from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from datetime import date, datetime, timedelta

from database import engine, Base, get_db
import models
import schemas
import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

RENTAL_PERIOD_DAYS = 7          # 대여 가능 기간
DORMANT_DAYS_THRESHOLD = 90     # 이 기간 이상 미로그인 시 자동 휴면 처리


# ─────────────────────────────────────────────
# 휴면 계정 자동 처리 (별도 스케줄러 없이, 로그인 시도/관리자 조회 시점에 검사해서 처리)
# ─────────────────────────────────────────────
def check_and_mark_dormant(user: models.User, db: Session) -> None:
    if not user.is_active:
        return
    reference_time = user.last_login_at or user.created_at
    if reference_time is None:
        return
    if datetime.utcnow() - reference_time > timedelta(days=DORMANT_DAYS_THRESHOLD):
        user.is_active = False
        db.commit()


# 아이디 중복 확인
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
        email=user.email,
        address=user.address,
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="이미 사용 중인 아이디입니다")
    return new_user


# 로그인
@app.post("/users/login", response_model=schemas.LoginResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.login_id == user.login_id).first()

    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 일치하지 않습니다")

    # 비밀번호까지 맞춘 뒤에 휴면 여부를 검사 (계정 존재/휴면 여부가 비밀번호 없이 노출되지 않도록)
    check_and_mark_dormant(db_user, db)
    if not db_user.is_active:
        raise HTTPException(
            status_code=403,
            detail="휴면 처리된 계정입니다. 본인 확인(POST /users/reactivate) 후 다시 로그인해주세요",
        )

    db_user.last_login_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)

    access_token = auth.create_access_token(db_user.id)
    return schemas.LoginResponse(access_token=access_token, token_type="bearer", user=db_user)


# 휴면 계정 셀프 재활성화 — 본인 확인(이름/전화번호/이메일/주소) 통과 시 즉시 활성화
@app.post("/users/reactivate", response_model=schemas.SimpleSuccessResponse)
def reactivate_account(payload: schemas.ReactivateRequest, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(
            models.User.login_id == payload.login_id,
            models.User.name == payload.name,
            models.User.phone_number == payload.phone_number,
            models.User.email == payload.email,
            models.User.address == payload.address,
        )
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="일치하는 회원 정보를 찾을 수 없습니다")
    if user.is_active:
        raise HTTPException(status_code=400, detail="이미 활성화된 계정입니다")

    user.is_active = True
    user.last_login_at = datetime.utcnow()  # 갱신 안 하면 로그인 시 바로 다시 휴면 처리되는 버그 발생
    db.commit()
    return {"success": True}


# 아이디 찾기
@app.post("/users/find-id", response_model=schemas.FindIdResponse)
def find_id(payload: schemas.FindIdRequest, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(
            models.User.name == payload.name,
            models.User.phone_number == payload.phone_number,
            models.User.email == payload.email,
            models.User.address == payload.address,
        )
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="일치하는 회원 정보를 찾을 수 없습니다")
    return schemas.FindIdResponse(login_id=user.login_id)


# 비밀번호 찾기(재설정) — 본인 확인 통과 시 새 비밀번호로 즉시 변경
@app.post("/users/reset-password", response_model=schemas.SimpleSuccessResponse)
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(
            models.User.login_id == payload.login_id,
            models.User.name == payload.name,
            models.User.phone_number == payload.phone_number,
            models.User.email == payload.email,
            models.User.address == payload.address,
        )
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="일치하는 회원 정보를 찾을 수 없습니다")

    user.password = pwd_context.hash(payload.new_password)
    db.commit()
    return {"success": True}


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


# 대여 신청 — 재고 1 감소 + rentals 테이블에 기록 생성
@app.post("/rentals", response_model=schemas.RentalResponse)
def create_rental(
    rental: schemas.RentalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    today = date.today()

    # 대여 금지 상태인지 먼저 확인
    if current_user.rental_banned_until and current_user.rental_banned_until > today:
        days_left = (current_user.rental_banned_until - today).days
        raise HTTPException(status_code=403, detail=f"{days_left}일 뒤에 대여가 가능합니다")

    book = (
        db.query(models.Book)
        .filter(models.Book.id == rental.book_id)
        .with_for_update()  # 동시 요청으로 재고가 꼬이지 않도록 행 잠금
        .first()
    )
    if not book:
        raise HTTPException(status_code=404, detail="해당 도서를 찾을 수 없습니다")
    if book.stock_quantity <= 0:
        raise HTTPException(status_code=400, detail="대여할 수 없습니다")

    new_rental = models.Rental(
        user_id=current_user.id,
        book_id=book.id,
        rental_date=today,
        due_date=today + timedelta(days=RENTAL_PERIOD_DAYS),
    )
    book.stock_quantity -= 1

    db.add(new_rental)
    db.commit()
    db.refresh(new_rental)
    return new_rental


# 마이페이지
@app.get("/users/me/mypage", response_model=schemas.MyPageResponse)
def get_mypage(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    today = date.today()

    current = (
        db.query(models.Rental)
        .filter(models.Rental.user_id == current_user.id, models.Rental.return_date.is_(None))
        .all()
    )
    current_rentals = []
    for r in current:
        is_overdue = r.due_date < today
        overdue_days = (today - r.due_date).days if is_overdue else 0
        current_rentals.append(
            schemas.CurrentRentalItem(
                rental_id=r.id,
                book_title=r.book.title,
                due_date=r.due_date,
                is_overdue=is_overdue,
                overdue_days=overdue_days,
            )
        )

    past = (
        db.query(models.Rental)
        .filter(models.Rental.user_id == current_user.id, models.Rental.return_date.isnot(None))
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
        login_id=current_user.login_id,
        name=current_user.name,
        rental_banned_until=current_user.rental_banned_until,
        current_rentals=current_rentals,
        past_rentals=past_rentals,
    )


# 메인페이지 알림 영역용 — 가볍게 대여 금지 상태만 조회
@app.get("/users/me/rental-status", response_model=schemas.RentalStatusResponse)
def get_rental_status(
    current_user: models.User = Depends(auth.get_current_user),
):
    today = date.today()
    is_banned = bool(current_user.rental_banned_until and current_user.rental_banned_until > today)
    return schemas.RentalStatusResponse(
        is_banned=is_banned,
        rental_banned_until=current_user.rental_banned_until if is_banned else None,
    )


# 개인정보 수정 (아이디/비밀번호 제외)
@app.patch("/users/me", response_model=schemas.UserResponse)
def update_profile(
    payload: schemas.ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.phone_number is not None:
        current_user.phone_number = payload.phone_number
    if payload.email is not None:
        current_user.email = payload.email
    if payload.address is not None:
        current_user.address = payload.address

    db.commit()
    db.refresh(current_user)
    return current_user


# 비밀번호 변경 (현재 비밀번호 확인 필수)
@app.patch("/users/me/password", response_model=schemas.SimpleSuccessResponse)
def change_password(
    payload: schemas.PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if not pwd_context.verify(payload.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="현재 비밀번호가 일치하지 않습니다")

    current_user.password = pwd_context.hash(payload.new_password)
    db.commit()
    return {"success": True}


# 반납하기 — return_date 채우고 재고 1 복구 + 연체 시 대여 금지 페널티 누적 부과
@app.patch("/rentals/{rental_id}/return", response_model=schemas.RentalReturnResponse)
def return_rental(
    rental_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    rental = db.query(models.Rental).filter(models.Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="해당 대여 기록을 찾을 수 없습니다")
    if rental.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="본인의 대여 기록만 반납할 수 있습니다")
    if rental.return_date is not None:
        raise HTTPException(status_code=400, detail="이미 반납된 도서입니다")

    today = date.today()
    rental.return_date = today
    rental.book.stock_quantity += 1

    # 연체 페널티: 연체 일수만큼 대여 금지, 기존 금지 기간이 남아있으면 그 위에 누적
    overdue_days = (today - rental.due_date).days
    penalty_days = 0
    if overdue_days > 0:
        penalty_days = overdue_days
        base_date = (
            current_user.rental_banned_until
            if current_user.rental_banned_until and current_user.rental_banned_until > today
            else today
        )
        current_user.rental_banned_until = base_date + timedelta(days=penalty_days)

    db.commit()
    db.refresh(rental)

    return schemas.RentalReturnResponse(
        id=rental.id,
        book_id=rental.book_id,
        return_date=rental.return_date,
        penalty_days=penalty_days,
    )


# ===== 관리자 페이지 =====

# 전체 회원 목록 조회 (활성/휴면 포함)
@app.get("/admin/users", response_model=list[schemas.AdminUserItem])
def get_all_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin),
):
    users = db.query(models.User).order_by(models.User.id.asc()).all()
    now = datetime.utcnow()
    result = []
    for u in users:
        check_and_mark_dormant(u, db)
        days_since = (now - u.last_login_at).days if u.last_login_at else None
        last_login_date = u.last_login_at.date() if u.last_login_at else None
        result.append(
            schemas.AdminUserItem(
                id=u.id,
                login_id=u.login_id,
                name=u.name,
                phone_number=u.phone_number,
                email=u.email,
                address=u.address,
                is_active=u.is_active,
                is_admin=u.is_admin,
                last_login_at=last_login_date,
                days_since_last_login=days_since,
            )
        )
    return result


# 휴면 후보 목록 조회 (조회 시점에 기준 초과 계정은 자동으로 휴면 처리하며 함께 반환)
@app.get("/admin/dormant-users", response_model=list[schemas.DormantUserItem])
def get_dormant_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin),
):
    active_users = db.query(models.User).filter(models.User.is_active == True).all()
    for u in active_users:
        check_and_mark_dormant(u, db)

    now = datetime.utcnow()
    dormant_users = db.query(models.User).filter(models.User.is_active == False).all()

    result = []
    for u in dormant_users:
        if u.last_login_at:
            days_since = (now - u.last_login_at).days
            last_login_date = u.last_login_at.date()
        else:
            days_since = None
            last_login_date = None
        result.append(
            schemas.DormantUserItem(
                id=u.id,
                login_id=u.login_id,
                name=u.name,
                last_login_at=last_login_date,
                days_since_last_login=days_since,
            )
        )
    return result


# 관리자가 수동으로 휴면 해제 (본인 확인 정보가 기억 안 나는 경우 등 예외 대응용)
@app.patch("/admin/users/{user_id}/activate", response_model=schemas.UserResponse)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 사용자를 찾을 수 없습니다")
    user.is_active = True
    user.last_login_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


# 관리자가 수동으로 휴면 처리
@app.patch("/admin/users/{user_id}/deactivate", response_model=schemas.UserResponse)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 사용자를 찾을 수 없습니다")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user



@app.get("/admin/users", response_model=list[schemas.UserListItem])
def get_all_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin),
):
    return db.query(models.User).all()