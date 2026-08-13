import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LOGO_ICON_URL =
  'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/563a6a3c-9ae2-4242-ab20-2540289775b8';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, findId, resetPassword, reactivateUser } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Active modal type: 'findId' | 'resetPassword' | 'reactivate' | null
  const [activeModal, setActiveModal] = useState(null);

  // Form states for modals
  const [modalName, setModalName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalAddress, setModalAddress] = useState('');
  const [modalUsername, setModalUsername] = useState('');
  const [modalNewPassword, setModalNewPassword] = useState('');
  const [modalMsg, setModalMsg] = useState('');
  const [foundIdResult, setFoundIdResult] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMsg('아이디 또는 비밀번호를 입력해주세요.');
      return;
    }
    
    const res = await login(username, password);
    if (res.success) {
      navigate('/');
    } else {
      if (res.isDormant) {
        setErrorMsg(res.message);
        setModalUsername(username);
        setActiveModal('reactivate');
      } else {
        setErrorMsg(res.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalName('');
    setModalPhone('');
    setModalUsername('');
    setModalNewPassword('');
    setModalMsg('');
    setFoundIdResult('');
  };

  const handleFindId = async () => {
    if (!modalName || !modalPhone) {
      setModalMsg('이름과 전화번호를 입력하세요.');
      return;
    }
    const res = await findId(modalName, modalPhone);
    if (res.success) {
      setFoundIdResult(res.login_id);
      setModalMsg('');
    } else {
      setModalMsg(res.message);
    }
  };

  const handleResetPassword = async () => {
    if (!modalUsername || !modalName || !modalPhone || !modalNewPassword) {
      setModalMsg('모든 정보를 입력하세요.');
      return;
    }
    const res = await resetPassword(modalUsername, modalName, modalPhone, modalNewPassword);
    setModalMsg(res.message);
    if (res.success) {
      setTimeout(() => closeModal(), 2000);
    }
  };

  const handleReactivate = async () => {
  if (!modalUsername || !modalName || !modalPhone || !modalEmail || !modalAddress) {
    setModalMsg('모든 정보를 입력하세요.');
    return;
  }
  const res = await reactivateUser(modalUsername, modalName, modalPhone, modalEmail, modalAddress);
  setModalMsg(res.message);
  if (res.success) {
    setTimeout(() => closeModal(), 2000);
  }
};

  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col items-center justify-center font-sans p-6">
      <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 flex flex-col items-center border border-gray-200">
        
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-4 mb-8 w-full">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <img src={LOGO_ICON_URL} alt="BookNest Logo" className="h-[40px] w-[40px] object-contain group-hover:opacity-80 transition-opacity" />
            <span className="text-[28px] text-black font-bold tracking-tight group-hover:text-blue-700 transition-colors">BookNest</span>
          </div>
          <span className="text-[15px] text-gray-500 font-medium">
            로그인하여 모든 서비스를 이용해보세요
          </span>
        </div>

        {/* Form Fields */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-gray-700">아이디</label>
            <input 
              type="text" 
              value={username}
              onChange={e => { setUsername(e.target.value); if(errorMsg) setErrorMsg(''); }}
              placeholder="아이디를 입력하세요" 
              className={`w-full h-[48px] rounded-lg border ${errorMsg ? 'border-red-500 bg-red-50/30' : 'border-gray-300'} px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`} 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-gray-700">비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={e => { setPassword(e.target.value); if(errorMsg) setErrorMsg(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="비밀번호를 입력하세요" 
              className={`w-full h-[48px] rounded-lg border ${errorMsg ? 'border-red-500 bg-red-50/30' : 'border-gray-300'} px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all`} 
            />
          </div>
          
          {/* Error Message */}
          <div className="min-h-[24px] flex items-start">
            {errorMsg && (
              <span className="text-red-500 text-[13px] font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {errorMsg}
              </span>
            )}
          </div>

          {/* Login Button */}
          <button 
            className="w-full h-[50px] rounded-lg bg-[#2d333a] flex items-center justify-center text-[16px] font-semibold text-white hover:bg-black hover:shadow-md active:scale-[0.98] transition-all"
            onClick={handleLogin}
          >
            로그인
          </button>
        </div>

        {/* Sub Links (Find ID / Reset Password) */}
        <div className="mt-5 w-full flex items-center justify-center gap-4 text-[13px] text-gray-500">
          <button onClick={() => { closeModal(); setActiveModal('findId'); }} className="hover:text-blue-600 font-medium">
            아이디 찾기
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={() => { closeModal(); setActiveModal('resetPassword'); }} className="hover:text-blue-600 font-medium">
            비밀번호 찾기
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={() => { closeModal(); setActiveModal('reactivate'); }} className="hover:text-blue-600 font-medium">
            휴면 해제
          </button>
        </div>

        {/* Signup Link */}
        <div className="mt-6 pt-5 w-full border-t border-gray-100 flex items-center justify-center gap-2">
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

      {/* Modal Dialogs */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-[420px] shadow-2xl border border-gray-100 flex flex-col gap-4">
            
            {/* Find ID Modal */}
            {activeModal === 'findId' && (
              <>
                <h3 className="text-[20px] font-bold text-gray-900">아이디 찾기</h3>
                <p className="text-[14px] text-gray-500">가입 시 등록한 이름과 전화번호를 입력해주세요.</p>
                <div className="flex flex-col gap-3 mt-1">
                  <input
                    type="text"
                    placeholder="이름"
                    value={modalName}
                    onChange={e => setModalName(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="전화번호 (예: 010-1234-5678)"
                    value={modalPhone}
                    onChange={e => setModalPhone(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                  />
                  <input
  type="email"
  placeholder="이메일"
  value={modalEmail}
  onChange={e => setModalEmail(e.target.value)}
  className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
/>
<input
  type="text"
  placeholder="집 주소"
  value={modalAddress}
  onChange={e => setModalAddress(e.target.value)}
  className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
/>
                </div>
                {foundIdResult ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-center font-bold text-[15px]">
                    고객님의 아이디: {foundIdResult}
                  </div>
                ) : (
                  modalMsg && <p className="text-red-500 text-[13px]">{modalMsg}</p>
                )}
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-600 hover:bg-gray-50">닫기</button>
                  {!foundIdResult && (
                    <button onClick={handleFindId} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-medium hover:bg-blue-700">찾기</button>
                  )}
                </div>
              </>
            )}

            {/* Reset Password Modal */}
            {activeModal === 'resetPassword' && (
              <>
                <h3 className="text-[20px] font-bold text-gray-900">비밀번호 찾기/재설정</h3>
                <p className="text-[14px] text-gray-500">본인 확인 후 새 비밀번호를 설정할 수 있습니다.</p>
                <div className="flex flex-col gap-3 mt-1">
                  <input
                    type="text"
                    placeholder="아이디"
                    value={modalUsername}
                    onChange={e => setModalUsername(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="이름"
                    value={modalName}
                    onChange={e => setModalName(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="전화번호"
                    value={modalPhone}
                    onChange={e => setModalPhone(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="새 비밀번호"
                    value={modalNewPassword}
                    onChange={e => setModalNewPassword(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                  />
                </div>
                {modalMsg && <p className={`text-[13px] ${modalMsg.includes('성공') ? 'text-green-600' : 'text-red-500'}`}>{modalMsg}</p>}
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-600 hover:bg-gray-50">닫기</button>
                  <button onClick={handleResetPassword} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-medium hover:bg-blue-700">비밀번호 변경</button>
                </div>
              </>
            )}

            {/* Reactivate Dormant Account Modal */}
            {activeModal === 'reactivate' && (
              <>
                <h3 className="text-[20px] font-bold text-gray-900">휴면 계정 해제</h3>
                <p className="text-[14px] text-gray-500">장기 미접속으로 휴면 처리된 계정을 본인 인증 후 해제합니다.</p>
                <div className="flex flex-col gap-3 mt-1">
                  <input
                    type="text"
                    placeholder="아이디"
                    value={modalUsername}
                    onChange={e => setModalUsername(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="이름"
                    value={modalName}
                    onChange={e => setModalName(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="전화번호"
                    value={modalPhone}
                    onChange={e => setModalPhone(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                  />
                </div>
                {modalMsg && <p className={`text-[13px] ${modalMsg.includes('성공') ? 'text-green-600 font-bold' : 'text-red-500'}`}>{modalMsg}</p>}
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-600 hover:bg-gray-50">취소</button>
                  <button onClick={handleReactivate} className="px-4 py-2 bg-green-600 text-white rounded-lg text-[14px] font-medium hover:bg-green-700">휴면 해제</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}