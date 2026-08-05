from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

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