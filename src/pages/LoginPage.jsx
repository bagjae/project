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

  const handleLogin = () => {
    if (!username || !password) {
      setErrorMsg('아이디 또는 비밀번호가 일치하지 않습니다');
      return;
    }
    
    const success = login(username, password);
    if (success) {
      navigate('/');
    } else {
      setErrorMsg('아이디 또는 비밀번호가 일치하지 않습니다');
    }
  };

  const handleTyping = (setter) => (e) => {
    setter(e.target.value);
    if (errorMsg) setErrorMsg('');
  };

  return (
    <div 
      className="relative mx-auto h-[1080px] w-[1920px] bg-gray-50 overflow-hidden flex items-center justify-center" 
      style={{ transformOrigin: 'top center', transform: 'scale(max(min(1, 100vw / 1920), 0.5))' }}
    >
      <div className="w-[540px] rounded-[24px] bg-white shadow-2xl p-[60px] flex flex-col items-center border border-gray-100 relative">
        
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <img src={LOGO_ICON_URL} alt="BookNest Logo" className="h-[72px] w-[72px] object-contain" />
            <span className="text-[42px] text-black" style={{ fontFamily: 'Kadwa', fontWeight: 700 }}>BookNest</span>
          </div>
          <span className="text-[28px] text-gray-500" style={{ fontFamily: 'Kadwa', fontWeight: 400 }}>
            로그인
          </span>
        </div>

        {/* Form Fields */}
        <div className="w-full flex flex-col gap-7 relative">
          <div className="flex flex-col gap-3">
            <label className="text-[22px] text-gray-700" style={{ fontFamily: 'Kadwa' }}>아이디</label>
            <input 
              type="text" 
              value={username}
              onChange={handleTyping(setUsername)}
              placeholder="아이디를 입력하세요" 
              className={`w-full h-[64px] rounded-xl border ${errorMsg ? 'border-red-500' : 'border-gray-300'} px-5 text-[22px] text-black placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`} 
              style={{ fontFamily: 'Kadwa' }} 
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[22px] text-gray-700" style={{ fontFamily: 'Kadwa' }}>비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={handleTyping(setPassword)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="비밀번호를 입력하세요" 
              className={`w-full h-[64px] rounded-xl border ${errorMsg ? 'border-red-500' : 'border-gray-300'} px-5 text-[22px] text-black placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`} 
              style={{ fontFamily: 'Kadwa' }} 
            />
          </div>
          
          <div className="h-[28px] flex items-center justify-center -mb-2">
            {errorMsg && (
              <span className="text-red-500 text-[18px] font-kadwa animate-fade-in-up">
                {errorMsg}
              </span>
            )}
          </div>

          {/* Login Button */}
          <button 
            className="w-full h-[70px] mt-2 rounded-xl bg-[#0088ff] flex items-center justify-center text-[28px] text-white hover:bg-blue-600 hover:shadow-lg active:scale-[0.98] transition-all"
            style={{ fontFamily: 'Kadwa', fontWeight: 700 }}
            onClick={handleLogin}
          >
            로그인
          </button>
        </div>

        {/* Signup Link */}
        <div className="mt-10 flex items-center gap-3">
          <span className="text-[22px] text-gray-500" style={{ fontFamily: 'Kadwa' }}>
            계정이 없으신가요?
          </span>
          <button 
            className="text-[22px] text-[#0088ff] hover:text-blue-700 hover:underline transition-colors" 
            style={{ fontFamily: 'Kadwa' }}
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
