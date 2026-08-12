import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function RentalStatus() {
  const { currentUser } = useAuth();
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchRentals = async () => {
      try {
        const res = await fetch(`http://192.168.1.212:8000/users/${currentUser.id}/mypage`);
        if (res.ok) {
          const data = await res.json();
          setActiveRentals(data.current_rentals || []);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchRentals();
  }, [currentUser]);
  
  if (!currentUser) {
    return (
      <div className="w-full max-w-7xl mx-auto mb-16 px-6">
        <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-8 flex flex-col items-center justify-center min-h-[280px]">
          <h2 className="text-[22px] font-bold text-gray-900 font-sans tracking-tight mb-4 self-start">나의 대여 / 연체 현황</h2>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[18px] text-gray-500 font-medium font-sans">로그인 후 이용가능</p>
          </div>
        </div>
      </div>
    );
  }
  
  const now = new Date();

  return (
    <div className="w-full max-w-7xl mx-auto mb-16 px-6">
      <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-8 flex flex-col min-h-[280px]">
        <h2 className="text-[22px] font-bold text-gray-900 font-sans tracking-tight mb-6">나의 대여 / 연체 현황</h2>
        
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {activeRentals.length === 0 ? (
            <div className="w-full text-center py-12 text-[16px] text-gray-400 font-sans">
              현재 대여 중인 도서가 없습니다.
            </div>
          ) : (
            activeRentals.map(rental => {
              const returnDate = new Date(rental.due_date);
              
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const rDate = new Date(returnDate);
              rDate.setHours(0, 0, 0, 0);
              
              const diffTime = rDate.getTime() - today.getTime();
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
              
              let statusConfig = { bg: 'bg-blue-50', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: '대여 중', color: 'text-blue-700', iconColor: 'text-blue-500', borderColor: 'border-blue-200' };
              
              if (diffDays < 0) {
                statusConfig = { bg: 'bg-red-50', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: '연체됨', color: 'text-red-700', iconColor: 'text-red-500', borderColor: 'border-red-200' };
              } else if (diffDays <= 2) {
                statusConfig = { bg: 'bg-orange-50', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text: '반납 임박', color: 'text-orange-700', iconColor: 'text-orange-500', borderColor: 'border-orange-200' };
              }

              return (
                <div 
                  key={rental.id} 
                  className={`w-[320px] shrink-0 rounded-xl border ${statusConfig.borderColor} ${statusConfig.bg} p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1 pr-3">
                      <span className="text-[18px] font-bold text-gray-900 font-sans truncate">{rental.book_title}</span>
                      <span className="text-[14px] text-gray-600 font-sans truncate">{rental.author_name}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <svg className={`w-6 h-6 ${statusConfig.iconColor} mb-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={statusConfig.icon}></path>
                      </svg>
                      <span className={`text-[14px] font-bold ${statusConfig.color} font-sans`}>{statusConfig.text}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-t border-gray-200 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[12px] text-gray-500 font-sans mb-0.5">대여일</span>
                      <span className="text-[14px] text-gray-700 font-sans font-medium">{new Date(rental.rental_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[12px] text-gray-500 font-sans mb-0.5">반납 기한</span>
                      <span className="text-[15px] font-bold text-gray-900 font-sans">{returnDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
