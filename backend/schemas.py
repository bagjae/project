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