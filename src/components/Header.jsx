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
    if (query.trim()) {
      navigate(`/search?type=${searchType}&query=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="absolute left-0 top-0 h-[176px] w-[1920px] bg-white z-40 px-[56px] flex items-center justify-between">
      
      {/* Logo Group */}
      <div className="flex items-center gap-[23px] shrink-0">
        <img
          src={LOGO_ICON_URL}
          alt="BookNest Logo"
          className="h-[116px] w-[116px] object-contain cursor-pointer"
          onClick={() => navigate('/')}
        />
        <span
          className="text-[48px] leading-none text-black cursor-pointer"
          style={{ fontFamily: 'Kadwa', fontWeight: 400 }}
          onClick={() => navigate('/')}
        >
          BookNest
        </span>
      </div>

      {/* Search Bar */}
      <div 
        ref={dropdownRef}
        className="relative h-[76px] w-[959.75px] max-w-[959px] rounded-[70px] border-[3px] border-black bg-white flex items-center mx-[20px]"
      >
        <div 
          className="relative ml-[20px] w-[140px] h-[56px] cursor-pointer bg-transparent z-20 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shrink-0"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span
            className="text-[24px] leading-none text-black pointer-events-none"
            style={{ fontFamily: 'Inter', fontWeight: 400 }}
          >
            {searchType}
          </span>
          <svg
            className="pointer-events-none shrink-0"
            width="16"
            height="12"
            viewBox="0 0 16 12"
          >
            <polygon points="8,12 0,0 16,0" fill="#000000" />
          </svg>

          {isDropdownOpen && (
            <div className="absolute left-0 top-[60px] w-[150px] bg-white border-[3px] border-black rounded-[15px] overflow-hidden flex flex-col z-50 shadow-md">
              {['제목검색', '장르검색', '작가검색'].map((type) => (
                <div
                  key={type}
                  className="pl-[13.5px] py-[12px] text-[24px] text-black hover:bg-gray-200 transition-colors cursor-pointer"
                  style={{ fontFamily: 'Inter', fontWeight: 400 }}
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

        <div className="ml-[10px] h-[51px] w-[1px] bg-[#AFAFAF] shrink-0" />
        
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter') handleSearch() }}
          placeholder={`${searchType}어를 입력하세요`}
          className="flex-1 h-full mx-[20px] min-w-0 text-[24px] outline-none bg-transparent placeholder-gray-400"
          style={{ fontFamily: 'Kadwa' }}
        />
        
        <div className="mr-[20px] shrink-0 cursor-pointer hover:opacity-70 transition-opacity" onClick={handleSearch}>
          <svg width="40" height="43" viewBox="0 0 40 43" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="13.5" fill="white" stroke="black" strokeWidth="3" />
            <path d="M25 25 L36 36" stroke="black" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center justify-end gap-[21px] shrink-0">
        {currentUser ? (
          <>
            <button
              onClick={() => navigate('/mypage')}
              className="h-[52px] px-8 rounded-full border-[2px] border-blue-500 bg-white text-[24px] text-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm whitespace-nowrap"
              style={{ fontFamily: 'Inter', fontWeight: 600 }}
            >
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              마이페이지
            </button>
            <button
              onClick={handleLogout}
              className="h-[52px] px-8 rounded-full bg-gray-100 text-[24px] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Inter', fontWeight: 600 }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/signup')}
              className="h-[52px] w-[147px] border-[2px] border-[#5E5E5E] bg-white text-[24px] text-black hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Inter', fontWeight: 400 }}
            >
              회원가입
            </button>
            <button
              onClick={() => navigate('/login')}
              className="h-[52px] w-[147px] bg-black text-[24px] text-white hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Inter', fontWeight: 400 }}
            >
              로그인
            </button>
          </>
        )}
      </div>
      
    </div>
  );
}
