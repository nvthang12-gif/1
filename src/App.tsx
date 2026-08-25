import React, { useState, useEffect } from 'react';
import { CategoryType } from './types';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { AlphabetView } from './components/AlphabetView';
import { AnimalsView } from './components/AnimalsView';
import { ActionsView } from './components/ActionsView';
import { FlagsView } from './components/FlagsView';
import { MathView } from './components/MathView';
import { GamesHub } from './components/GamesHub';
import { ParentalModal } from './components/ParentalModal';
import { playPopSound, speakVietnamese } from './utils/sound';
import { Home, BookOpen, PawPrint, Heart, Globe, Calculator, Gamepad2 } from 'lucide-react';

export default function App() {
  const [currentCategory, setCurrentCategory] = useState<CategoryType>('home');
  const [stars, setStars] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('be_vui_hoc_stars');
      return saved ? parseInt(saved, 10) : 5;
    } catch {
      return 5;
    }
  });
  const [showParentModal, setShowParentModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('be_vui_hoc_stars', stars.toString());
    } catch {
      // ignore
    }
  }, [stars]);

  const handleAddStar = () => {
    setStars(prev => prev + 1);
  };

  const handleResetProgress = () => {
    setStars(0);
    try {
      localStorage.setItem('be_vui_hoc_stars', '0');
    } catch {
      // ignore
    }
  };

  const handleSelectCategory = (cat: CategoryType) => {
    playPopSound();
    setCurrentCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-slate-800 flex flex-col font-['Nunito',sans-serif] selection:bg-sky-200">
      
      {/* Top Header */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
        stars={stars}
        onOpenParentGuide={() => setShowParentModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 sm:pb-28">
        {currentCategory === 'home' && (
          <HomeDashboard
            onSelectCategory={handleSelectCategory}
            stars={stars}
          />
        )}

        {currentCategory === 'alphabet' && (
          <AlphabetView onAddStar={handleAddStar} />
        )}

        {currentCategory === 'animals' && (
          <AnimalsView onAddStar={handleAddStar} />
        )}

        {currentCategory === 'actions' && (
          <ActionsView onAddStar={handleAddStar} />
        )}

        {currentCategory === 'flags' && (
          <FlagsView onAddStar={handleAddStar} />
        )}

        {currentCategory === 'math' && (
          <MathView onAddStar={handleAddStar} />
        )}

        {currentCategory === 'games' && (
          <GamesHub onAddStar={handleAddStar} />
        )}
      </main>

      {/* Bottom Floating Toddler Navigation Dock */}
      <nav className="fixed bottom-3 inset-x-0 z-40 max-w-2xl mx-auto px-3 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-3xl border-3 border-sky-300 shadow-2xl flex items-center justify-between pointer-events-auto gap-1">
          
          <button
            id="dock-btn-home"
            onClick={() => handleSelectCategory('home')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl transition-all cursor-pointer ${
              currentCategory === 'home'
                ? 'bg-sky-500 text-white font-black scale-105 shadow-md'
                : 'text-slate-600 hover:bg-sky-50 font-bold'
            }`}
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[10px] sm:text-xs">Trang Chủ</span>
          </button>

          <button
            id="dock-btn-alphabet"
            onClick={() => handleSelectCategory('alphabet')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl transition-all cursor-pointer ${
              currentCategory === 'alphabet'
                ? 'bg-rose-500 text-white font-black scale-105 shadow-md'
                : 'text-slate-600 hover:bg-rose-50 font-bold'
            }`}
          >
            <span className="text-base sm:text-lg leading-none">🔤</span>
            <span className="text-[10px] sm:text-xs">Chữ Cái</span>
          </button>

          <button
            id="dock-btn-animals"
            onClick={() => handleSelectCategory('animals')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl transition-all cursor-pointer ${
              currentCategory === 'animals'
                ? 'bg-amber-500 text-white font-black scale-105 shadow-md'
                : 'text-slate-600 hover:bg-amber-50 font-bold'
            }`}
          >
            <span className="text-base sm:text-lg leading-none">🐾</span>
            <span className="text-[10px] sm:text-xs">Con Vật</span>
          </button>

          <button
            id="dock-btn-actions"
            onClick={() => handleSelectCategory('actions')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl transition-all cursor-pointer ${
              currentCategory === 'actions'
                ? 'bg-emerald-500 text-white font-black scale-105 shadow-md'
                : 'text-slate-600 hover:bg-emerald-50 font-bold'
            }`}
          >
            <span className="text-base sm:text-lg leading-none">🌻</span>
            <span className="text-[10px] sm:text-xs">Hành Động</span>
          </button>

          <button
            id="dock-btn-flags"
            onClick={() => handleSelectCategory('flags')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl transition-all cursor-pointer ${
              currentCategory === 'flags'
                ? 'bg-sky-500 text-white font-black scale-105 shadow-md'
                : 'text-slate-600 hover:bg-sky-50 font-bold'
            }`}
          >
            <span className="text-base sm:text-lg leading-none">🚩</span>
            <span className="text-[10px] sm:text-xs">Lá Cờ</span>
          </button>

          <button
            id="dock-btn-math"
            onClick={() => handleSelectCategory('math')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl transition-all cursor-pointer ${
              currentCategory === 'math'
                ? 'bg-indigo-500 text-white font-black scale-105 shadow-md'
                : 'text-slate-600 hover:bg-indigo-50 font-bold'
            }`}
          >
            <span className="text-base sm:text-lg leading-none">🔢</span>
            <span className="text-[10px] sm:text-xs">Toán Đếm</span>
          </button>

          <button
            id="dock-btn-games"
            onClick={() => handleSelectCategory('games')}
            className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl transition-all cursor-pointer ${
              currentCategory === 'games'
                ? 'bg-purple-500 text-white font-black scale-105 shadow-md'
                : 'text-slate-600 hover:bg-purple-50 font-bold'
            }`}
          >
            <span className="text-base sm:text-lg leading-none">🎹</span>
            <span className="text-[10px] sm:text-xs">Trò Chơi</span>
          </button>

        </div>
      </nav>

      {/* Parental Gate & Guide Modal */}
      <ParentalModal
        isOpen={showParentModal}
        onClose={() => setShowParentModal(false)}
        stars={stars}
        onResetProgress={handleResetProgress}
      />

    </div>
  );
}

