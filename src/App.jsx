import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import SearchResultsPage from './pages/SearchResultsPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;