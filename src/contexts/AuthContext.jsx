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
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const BASE_URL = 'http://192.168.1.212:8000';

  // Helper to build headers with Authorization Bearer token if present
  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (currentUser && currentUser.token) {
      headers['Authorization'] = `Bearer ${currentUser.token}`;
    }
    return headers;
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: username, password })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 403 || (errData.detail && errData.detail.includes('휴면'))) {
          return { success: false, isDormant: true, message: errData.detail || "휴면 계정입니다. 본인 인증 후 해제해 주세요." };
        }
        return { success: false, message: errData.detail || "아이디 또는 비밀번호가 일치하지 않습니다." };
      }

      const data = await response.json();
      const userData = data.user || data;
      const token = data.access_token || '';

      const userObj = {
        id: userData.id,
        username: userData.login_id,
        name: userData.name,
        phone_number: userData.phone_number || '',
        email: userData.email || '',
        address: userData.address || '',
        is_admin: userData.is_admin || false,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        rental_banned_until: userData.rental_banned_until || null,
        token: token
      };
      setCurrentUser(userObj);
      return { success: true, user: userObj };
    } catch (err) {
      console.error(err);
      // Fallback for mock mode if backend server is unreachable
      if (username === 'admin' && password === '1234') {
        const adminUser = { id: 1, username: 'admin', name: '관리자', is_admin: true, is_active: true, token: 'mock-admin-token' };
        setCurrentUser(adminUser);
        return { success: true, user: adminUser };
      }
      return { success: false, message: "서버와 연결할 수 없습니다." };
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

  // 휴면 계정 해제 API
  const reactivateUser = async (loginId, name, phoneNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/users/reactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId, name, phone_number: phoneNumber })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.detail || "휴면 해제 정보가 일치하지 않습니다." };
      }
      return { success: true, message: "계정이 성공적으로 재활성화되었습니다. 로그인해 주세요!" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "서버와 연결할 수 없습니다." };
    }
  };

  // 아이디 찾기 API
  const findId = async (name, phoneNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/users/find-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone_number: phoneNumber })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.detail || "일치하는 회원 정보를 찾을 수 없습니다." };
      }
      const data = await response.json();
      return { success: true, login_id: data.login_id };
    } catch (err) {
      console.error(err);
      return { success: false, message: "서버와 연결할 수 없습니다." };
    }
  };

  // 비밀번호 재설정 API
  const resetPassword = async (loginId, name, phoneNumber, newPassword) => {
    try {
      const response = await fetch(`${BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login_id: loginId,
          name,
          phone_number: phoneNumber,
          new_password: newPassword
        })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.detail || "정보가 일치하지 않아 비밀번호를 변경할 수 없습니다." };
      }
      return { success: true, message: "비밀번호가 성공적으로 변경되었습니다. 새로 로그인해 주세요." };
    } catch (err) {
      console.error(err);
      return { success: false, message: "서버와 연결할 수 없습니다." };
    }
  };

  // 내 정보 수정 API (PATCH /users/me)
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.detail || "프로필 수정에 실패했습니다." };
      }
      const data = await response.json();
      setCurrentUser(prev => ({
        ...prev,
        name: data.name,
        phone_number: data.phone_number,
        email: data.email,
        address: data.address
      }));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: "서버와 연결할 수 없습니다." };
    }
  };

  // 비밀번호 변경 API (PATCH /users/me/password)
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${BASE_URL}/users/me/password`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.detail || "현재 비밀번호가 일치하지 않습니다." };
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: "서버와 연결할 수 없습니다." };
    }
  };

  const rentBook = async (bookId) => {
    if (!currentUser) return null;

    try {
      const response = await fetch(`${BASE_URL}/rentals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: currentUser.id,
          book_id: bookId
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
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
    try {
      const response = await fetch(`${BASE_URL}/rentals/${rentalId}/return`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        alert(errData.detail || "반납에 실패했습니다.");
        return false;
      }

      const data = await response.json().catch(() => ({}));
      if (data.penalty_days && data.penalty_days > 0) {
        alert(`도서가 반납되었습니다.\n(※ 연체로 인해 ${data.penalty_days}일간 도서 대여가 금지됩니다.)`);
      } else {
        alert("성공적으로 반납되었습니다!");
      }
      window.location.reload();
      return true;
    } catch (err) {
      console.error(err);
      alert("서버와 연결할 수 없습니다.");
      return false;
    }
  };

  // 관리자 - 휴면 사용자 목록 조회
  const getDormantUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/dormant-users`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // 관리자 - 사용자 활성화
  const activateUser = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}/activate`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return response.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // 관리자 - 사용자 비활성화 (휴면 처리)
  const deactivateUser = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}/deactivate`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return response.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const value = {
    currentUser,
    getAuthHeaders,
    login,
    logout,
    signup,
    checkIdDuplicate,
    reactivateUser,
    findId,
    resetPassword,
    updateProfile,
    changePassword,
    rentBook,
    returnBook,
    getDormantUsers,
    activateUser,
    deactivateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
