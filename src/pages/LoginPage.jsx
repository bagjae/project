import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LOGO_ICON_URL =
  'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/563a6a3c-9ae2-4242-ab20-2540289775b8';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMsg('아이디 또는 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setErrorMsg('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleTyping = (setter) => (e) => {
    setter(e.target.value);
    if (errorMsg) setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col items-center justify-center font-sans p-6">
      <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 flex flex-col items-center border border-gray-200">
        
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-4 mb-10 w-full">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <img src={LOGO_ICON_URL} alt="BookNest Logo" className="h-[40px] w-[40px] object-contain group-hover:opacity-80 transition-opacity" />
            <span className="text-[28px] text-black font-bold tracking-tight group-hover:text-blue-700 transition-colors">BookNest</span>
          </div>
          <span className="text-[16px] text-gray-500 font-medium mt-2">
            로그인하여 모든 서비스를 이용해보세요
          </span>
        </div>

        {/* Form Fields */}
        <div className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-gray-700">아이디</label>
            <input 
              type="text" 
              value={username}
              onChange={handleTyping(setUsername)}
              placeholder="아이디를 입력하세요" 
              className={`w-full h-[48px] rounded-lg border ${errorMsg ? 'border-red-500 bg-red-50/30' : 'border-gray-300'} px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-gray-700">비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={handleTyping(setPassword)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="비밀번호를 입력하세요" 
              className={`w-full h-[48px] rounded-lg border ${errorMsg ? 'border-red-500 bg-red-50/30' : 'border-gray-300'} px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`} 
            />
          </div>
          
          {/* Error Message Space (Fixed height to prevent layout shift) */}
          <div className="min-h-[24px] flex items-start -mt-1">
            {errorMsg && (
              <span className="text-red-500 text-[13px] font-medium animate-fade-in-up flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {errorMsg}
              </span>
            )}
          </div>

          {/* Login Button */}
          <button 
            className="w-full h-[52px] rounded-lg bg-[#2d333a] flex items-center justify-center text-[16px] font-semibold text-white hover:bg-black hover:shadow-md active:scale-[0.98] transition-all mt-2"
            onClick={handleLogin}
          >
            로그인
          </button>
        </div>

        {/* Signup Link */}
        <div className="mt-8 pt-6 w-full border-t border-gray-100 flex items-center justify-center gap-2">
          <span className="text-[14px] text-gray-500">
            아직 계정이 없으신가요?
          </span>
          <button 
            className="text-[14px] font-semibold text-blue-600 hover:text-blue-800 transition-colors" 
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}