import React, { useState } from 'react';
import { ANIMALS_DATA } from '../data/animalsData';
import { AnimalItem } from '../types';
import { playAnimalSound, playPopSound, playSuccessChime, playWrongGentle, speakSmart, currentLanguageMode } from '../utils/sound';
import { AudioRecorderModal } from './AudioRecorderModal';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, HelpCircle, RefreshCw, Trophy, Mic } from 'lucide-react';

interface AnimalsViewProps {
  onAddStar: () => void;
}

export const AnimalsView: React.FC<AnimalsViewProps> = ({ onAddStar }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [gameMode, setGameMode] = useState<boolean>(false);
  const [activeAnimal, setActiveAnimal] = useState<AnimalItem | null>(null);

  // Recording State
  const [recordingAnimal, setRecordingAnimal] = useState<AnimalItem | null>(null);

  // Mini-game State
  const [targetAnimal, setTargetAnimal] = useState<AnimalItem>(ANIMALS_DATA[0]);
  const [quizOptions, setQuizOptions] = useState<AnimalItem[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const filteredAnimals = selectedFilter === 'all' 
    ? ANIMALS_DATA 
    : ANIMALS_DATA.filter(a => a.category === selectedFilter);

  const handleAnimalClick = (animal: AnimalItem) => {
    playPopSound();
    setActiveAnimal(animal);
    const soundKey = `animal_${animal.id}`;
    // Phát âm chuẩn giọng cô giáo Tiếng Việt như mục Ngôn ngữ & Giao tiếp
    const speechVi = `${animal.nameVi}. ${animal.soundDescription}. ${animal.funFactVi || ''}`;
    speakSmart(
      soundKey,
      speechVi,
      `${animal.nameVi}. ${animal.nameEn || ''}`
    );
  };

  // Start new animal sound quiz
  const startNewQuiz = () => {
    playPopSound();
    setQuizFeedback('idle');
    const randomTarget = ANIMALS_DATA[Math.floor(Math.random() * ANIMALS_DATA.length)];
    setTargetAnimal(randomTarget);

    // Pick 2 other random options
    const others = ANIMALS_DATA.filter(a => a.id !== randomTarget.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const options = [randomTarget, ...others].sort(() => 0.5 - Math.random());
    setQuizOptions(options);

    // Play prompt voice
    setTimeout(() => {
      speakSmart(
        null,
        `Đố bé đoán xem: Tiếng kêu "${randomTarget.soundDescription}" là của con vật nào?`,
        `Which animal makes this sound?`
      );
    }, 150);
  };

  const handlePlayQuizSound = () => {
    playPopSound();
    speakSmart(
      null,
      `Tiếng kêu: ${targetAnimal.soundDescription}. Đố bé đây là tiếng của con vật nào?`,
      `Listen: ${targetAnimal.soundDescription}. Which animal is this?`
    );
  };

  const handleSelectQuizOption = (option: AnimalItem) => {
    playPopSound();
    if (quizFeedback === 'correct') return;

    if (option.id === targetAnimal.id) {
      setQuizFeedback('correct');
      playSuccessChime();
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      speakSmart(
        `animal_${targetAnimal.id}`,
        `Hoan hô bé! Chính là ${targetAnimal.nameVi}! ${targetAnimal.soundDescription}. ${targetAnimal.funFactVi || ''}`,
        `Great job! That is the ${targetAnimal.nameEn || targetAnimal.nameVi}!`
      );
      onAddStar();
    } else {
      setQuizFeedback('wrong');
      playWrongGentle();
      speakSmart(
        null, 
        `Chưa đúng rồi, đây là ${option.nameVi}. Bé hãy nghe lại và chọn lại nhé!`, 
        `Try again! This is ${option.nameEn || option.nameVi}.`
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-5">
      
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-3 border-amber-200 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-700 font-['Baloo_2'] flex items-center gap-2">
            <span>🐾</span> Thế Giới Động Vật Sinh Động
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Khám phá 20+ con vật ngộ nghĩnh, nghe tiếng kêu tự nhiên, thu âm giọng ba mẹ và học từ vựng.
          </p>
        </div>

        <button
          id="btn-toggle-animal-quiz"
          onClick={() => {
            playPopSound();
            const nextMode = !gameMode;
            setGameMode(nextMode);
            if (nextMode) startNewQuiz();
          }}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
            gameMode
              ? 'bg-purple-600 text-white border-2 border-purple-400'
              : 'bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 border-2 border-yellow-200'
          }`}
        >
          {gameMode ? (
            <>
              <span>📖</span>
              <span>Xem Danh Sách Con Vật</span>
            </>
          ) : (
            <>
              <HelpCircle className="w-5 h-5" />
              <span>Đố Bé Đoán Tiếng Con Vật ⭐</span>
            </>
          )}
        </button>
      </div>

      {/* QUIZ MODE: ĐỐ BÉ ĐOÁN TIẾNG CON VẬT */}
      {gameMode ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-purple-200 shadow-xl space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-1 rounded-full text-xs sm:text-sm font-black">
              <Sparkles className="w-4 h-4 text-purple-600" />
              TRÒ CHƠI LUYỆN THÍNH GIÁC & TƯ DUY
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 font-['Baloo_2']">
              Đố bé: Đây là tiếng kêu của ai?
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Nhấn nút loa để nghe tiếng kêu, sau đó chạm vào con vật đúng nhé!
            </p>
          </div>

          {/* Big Audio Play Button */}
          <div className="flex justify-center">
            <button
              onClick={handlePlayQuizSound}
              className="px-8 py-5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 active:scale-95 text-white rounded-3xl shadow-xl shadow-purple-500/30 flex items-center gap-3 font-black text-lg sm:text-xl border-3 border-purple-300 transition-all cursor-pointer"
            >
              <Volume2 className="w-8 h-8 animate-bounce text-yellow-300" />
              <span>Nghe Lại Tiếng Kêu 🔊</span>
            </button>
          </div>

          {/* 3 Animal Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
            {quizOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectQuizOption(opt)}
                className={`p-6 rounded-3xl border-4 transition-all duration-200 transform active:scale-95 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-md ${
                  quizFeedback === 'correct' && opt.id === targetAnimal.id
                    ? 'bg-emerald-100 border-emerald-400 ring-4 ring-emerald-200 scale-105'
                    : 'bg-amber-50/70 hover:bg-amber-100 border-amber-200 hover:border-amber-400'
                }`}
              >
                <span className="text-6xl sm:text-7xl">{opt.emoji}</span>
                <span className="text-lg sm:text-xl font-black text-slate-800 font-['Baloo_2']">
                  {opt.nameVi}
                </span>
                <span className="text-xs font-bold text-amber-700">
                  {opt.categoryVi}
                </span>
              </button>
            ))}
          </div>

          {/* Feedback message and Next Question button */}
          {quizFeedback === 'correct' && (
            <div className="pt-4 space-y-3">
              <div className="text-xl font-black text-emerald-600 animate-bounce">
                🎉 Bé trả lời chính xác tuyệt vời! (+1 ⭐)
              </div>
              <button
                onClick={startNewQuiz}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Câu Tiếp Theo ➔</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* EXPLORER MODE: BROWSE ALL ANIMALS */
        <div className="space-y-4">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tất Cả (20+ loài)', icon: '🐾', speakText: 'Tất cả các loài động vật' },
              { id: 'domestic', label: 'Động Vật Nuôi', icon: '🐶', speakText: 'Động vật nuôi trong gia đình' },
              { id: 'wild', label: 'Rừng Xanh', icon: '🦁', speakText: 'Động vật hoang dã nơi rừng xanh' },
              { id: 'birds', label: 'Có Cánh / Chim', icon: '🦜', speakText: 'Các loài chim và động vật có cánh' },
              { id: 'aquatic', label: 'Dưới Nước', icon: '🐬', speakText: 'Các loài sinh vật bơi dưới nước' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playPopSound();
                  setSelectedFilter(tab.id);
                  speakSmart(null, tab.speakText, tab.label);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-amber-500 text-white shadow-md border-2 border-amber-400'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border-2 border-amber-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Animal Flashcards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredAnimals.map((animal) => {
              const isActive = activeAnimal?.id === animal.id;
              return (
                <div
                  key={animal.id}
                  id={`card-animal-${animal.id}`}
                  onClick={() => handleAnimalClick(animal)}
                  className={`relative p-4 sm:p-5 rounded-3xl border-3 transition-all duration-200 transform active:scale-95 cursor-pointer flex flex-col items-center justify-between text-center shadow-sm hover:shadow-lg ${
                    animal.bgColor
                  } ${isActive ? 'ring-4 ring-amber-300 scale-102' : ''}`}
                >
                  <div className="w-full flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecordingAnimal(animal);
                      }}
                      className="p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow-2xs cursor-pointer"
                      title="Thu âm giọng ba mẹ"
                    >
                      <Mic className="w-3.5 h-3.5 text-amber-800" />
                    </button>
                    <span className="p-1.5 bg-white/70 rounded-full text-slate-700 shadow-2xs">
                      <Volume2 className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="text-5xl sm:text-6xl my-2 hover:scale-115 transition-transform">
                    {animal.emoji}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-black text-base sm:text-lg font-['Baloo_2'] leading-tight">
                      {animal.nameVi}
                    </h4>
                    {animal.nameEn && currentLanguageMode !== 'vi' && (
                      <p className="text-xs font-bold text-slate-600">
                        {animal.nameEn}
                      </p>
                    )}
                    <p className="text-[11px] font-extrabold opacity-75">
                      {animal.soundDescription}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-black/10 w-full text-[10px] font-semibold opacity-70">
                    {animal.funFactVi}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Recording Modal */}
      {recordingAnimal && (
        <AudioRecorderModal
          isOpen={!!recordingAnimal}
          onClose={() => setRecordingAnimal(null)}
          itemId={`animal_${recordingAnimal.id}`}
          itemTitle={`Con ${recordingAnimal.nameVi}`}
        />
      )}

    </div>
  );
};

