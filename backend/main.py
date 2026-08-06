from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from datetime import date, timedelta

from database import engine, Base, get_db
import models
import schemas

# 서버 실행 시 users 테이블이 없으면 자동으로 만들어줌
Base.metadata.create_all(bind=engine)

app = FastAPI()

# React 개발 서버(localhost:3000)에서 오는 요청을 허용
# 브라우저는 기본적으로 "다른 포트=다른 출처"로 보고 요청을 막기 때문에
# 백엔드가 명시적으로 허용해줘야 함 (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 비밀번호 해싱 도구 (bcrypt 알고리즘 사용)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# 아이디 중복 확인 (프론트엔드에서 입력창 벗어날 때 호출)
@app.get("/users/check-id", response_model=schemas.CheckIdResponse)
def check_id(login_id: str, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.login_id == login_id).first()
    return {"available": existing is None}


# 회원가입
@app.post("/users/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = pwd_context.hash(user.password)
    new_user = models.User(
        login_id=user.login_id,
        password=hashed_password,
        name=user.name,
        phone_number=user.phone_number,
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        # 실시간 중복 확인을 통과했더라도, 그 사이 다른 사람이
        # 먼저 가입했을 경우를 대비한 최종 방어선
        db.rollback()
        raise HTTPException(status_code=400, detail="이미 사용 중인 아이디입니다")
    return new_user


# 로그인
@app.post("/users/login", response_model=schemas.UserResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.login_id == user.login_id).first()
    # 아이디가 없는 경우와 비밀번호가 틀린 경우를 구분하지 않고
    # 같은 에러 메시지로 응답 (계정 존재 여부 노출 방지)
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 일치하지 않습니다")
    return db_user


# 메인페이지 - 베스트셀러 도서 추천
@app.get("/books/bestsellers", response_model=list[schemas.BookListItem])
def get_bestsellers(db: Session = Depends(get_db)):
    books = (
        db.query(models.Book)
        .join(models.Author)
        .join(models.Genre)
        .filter(models.Book.is_bestseller == True)
        .all()
    )

    return [
        schemas.BookListItem(
            id=book.id,
            title=book.title,
            author_name=book.author.name,
            genre_name=book.genre.name,
            is_available=book.stock_quantity > 0,
        )
        for book in books
    ]


# 도서 검색 (제목/장르/작가 페이지 3개가 공통으로 호출)
# 예: /books/search?title=해리포터  또는  /books/search?genre=판타지  또는  /books/search?author=김영하
@app.get("/books/search", response_model=list[schemas.BookListItem])
def search_books(
    title: str | None = None,
    genre: str | None = None,
    author: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Book).join(models.Author).join(models.Genre)

    if title:
        query = query.filter(models.Book.title.like(f"%{title}%"))
    if genre:
        query = query.filter(models.Genre.name.like(f"%{genre}%"))
    if author:
        query = query.filter(models.Author.name.like(f"%{author}%"))

    books = query.all()

    return [
        schemas.BookListItem(
            id=book.id,
            title=book.title,
            author_name=book.author.name,
            genre_name=book.genre.name,
            is_available=book.stock_quantity > 0,
        )
        for book in books
    ]


# 검색 목록에서 행 클릭 시 모달에 뿌려줄 상세 정보
@app.get("/books/{book_id}", response_model=schemas.BookDetail)
def get_book_detail(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="해당 도서를 찾을 수 없습니다")

    return schemas.BookDetail(
        id=book.id,
        title=book.title,
        author_name=book.author.name,
        genre_name=book.genre.name,
        stock_quantity=book.stock_quantity,
        isbn=book.isbn,
        location=book.location,
    )


# 대여 가능 기간 (기획에서 확정한 7일)
RENTAL_PERIOD_DAYS = 7


# 대여 신청 — 재고 1 감소 + rentals 테이블에 기록 생성
@app.post("/rentals", response_model=schemas.RentalResponse)
def create_rental(rental: schemas.RentalCreate, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == rental.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="해당 도서를 찾을 수 없습니다")

    if book.stock_quantity <= 0:
        # 프론트에서 재고 없으면 버튼을 비활성화해두겠지만,
        # 그 사이 다른 사람이 먼저 대여했을 경우를 대비한 최종 방어선
        raise HTTPException(status_code=400, detail="대여할 수 없습니다")

    today = date.today()
    new_rental = models.Rental(
        user_id=rental.user_id,
        book_id=rental.book_id,
        rental_date=today,
        due_date=today + timedelta(days=RENTAL_PERIOD_DAYS),
    )
    book.stock_quantity -= 1  # 재고 차감

    db.add(new_rental)
    db.commit()
    db.refresh(new_rental)

    return new_rental


# 마이페이지 — 나의 정보 + 현재 대여 중인 책(반납기한/연체) + 과거 대여 기록
@app.get("/users/{user_id}/mypage", response_model=schemas.MyPageResponse)
def get_mypage(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 사용자를 찾을 수 없습니다")

    today = date.today()

    # 아직 반납 안 한(return_date가 NULL인) 대여 건들
    current = (
        db.query(models.Rental)
        .filter(models.Rental.user_id == user_id, models.Rental.return_date.is_(None))
        .all()
    )
    current_rentals = []
    for r in current:
        is_overdue = r.due_date < today
        overdue_days = (today - r.due_date).days if is_overdue else 0
        current_rentals.append(
            schemas.CurrentRentalItem(
                book_title=r.book.title,
                due_date=r.due_date,
                is_overdue=is_overdue,
                overdue_days=overdue_days,
            )
        )

    # 반납 완료된(return_date가 있는) 과거 대여 기록들
    past = (
        db.query(models.Rental)
        .filter(models.Rental.user_id == user_id, models.Rental.return_date.isnot(None))
        .all()
    )
    past_rentals = [
        schemas.PastRentalItem(
            book_title=r.book.title,
            author_name=r.book.author.name,
            genre_name=r.book.genre.name,
            rental_date=r.rental_date,
            return_date=r.return_date,
        )
        for r in past
    ]

    return schemas.MyPageResponse(
        login_id=user.login_id,
        name=user.name,
        current_rentals=current_rentals,
        past_rentals=past_rentals,
    )