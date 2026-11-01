import React from 'react';
import { Header } from '../components/Header';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { LoginCard } from '../components/LoginCard';
import { Footer } from '../components/Footer';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-[#050506] text-[#E8E8EC] overflow-x-hidden">
      {/* Background Graphic Effects */}
      <BackgroundLayer />

      {/* Semantic Top Header */}
      <Header />

      {/* Semantic Main Content Area */}
      <main className="flex-1 flex items-center justify-center relative z-10 py-6 sm:py-8 px-4 w-full">
        <LoginCard />
      </main>

      {/* Semantic Footer */}
      <Footer />
    </div>
  );
};
