import React from 'react';
import Header from '../components/Header';
import WeeklyBest from '../components/WeeklyBest';
import RentalStatus from '../components/RentalStatus';

export default function MainPage() {
  return (
    <div 
      className="relative mx-auto h-[1498px] w-[1920px] bg-white overflow-hidden shadow-xl" 
      style={{ transformOrigin: 'top center', transform: 'scale(max(min(1, 100vw / 1920), 0.5))' }}
    >
      <Header />
      <WeeklyBest />
      <RentalStatus />
    </div>
  );
}
