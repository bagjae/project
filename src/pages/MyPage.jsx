import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyPage() {
  const { currentUser, rentals, returnBook } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleReturn = (rentalId) => {
    if (window.confirm("이 책을 반납하시겠습니까?")) {
      returnBook(rentalId);
    }
  };

  if (!currentUser) return null;

  const userRentals = rentals.filter(r => r.username === currentUser.username);
  
  const now = new Date();
  
  const activeRentals = userRentals.filter(r => r.status === '대여중');
  const pastRentals = userRentals.filter(r => r.status === '반납됨');

  return (
    <div 
      className="relative mx-auto h-[1498px] w-[1920px] bg-gray-50 overflow-hidden shadow-xl" 
      style={{ transformOrigin: 'top center', transform: 'scale(max(min(1, 100vw / 1920), 0.5))' }}
    >
      <Header />
      
      <div className="absolute left-[260px] top-[250px] w-[1400px] flex gap-10">
        
        {/* Profile Sidebar */}
        <div className="w-[400px] h-fit bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center border border-gray-100">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <span className="text-5xl font-bold text-blue-500 font-kadwa">{currentUser.name[0]}</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 font-kadwa mb-2">{currentUser.name} 님</h2>
          <span className="text-2xl text-gray-500 font-kadwa mb-8">@{currentUser.username}</span>
          
          <div className="w-full flex flex-col gap-4 border-t border-gray-100 pt-8">
            <div className="flex justify-between items-center">
              <span className="text-xl text-gray-500 font-kadwa">현재 대여 중</span>
              <span className="text-2xl font-bold text-blue-500 font-kadwa">{activeRentals.length} 권</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl text-gray-500 font-kadwa">누적 대여 기록</span>
              <span className="text-2xl font-bold text-gray-700 font-kadwa">{pastRentals.length} 권</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-10">
          
          {/* Active Rentals */}
          <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-800 font-kadwa mb-8">현재 대여 중인 도서</h3>
            <div className="flex flex-col gap-6">
              {activeRentals.length === 0 ? (
                <div className="py-10 text-center text-2xl text-gray-400 font-kadwa">
                  현재 대여 중인 도서가 없습니다.
                </div>
              ) : (
                activeRentals.map(rental => {
                  const returnDate = new Date(rental.returnDate);
                  const isOverdue = now > returnDate;
                  const diffDays = Math.ceil((now - returnDate) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={rental.id} className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex flex-col gap-2">
                        <span className="text-2xl font-bold text-gray-800 font-kadwa">{rental.bookTitle}</span>
                        <span className="text-lg text-gray-500 font-kadwa">{rental.bookAuthor} | {rental.bookGenre}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end gap-2">
                          {isOverdue ? (
                            <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-xl font-bold font-kadwa">
                              {diffDays}일 연체됨
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-xl font-bold font-kadwa">
                              정상 대여중
                            </span>
                          )}
                          <span className="text-lg text-gray-500 font-kadwa">
                            기한: {returnDate.toLocaleDateString()}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleReturn(rental.id)}
                          className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-colors shadow-sm font-kadwa text-xl"
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
          <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-800 font-kadwa mb-8">과거 대여 기록</h3>
            
            {pastRentals.length === 0 ? (
              <div className="py-10 text-center text-2xl text-gray-400 font-kadwa">
                과거 대여 기록이 없습니다.
              </div>
            ) : (
              <table className="w-full text-left font-kadwa">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-500 text-xl">
                    <th className="pb-4 font-normal">도서 제목</th>
                    <th className="pb-4 font-normal">저자</th>
                    <th className="pb-4 font-normal">장르</th>
                    <th className="pb-4 font-normal">대여일</th>
                    <th className="pb-4 font-normal">반납일</th>
                  </tr>
                </thead>
                <tbody>
                  {pastRentals.map(rental => (
                    <tr key={rental.id} className="border-b border-gray-100 text-xl text-gray-800">
                      <td className="py-6 font-bold">{rental.bookTitle}</td>
                      <td className="py-6 text-gray-600">{rental.bookAuthor}</td>
                      <td className="py-6 text-gray-500">{rental.bookGenre}</td>
                      <td className="py-6 text-gray-500">{new Date(rental.rentDate).toLocaleDateString()}</td>
                      <td className="py-6 text-gray-500">{new Date(rental.returnDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
