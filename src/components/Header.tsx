import React, { useState } from 'react';
import { Volume2, VolumeX, Home, Sparkles, Sliders, Info, RotateCcw, Languages, Mic } from 'lucide-react';
import { CategoryType } from '../types';
import { 
  isMuted, 
  setSoundMuted, 
  speechRate, 
  setSpeechRate, 
  playPopSound, 
  currentLanguageMode, 
  setAppLanguageMode, 
  AppLanguageMode,
  speakSmart
} from '../utils/sound';

interface HeaderProps {
  currentCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  stars: number;
  onOpenParentGuide: () => void;
  onOpenQuickRecord?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  stars,
  onOpenParentGuide,
  onOpenQuickRecord,
}) => {
  const [muted, setMuted] = useState(isMuted);
  const [rate, setRate] = useState(speechRate);
  const [langMode, setLangMode] = useState<AppLanguageMode>(currentLanguageMode);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const toggleSound = () => {
    playPopSound();
    const nextMuted = !muted;
    setMuted(nextMuted);
    setSoundMuted(nextMuted);
  };

  const handleRateChange = (newRate: number) => {
    playPopSound();
    setRate(newRate);
    setSpeechRate(newRate);
    setShowSpeedMenu(false);
  };

  const handleLanguageChange = (mode: AppLanguageMode) => {
    playPopSound();
    setLangMode(mode);
    setAppLanguageMode(mode);
    setShowLangMenu(false);
    if (mode === 'vi') {
      speakSmart(null, 'Chế độ Tiếng Việt');
    } else if (mode === 'en') {
      speakSmart(null, '', 'English mode activated');
    } else {
      speakSmart(null, 'Chế độ Song Ngữ Việt Anh', 'Bilingual English and Vietnamese mode');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-400 text-white shadow-md border-b-4 border-sky-300">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
        
        {/* Left: Home button / Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentCategory !== 'home' ? (
            <button
              id="header-btn-home"
              onClick={() => {
                playPopSound();
                onSelectCategory('home');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-amber-950 font-extrabold rounded-2xl shadow-sm border-2 border-yellow-200 transition-transform cursor-pointer"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline text-base">Trang Chủ</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-bounce">🎓</span>
              <div className="leading-tight">
                <h1 className="text-lg sm:text-2xl font-black tracking-wide text-yellow-300 drop-shadow-sm font-['Baloo_2']">
                  BÉ VUI HỌC
                </h1>
                <p className="text-xs font-semibold text-sky-100 hidden sm:block">
                  Giáo Dục Sớm Cho Bé 2 - 5 Tuổi
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Stars Reward Counter */}
        <div 
          id="header-stars-badge"
          className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3.5 py-1 rounded-full border-2 border-white/30 shadow-inner"
        >
          <span className="text-xl sm:text-2xl animate-pulse">⭐</span>
          <span className="font-extrabold text-lg sm:text-xl text-yellow-300 drop-shadow">
            {stars}
          </span>
          <span className="text-xs sm:text-sm font-bold text-white hidden md:inline">
            Sao Bé Ngoan
          </span>
        </div>

        {/* Right Actions: Language Switcher, Voice Speed, Sound Toggle, Parents Guide */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Language Switcher */}
          <div className="relative">
            <button
              id="header-btn-lang"
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowSpeedMenu(false);
              }}
              className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-colors border border-white/30 cursor-pointer"
              title="Giọng đọc nguồn của ứng dụng"
            >
              <Languages className="w-4 h-4 text-yellow-300" />
              <span>
                {langMode === 'vi' ? '🇻🇳 Giọng Tiếng Việt' : langMode === 'en' ? '🇬🇧 English' : '🌐 Song Ngữ'}
              </span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white text-slate-800 rounded-2xl shadow-xl border-2 border-sky-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-xs font-bold text-slate-400 px-2 py-1 uppercase">
                  Giọng đọc nguồn
                </div>
                <button
                  onClick={() => handleLanguageChange('vi')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer ${langMode === 'vi' ? 'bg-sky-100 text-sky-800 font-black' : 'hover:bg-slate-100'}`}
                >
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2">🇻🇳 Tiếng Việt Chuẩn</span>
                    <span className="text-[10px] text-slate-500 font-normal">Giọng đọc nguồn mặc định</span>
                  </div>
                  {langMode === 'vi' && <span className="text-sky-600 font-black">✓</span>}
                </button>
                <button
                  onClick={() => handleLanguageChange('bilingual')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer ${langMode === 'bilingual' ? 'bg-sky-100 text-sky-800 font-black' : 'hover:bg-slate-100'}`}
                >
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2">🌐 Song Ngữ (Việt - Anh)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Đọc tiếng Việt trước</span>
                  </div>
                  {langMode === 'bilingual' && <span className="text-sky-600 font-black">✓</span>}
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer ${langMode === 'en' ? 'bg-sky-100 text-sky-800 font-black' : 'hover:bg-slate-100'}`}
                >
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2">🇬🇧 Tiếng Anh (English)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Dành cho bé học thêm Anh ngữ</span>
                  </div>
                  {langMode === 'en' && <span className="text-sky-600 font-black">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Speed Selector */}
          <div className="relative">
            <button
              id="header-btn-speed"
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowLangMenu(false);
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors border border-white/30 cursor-pointer"
              title="Tốc độ giọng đọc"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden md:inline">
                {rate <= 0.75 ? 'Đọc chậm' : rate >= 1.0 ? 'Đọc nhanh' : 'Đọc vừa'}
              </span>
            </button>

            {showSpeedMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white text-slate-800 rounded-2xl shadow-xl border-2 border-sky-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-xs font-bold text-slate-400 px-2 py-1 uppercase">
                  Tốc độ giọng nói
                </div>
                <button
                  onClick={() => handleRateChange(0.7)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center justify-between cursor-pointer ${rate === 0.7 ? 'bg-sky-100 text-sky-700 font-black' : 'hover:bg-slate-100'}`}
                >
                  <span>🐢 Rất Chậm (2-3 tuổi)</span>
                  {rate === 0.7 && <span>✓</span>}
                </button>
                <button
                  onClick={() => handleRateChange(0.85)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center justify-between cursor-pointer ${rate === 0.85 ? 'bg-sky-100 text-sky-700 font-black' : 'hover:bg-slate-100'}`}
                >
                  <span>🐰 Vừa Phải (3-4 tuổi)</span>
                  {rate === 0.85 && <span>✓</span>}
                </button>
                <button
                  onClick={() => handleRateChange(1.0)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center justify-between cursor-pointer ${rate === 1.0 ? 'bg-sky-100 text-sky-700 font-black' : 'hover:bg-slate-100'}`}
                >
                  <span>🚀 Chuẩn (4-5 tuổi)</span>
                  {rate === 1.0 && <span>✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Sound Mute/Unmute */}
          <button
            id="header-btn-sound"
            onClick={toggleSound}
            className={`p-2 rounded-xl text-white font-bold transition-all border cursor-pointer ${
              muted 
                ? 'bg-rose-500 hover:bg-rose-600 border-rose-300' 
                : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-300'
            }`}
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Parent Guide */}
          <button
            id="header-btn-parent-guide"
            onClick={() => {
              playPopSound();
              onOpenParentGuide();
            }}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-colors border border-white/30 cursor-pointer"
            title="Góc Phụ Huynh & Thu Âm Giọng Ba Mẹ"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};

