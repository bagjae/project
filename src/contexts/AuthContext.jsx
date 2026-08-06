import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Save to localStorage on change
  useEffect(() => localStorage.setItem('currentUser', JSON.stringify(currentUser)), [currentUser]);

  const BASE_URL = 'http://192.168.1.212:8000';

  const login = async (username, password) => {
    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: username, password })
      });
      if (!response.ok) return false;
      
      const data = await response.json();
      setCurrentUser({
        id: data.id,
        username: data.login_id,
        name: data.name
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const checkIdDuplicate = async (username) => {
    try {
      const response = await fetch(`${BASE_URL}/users/check-id?login_id=${username}`);
      if (!response.ok) return false;
      const data = await response.json();
      return !data.available;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const signup = async (userObj) => {
    try {
      const response = await fetch(`${BASE_URL}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login_id: userObj.username,
          password: userObj.password,
          name: userObj.name,
          phone_number: userObj.phone
        })
      });
      if (!response.ok) {
        const errData = await response.json();
        return { success: false, error: errData.detail || "회원가입 중 오류가 발생했습니다." };
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "서버와 연결할 수 없습니다." };
    }
  };

  const rentBook = async (bookId) => {
    if (!currentUser) return null;
    
    try {
      const response = await fetch(`${BASE_URL}/rentals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          book_id: bookId
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(errData.detail || "대여에 실패했습니다.");
        return null;
      }

      const data = await response.json();
      return new Date(data.due_date);
    } catch (err) {
      console.error("대여 오류:", err);
      return null;
    }
  };

  const returnBook = async (rentalId) => {
    alert("백엔드에 아직 반납 기능 API가 구현되지 않았습니다.");
    return false;
  };

  const value = {
    currentUser,
    login,
    logout,
    signup,
    checkIdDuplicate,
    rentBook,
    returnBook,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
