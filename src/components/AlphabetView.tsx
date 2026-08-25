import React, { useState, useRef, useEffect } from 'react';
import { VIETNAMESE_ALPHABET } from '../data/alphabetData';
import { LetterItem } from '../types';
import { speakSmart, playPopSound, playSuccessChime, playCheerFanfare, currentLanguageMode } from '../utils/sound';
import { AudioRecorderModal } from './AudioRecorderModal';
import confetti from 'canvas-confetti';
import { Volume2, ChevronLeft, ChevronRight, PenTool, Sparkles, BookOpen, Layers, Eraser, RotateCcw, Mic } from 'lucide-react';

interface AlphabetViewProps {
  onAddStar: () => void;
}

export const AlphabetView: React.FC<AlphabetViewProps> = ({ onAddStar }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'blend' | 'write'>('cards');
  const [selectedLetter, setSelectedLetter] = useState<LetterItem>(VIETNAMESE_ALPHABET[0]);
  const [autoPronounce, setAutoPronounce] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Syllable Blending State
  const consonants = ['b', 'c', 'd', 'đ', 'g', 'h', 'l', 'm', 'n', 't', 'v', 'x'];
  const vowels = ['a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư'];
  const [selectedConsonant, setSelectedConsonant] = useState('b');
  const [selectedVowel, setSelectedVowel] = useState('a');

  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#EF4444');
  const [brushSize, setBrushSize] = useState(12);

  const letterKey = `letter_${selectedLetter.letter}`;

  const handleSelectLetter = (item: LetterItem) => {
    playPopSound();
    setSelectedLetter(item);
    // Luôn phát âm chữ cái và con vật đi kèm khi bé chạm vào
    const speechVi = `${item.phoneticName || `Chữ ${item.upper}`}. ${item.word}.`;
    speakSmart(`letter_${item.letter}`, speechVi, `Letter ${item.upper}. ${item.word}.`);
  };

  const handleSpeakCurrent = () => {
    playPopSound();
    const phoneticPart = selectedLetter.phoneticSound ? `Phát âm là ${selectedLetter.phoneticSound}.` : '';
    const mnemonicPart = selectedLetter.mnemonic ? `${selectedLetter.mnemonic}.` : '';
    const speechVi = `${selectedLetter.phoneticName || `Chữ ${selectedLetter.upper}`}. ${selectedLetter.word}! Chữ in thường là ${selectedLetter.lower}. ${phoneticPart} ${mnemonicPart}`;
    speakSmart(
      letterKey,
      speechVi,
      `Letter ${selectedLetter.upper}. ${selectedLetter.word}.`
    );
  };

  const handleNextLetter = () => {
    const currentIndex = VIETNAMESE_ALPHABET.findIndex(l => l.letter === selectedLetter.letter);
    const nextIndex = (currentIndex + 1) % VIETNAMESE_ALPHABET.length;
    handleSelectLetter(VIETNAMESE_ALPHABET[nextIndex]);
  };

  const handlePrevLetter = () => {
    const currentIndex = VIETNAMESE_ALPHABET.findIndex(l => l.letter === selectedLetter.letter);
    const prevIndex = (currentIndex - 1 + VIETNAMESE_ALPHABET.length) % VIETNAMESE_ALPHABET.length;
    handleSelectLetter(VIETNAMESE_ALPHABET[prevIndex]);
  };

  const consonantPhonetics: Record<string, string> = {
    b: 'Phụ âm bờ',
    c: 'Phụ âm cờ',
    d: 'Phụ âm dờ',
    đ: 'Phụ âm đờ',
    g: 'Phụ âm gờ',
    h: 'Phụ âm hờ',
    l: 'Phụ âm lờ',
    m: 'Phụ âm mờ',
    n: 'Phụ âm nờ',
    t: 'Phụ âm tờ',
    v: 'Phụ âm vờ',
    x: 'Phụ âm xờ',
  };

  const vowelPhonetics: Record<string, string> = {
    a: 'Nguyên âm a',
    ă: 'Nguyên âm á (ă)',
    â: 'Nguyên âm ớ (â)',
    e: 'Nguyên âm e',
    ê: 'Nguyên âm ê',
    i: 'Nguyên âm i',
    o: 'Nguyên âm o',
    ô: 'Nguyên âm ô',
    ơ: 'Nguyên âm ơ',
    u: 'Nguyên âm u',
    ư: 'Nguyên âm ư',
  };

  // Blending sound pronunciation
  const handleBlendSpeak = () => {
    playPopSound();
    const blendedWord = `${selectedConsonant}${selectedVowel}`;
    const onsetSound = consonantPhonetics[selectedConsonant]?.replace('Phụ âm ', '') || selectedConsonant;
    const nucleusSound = vowelPhonetics[selectedVowel]?.replace('Nguyên âm ', '') || selectedVowel;
    const blendPhrase = `${onsetSound} ${nucleusSound} ${blendedWord}. ${selectedConsonant} cộng ${selectedVowel} bằng ${blendedWord}.`;
    
    speakSmart(
      null,
      blendPhrase,
      `${selectedConsonant} plus ${selectedVowel} is ${blendedWord}`
    );
    playSuccessChime();
    confetti({ particleCount: 25, spread: 60, origin: { y: 0.7 } });
    onAddStar();
  };

  // Canvas Drawing Handlers
  useEffect(() => {
    if (activeTab === 'write') {
      clearCanvas();
    }
  }, [activeTab, selectedLetter]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = drawColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleFinishWriting = () => {
    playCheerFanfare();
    confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
    speakSmart(null, `Bé giỏi lắm! Bé đã hoàn thành tập viết chữ ${selectedLetter.upper}!`, `Great job! You finished writing letter ${selectedLetter.upper}!`);
    onAddStar();
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-5">
      
      {/* Top Title & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-3 border-rose-200 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-rose-600 font-['Baloo_2'] flex items-center gap-2">
            <span>🔤</span> 29 Chữ Cái & Ngôn Ngữ
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Học phát âm chuẩn, thu âm giọng đọc ba mẹ, ghép âm vần và tập viết nét tay cho bé từ 2 đến 5 tuổi.
          </p>
        </div>

        {/* 3 Main View Tabs */}
        <div className="flex items-center gap-1.5 bg-rose-50 p-1.5 rounded-2xl border border-rose-200">
          <button
            id="tab-alphabet-cards"
            onClick={() => { playPopSound(); setActiveTab('cards'); }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'cards' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Thẻ Chữ Cái</span>
          </button>
          
          <button
            id="tab-alphabet-blend"
            onClick={() => { playPopSound(); setActiveTab('blend'); }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'blend' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ghép Âm (b+a=ba)</span>
          </button>

          <button
            id="tab-alphabet-write"
            onClick={() => { playPopSound(); setActiveTab('write'); }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'write' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Tập Viết Nét</span>
          </button>
        </div>
      </div>

      {/* TAB 1: THẺ CHỮ CÁI & TỪ VỰNG */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: 29 Letters Grid */}
          <div className="lg:col-span-7 bg-white p-4 rounded-3xl border-3 border-rose-100 shadow-md">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Chạm vào chữ cái để nghe đọc
              </span>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPronounce}
                  onChange={(e) => setAutoPronounce(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
                />
                Tự động đọc
              </label>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
              {VIETNAMESE_ALPHABET.map((item) => {
                const isSelected = selectedLetter.letter === item.letter;
                return (
                  <button
                    key={item.letter}
                    id={`btn-letter-${item.letter}`}
                    onClick={() => handleSelectLetter(item)}
                    className={`h-16 sm:h-18 rounded-2xl flex flex-col items-center justify-center p-1 transition-all transform active:scale-90 border-2 cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-gradient-to-b from-rose-500 to-red-600 text-white border-red-400 scale-105 shadow-md ring-4 ring-rose-200'
                        : 'bg-rose-50/70 hover:bg-rose-100/80 text-slate-800 border-rose-200 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl font-black font-['Baloo_2'] leading-none">
                        {item.upper}
                      </span>
                      <span className={`text-xs font-bold leading-none ${isSelected ? 'text-rose-100' : 'text-slate-500'}`}>
                        {item.lower}
                      </span>
                    </div>
                    <span className="text-base sm:text-lg leading-none mt-1" title={item.word}>
                      {item.imageEmoji}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Big Interactive Learning Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-3xl border-4 border-rose-300 shadow-xl overflow-hidden p-5 flex flex-col justify-between flex-1 relative">
              
              {/* Top Card Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevLetter}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold transition-all active:scale-95 cursor-pointer"
                  title="Chữ trước"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black bg-rose-100 text-rose-700 px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedLetter.phoneticName || `Chữ ${selectedLetter.upper}`}
                  </span>
                  {/* Custom voice recording button */}
                  <button
                    onClick={() => setShowRecordModal(true)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-full cursor-pointer transition-colors shadow-2xs"
                    title="Thu âm giọng ba mẹ cho chữ này"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleNextLetter}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold transition-all active:scale-95 cursor-pointer"
                  title="Chữ tiếp theo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Center Letter & Illustrated Word */}
              <div className="my-4 text-center space-y-4">
                
                {/* Big Letter Display - Clickable */}
                <button
                  onClick={handleSpeakCurrent}
                  className="inline-flex flex-col items-center bg-gradient-to-r from-rose-50 to-orange-50 hover:from-rose-100 hover:to-orange-100 active:scale-95 transition-transform px-6 py-3 rounded-3xl border-2 border-rose-200 shadow-inner cursor-pointer"
                  title="Chạm để nghe đọc chữ cái"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl sm:text-7xl font-black text-rose-600 font-['Baloo_2']">
                      {selectedLetter.upper}
                    </span>
                    <span className="text-4xl sm:text-5xl font-black text-rose-400 font-['Baloo_2']">
                      {selectedLetter.lower}
                    </span>
                  </div>
                  {selectedLetter.phoneticSound && (
                    <span className="text-xs font-black text-rose-500 bg-rose-100/80 px-2.5 py-0.5 rounded-full mt-1">
                      {selectedLetter.phoneticSound}
                    </span>
                  )}
                </button>

                {/* Big Emoji, Word & Mnemonic - Clickable */}
                <button
                  onClick={() => {
                    playPopSound();
                    const speechVi = `${selectedLetter.phoneticName || `Chữ ${selectedLetter.upper}`}. ${selectedLetter.word}!`;
                    speakSmart(null, speechVi, `Letter ${selectedLetter.upper}. ${selectedLetter.word}.`);
                  }}
                  className="w-full bg-gradient-to-b from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 active:scale-98 transition-transform rounded-2xl p-4 border-2 border-amber-200 shadow-sm text-center cursor-pointer"
                  title="Chạm để nghe phát âm con vật"
                >
                  <div className="text-6xl sm:text-7xl animate-bounce mb-2">
                    {selectedLetter.imageEmoji}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-800 font-['Baloo_2']">
                    {selectedLetter.word}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-amber-800 mt-1">
                    {selectedLetter.meaningVi}
                  </p>
                  {selectedLetter.mnemonic && (
                    <p className="text-xs font-semibold text-amber-900 bg-amber-100/60 rounded-xl px-3 py-1 mt-2 inline-block border border-amber-200">
                      💡 {selectedLetter.mnemonic}
                    </p>
                  )}
                </button>

                {/* Spelling Combos */}
                {selectedLetter.spellingExamples && (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-left">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Ví dụ ghép vần quen thuộc (Bé chạm để nghe đọc vần):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedLetter.spellingExamples.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            playPopSound();
                            const spText = ex.speechText || `${ex.tone || ex.result}`;
                            speakSmart(null, spText, ex.result);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-extrabold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>{ex.tone || ex.result}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Voice Button */}
              <button
                id="btn-speak-letter"
                onClick={handleSpeakCurrent}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 active:scale-98 text-white rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 border-2 border-red-300 transition-all cursor-pointer"
              >
                <Volume2 className="w-6 h-6 animate-pulse" />
                <span>Bé Nghe Phát Âm / Giọng Ba Mẹ</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GHÉP ÂM & ĐỌC TIẾNG (b + a = ba) */}
      {activeTab === 'blend' && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border-4 border-indigo-200 shadow-xl space-y-6">
          
          <div className="text-center space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 font-['Baloo_2']">
              Ghép Âm - Đọc Tiếng
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Bé chạm vào phụ âm đầu và nguyên âm để ghép thành tiếng mới nhé!
            </p>
          </div>

          {/* Big Equation Card directly matching reference image 2 */}
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-50 rounded-3xl p-6 border-3 border-indigo-200 flex flex-wrap items-center justify-center gap-3 sm:gap-6 shadow-inner">
            
            {/* Box 1: Consonant */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-white rounded-2xl border-3 border-blue-400 shadow-md flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black text-blue-600 font-['Baloo_2']">
                {selectedConsonant}
              </span>
              <span className="text-[10px] font-bold text-slate-400">Phụ âm</span>
            </div>

            <span className="text-3xl sm:text-4xl font-black text-indigo-400">+</span>

            {/* Box 2: Vowel */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-white rounded-2xl border-3 border-rose-400 shadow-md flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black text-red-500 font-['Baloo_2']">
                {selectedVowel}
              </span>
              <span className="text-[10px] font-bold text-slate-400">Nguyên âm</span>
            </div>

            <span className="text-3xl sm:text-4xl font-black text-indigo-400">=</span>

            {/* Box 3: Result */}
            <div className="w-24 h-24 sm:w-32 sm:h-28 bg-emerald-500 text-white rounded-2xl border-3 border-emerald-400 shadow-lg flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black font-['Baloo_2'] tracking-wide">
                {selectedConsonant}{selectedVowel}
              </span>
              <span className="text-[10px] font-bold text-emerald-100">Tiếng tạo thành</span>
            </div>

            {/* Big Sound Play Button */}
            <button
              id="btn-speak-blend"
              onClick={handleBlendSpeak}
              className="p-4 bg-yellow-400 hover:bg-yellow-300 text-amber-950 rounded-2xl shadow-lg border-2 border-yellow-200 active:scale-95 transition-transform flex items-center gap-2 font-black cursor-pointer"
              title="Đọc to tiếng ghép"
            >
              <Volume2 className="w-7 h-7 text-amber-950 animate-pulse" />
              <span className="text-sm sm:text-base hidden sm:inline">Phát âm & Nhận Sao ⭐</span>
            </button>

          </div>

          {/* Consonant Picker */}
          <div className="space-y-2">
            <div className="text-xs font-black text-blue-600 uppercase tracking-wider">
              1. Chọn Phụ âm đầu:
            </div>
            <div className="flex flex-wrap gap-2">
              {consonants.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    playPopSound();
                    setSelectedConsonant(c);
                    const viSp = consonantPhonetics[c] || `Phụ âm ${c}`;
                    speakSmart(null, viSp, `Consonant ${c}`);
                  }}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl font-black text-lg sm:text-xl font-['Baloo_2'] transition-all active:scale-90 border-2 cursor-pointer ${
                    selectedConsonant === c
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md scale-105'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Vowel Picker */}
          <div className="space-y-2">
            <div className="text-xs font-black text-red-500 uppercase tracking-wider">
              2. Chọn Nguyên âm:
            </div>
            <div className="flex flex-wrap gap-2">
              {vowels.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    playPopSound();
                    setSelectedVowel(v);
                    const viSp = vowelPhonetics[v] || `Nguyên âm ${v}`;
                    speakSmart(null, viSp, `Vowel ${v}`);
                  }}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl font-black text-lg sm:text-xl font-['Baloo_2'] transition-all active:scale-90 border-2 cursor-pointer ${
                    selectedVowel === v
                      ? 'bg-red-500 text-white border-red-400 shadow-md scale-105'
                      : 'bg-rose-50 hover:bg-rose-100 text-red-800 border-rose-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: TẬP VIẾT NÉT CHỮ ĐÚNG NÉT (Directly matching reference image 2) */}
      {activeTab === 'write' && (
        <div className="bg-white rounded-3xl p-5 border-4 border-amber-200 shadow-xl space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
            <div>
              <h3 className="text-2xl font-black text-amber-700 font-['Baloo_2'] flex items-center gap-2">
                <PenTool className="w-6 h-6 text-amber-500" />
                Tập Viết Đúng Nét: Chữ "{selectedLetter.upper} {selectedLetter.lower}"
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Dùng ngón tay hoặc chuột vẽ theo các nét hướng dẫn để rèn luyện vận động tinh.
              </p>
            </div>

            {/* Steps text guide & Voice Button */}
            {selectedLetter.strokeSteps && (
              <button
                onClick={() => {
                  playPopSound();
                  const strokePrompt = `Hướng dẫn nét viết chữ ${selectedLetter.upper}: ${selectedLetter.strokeSteps?.join('. ')}`;
                  speakSmart(null, strokePrompt, `Writing guide for letter ${selectedLetter.upper}`);
                }}
                className="bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                title="Bé chạm để nghe hướng dẫn nét viết"
              >
                <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>✏️ {selectedLetter.strokeSteps.join(' ➔ ')}</span>
              </button>
            )}
          </div>

          {/* Canvas Work Area with Dotted Background Letter */}
          <div className="relative w-full h-80 sm:h-96 bg-amber-50/40 rounded-3xl border-3 border-dashed border-amber-300 overflow-hidden flex items-center justify-center touch-none">
            
            {/* Guide Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 p-6">
              <div className="border-b-2 border-blue-400 border-dashed w-full h-1/4" />
              <div className="border-b-2 border-red-400 w-full h-1/4" />
              <div className="border-b-2 border-blue-400 border-dashed w-full h-1/4" />
              <div className="border-b-2 border-blue-400 w-full h-1/4" />
            </div>

            {/* Dotted Silhouette Guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[180px] sm:text-[230px] font-black text-slate-300/60 font-['Nunito'] tracking-widest">
                {selectedLetter.lower}
              </span>
            </div>

            {/* Actual HTML5 Drawing Canvas */}
            <canvas
              ref={canvasRef}
              width={700}
              height={400}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full cursor-crosshair z-10"
            />
          </div>

          {/* Palette & Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            
            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">Màu bút:</span>
              {['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899'].map((c) => (
                <button
                  key={c}
                  onClick={() => { playPopSound(); setDrawColor(c); }}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 cursor-pointer ${
                    drawColor === c ? 'border-slate-800 scale-110 shadow-sm' : 'border-white'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { playPopSound(); clearCanvas(); }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Xóa Viết Lại</span>
              </button>

              <button
                id="btn-finish-writing"
                onClick={handleFinishWriting}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bé Đã Viết Xong ⭐</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Audio Recorder Modal */}
      <AudioRecorderModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        itemId={letterKey}
        itemTitle={`Chữ ${selectedLetter.upper} - ${selectedLetter.word}`}
      />

    </div>
  );
};

