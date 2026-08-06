import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';
  const type = searchParams.get('type') || '제목검색';
  
  const { currentUser, rentBook } = useAuth();
  
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [rentSuccessModal, setRentSuccessModal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let url = 'http://192.168.1.212:8000/books/search';
        if (query) {
          if (type === '작가검색') url += `?author=${encodeURIComponent(query)}`;
          else if (type === '장르검색') url += `?genre=${encodeURIComponent(query)}`;
          else url += `?title=${encodeURIComponent(query)}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setFilteredBooks(data);
        }
      } catch (err) {
        console.error("도서 검색 실패:", err);
      }
      setLoading(false);
    };
    fetchBooks();
  }, [query, type]);

  const handleBookClick = async (bookId) => {
    try {
      const res = await fetch(`http://192.168.1.212:8000/books/${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedBook(data);
      }
    } catch(err) {
      console.error("도서 상세정보 불러오기 실패:", err);
    }
  };

  const handleRentClick = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (selectedBook.stock_quantity > 0) {
      const returnDateObj = await rentBook(selectedBook.id);
      if (returnDateObj) {
        setRentSuccessModal({ returnDate: returnDateObj });
        // Update stock locally for UI
        setSelectedBook(prev => ({ ...prev, stock_quantity: prev.stock_quantity - 1 }));
        setFilteredBooks(prev => prev.map(b => b.id === selectedBook.id ? { ...b, is_available: selectedBook.stock_quantity - 1 > 0 } : b));
      }
    }
  };

  const handleCloseSuccess = () => {
    setRentSuccessModal(null);
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
        {/* Search Result Header */}
        <div className="flex items-end justify-between border-b border-gray-900 pb-4 mb-8">
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
            <span className="text-blue-600">"{query}"</span> 검색 결과
          </h1>
          <span className="text-[15px] text-gray-500 font-medium">
            총 <span className="text-gray-900 font-bold">{filteredBooks.length}</span>건
          </span>
        </div>

        {/* Result List */}
        <div className="flex flex-col gap-6">
          {loading ? (
             <div className="w-full text-center py-24 text-[16px] text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
               검색 중입니다...
             </div>
          ) : filteredBooks.length === 0 ? (
            <div className="w-full text-center py-24 text-[16px] text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div 
                key={book.id} 
                onClick={() => handleBookClick(book.id)}
                className="w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-gray-300 cursor-pointer transition-all flex flex-col sm:flex-row items-center sm:items-start p-6 gap-8 group"
              >
                <div className="w-[130px] shrink-0 bg-gray-100 rounded-lg shadow-sm overflow-hidden border border-gray-200 group-hover:-translate-y-1 transition-transform aspect-[2/3] flex items-center justify-center">
                  <span className="text-gray-400 text-sm">이미지 없음</span>
                </div>
                <div className="flex flex-col gap-2 flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-[13px] font-medium border border-gray-200">{book.genre_name}</span>
                    <span className={`px-2.5 py-1 rounded text-[13px] font-medium border ${book.is_available ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {book.is_available ? '대여 가능' : '대여 불가'}
                    </span>
                  </div>
                  <h2 className="text-[22px] font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">{book.title}</h2>
                  <span className="text-[15px] text-gray-600 font-medium">{book.author_name} 저</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Book Detail Modal */}
      {selectedBook && !rentSuccessModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div 
            className="w-full max-w-[800px] bg-white rounded-2xl shadow-2xl p-10 flex flex-col relative animate-fade-in-up border border-gray-100"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 rounded-full p-2"
              onClick={() => setSelectedBook(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-[200px] shrink-0 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden border border-gray-200 mx-auto md:mx-0 aspect-[2/3] bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">이미지 없음</span>
              </div>
              <div className="flex flex-col gap-4 flex-1 pt-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] text-blue-600 font-bold tracking-wide">{selectedBook.genre_name}</span>
                  <h2 className="text-[32px] font-bold text-gray-900 leading-tight tracking-tight">{selectedBook.title}</h2>
                  <span className="text-[16px] text-gray-600 font-medium">{selectedBook.author_name} 저</span>
                </div>
                
                <div className="h-px w-full bg-gray-200 my-4" />
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] text-gray-500 font-medium">도서 위치</span>
                    <span className="text-[15px] font-bold text-gray-900">{selectedBook.location}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] text-gray-500 font-medium">잔여 수량</span>
                    <span className="text-[15px] font-bold text-gray-900">{selectedBook.stock_quantity} 권</span>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <span className="text-[12px] text-gray-500 font-medium">ISBN</span>
                    <span className="text-[14px] font-medium text-gray-600">{selectedBook.isbn}</span>
                  </div>
                </div>

                {/* Render Button Logic */}
                <div className="mt-auto">
                  {selectedBook.stock_quantity > 0 ? (
                    currentUser ? (
                      <button 
                        onClick={handleRentClick}
                        className="w-full h-[56px] bg-[#2d333a] text-white text-[18px] font-bold rounded-xl hover:bg-black transition-colors shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        대여 신청
                      </button>
                    ) : (
                      <button 
                        onClick={handleRentClick}
                        className="w-full h-[56px] border border-gray-300 bg-white text-gray-800 text-[18px] font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        로그인하고 대여하기
                      </button>
                    )
                  ) : (
                    <button 
                      disabled
                      className="w-full h-[56px] bg-gray-100 text-gray-400 text-[18px] font-bold rounded-xl cursor-not-allowed border border-gray-200"
                    >
                      대여할 수 없습니다
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rent Success Modal */}
      {rentSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in-up border border-gray-100">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-2 text-center tracking-tight">대여 신청 완료</h2>
            <p className="text-[15px] text-gray-600 mb-8 text-center">반납 예정일: <span className="font-bold text-gray-900">{rentSuccessModal.returnDate.toLocaleDateString()}</span></p>
            <button 
              className="w-full h-[48px] rounded-lg bg-[#2d333a] text-white text-[15px] font-semibold hover:bg-black transition-colors"
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
