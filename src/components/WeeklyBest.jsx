import React, { useState, useEffect } from 'react';

function ArrowButton({ direction, onClick, disabled }) {
  const isLeft = direction === 'left';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md transition-all ${
        disabled ? 'opacity-0 cursor-default' : 'opacity-0 group-hover:opacity-100 hover:bg-gray-50 hover:text-blue-600 cursor-pointer text-gray-600'
      }`}
    >
      {isLeft ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
      )}
    </button>
  );
}

export default function WeeklyBest() {
  const [bestsellers, setBestsellers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const res = await fetch('http://192.168.1.212:8000/books/bestsellers');
        if (res.ok) {
          const data = await res.json();
          setBestsellers(data);
        }
      } catch (err) {
        console.error("베스트셀러 불러오기 실패:", err);
      }
    };
    fetchBestsellers();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    // Show 4 items at a time
    setCurrentIndex((prev) => Math.min(Math.max(0, bestsellers.length - 4), prev + 1));
  };

  if (bestsellers.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto mt-12 mb-8 px-6 text-center text-gray-500 py-10">
        베스트셀러 정보를 불러오는 중이거나 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-12 mb-8 px-6">
      <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm pt-8 pb-10 px-10">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-[22px] font-bold text-gray-900 font-sans tracking-tight">종합 주간 베스트</h2>
        </div>

        <div className="relative group">
          <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 z-10">
            <ArrowButton direction="left" onClick={handlePrev} disabled={currentIndex === 0} />
          </div>
          <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 z-10">
            <ArrowButton direction="right" onClick={handleNext} disabled={currentIndex >= bestsellers.length - 4} />
          </div>

          <div className="overflow-hidden px-4 py-4">
            <div 
              className="flex items-center gap-8 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (220 + 32)}px)` }}
            >
              {bestsellers.map((book, i) => (
                <div key={book.id || i} className="relative shrink-0 group/book cursor-pointer hover:-translate-y-2 transition-transform duration-300" style={{ width: 220 }}>
                  <div className="w-full aspect-[2/3] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center relative">
                    {/* Placeholder image logic since backend does not provide coverUrls */}
                    <img src={`https://picsum.photos/seed/${book.id || i}/220/330`} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-4 px-1">
                    <p className="text-gray-900 font-bold text-[16px] truncate" title={book.title}>{book.title}</p>
                    <p className="text-gray-500 text-[14px] mt-1 truncate" title={`${book.author_name} · ${book.genre_name}`}>
                      {book.author_name} · {book.genre_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
