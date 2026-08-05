import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const INITIAL_BOOKS = [
  {
    id: 1,
    title: '히가시노 게이고의 어떤 책',
    author: '히가시노 게이고',
    genre: '추리/미스터리',
    coverUrl: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/3f76474d-510b-4426-9dc4-d2d2127bda5a',
    description: '베스트셀러 추리 소설. 숨막히는 전개와 반전이 돋보이는 작품입니다.',
    location: '2층 B열 4번',
    isAvailable: true,
    totalQuantity: 3,
    availableQuantity: 3
  },
  {
    id: 2,
    title: 'SF 명작 단편선',
    author: '아이작 아시모프',
    genre: 'SF',
    coverUrl: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/ed7a92be-43eb-47d5-9049-f291963f561a',
    description: '미래 세계를 그린 SF 단편 모음집.',
    location: '3층 A열 1번',
    isAvailable: false,
    totalQuantity: 1,
    availableQuantity: 0
  },
  {
    id: 3,
    title: '화성 침공',
    author: 'H.G. 웰스',
    genre: 'SF',
    coverUrl: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/56161b08-6653-4712-80e1-67826abdc698',
    description: '외계의 침공을 다룬 고전 공상과학 소설.',
    location: '3층 A열 2번',
    isAvailable: true,
    totalQuantity: 2,
    availableQuantity: 2
  },
  {
    id: 4,
    title: '나미야 잡화점의 기적',
    author: '히가시노 게이고',
    genre: '현대소설',
    coverUrl: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/2b1c6937-1491-4979-be7d-bca4f0c4d7ab',
    description: '따뜻한 위로와 감동을 전해주는 베스트셀러.',
    location: '2층 B열 5번',
    isAvailable: true,
    totalQuantity: 5,
    availableQuantity: 5
  }
];

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('users')) || []);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')) || null);
  const [books, setBooks] = useState(() => JSON.parse(localStorage.getItem('books')) || INITIAL_BOOKS);
  const [rentals, setRentals] = useState(() => JSON.parse(localStorage.getItem('rentals')) || []);

  // Save to localStorage on change
  useEffect(() => localStorage.setItem('users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('currentUser', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('books', JSON.stringify(books)), [books]);
  useEffect(() => localStorage.setItem('rentals', JSON.stringify(rentals)), [rentals]);

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const checkIdDuplicate = (username) => {
    return users.some(u => u.username === username);
  };

  const signup = (userObj) => {
    if (checkIdDuplicate(userObj.username)) return false;
    setUsers(prev => [...prev, userObj]);
    return true;
  };

  const rentBook = (bookId) => {
    if (!currentUser) return null;
    
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1 || books[bookIndex].availableQuantity <= 0) return null;

    const book = books[bookIndex];
    
    // Update book stock
    const updatedBooks = [...books];
    updatedBooks[bookIndex] = {
      ...book,
      availableQuantity: book.availableQuantity - 1,
      isAvailable: (book.availableQuantity - 1) > 0
    };
    setBooks(updatedBooks);

    // Create rental record (14 days)
    const rentDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 14);

    const rentalRecord = {
      id: Date.now(),
      username: currentUser.username,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookGenre: book.genre,
      rentDate: rentDate.toISOString(),
      returnDate: returnDate.toISOString(),
      status: '대여중' // or '반납됨'
    };

    setRentals(prev => [...prev, rentalRecord]);

    return returnDate;
  };

  const returnBook = (rentalId) => {
    const rentalIndex = rentals.findIndex(r => r.id === rentalId);
    if (rentalIndex === -1) return false;
    
    const rental = rentals[rentalIndex];
    if (rental.status === '반납됨') return false;

    // 대여 상태 변경 및 실 반납일 기록
    const updatedRentals = [...rentals];
    updatedRentals[rentalIndex] = {
      ...rental,
      status: '반납됨',
      returnDate: new Date().toISOString()
    };
    setRentals(updatedRentals);

    // 책 재고 1 증가
    const bookIndex = books.findIndex(b => b.id === rental.bookId);
    if (bookIndex !== -1) {
      const book = books[bookIndex];
      const updatedBooks = [...books];
      updatedBooks[bookIndex] = {
        ...book,
        availableQuantity: book.availableQuantity + 1,
        isAvailable: true
      };
      setBooks(updatedBooks);
    }
    return true;
  };

  const value = {
    users,
    currentUser,
    books,
    rentals,
    login,
    logout,
    signup,
    checkIdDuplicate,
    rentBook,
    returnBook,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
