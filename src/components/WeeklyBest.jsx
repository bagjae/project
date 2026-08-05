import React from 'react';

const BOOK1_URL =
  'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/3f76474d-510b-4426-9dc4-d2d2127bda5a';
const BOOK2_URL =
  'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/ed7a92be-43eb-47d5-9049-f291963f561a';
const BOOK3_URL =
  'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/56161b08-6653-4712-80e1-67826abdc698';
const BOOK4_URL =
  'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/2b1c6937-1491-4979-be7d-bca4f0c4d7ab';

function ArrowButton({ direction, onClick, disabled }) {
  const isLeft = direction === 'left';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[71px] w-[71px] shrink-0 items-center justify-center rounded-[71px] bg-[#D9D9D9] transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#c0c0c0] active:scale-95 cursor-pointer'
      }`}
    >
      {isLeft ? (
        <svg width="18" height="28" viewBox="0 0 18 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2 L4 14 L16 26" stroke="black" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
      ) : (
        <svg width="18" height="28" viewBox="0 0 18 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2 L14 14 L2 26" stroke="black" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
      )}
    </button>
  );
}

const BOOKS = [
  { src: BOOK1_URL, width: 263 },
  { src: BOOK2_URL, width: 266 },
  { src: BOOK3_URL, width: 225 },
  { src: BOOK4_URL, width: 259 },
];

const EXTENDED_BOOKS = [...BOOKS, ...BOOKS, ...BOOKS]; // 12 books for a long carousel

export default function WeeklyBest() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(EXTENDED_BOOKS.length - 4, prev + 1));
  };

  const getOffset = (index) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += EXTENDED_BOOKS[i].width + 101;
    }
    return offset;
  };

  return (
    <div className="absolute left-[112px] top-[267px] h-[602px] w-[1717px] rounded-[21px] border-[3px] border-black bg-white">
      <span
        className="absolute left-[22px] top-[23px] text-[40px] leading-none text-black"
        style={{ fontFamily: 'Kadwa', fontWeight: 700 }}
      >
        종합 주간 베스트
      </span>

      <div className="absolute left-[20px] top-[271px]">
        <ArrowButton direction="left" onClick={handlePrev} disabled={currentIndex === 0} />
      </div>
      <div className="absolute left-[1625px] top-[271px]">
        <ArrowButton direction="right" onClick={handleNext} disabled={currentIndex === EXTENDED_BOOKS.length - 4} />
      </div>

      <div className="absolute left-[140px] top-[111px] h-[380px] w-[1450px] overflow-hidden">
        <div 
          className="flex items-center gap-[101px] px-[60px] transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${getOffset(currentIndex)}px)` }}
        >
          {EXTENDED_BOOKS.map((book, i) => (
            <div key={i} className="relative shrink-0" style={{ width: book.width, height: 380 }}>
              <img
                src={book.src}
                alt={`Book ${i + 1}`}
                className="absolute left-0 top-0 h-full w-full rounded-[21px] object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div
                className="absolute left-0 top-0 hidden h-full w-full rounded-[21px] bg-gray-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
