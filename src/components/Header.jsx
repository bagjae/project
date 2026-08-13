import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LOGO_ICON_URL =
  'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/563a6a3c-9ae2-4242-ab20-2540289775b8';

export default function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchType, setSearchType] = useState('제목검색');
  const [query, setQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    navigate(`/search?type=${searchType}&query=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 z-40 sticky top-0">
      <div className="max-w-7xl mx-auto h-[90px] px-6 flex items-center justify-between">
        
        {/* Logo Group */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer group" onClick={() => navigate('/')}>
          <img
            src={LOGO_ICON_URL}
            alt="BookNest Logo"
            className="h-[42px] w-[42px] object-contain group-hover:opacity-80 transition-opacity"
          />
          <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-blue-700 transition-colors font-sans">
            BookNest
          </span>
        </div>

        {/* Search Bar */}
        <div 
          ref={dropdownRef}
          className="relative flex items-center flex-1 max-w-2xl mx-8 bg-gray-50 border border-gray-300 rounded-full h-[46px] hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] focus-within:bg-white focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.08)] focus-within:border-blue-500 transition-all duration-200"
        >
          <div 
            className="relative px-5 h-full cursor-pointer flex items-center justify-center gap-2 hover:text-blue-600 transition-colors shrink-0 text-gray-700 border-r border-gray-300"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-[14px] font-medium pointer-events-none whitespace-nowrap">
              {searchType}
            </span>
            <svg className="w-3.5 h-3.5 pointer-events-none text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>

            {isDropdownOpen && (
              <div className="absolute left-0 top-[52px] w-[130px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col z-50">
                {['제목검색', '장르검색', '작가검색'].map((type) => (
                  <div
                    key={type}
                    className="px-4 py-3 text-[14px] text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchType(type);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') handleSearch() }}
            placeholder={`${searchType}어를 입력하세요`}
            className="flex-1 h-full mx-4 min-w-0 text-[15px] outline-none bg-transparent placeholder-gray-400 font-sans"
          />
          
          <button className="pr-5 pl-2 shrink-0 text-blue-600 hover:text-blue-800 transition-colors" onClick={handleSearch}>
            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-5 shrink-0">
          {currentUser ? (
            <>
              {currentUser.is_admin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-[14px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                  관리자 콘솔
                </button>
              )}
              <button
                onClick={() => navigate('/mypage')}
                className="text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                마이페이지
              </button>
              <button
                onClick={handleLogout}
                className="text-[14px] font-medium px-4 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="text-[14px] font-medium px-5 py-2 rounded-md bg-[#2d333a] text-white hover:bg-black transition-colors"
              >
                회원가입
              </button>
            </>
          )}
        </div>
        
      </div>
    </header>
  );
}
