import React, { useState } from 'react';
import Header from '../components/Header';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';
  const type = searchParams.get('type') || '제목검색';
  
  const { books, currentUser, rentBook } = useAuth();
  
  const [selectedBook, setSelectedBook] = useState(null);
  const [rentSuccessModal, setRentSuccessModal] = useState(null); // stores { returnDate }

  // Search logic
  const filteredBooks = books.filter(b => {
    if (!query) return true;
    if (type === '작가검색') return b.author.includes(query);
    if (type === '장르검색') return b.genre.includes(query);
    return b.title.includes(query);
  });

  const handleRentClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (selectedBook.availableQuantity > 0) {
      const returnDateObj = rentBook(selectedBook.id);
      if (returnDateObj) {
        setRentSuccessModal({ returnDate: returnDateObj });
      }
    }
  };

  const handleCloseSuccess = () => {
    setRentSuccessModal(null);
    setSelectedBook(null); // Close both modals
  };

  return (
    <div 
      className="relative mx-auto h-[1498px] w-[1920px] bg-white overflow-hidden shadow-xl" 
      style={{ transformOrigin: 'top center', transform: 'scale(max(min(1, 100vw / 1920), 0.5))' }}
    >
      <Header />
      
      <div className="absolute left-[259px] top-[287px] flex flex-col gap-[20px] w-[1402px] h-[1100px]">
        {/* Search Result Header */}
        <div className="flex items-end justify-between px-2 mb-4">
          <span className="text-[40px] text-black" style={{ fontFamily: 'Kadwa', fontWeight: 700 }}>
            "{query}" 검색 결과
          </span>
          <span className="text-[28px] text-gray-500" style={{ fontFamily: 'Kadwa' }}>
            총 {filteredBooks.length}건
          </span>
        </div>

        {/* Result List */}
        <div className="flex flex-col gap-[30px] overflow-y-auto pr-4 pb-10">
          {filteredBooks.length === 0 ? (
            <div className="w-full text-center py-20 text-[30px] text-gray-400 font-kadwa">
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div 
                key={book.id} 
                onClick={() => setSelectedBook(book)}
                className="w-full bg-[#f8f9fa] rounded-[21px] border-[2px] border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all flex items-center p-8 gap-10"
              >
                <div className="w-[180px] h-[250px] shrink-0 bg-white rounded-lg shadow-md overflow-hidden">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-4">
                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-[18px] font-kadwa">{book.genre}</span>
                    <span className={`px-3 py-1 rounded-full text-[18px] font-kadwa text-white ${book.availableQuantity > 0 ? 'bg-blue-500' : 'bg-red-500'}`}>
                      {book.availableQuantity > 0 ? '대여 가능' : '대여 불가'}
                    </span>
                  </div>
                  <span className="text-[42px] font-bold text-black leading-tight" style={{ fontFamily: 'Kadwa' }}>{book.title}</span>
                  <span className="text-[26px] text-gray-600" style={{ fontFamily: 'Kadwa' }}>{book.author} 저</span>
                  <p className="text-[22px] text-gray-500 mt-2 line-clamp-2">{book.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Book Detail Modal */}
      {selectedBook && !rentSuccessModal && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={() => setSelectedBook(null)}
        >
          <div 
            className="w-[900px] bg-white rounded-3xl shadow-2xl p-12 flex flex-col relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing
          >
            <button 
              className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"
              onClick={() => setSelectedBook(null)}
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex gap-12">
              <div className="w-[260px] h-[370px] shrink-0 rounded-xl shadow-xl overflow-hidden">
                <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-6 flex-1 pt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xl text-blue-500 font-bold tracking-wide font-kadwa">{selectedBook.genre}</span>
                  <h2 className="text-[46px] font-bold text-gray-900 leading-tight font-kadwa">{selectedBook.title}</h2>
                  <span className="text-[28px] text-gray-600 font-kadwa">{selectedBook.author}</span>
                </div>
                
                <div className="h-[1px] w-full bg-gray-200 my-2" />
                
                <div className="grid grid-cols-2 gap-8 mb-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-lg text-gray-500 font-kadwa">도서 위치</span>
                    <span className="text-2xl font-semibold text-gray-800 font-kadwa">{selectedBook.location}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-lg text-gray-500 font-kadwa">잔여 수량 / 총 수량</span>
                    <span className="text-2xl font-semibold text-gray-800 font-kadwa">{selectedBook.availableQuantity} / {selectedBook.totalQuantity}</span>
                  </div>
                </div>

                {/* Render Button Logic */}
                {selectedBook.availableQuantity > 0 ? (
                  currentUser ? (
                    <button 
                      onClick={handleRentClick}
                      className="w-full h-[64px] bg-[#0088ff] text-white text-[26px] font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-md font-kadwa"
                    >
                      대여 신청
                    </button>
                  ) : (
                    <button 
                      onClick={handleRentClick}
                      className="w-full h-[64px] border-2 border-[#0088ff] text-[#0088ff] text-[26px] font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm font-kadwa"
                    >
                      로그인하고 대여하기
                    </button>
                  )
                ) : (
                  <button 
                    disabled
                    className="w-full h-[64px] bg-gray-300 text-gray-600 text-[26px] font-bold rounded-xl cursor-not-allowed font-kadwa"
                  >
                    대여할 수 없습니다
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rent Success Modal */}
      {rentSuccessModal && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
        >
          <div className="w-[500px] bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center animate-fade-in-up">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[36px] font-bold text-gray-800 font-kadwa mb-4 text-center">대여 신청 완료</h2>
            <span className="text-[24px] text-gray-600 font-kadwa mb-8">
              반납 예정일: {rentSuccessModal.returnDate.toLocaleDateString()}
            </span>
            <button 
              className="w-full h-[60px] rounded-xl bg-[#0088ff] text-white text-[24px] font-bold hover:bg-blue-600 transition-colors font-kadwa"
              onClick={handleCloseSuccess}
            >
              확인
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
