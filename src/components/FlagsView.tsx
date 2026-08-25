import React, { useState, useMemo } from 'react';
import { FLAGS_DATA, CONTINENTS } from '../data/flagsData';
import { FlagItem } from '../types';
import { speakSmart, playPopSound, playSuccessChime, playWrongGentle, currentLanguageMode } from '../utils/sound';
import { AudioRecorderModal } from './AudioRecorderModal';
import confetti from 'canvas-confetti';
import { Volume2, HelpCircle, RefreshCw, Mic, Search, Globe, Sparkles, MapPin, MessageCircleHeart, Info } from 'lucide-react';

interface FlagsViewProps {
  onAddStar: () => void;
}

export const FlagsView: React.FC<FlagsViewProps> = ({ onAddStar }) => {
  const [selectedFlag, setSelectedFlag] = useState<FlagItem>(FLAGS_DATA[0]);
  const [activeContinent, setActiveContinent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});
  
  const flagKey = `flag_${selectedFlag.id}`;

  // Filter flags based on continent and search
  const filteredFlags = useMemo(() => {
    return FLAGS_DATA.filter((flag) => {
      const matchContinent = activeContinent === 'all' || flag.continentCode === activeContinent;
      const matchSearch = searchQuery.trim() === '' || 
        flag.countryVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.capitalVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.countryEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchContinent && matchSearch;
    });
  }, [activeContinent, searchQuery]);

  // Quiz State
  const [quizTarget, setQuizTarget] = useState<FlagItem>(FLAGS_DATA[0]);
  const [quizOptions, setQuizOptions] = useState<FlagItem[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const handleSelectFlag = (flag: FlagItem) => {
    playPopSound();
    setSelectedFlag(flag);
    speakSmart(
      `flag_${flag.id}`,
      `Lá cờ ${flag.countryVi}. Thủ đô là thành phố ${flag.capitalVi}. Lời chào là ${flag.greetingVi}. ${flag.iconicSymbol}`,
      `Flag of ${flag.countryEn}. Capital is ${flag.capitalVi}. Greeting is ${flag.greetingVi}`
    );
  };

  const handleSpeakFullIntro = () => {
    playPopSound();
    const prompt = `Đất nước ${selectedFlag.countryVi}. Thuộc ${selectedFlag.continentVi}. Thủ đô là thành phố ${selectedFlag.capitalVi}. Người dân ở đây chào nhau là: ${selectedFlag.greetingVi}. Biểu tượng đặc trưng: ${selectedFlag.iconicSymbol}. ${selectedFlag.funFactVi || ''}`;
    speakSmart(
      flagKey,
      prompt,
      `Country: ${selectedFlag.countryEn}. Capital: ${selectedFlag.capitalVi}. Greeting: ${selectedFlag.greetingVi}. ${selectedFlag.iconicSymbol}`
    );
  };

  const handleSpeakCapital = () => {
    playPopSound();
    speakSmart(
      null,
      `Thủ đô của đất nước ${selectedFlag.countryVi} là thành phố ${selectedFlag.capitalVi}.`,
      `Capital of ${selectedFlag.countryEn} is ${selectedFlag.capitalVi}.`
    );
  };

  const handleSpeakGreeting = () => {
    playPopSound();
    speakSmart(
      null,
      `Người dân ${selectedFlag.countryVi} chào nhau là: ${selectedFlag.greetingVi}.`,
      `Greeting in ${selectedFlag.countryEn} is ${selectedFlag.greetingVi}.`
    );
  };

  const handleSpeakFunFact = () => {
    playPopSound();
    speakSmart(
      null,
      `Điều thú vị: ${selectedFlag.funFactVi || selectedFlag.iconicSymbol}`,
      `Fun fact: ${selectedFlag.funFactVi || selectedFlag.iconicSymbol}`
    );
  };

  const startNewQuiz = () => {
    playPopSound();
    setIsCorrect(false);
    const pool = activeContinent === 'all' 
      ? FLAGS_DATA 
      : (FLAGS_DATA.filter(f => f.continentCode === activeContinent).length >= 3 
          ? FLAGS_DATA.filter(f => f.continentCode === activeContinent) 
          : FLAGS_DATA);
    
    const randomTarget = pool[Math.floor(Math.random() * pool.length)];
    setQuizTarget(randomTarget);

    const others = FLAGS_DATA.filter(f => f.id !== randomTarget.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const shuffled = [randomTarget, ...others].sort(() => 0.5 - Math.random());
    setQuizOptions(shuffled);

    setTimeout(() => {
      speakSmart(
        null,
        `Bé hãy tìm lá cờ của đất nước ${randomTarget.countryVi} nhé!`,
        `Find the flag of ${randomTarget.countryEn}!`
      );
    }, 200);
  };

  const handleQuizAnswer = (option: FlagItem) => {
    playPopSound();
    if (option.id === quizTarget.id) {
      setIsCorrect(true);
      playSuccessChime();
      confetti({ particleCount: 45, spread: 75, origin: { y: 0.6 } });
      speakSmart(
        `flag_${quizTarget.id}`,
        `Hoan hô bé! Chính xác là lá cờ của đất nước ${quizTarget.countryVi}! Thủ đô là thành phố ${quizTarget.capitalVi}. Lời chào là ${quizTarget.greetingVi}!`,
        `Awesome! That is the flag of ${quizTarget.countryEn}!`
      );
      onAddStar();
    } else {
      playWrongGentle();
      speakSmart(
        null,
        `Chưa đúng rồi, đây là lá cờ ${option.countryVi}. Bé tìm lại lá cờ của ${quizTarget.countryVi} nhé!`,
        `Try again! That is the flag of ${option.countryEn}.`
      );
    }
  };

  const handleImageError = (id: string) => {
    setImgErrorMap(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-5">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-3 border-sky-200 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-sky-700 font-['Baloo_2'] flex items-center gap-2">
            <span>🚩</span> Lá Cờ Các Quốc Gia Thế Giới
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Khám phá hình ảnh lá cờ sắc nét của các nước trên 5 châu lục, học thủ đô, lời chào và lắng nghe giọng đọc cô giáo tiếng Việt ấm áp!
          </p>
        </div>

        <button
          id="btn-toggle-flag-quiz"
          onClick={() => {
            playPopSound();
            const nextMode = !isQuizMode;
            setIsQuizMode(nextMode);
            if (nextMode) startNewQuiz();
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
            isQuizMode
              ? 'bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-400'
              : 'bg-sky-500 hover:bg-sky-600 text-white border-2 border-sky-300'
          }`}
        >
          {isQuizMode ? (
            <>
              <span>📖</span>
              <span>Khám Phá Các Lá Cờ</span>
            </>
          ) : (
            <>
              <HelpCircle className="w-5 h-5" />
              <span>Đố Bé Nhận Diện Lá Cờ ⭐</span>
            </>
          )}
        </button>
      </div>

      {/* CONTINENT TABS & SEARCH BAR */}
      {!isQuizMode && (
        <div className="bg-white p-3 sm:p-4 rounded-3xl border-2 border-sky-100 shadow-sm space-y-3">
          {/* Continents Pill Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CONTINENTS.map((c) => {
              const isActive = activeContinent === c.id;
              const count = c.id === 'all' 
                ? FLAGS_DATA.length 
                : FLAGS_DATA.filter(f => f.continentCode === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    playPopSound();
                    setActiveContinent(c.id);
                    speakSmart(null, `Khu vực: ${c.nameVi}`, c.nameVi);
                  }}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md border-2 border-sky-400 scale-105'
                      : 'bg-sky-50/70 hover:bg-sky-100 text-slate-700 border border-sky-200'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.nameVi}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="🔍 Tìm nhanh tên quốc gia hoặc thủ đô (ví dụ: Việt Nam, Pháp, Tokyo, Paris...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>
        </div>
      )}

      {/* QUIZ MODE */}
      {isQuizMode ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-purple-200 shadow-xl space-y-6 text-center">
          <div className="space-y-2">
            <span className="inline-block bg-purple-100 text-purple-800 text-xs font-black px-3.5 py-1 rounded-full uppercase">
              Vòng Quanh Trái Đất
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 font-['Baloo_2']">
              Đố bé: Đâu là lá cờ của đất nước <span className="text-red-600">{quizTarget.countryVi}</span>?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Thủ đô: {quizTarget.capitalVi} • {quizTarget.continentVi}
            </p>
            <button
              onClick={() => speakSmart(null, `Bé hãy tìm lá cờ của đất nước ${quizTarget.countryVi} nhé!`, `Find the flag of ${quizTarget.countryEn}!`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-3.5 py-1.5 rounded-full cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe lại câu hỏi tiếng Việt</span>
            </button>
          </div>

          {/* 3 Real Flags options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto pt-2">
            {quizOptions.map((opt) => {
              const hasImg = opt.flagUrl && !imgErrorMap[opt.id];
              return (
                <button
                  key={opt.id}
                  onClick={() => handleQuizAnswer(opt)}
                  className={`p-5 rounded-3xl border-4 transition-all duration-200 transform active:scale-95 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-md ${
                    isCorrect && opt.id === quizTarget.id
                      ? 'bg-emerald-100 border-emerald-400 ring-4 ring-emerald-200 scale-105'
                      : 'bg-sky-50/60 hover:bg-sky-100 border-sky-200 hover:border-sky-400'
                  }`}
                >
                  {/* Flag Image or Emoji */}
                  <div className="w-40 h-28 sm:w-48 sm:h-32 flex items-center justify-center rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white p-1">
                    {hasImg ? (
                      <img
                        src={opt.flagUrl}
                        alt={`Lá cờ ${opt.countryVi}`}
                        referrerPolicy="no-referrer"
                        onError={() => handleImageError(opt.id)}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-7xl drop-shadow-sm">{opt.flagEmoji}</span>
                    )}
                  </div>
                  
                  <span className="text-lg font-black text-slate-800 font-['Baloo_2']">
                    {isCorrect ? opt.countryVi : '???'}
                  </span>
                </button>
              );
            })}
          </div>

          {isCorrect && (
            <div className="pt-4 space-y-3">
              <div className="text-xl font-black text-emerald-600 animate-bounce">
                🎉 Bé đoán rất chính xác! Lời chào: "{quizTarget.greetingVi}" (+1 ⭐)
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
        /* EXPLORER MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Big Interactive Flag Detail Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-4 border-sky-300 p-5 sm:p-6 shadow-xl space-y-5 flex flex-col justify-between">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 bg-sky-100 text-sky-800 text-xs font-black rounded-full uppercase flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{selectedFlag.continentVi}</span>
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRecordModal(true)}
                    className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-full border border-sky-200 cursor-pointer shadow-2xs"
                    title="Thu âm giọng ba mẹ giới thiệu quốc gia này"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    {selectedFlag.countryEn}
                  </span>
                </div>
              </div>

              {/* Big Flag Image & Country Title */}
              <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-3xl p-5 sm:p-6 border-3 border-sky-200 text-center space-y-4 shadow-inner">
                
                {/* Visual Flag Image Display */}
                <div 
                  onClick={handleSpeakFullIntro}
                  className="group relative max-w-sm mx-auto cursor-pointer"
                  title="Bé bấm vào lá cờ để nghe đọc giới thiệu"
                >
                  <div className="w-full aspect-[3/2] max-h-56 bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-105">
                    {selectedFlag.flagUrl && !imgErrorMap[selectedFlag.id] ? (
                      <img
                        src={selectedFlag.flagUrl}
                        alt={`Lá cờ ${selectedFlag.countryVi}`}
                        referrerPolicy="no-referrer"
                        onError={() => handleImageError(selectedFlag.id)}
                        className="w-full h-full object-contain rounded-xl shadow-xs"
                      />
                    ) : (
                      <div className="text-9xl drop-shadow-md">
                        {selectedFlag.flagEmoji}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-white/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <Volume2 className="w-3 h-3 text-sky-500 animate-pulse" />
                    <span>Chạm vào lá cờ để nghe đọc</span>
                  </div>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-slate-800 font-['Baloo_2']">
                  {selectedFlag.countryVi}
                </h3>

                {currentLanguageMode !== 'vi' && (
                  <p className="text-sm font-bold text-slate-500">
                    {selectedFlag.countryEn}
                  </p>
                )}

                {/* Clickable Quick Details Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleSpeakCapital}
                    className="px-3.5 py-1.5 bg-white hover:bg-amber-50 active:scale-95 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>Thủ đô: <strong>{selectedFlag.capitalVi}</strong></span>
                  </button>

                  <button
                    onClick={handleSpeakGreeting}
                    className="px-3.5 py-1.5 bg-white hover:bg-rose-50 active:scale-95 text-rose-600 font-black text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <MessageCircleHeart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Chào: {selectedFlag.greetingVi}</span>
                  </button>
                </div>
              </div>

              {/* Cultural Symbol Card */}
              <div 
                onClick={handleSpeakFullIntro}
                className="bg-amber-50 hover:bg-amber-100/80 transition-colors cursor-pointer rounded-2xl p-4 border border-amber-200 space-y-1.5"
              >
                <div className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Đặc trưng văn hóa & Biểu tượng nổi tiếng:</span>
                  </span>
                  <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <p className="text-sm font-bold text-amber-950">
                  {selectedFlag.iconicSymbol}
                </p>
              </div>

              {/* Fun Fact Card */}
              {selectedFlag.funFactVi && (
                <div 
                  onClick={handleSpeakFunFact}
                  className="bg-emerald-50 hover:bg-emerald-100/80 transition-colors cursor-pointer rounded-2xl p-3.5 border border-emerald-200 space-y-1"
                >
                  <div className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bé có biết không?</span>
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-950">
                    {selectedFlag.funFactVi}
                  </p>
                </div>
              )}
            </div>

            {/* Read Aloud Button */}
            <button
              id="btn-speak-flag"
              onClick={handleSpeakFullIntro}
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 active:scale-98 text-white rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg shadow-sky-500/20 border-2 border-sky-300 transition-all cursor-pointer mt-3"
            >
              <Volume2 className="w-6 h-6 animate-pulse" />
              <span>Bé Nghe Giới Thiệu Giọng Tiếng Việt</span>
            </button>

          </div>

          {/* Right: Flag List with Real Flag Images */}
          <div className="lg:col-span-5 bg-white p-4 rounded-3xl border-3 border-sky-100 shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400 tracking-wider px-1">
              <span>Danh sách quốc gia ({filteredFlags.length})</span>
              <span>Chạm để nghe đọc</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[580px] overflow-y-auto pr-1 pb-1">
              {filteredFlags.map((flag) => {
                const isSelected = flag.id === selectedFlag.id;
                const hasImg = flag.flagUrl && !imgErrorMap[flag.id];
                return (
                  <button
                    key={flag.id}
                    onClick={() => handleSelectFlag(flag)}
                    className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-sky-500 text-white border-sky-400 scale-105 shadow-md ring-3 ring-sky-200'
                        : 'bg-sky-50/50 hover:bg-sky-100 text-slate-800 border-sky-100'
                    }`}
                  >
                    {/* Country Real Flag Thumbnail */}
                    <div className="w-full aspect-[3/2] bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex items-center justify-center p-0.5 mb-1.5">
                      {hasImg ? (
                        <img
                          src={flag.flagUrl}
                          alt={flag.countryVi}
                          referrerPolicy="no-referrer"
                          onError={() => handleImageError(flag.id)}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-3xl">{flag.flagEmoji}</span>
                      )}
                    </div>

                    <span className={`text-xs font-black text-center line-clamp-1 font-['Baloo_2'] ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {flag.countryVi}
                    </span>

                    <span className={`text-[10px] font-bold line-clamp-1 ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                      {flag.capitalVi}
                    </span>
                  </button>
                );
              })}

              {filteredFlags.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs font-bold">
                  Không tìm thấy quốc gia phù hợp với từ khóa "{searchQuery}"
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Audio Recorder Modal */}
      <AudioRecorderModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        itemId={flagKey}
        itemTitle={`Lá cờ ${selectedFlag.countryVi}`}
      />

    </div>
  );
};
