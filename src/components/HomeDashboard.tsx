import React from 'react';
import { CategoryType } from '../types';
import { playPopSound, speakSmart } from '../utils/sound';
import { Sparkles, BookOpen, Heart, Globe, Calculator, Gamepad2, Palette, Music, Volume2 } from 'lucide-react';

interface HomeDashboardProps {
  onSelectCategory: (cat: CategoryType) => void;
  stars: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectCategory,
  stars,
}) => {
  const handleCategoryClick = (cat: CategoryType, titleVi: string) => {
    playPopSound();
    speakSmart(null, `Bài học: ${titleVi}. Bé Nem cùng bắt đầu học nhé!`, titleVi);
    onSelectCategory(cat);
  };

  const handlePlayWelcomeGreeting = () => {
    playPopSound();
    speakSmart(
      null,
      "Xin chào bé Nem, chúng ta cùng bắt đầu học nhé!",
      "Hello Nem, let's start learning together!"
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      
      {/* Hero Banner with Mascots & Slogan from the user's reference */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 text-white p-5 sm:p-8 shadow-xl border-4 border-sky-300">
        
        {/* Decorative background clouds / stars */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-amber-950 px-3.5 py-1 rounded-full text-xs sm:text-sm font-black shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-900 animate-spin" />
              GIÁO DỤC SỚM TOÀN DIỆN CHO BÉ NEM (2 - 5 TUỔI)
            </div>
            
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-['Baloo_2'] drop-shadow-md">
              KÍCH HOẠT NÃO BỘ • BÉ THÔNG MINH
            </h2>
            
            <p className="text-sm sm:text-lg font-bold text-sky-100 max-w-xl">
              Phát âm chuẩn Tiếng Việt, tương tác đa giác quan: Chữ cái, Con vật, Hành động, Lá cờ và Toán tư duy!
            </p>

            {/* Interactive Welcome Voice Button */}
            <div className="pt-2">
              <button
                id="btn-welcome-greeting"
                onClick={handlePlayWelcomeGreeting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 hover:bg-yellow-100 active:scale-95 font-black text-xs sm:text-sm rounded-2xl shadow-lg border-2 border-indigo-200 cursor-pointer transition-all"
                title="Nghe lời chào bé Nem"
              >
                <Volume2 className="w-5 h-5 text-indigo-600 animate-pulse" />
                <span>Chào Bé Nem: &ldquo;Xin chào bé Nem, chúng ta cùng bắt đầu học nhé!&rdquo; 🔊</span>
              </button>
            </div>
          </div>

          {/* Quick Mascot & Star Highlight */}
          <div 
            onClick={handlePlayWelcomeGreeting}
            className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-3 rounded-2xl border-2 border-white/30 shrink-0 cursor-pointer transition-all active:scale-95"
            title="Chạm để nghe cô chào bé Nem"
          >
            <div className="text-4xl sm:text-5xl animate-bounce">
              🧒🌟
            </div>
            <div className="text-left">
              <div className="text-xs text-sky-100 font-bold uppercase">Bé Nem yêu quý</div>
              <div className="text-xl sm:text-2xl font-black text-yellow-300 flex items-center gap-1">
                <span>{stars}</span>
                <span className="text-sm text-white">⭐ Ngôi Sao</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 6 Pillars Grid - Inspired directly by reference images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* 1. Tiếng Việt & Chữ Cái */}
        <div
          id="home-card-alphabet"
          onClick={() => handleCategoryClick('alphabet', 'Bảng chữ cái và Ghép vần Tiếng Việt')}
          className="group relative bg-white rounded-3xl p-5 border-4 border-rose-200 hover:border-rose-400 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-black rounded-full uppercase tracking-wider">
                Ngôn Ngữ & Giao Tiếp
              </span>
              <span className="text-3xl group-hover:scale-125 transition-transform">🔤</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-['Baloo_2'] group-hover:text-rose-600 transition-colors">
              Chữ Cái & Ghép Vần
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              29 chữ cái Tiếng Việt, ghép âm <span className="text-rose-600 font-bold">b + a = ba</span>, từ vựng và tập tô nét chữ.
            </p>

            {/* Visual Mini Preview from user's image */}
            <div className="bg-rose-50 rounded-2xl p-3 flex items-center justify-around border-2 border-rose-100">
              <div className="w-12 h-14 bg-white rounded-xl shadow-sm border border-rose-200 flex flex-col items-center justify-center font-black text-2xl text-red-500">
                A
                <span className="text-[10px] text-slate-400 font-normal">a</span>
              </div>
              <span className="text-xl font-black text-rose-400">+</span>
              <div className="w-12 h-14 bg-white rounded-xl shadow-sm border border-rose-200 flex flex-col items-center justify-center font-black text-2xl text-blue-500">
                B
                <span className="text-[10px] text-slate-400 font-normal">b</span>
              </div>
              <span className="text-xl font-black text-rose-400">=</span>
              <div className="px-3 py-2 bg-emerald-500 text-white rounded-xl font-black text-lg shadow-sm">
                ba 👶
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-black text-rose-600 pt-2 border-t border-rose-100">
            <span>Bé bắt đầu học ngay</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </div>

        {/* 2. Thế Giới Con Vật */}
        <div
          id="home-card-animals"
          onClick={() => handleCategoryClick('animals', 'Thế giới động vật và tiếng kêu')}
          className="group relative bg-white rounded-3xl p-5 border-4 border-amber-200 hover:border-amber-400 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full uppercase tracking-wider">
                Khám Phá Thế Giới
              </span>
              <span className="text-3xl group-hover:scale-125 transition-transform">🐾</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-['Baloo_2'] group-hover:text-amber-600 transition-colors">
              Thế Giới Con Vật
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Vật nuôi, động vật rừng, chim muông, sinh vật biển kèm âm thanh tiếng kêu thực tế sinh động!
            </p>

            {/* Visual Mini Preview */}
            <div className="bg-amber-50 rounded-2xl p-3 flex items-center justify-around border-2 border-amber-100">
              <div className="text-center">
                <span className="text-3xl">🐶</span>
                <span className="block text-[11px] font-bold text-amber-900">Gâu gâu</span>
              </div>
              <div className="text-center">
                <span className="text-3xl">🐱</span>
                <span className="block text-[11px] font-bold text-amber-900">Meo meo</span>
              </div>
              <div className="text-center">
                <span className="text-3xl">🐓</span>
                <span className="block text-[11px] font-bold text-amber-900">Ò ó o</span>
              </div>
              <div className="text-center">
                <span className="text-3xl">🐘</span>
                <span className="block text-[11px] font-bold text-amber-900">Voi con</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-black text-amber-600 pt-2 border-t border-amber-100">
            <span>Nghe tiếng con vật</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </div>

        {/* 3. Hành Động Quanh Bé */}
        <div
          id="home-card-actions"
          onClick={() => handleCategoryClick('actions', 'Hành động và Thói quen sinh hoạt của bé')}
          className="group relative bg-white rounded-3xl p-5 border-4 border-emerald-200 hover:border-emerald-400 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase tracking-wider">
                Thói Quen Tốt
              </span>
              <span className="text-3xl group-hover:scale-125 transition-transform">🌻</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-['Baloo_2'] group-hover:text-emerald-600 transition-colors">
              Hành Động Quanh Bé
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Nhận biết việc làm hằng ngày: Bé tưới hoa, rửa tay xà phòng, đánh răng, tự ăn cơm và đi ngủ ngoan.
            </p>

            {/* Visual Mini Preview */}
            <div className="bg-emerald-50 rounded-2xl p-3 flex items-center justify-around border-2 border-emerald-100">
              <div className="text-center">
                <span className="text-3xl">🪥</span>
                <span className="block text-[11px] font-bold text-emerald-900">Đánh răng</span>
              </div>
              <div className="text-center">
                <span className="text-3xl">🧼</span>
                <span className="block text-[11px] font-bold text-emerald-900">Rửa tay</span>
              </div>
              <div className="text-center">
                <span className="text-3xl">🌻</span>
                <span className="block text-[11px] font-bold text-emerald-900">Tưới hoa</span>
              </div>
              <div className="text-center">
                <span className="text-3xl">🍚</span>
                <span className="block text-[11px] font-bold text-emerald-900">Ăn cơm</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-black text-emerald-600 pt-2 border-t border-emerald-100">
            <span>Xem bài học hành động</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </div>

        {/* 4. Lá Cờ Các Quốc Gia */}
        <div
          id="home-card-flags"
          onClick={() => handleCategoryClick('flags', 'Lá cờ các quốc gia trên thế giới')}
          className="group relative bg-white rounded-3xl p-5 border-4 border-sky-200 hover:border-sky-400 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-sky-100 text-sky-800 text-xs font-black rounded-full uppercase tracking-wider">
                Vòng Quanh Thế Giới
              </span>
              <span className="text-3xl group-hover:scale-125 transition-transform">🌍</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-['Baloo_2'] group-hover:text-sky-600 transition-colors">
              Lá Cờ Quốc Gia
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Nhận biết quốc kỳ Việt Nam và các nước, thủ đô và câu chào tiếng bản xứ đặc sắc.
            </p>

            {/* Visual Mini Preview */}
            <div className="bg-sky-50 rounded-2xl p-3 flex items-center justify-around border-2 border-sky-100">
              <div className="text-center">
                <span className="text-3xl">🇻🇳</span>
                <span className="block text-[11px] font-bold text-sky-900">Việt Nam</span>
              </div>
              <div className="text-center">
                <span className="text-3xl">🇯🇵</span>
                <span className="block text-[11px] font-bold text-sky-900">Nhật Bản</span>
              </div>
              <div className="text-center">
                <span className="text-3xl">🇺🇸</span>
                <span className="block text-[11px] font-bold text-sky-900">Hoa Kỳ</span>
              </div>
              <div className="text-center">
                <span className="text-3xl">🇫🇷</span>
                <span className="block text-[11px] font-bold text-sky-900">Nước Pháp</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-black text-sky-600 pt-2 border-t border-sky-100">
            <span>Khám phá lá cờ</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </div>

        {/* 5. Toán Tư Duy & Số Đếm */}
        <div
          id="home-card-math"
          onClick={() => handleCategoryClick('math', 'Toán tư duy, số đếm và hình khối')}
          className="group relative bg-white rounded-3xl p-5 border-4 border-indigo-200 hover:border-indigo-400 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-black rounded-full uppercase tracking-wider">
                Toán Học Cơ Bản
              </span>
              <span className="text-3xl group-hover:scale-125 transition-transform">🔢</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-['Baloo_2'] group-hover:text-indigo-600 transition-colors">
              Toán Tư Duy & Số Đếm
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Đếm quả táo 1 - 10, phép cộng vui nhộn, so sánh lớn bé (&gt; &lt; =) và hình khối màu sắc.
            </p>

            {/* Visual Mini Preview */}
            <div className="bg-indigo-50 rounded-2xl p-3 flex items-center justify-around border-2 border-indigo-100 font-black text-indigo-900">
              <div className="text-center">
                <span className="text-2xl text-red-500">🍎🍎</span>
                <span className="block text-xs font-extrabold">2</span>
              </div>
              <span className="text-xl text-indigo-400">+</span>
              <div className="text-center">
                <span className="text-2xl text-red-500">🍎</span>
                <span className="block text-xs font-extrabold">1</span>
              </div>
              <span className="text-xl text-indigo-400">=</span>
              <div className="w-8 h-8 bg-yellow-400 text-amber-950 rounded-xl flex items-center justify-center text-lg font-black shadow-sm">
                3
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-black text-indigo-600 pt-2 border-t border-indigo-100">
            <span>Bé tập đếm số</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </div>

        {/* 6. Góc Trò Chơi & Âm Nhạc */}
        <div
          id="home-card-games"
          onClick={() => handleCategoryClick('games', 'Góc trò chơi trí tuệ và Âm nhạc thiếu nhi')}
          className="group relative bg-white rounded-3xl p-5 border-4 border-purple-200 hover:border-purple-400 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-black rounded-full uppercase tracking-wider">
                Tập Trung & Vận Động Tinh
              </span>
              <span className="text-3xl group-hover:scale-125 transition-transform">🎮</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-800 font-['Baloo_2'] group-hover:text-purple-600 transition-colors">
              Trò Chơi & Âm Nhạc
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Tráo thẻ đố vui, ghép bóng con vật, lật thẻ trí nhớ và đàn Xylophone 8 nốt vui nhộn!
            </p>

            {/* Visual Mini Preview */}
            <div className="bg-purple-50 rounded-2xl p-3 flex items-center justify-around border-2 border-purple-100">
              <div className="text-center">
                <span className="text-2xl">🎹</span>
                <span className="block text-[11px] font-bold text-purple-900">Xylophone</span>
              </div>
              <div className="text-center">
                <span className="text-2xl">🧩</span>
                <span className="block text-[11px] font-bold text-purple-900">Ghép bóng</span>
              </div>
              <div className="text-center">
                <span className="text-2xl">🃏</span>
                <span className="block text-[11px] font-bold text-purple-900">Trí nhớ</span>
              </div>
              <div className="text-center">
                <span className="text-2xl">🎨</span>
                <span className="block text-[11px] font-bold text-purple-900">Tô màu</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-black text-purple-600 pt-2 border-t border-purple-100">
            <span>Chơi trò chơi thông minh</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </div>

      </div>

      {/* Encouragement Footer Box */}
      <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 rounded-3xl p-4 sm:p-5 border-3 border-amber-300 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl sm:text-4xl">🌻</span>
          <div>
            <h4 className="font-extrabold text-amber-950 text-sm sm:text-base">
              Lời khuyên cho ba mẹ đồng hành cùng bé
            </h4>
            <p className="text-xs sm:text-sm text-amber-900 font-semibold">
              Mỗi ngày cùng bé học 15-20 phút, khen ngợi và thưởng sao giúp bé phát triển ngôn ngữ & tư duy vượt trội!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
