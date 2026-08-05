import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function RentalStatus() {
  const { currentUser, rentals } = useAuth();
  
  if (!currentUser) {
    return (
      <div className="absolute left-[112px] top-[940px] h-[367px] w-[1717px] rounded-[21px] border-[3px] border-black bg-white flex items-center justify-center">
        <span
          className="absolute left-[22.3px] top-[19px] text-[40px] leading-none text-black"
          style={{ fontFamily: 'Kadwa', fontWeight: 700 }}
        >
          나의 대여 / 연체 현황
        </span>
        <span
          className="text-[40px] leading-none text-[#515151]"
          style={{ fontFamily: 'Kadwa', fontWeight: 400 }}
        >
          로그인 후 이용가능
        </span>
      </div>
    );
  }

  // Get active rentals for the user
  const activeRentals = rentals.filter(r => r.username === currentUser.username && r.status === '대여중');
  
  const now = new Date();

  return (
    <div className="absolute left-[112px] top-[940px] h-[367px] w-[1717px] rounded-[21px] border-[3px] border-black bg-white overflow-hidden p-[20px]">
      <span
        className="text-[40px] leading-none text-black absolute left-[22.3px] top-[19px]"
        style={{ fontFamily: 'Kadwa', fontWeight: 700 }}
      >
        나의 대여 / 연체 현황
      </span>
      
      <div className="mt-[80px] w-full h-[240px] flex gap-[30px] overflow-x-auto px-[20px] items-center">
        {activeRentals.length === 0 ? (
          <div className="w-full text-center text-[30px] text-gray-400 font-kadwa mt-10">
            현재 대여 중인 도서가 없습니다.
          </div>
        ) : (
          activeRentals.map(rental => {
            const returnDate = new Date(rental.returnDate);
            const diffTime = returnDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let statusConfig = { bg: 'bg-blue-100', dot: '🔵', text: '대여 중', color: 'text-blue-600', borderColor: 'border-blue-200' };
            
            if (diffDays < 0) {
              statusConfig = { bg: 'bg-red-100', dot: '🔴', text: '연체됨', color: 'text-red-600', borderColor: 'border-red-300' };
            } else if (diffDays <= 2) {
              statusConfig = { bg: 'bg-yellow-100', dot: '🟡', text: '반납 임박', color: 'text-yellow-600', borderColor: 'border-yellow-300' };
            }

            return (
              <div 
                key={rental.id} 
                className={`w-[450px] shrink-0 h-[180px] rounded-[24px] border-2 ${statusConfig.borderColor} ${statusConfig.bg} p-6 flex flex-col justify-between shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[28px] font-bold text-gray-900 font-kadwa truncate max-w-[250px]">{rental.bookTitle}</span>
                    <span className="text-[20px] text-gray-600 font-kadwa">{rental.bookAuthor}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[32px]">{statusConfig.dot}</span>
                    <span className={`text-[22px] font-bold ${statusConfig.color} font-kadwa`}>{statusConfig.text}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-gray-300/30 pt-3">
                  <span className="text-[18px] text-gray-500 font-kadwa">대여: {new Date(rental.rentDate).toLocaleDateString()}</span>
                  <span className="text-[20px] font-bold text-gray-800 font-kadwa">기한: {returnDate.toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
