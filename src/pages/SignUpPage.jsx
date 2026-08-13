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

  const handleIdBlur = async () => {
    if (!username) return;
    const isDuplicate = await checkIdDuplicate(username);
    if (isDuplicate) {
      setIdError('사용할 수 없는 아이디입니다.');
    } else {
      setIdError('');
    }
  };

  const handleTyping = (setter, errorSetter) => (e) => {
    setter(e.target.value);
    if (errorSetter) errorSetter('');
  };

  const handleSignup = async () => {
    if (!username || !password || !confirmPassword || !name || !phone) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    const isDuplicate = await checkIdDuplicate(username);
    if (isDuplicate) {
      setIdError('사용할 수 없는 아이디입니다.');
      return;
    }
    if (password !== confirmPassword) {
      setPwError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const result = await signup({ username, password, name, phone });
    if (result.success) {
      setShowWelcome(true);
    } else {
      console.log(result.error);
      alert(result.error);
    }
  };

  const handleWelcomeConfirm = () => {
    setShowWelcome(false);
    login(username, password);
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col items-center justify-center font-sans py-12 px-6">
      <div className="w-full max-w-[460px] rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 flex flex-col items-center border border-gray-200">
        
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-4 mb-8 w-full">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <img src={LOGO_ICON_URL} alt="BookNest Logo" className="h-[40px] w-[40px] object-contain group-hover:opacity-80 transition-opacity" />
            <span className="text-[28px] text-black font-bold tracking-tight group-hover:text-blue-700 transition-colors">BookNest</span>
          </div>
          <span className="text-[16px] text-gray-500 font-medium mt-1">
            간편하게 가입하고 서비스를 이용해보세요
          </span>
        </div>

        {/* Form Fields */}
        <div className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-gray-700">이름</label>
            <input 
              type="text" 
              value={name}
              onChange={handleTyping(setName)}
              placeholder="이름을 입력하세요" 
              className="w-full h-[48px] rounded-lg border border-gray-300 px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-gray-700">전화번호</label>
            <input 
              type="text" 
              value={phone}
              onChange={handleTyping(setPhone)}
              placeholder="010-0000-0000" 
              className="w-full h-[48px] rounded-lg border border-gray-300 px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-[14px] font-medium text-gray-700">아이디</label>
            <input 
              type="text" 
              value={username}
              onChange={handleTyping(setUsername, setIdError)}
              onBlur={handleIdBlur}
              placeholder="사용할 아이디를 입력하세요" 
              className={`w-full h-[48px] rounded-lg border ${idError ? 'border-red-500 bg-red-50/30' : 'border-gray-300'} px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`} 
            />
            {idError && <span className="text-red-500 text-[13px] font-medium mt-1 animate-fade-in-up flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{idError}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-gray-700">비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={handleTyping(setPassword)}
              placeholder="비밀번호를 입력하세요" 
              className="w-full h-[48px] rounded-lg border border-gray-300 px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
            />
          </div>
          
          <div className="flex flex-col gap-2 relative">
            <label className="text-[14px] font-medium text-gray-700">비밀번호 확인</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={handleTyping(setConfirmPassword, setPwError)}
              placeholder="비밀번호를 다시 입력하세요" 
              className={`w-full h-[48px] rounded-lg border ${pwError ? 'border-red-500 bg-red-50/30' : 'border-gray-300'} px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`} 
            />
            {pwError && <span className="text-red-500 text-[13px] font-medium mt-1 animate-fade-in-up flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{pwError}</span>}
          </div>

          {/* Signup Button */}
          <button 
            className="w-full h-[52px] rounded-lg bg-[#2d333a] flex items-center justify-center text-[16px] font-semibold text-white hover:bg-black hover:shadow-md active:scale-[0.98] transition-all mt-4"
            onClick={handleSignup}
          >
            회원가입
          </button>
        </div>

        {/* Login Link */}
        <div className="mt-8 pt-6 w-full border-t border-gray-100 flex items-center justify-center gap-2">
          <span className="text-[14px] text-gray-500">
            이미 계정이 있으신가요?
          </span>
          <button 
            className="text-[14px] font-semibold text-blue-600 hover:text-blue-800 transition-colors" 
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
        </div>
      </div>

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in-up border border-gray-100">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-2 text-center tracking-tight">회원가입 완료</h2>
            <p className="text-[15px] text-gray-600 mb-8 text-center">환영합니다 <span className="font-bold text-gray-900">{name}</span>님!</p>
            <button 
              className="w-full h-[48px] rounded-lg bg-[#2d333a] text-white text-[15px] font-semibold hover:bg-black transition-colors"
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