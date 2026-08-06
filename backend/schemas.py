from datetime import date
from pydantic import BaseModel
 
 
# 회원가입 요청 시 프론트엔드가 보내야 하는 값
class UserCreate(BaseModel):
    login_id: str
    password: str
    name: str
    phone_number: str
 
 
# 로그인 요청 시 프론트엔드가 보내야 하는 값
class UserLogin(BaseModel):
    login_id: str
    password: str
 
 
# 회원가입/로그인 성공 시 프론트엔드로 돌려주는 값
# password는 절대 포함하지 않음
class UserResponse(BaseModel):
    id: int
    login_id: str
    name: str
 
    class Config:
        from_attributes = True
 
 
# 아이디 중복 확인 응답
class CheckIdResponse(BaseModel):
    available: bool


# 검색 목록(행)에 표시할 정보 — 제목/작가/장르 + 대여 가능 여부만
class BookListItem(BaseModel):
    id: int
    title: str
    author_name: str
    genre_name: str
    is_available: bool  # 재고 > 0 이면 True (프론트에서 파란색/빨간색 분기용)


# 행 클릭 시 모달에 표시할 상세 정보
class BookDetail(BaseModel):
    id: int
    title: str
    author_name: str
    genre_name: str
    stock_quantity: int
    isbn: str
    location: str


# 대여 신청 요청 시 프론트엔드가 보내야 하는 값
# (로그인 토큰 방식을 안 쓰기로 했으므로, 로그인 후 프론트에 저장해둔 user_id를 그대로 실어 보냄)
class RentalCreate(BaseModel):
    user_id: int
    book_id: int


# 대여 신청 성공 시 돌려주는 값 — "반납 예정일: ..." 표시에 사용
class RentalResponse(BaseModel):
    id: int
    book_id: int
    rental_date: date
    due_date: date

    class Config:
        from_attributes = True


# 마이페이지 - 현재 대여 중인 책 한 권
class CurrentRentalItem(BaseModel):
    book_title: str
    due_date: date
    is_overdue: bool     # 연체 여부
    overdue_days: int    # 연체 아니면 0


# 마이페이지 - 과거(반납 완료된) 대여 기록 한 건
class PastRentalItem(BaseModel):
    book_title: str
    author_name: str
    genre_name: str
    rental_date: date
    return_date: date


# 마이페이지 전체 응답
class MyPageResponse(BaseModel):
    login_id: str
    name: str
    current_rentals: list[CurrentRentalItem]
    past_rentals: list[PastRentalItem]