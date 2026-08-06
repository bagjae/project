import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyPage() {
  const { currentUser, returnBook } = useAuth();
  const navigate = useNavigate();
  
  const [mypageData, setMypageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedBooks, setExpandedBooks] = useState({});

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchMyPage = async () => {
      try {
        const res = await fetch(`http://192.168.1.212:8000/users/${currentUser.id}/mypage`);
        if (res.ok) {
          const data = await res.json();
          setMypageData(data);
        }
      } catch (err) {
        console.error("마이페이지 정보 불러오기 실패:", err);
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
    // Sort history by returnDate descending (most recent first)
    group.history.sort((a, b) => new Date(b.return_date) - new Date(a.return_date));
    return group;
  }).sort((a, b) => {
    // Sort groups by their most recent return date
    return new Date(b.history[0].return_date) - new Date(a.history[0].return_date);
  });

  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Profile Sidebar */}
        <aside className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 flex flex-col items-center border border-gray-100">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-5 border border-blue-100">
              <span className="text-[32px] font-bold text-blue-600">{mypageData.name[0]}</span>
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-1">{mypageData.name} 님</h2>
            <span className="text-[14px] text-gray-500 font-medium mb-8">@{mypageData.login_id}</span>
            
            <div className="w-full flex flex-col gap-5 border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-gray-600 font-medium">현재 대여 중</span>
                <span className="text-[18px] font-bold text-blue-600">{activeRentals.length} 권</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-gray-600 font-medium">누적 대여 기록</span>
                <span className="text-[18px] font-bold text-gray-900">{pastRentals.length} 권</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-8">
          
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
                              {diffDays}일 연체됨
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
                          onClick={() => handleReturn(rental.id)}
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
    </div>
  );
}
