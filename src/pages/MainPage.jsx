import React from 'react';
import Header from '../components/Header';
import WeeklyBest from '../components/WeeklyBest';
import RentalStatus from '../components/RentalStatus';

export default function MainPage() {
  return (
    <div className="min-h-screen w-full bg-[#fbfbfb] flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full pt-4">
        <WeeklyBest />
        <RentalStatus />
      </main>
    </div>
  );
}
