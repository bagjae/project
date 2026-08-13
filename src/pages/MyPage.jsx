import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyPage() {
  const { currentUser, returnBook, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  
  const [mypageData, setMypageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedBooks, setExpandedBooks] = useState({});

  // Modals for Profile Edit & Password Change
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalMsg, setModalMsg] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchMyPage = async () => {
      try {
        const headers = currentUser?.token ? { 'Authorization': `Bearer ${currentUser.token}` } : {};
        let res = await fetch(`http://192.168.1.212:8000/users/me/mypage`, { headers });
        if (!res.ok) {
          res = await fetch(`http://192.168.1.212:8000/users/${currentUser.id}/mypage`, { headers });
        }
        if (res.ok) {
          const data = await res.json();
          setMypageData(data);
        } else {
          setMypageData({
            name: currentUser.name,
            login_id: currentUser.username,
            rental_banned_until: currentUser.rental_banned_until,
            current_rentals: [],
            past_rentals: []
          });
        }
      } catch (err) {
        console.error("마이페이지 정보 불러오기 실패:", err);
        setMypageData({
          name: currentUser.name,
          login_id: currentUser.username,
          rental_banned_until: currentUser.rental_banned_until,
          current_rentals: [],
          past_rentals: []
        });
      }
      setLoading(false);
    };

    fetchMyPage();
  }, [currentUser, navigate]);

  const handleReturn = (rentalId) => {
    if (window.confirm("이 책을 반납하시겠습니까?")) {
      returnBook(rentalId);
    }
  };

  const toggleExpand = (title) => {
    setExpandedBooks(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const openProfileModal = () => {
    setEditName(currentUser?.name || mypageData?.name || '');
    setEditPhone(currentUser?.phone_number || '');
    setEditEmail(currentUser?.email || '');
    setEditAddress(currentUser?.address || '');
    setModalMsg('');
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName) {
      setModalMsg('이름을 입력해 주세요.');
      return;
    }
    const res = await updateProfile({
      name: editName,
      phone_number: editPhone,
      email: editEmail,
      address: editAddress
    });
    if (res.success) {
      alert("개인정보가 성공적으로 수정되었습니다.");
      setIsEditProfileOpen(false);
      setMypageData(prev => ({ ...prev, name: editName }));
    } else {
      setModalMsg(res.message);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      setModalMsg('모든 비밀번호 항목을 입력해 주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalMsg('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }
    const res = await changePassword(currentPassword, newPassword);
    if (res.success) {
      alert("비밀번호가 성공적으로 변경되었습니다.");
      setIsChangePasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setModalMsg(res.message);
    }
  };

  if (!currentUser || loading) return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex items-center justify-center text-gray-500">
        로딩 중...
      </div>
    </div>
  );

  if (!mypageData) return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex items-center justify-center text-red-500">
        정보를 불러오지 못했습니다.
      </div>
    </div>
  );

  const activeRentals = mypageData.current_rentals || [];
  const pastRentals = mypageData.past_rentals || [];

  // Check if user is currently banned from renting due to overdue penalty
  const bannedUntilStr = mypageData.rental_banned_until || currentUser.rental_banned_until;
  const isBanned = bannedUntilStr && new Date(bannedUntilStr) > new Date();

  // Group past rentals by book title for the UI
  const groupedPastRentals = Object.values(
    pastRentals.reduce((acc, rental) => {
      if (!acc[rental.book_title]) {
        acc[rental.book_title] = {
          bookTitle: rental.book_title,
          bookAuthor: rental.author_name,
          bookGenre: rental.genre_name,
          history: []
        };
      }
      acc[rental.book_title].history.push(rental);
      return acc;
    }, {})
  ).map(group => {
    group.history.sort((a, b) => new Date(b.return_date) - new Date(a.return_date));
    return group;
  }).sort((a, b) => {
    return new Date(b.history[0].return_date) - new Date(a.history[0].return_date);
  });

  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Profile Sidebar */}
        <aside className="w-full lg:w-[340px] shrink-0">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 flex flex-col items-center border border-gray-100">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-5 border border-blue-100 relative">
              <span className="text-[32px] font-bold text-blue-600">{mypageData.name ? mypageData.name[0] : 'U'}</span>
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-1">{mypageData.name} 님</h2>
            <span className="text-[14px] text-gray-500 font-medium mb-4">@{mypageData.login_id}</span>

            {/* Profile Info Details */}
            <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 flex flex-col gap-2 border border-gray-100 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">전화번호</span>
                <span className="text-gray-900 font-semibold">{currentUser?.phone_number || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">이메일</span>
                <span className="text-gray-900 font-semibold truncate max-w-[170px]">{currentUser?.email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">집 주소</span>
                <span className="text-gray-900 font-semibold truncate max-w-[170px]">{currentUser?.address || '-'}</span>
              </div>
            </div>
            
            {/* Penalty Badge */}
            {isBanned && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 mb-6 flex flex-col items-center text-center">
                <span className="text-red-700 font-bold text-[13px] flex items-center gap-1">
                  ⚠️ 대여 정지 상태
                </span>
                <span className="text-red-600 text-[12px] mt-1">
                  {bannedUntilStr}까지 대여 불가능
                </span>
              </div>
            )}

            <div className="w-full flex flex-col gap-4 border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-gray-600 font-medium">현재 대여 중</span>
                <span className="text-[18px] font-bold text-blue-600">{activeRentals.length} 권</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-gray-600 font-medium">누적 대여 기록</span>
                <span className="text-[18px] font-bold text-gray-900">{pastRentals.length} 권</span>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="w-full flex flex-col gap-2.5 border-t border-gray-100 pt-6 mt-6">
              <button
                onClick={openProfileModal}
                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-[14px] rounded-xl border border-gray-200 transition-colors"
              >
                개인정보 수정 (이름/전화번호/이메일/주소)
              </button>
              <button
                onClick={() => { setIsChangePasswordOpen(true); setModalMsg(''); }}
                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-[14px] rounded-xl border border-gray-200 transition-colors"
              >
                비밀번호 변경
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Overdue Penalty Banner */}
          {isBanned && (
            <div className="bg-red-500 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div>
                  <h4 className="text-[18px] font-bold">연체 페널티로 인한 도서 대여 정지 안내</h4>
                  <p className="text-[14px] opacity-90">반납 기한 지연으로 인해 <strong>{bannedUntilStr}</strong>까지 신규 도서 대여가 정지된 상태입니다.</p>
                </div>
              </div>
            </div>
          )}

          {/* Active Rentals */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 border border-gray-100">
            <h3 className="text-[20px] font-bold text-gray-900 mb-6 tracking-tight">현재 대여 중인 도서</h3>
            <div className="flex flex-col gap-4">
              {activeRentals.length === 0 ? (
                <div className="py-12 text-center text-[15px] text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                  현재 대여 중인 도서가 없습니다.
                </div>
              ) : (
                activeRentals.map((rental, idx) => {
                  const returnDate = new Date(rental.due_date);
                  const isOverdue = rental.is_overdue;
                  const diffDays = rental.overdue_days;
                  
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[18px] font-bold text-gray-900">{rental.book_title}</span>
                      </div>
                      <div className="flex items-center gap-5 justify-between sm:justify-end border-t border-gray-100 pt-4 sm:border-0 sm:pt-0">
                        <div className="flex flex-col sm:items-end gap-1">
                          {isOverdue ? (
                            <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded text-[13px] font-bold border border-red-100 inline-block w-fit">
                              {diffDays}일 연체됨 (반납 시 {diffDays}일 대여 정지 누적)
                            </span>
                          ) : (
                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-[13px] font-bold border border-blue-100 inline-block w-fit">
                              정상 대여중
                            </span>
                          )}
                          <span className="text-[13px] text-gray-500 font-medium">
                            기한: {returnDate.toLocaleDateString()}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleReturn(rental.rental_id)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm text-[14px]"
                        >
                          반납하기
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Past History */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 border border-gray-100">
            <h3 className="text-[20px] font-bold text-gray-900 mb-6 tracking-tight">과거 대여 기록</h3>
            
            {groupedPastRentals.length === 0 ? (
              <div className="py-12 text-center text-[15px] text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                과거 대여 기록이 없습니다.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {groupedPastRentals.map(group => (
                  <div key={group.bookTitle} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Summary Row */}
                    <div 
                      onClick={() => toggleExpand(group.bookTitle)}
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[16px] font-bold text-gray-900">{group.bookTitle}</span>
                        <span className="text-[13px] text-gray-500 font-medium">{group.bookAuthor} <span className="mx-1 text-gray-300">|</span> {group.bookGenre}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] text-blue-600 font-bold bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                          총 {group.history.length}회 대여
                        </span>
                        <div className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${expandedBooks[group.bookTitle] ? 'bg-gray-100' : ''}`}>
                          <svg 
                            className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${expandedBooks[group.bookTitle] ? 'rotate-180' : ''}`} 
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {expandedBooks[group.bookTitle] && (
                      <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                        <div className="flex flex-col gap-3">
                          {group.history.map((record, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between text-[14px] bg-white p-4 rounded-lg border border-gray-200 shadow-sm gap-2">
                              <span className="text-gray-700 font-bold">{group.history.length - index}회차 대여</span>
                              <div className="flex items-center gap-4 text-gray-500 text-[13.5px] font-medium">
                                <span><span className="text-gray-400 mr-1">대여:</span> {new Date(record.rental_date).toLocaleDateString()}</span>
                                <span className="text-gray-300">|</span>
                                <span><span className="text-gray-400 mr-1">반납:</span> {new Date(record.return_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-[440px] shadow-2xl border border-gray-100 flex flex-col gap-4">
            <h3 className="text-[20px] font-bold text-gray-900">개인정보 수정</h3>
            <p className="text-[13px] text-gray-500">아이디는 변경이 불가능하며, 기타 개인정보를 수정할 수 있습니다.</p>
            <div className="flex flex-col gap-3 mt-1">
              <div>
                <label className="text-[13px] font-medium text-gray-600 mb-1 block">이름</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-600 mb-1 block">전화번호</label>
                <input
                  type="text"
                  placeholder="예: 010-1234-5678"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-600 mb-1 block">이메일</label>
                <input
                  type="email"
                  placeholder="예: user@example.com"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-600 mb-1 block">집 주소</label>
                <input
                  type="text"
                  placeholder="집 주소 입력"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
                />
              </div>
            </div>
            {modalMsg && <p className="text-red-500 text-[13px]">{modalMsg}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsEditProfileOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-600 hover:bg-gray-50">취소</button>
              <button onClick={handleSaveProfile} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-medium hover:bg-blue-700">저장하기</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-[420px] shadow-2xl border border-gray-100 flex flex-col gap-4">
            <h3 className="text-[20px] font-bold text-gray-900">비밀번호 변경</h3>
            <p className="text-[13px] text-gray-500">현재 비밀번호를 확인한 후 새로운 비밀번호로 변경합니다.</p>
            <div className="flex flex-col gap-3 mt-1">
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full h-11 border border-gray-300 rounded-lg px-3.5 text-[14px] outline-none focus:border-blue-500"
              />
            </div>
            {modalMsg && <p className="text-red-500 text-[13px]">{modalMsg}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsChangePasswordOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-600 hover:bg-gray-50">취소</button>
              <button onClick={handleSavePassword} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-medium hover:bg-blue-700">변경하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
