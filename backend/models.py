from sqlalchemy import Column, Integer, String, DateTime, Boolean, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    login_id = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    name = Column(String(50), nullable=False)
    phone_number = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 회원가입 추가 항목 (아이디/비밀번호 찾기, 휴면 해제 본인확인에 사용)
    # 기존 회원은 값이 없을 수 있어 nullable=True로 둠 (마이페이지에서 나중에 채울 수 있음)
    email = Column(String(100), nullable=True)
    address = Column(String(200), nullable=True)

    # 휴면 계정 처리용
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)  # False면 휴면 처리된 계정

    # 관리자 여부
    is_admin = Column(Boolean, nullable=False, default=False)

    # 연체 페널티 — 이 날짜까지 대여 금지 (NULL이면 제한 없음)
    rental_banned_until = Column(Date, nullable=True)


class Author(Base):
    __tablename__ = "authors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)


class Genre(Base):
    __tablename__ = "genres"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String(20), unique=True)
    title = Column(String(200), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("authors.id"), nullable=False)
    genre_id = Column(Integer, ForeignKey("genres.id"), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    location = Column(String(20), nullable=False)
    is_bestseller = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    author = relationship("Author")
    genre = relationship("Genre")


class Rental(Base):
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    rental_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)

    book = relationship("Book")