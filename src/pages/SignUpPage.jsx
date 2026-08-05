import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LOGO_ICON_URL =
  'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/563a6a3c-9ae2-4242-ab20-2540289775b8';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { checkIdDuplicate, signup, login } = useAuth();

  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const [idError, setIdError] = useState('');
  const [pwError, setPwError] = useState('');
  
  const [showWelcome, setShowWelcome] = useState(false);

  const handleIdBlur = () => {
    if (!username) return;
    if (checkIdDuplicate(username)) {
      setIdError('사용할 수 없는 아이디입니다');
    } else {
      setIdError('');
    }
  };

  const handleTyping = (setter, errorSetter) => (e) => {
    setter(e.target.value);
    if (errorSetter) errorSetter('');
  };

  const handleSignup = () => {
    if (!username || !password || !confirmPassword || !name || !phone) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (checkIdDuplicate(username)) {
      setIdError('사용할 수 없는 아이디입니다');
      return;
    }
    if (password !== confirmPassword) {
      setPwError('비밀번호가 일치하지 않습니다');
      return;
    }

    const success = signup({ username, password, name, phone });
    if (success) {
      setShowWelcome(true);
    }
  };

  const handleWelcomeConfirm = () => {
    setShowWelcome(false);
    login(username, password);
    navigate('/');
  };

  return (
    <div 
      className="relative mx-auto h-[1080px] w-[1920px] bg-gray-50 overflow-hidden flex items-center justify-center" 
      style={{ transformOrigin: 'top center', transform: 'scale(max(min(1, 100vw / 1920), 0.5))' }}
    >
      <div className="w-[540px] rounded-[24px] bg-white shadow-2xl p-[50px] px-[60px] flex flex-col items-center border border-gray-100">
        
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-5 mb-8">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <img src={LOGO_ICON_URL} alt="BookNest Logo" className="h-[64px] w-[64px] object-contain" />
            <span className="text-[38px] text-black" style={{ fontFamily: 'Kadwa', fontWeight: 700 }}>BookNest</span>
          </div>
          <span className="text-[26px] text-gray-500" style={{ fontFamily: 'Kadwa', fontWeight: 400 }}>
            회원가입
          </span>
        </div>

        {/* Form Fields */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[20px] text-gray-700 font-kadwa">전화번호</label>
            <input 
              type="text" 
              value={phone}
              onChange={handleTyping(setPhone)}
              placeholder="전화번호를 입력하세요" 
              className="w-full h-[56px] rounded-xl border border-gray-300 px-5 text-[20px] text-black placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-kadwa" 
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-[20px] text-gray-700 font-kadwa">아이디</label>
            <input 
              type="text" 
              value={username}
              onChange={handleTyping(setUsername, setIdError)}
              onBlur={handleIdBlur}
              placeholder="사용할 아이디를 입력하세요" 
              className={`w-full h-[56px] rounded-xl border ${idError ? 'border-red-500' : 'border-gray-300'} px-5 text-[20px] text-black placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-kadwa`} 
            />
            {idError && <span className="text-red-500 text-[16px] font-kadwa mt-1 absolute -bottom-6 left-1 animate-fade-in-up">{idError}</span>}
          </div>

          <div className="flex flex-col gap-2 relative mt-2">
            <label className="text-[20px] text-gray-700 font-kadwa">비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={handleTyping(setPassword)}
              placeholder="비밀번호를 입력하세요" 
              className="w-full h-[56px] rounded-xl border border-gray-300 px-5 text-[20px] text-black placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-kadwa" 
            />
          </div>
          
          <div className="flex flex-col gap-2 relative">
            <label className="text-[20px] text-gray-700 font-kadwa">비밀번호 확인</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={handleTyping(setConfirmPassword, setPwError)}
              placeholder="비밀번호를 다시 입력하세요" 
              className={`w-full h-[56px] rounded-xl border ${pwError ? 'border-red-500' : 'border-gray-300'} px-5 text-[20px] text-black placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-kadwa`} 
            />
            {pwError && <span className="text-red-500 text-[16px] font-kadwa mt-1 absolute -bottom-6 left-1 animate-fade-in-up">{pwError}</span>}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[20px] text-gray-700 font-kadwa">이름</label>
            <input 
              type="text" 
              value={name}
              onChange={handleTyping(setName)}
              placeholder="사용할 이름을 입력하세요" 
              className="w-full h-[56px] rounded-xl border border-gray-300 px-5 text-[20px] text-black placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-kadwa" 
            />
          </div>

          {/* Signup Button */}
          <button 
            className="w-full h-[64px] mt-4 rounded-xl bg-[#0088ff] flex items-center justify-center text-[26px] text-white hover:bg-blue-600 hover:shadow-lg active:scale-[0.98] transition-all font-kadwa font-bold"
            onClick={handleSignup}
          >
            회원가입
          </button>
        </div>

        {/* Login Link */}
        <div className="mt-8 flex items-center gap-3">
          <span className="text-[20px] text-gray-500 font-kadwa">
            이미 계정이 있으신가요?
          </span>
          <button 
            className="text-[20px] text-[#0088ff] hover:text-blue-700 hover:underline transition-colors font-kadwa" 
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
        </div>
      </div>

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="w-[500px] bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center animate-fade-in-up">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[36px] font-bold text-gray-800 font-kadwa mb-8 text-center">환영합니다 {name}님!</h2>
            <button 
              className="w-full h-[60px] rounded-xl bg-[#0088ff] text-white text-[24px] font-bold hover:bg-blue-600 transition-colors font-kadwa"
              onClick={handleWelcomeConfirm}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
