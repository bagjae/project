from datetime import date
from pydantic import BaseModel


# 회원가입 요청 시 프론트엔드가 보내야 하는 값
class UserCreate(BaseModel):
    login_id: str
    password: str
    name: str
    phone_number: str
    email: str
    address: str


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
    phone_number: str
    email: str | None
    address: str | None
    is_admin: bool

    class Config:
        from_attributes = True


# 로그인 성공 시 돌려주는 값 (토큰 방식)
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# 아이디 중복 확인 응답
class CheckIdResponse(BaseModel):
    available: bool


# 단순 성공 여부만 알려주면 되는 응답 (비밀번호 재설정 등)
class SimpleSuccessResponse(BaseModel):
    success: bool


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
# (토큰 방식이라 user_id는 프론트가 안 보내도 됨 — 토큰에서 자동으로 추출)
class RentalCreate(BaseModel):
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
    rental_id: int  # "반납하기" 버튼 클릭 시 PATCH /rentals/{rental_id}/return 호출용
    book_title: str
    due_date: date
    is_overdue: bool
    overdue_days: int


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
    rental_banned_until: date | None  # 대여 금지 상태면 그 해제일, 아니면 None
    current_rentals: list[CurrentRentalItem]
    past_rentals: list[PastRentalItem]


# 메인 페이지 대여 상태 알림 영역용 (연체/금지 여부만 가볍게)
class RentalStatusResponse(BaseModel):
    is_banned: bool
    rental_banned_until: date | None


# 반납 처리 성공 시 돌려주는 값
class RentalReturnResponse(BaseModel):
    id: int
    book_id: int
    return_date: date
    penalty_days: int  # 이번 반납으로 새로 부과된 대여 금지 일수 (연체 아니면 0)


# ===== 아이디 / 비밀번호 찾기, 휴면 해제 =====

class FindIdRequest(BaseModel):
    name: str
    phone_number: str
    email: str
    address: str


class FindIdResponse(BaseModel):
    login_id: str


class ResetPasswordRequest(BaseModel):
    login_id: str
    name: str
    phone_number: str
    email: str
    address: str
    new_password: str


class ReactivateRequest(BaseModel):
    login_id: str
    name: str
    phone_number: str
    email: str
    address: str


# ===== 마이페이지 - 개인정보 수정 =====

class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    phone_number: str | None = None
    email: str | None = None
    address: str | None = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


# ===== 관리자 페이지 =====

class DormantUserItem(BaseModel):
    id: int
    login_id: str
    name: str
    last_login_at: date | None
    days_since_last_login: int | None