import React, { useState } from 'react';
import { NUMBERS_DATA, SHAPES_DATA, COLORS_DATA } from '../data/mathData';
import { MathNumberItem, ShapeColorItem } from '../types';
import { speakSmart, playPopSound, playSuccessChime, playWrongGentle } from '../utils/sound';
import { AudioRecorderModal } from './AudioRecorderModal';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, Plus, Scale, Shapes, Palette, CheckCircle2, Mic } from 'lucide-react';

interface MathViewProps {
  onAddStar: () => void;
}

export const MathView: React.FC<MathViewProps> = ({ onAddStar }) => {
  const [activeTab, setActiveTab] = useState<'counting' | 'addition' | 'compare' | 'shapes'>('counting');
  const [selectedNumber, setSelectedNumber] = useState<MathNumberItem>(NUMBERS_DATA[0]);
  const [tappedDots, setTappedDots] = useState<number[]>([]);
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const [recordTarget, setRecordTarget] = useState<{ id: string; title: string }>({
    id: `number_${NUMBERS_DATA[0].number}`,
    title: `Số ${NUMBERS_DATA[0].number}`,
  });

  // Addition Quiz State
  const [addNum1, setAddNum1] = useState(2);
  const [addNum2, setAddNum2] = useState(1);
  const [addAnswerGiven, setAddAnswerGiven] = useState<number | null>(null);

  // Compare Quiz State
  const [compLeft, setCompLeft] = useState(4);
  const [compRight, setCompRight] = useState(2);
  const [compAnswerGiven, setCompAnswerGiven] = useState<string | null>(null);

  const VI_NUMBER_WORDS = ['', 'Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười'];

  const handleSelectNumber = (num: MathNumberItem) => {
    playPopSound();
    setSelectedNumber(num);
    setTappedDots([]);
    speakSmart(
      `number_${num.number}`,
      `Số ${num.number}, ${num.wordVi}. Bé hãy cùng đếm ${num.itemNameVi} nhé!`,
      `Number ${num.number}. ${num.wordEn || num.number}.`
    );
  };

  const handleTapDot = (idx: number) => {
    playPopSound();
    if (!tappedDots.includes(idx)) {
      const next = [...tappedDots, idx];
      setTappedDots(next);
      const countVi = VI_NUMBER_WORDS[next.length] || `${next.length}`;
      speakSmart(null, countVi, `${next.length}`);
      if (next.length === selectedNumber.number) {
        playSuccessChime();
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
        speakSmart(
          `number_${selectedNumber.number}`,
          `Đúng rồi! Đủ ${selectedNumber.number} ${selectedNumber.itemNameVi}! Bé giỏi quá!`,
          `Great! Exactly ${selectedNumber.number}!`
        );
        onAddStar();
      }
    }
  };

  // Addition logic
  const handleAdditionChoice = (sum: number) => {
    const correctSum = addNum1 + addNum2;
    setAddAnswerGiven(sum);
    if (sum === correctSum) {
      playSuccessChime();
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      speakSmart(null, `Chính xác! ${addNum1} cộng ${addNum2} bằng ${correctSum}!`, `Correct! ${addNum1} plus ${addNum2} equals ${correctSum}!`);
      onAddStar();
    } else {
      playWrongGentle();
      speakSmart(null, `Chưa đúng rồi, bé hãy cùng cô đếm lại số quả táo nhé!`, `Try again, count the apples together!`);
    }
  };

  const nextAdditionQuestion = () => {
    playPopSound();
    setAddAnswerGiven(null);
    const n1 = Math.floor(Math.random() * 4) + 1; // 1-4
    const n2 = Math.floor(Math.random() * 4) + 1; // 1-4
    setAddNum1(n1);
    setAddNum2(n2);
  };

  // Comparison logic
  const handleCompareChoice = (operator: '>' | '<' | '=') => {
    setCompAnswerGiven(operator);
    let correctOp = '=';
    if (compLeft > compRight) correctOp = '>';
    if (compLeft < compRight) correctOp = '<';

    if (operator === correctOp) {
      playSuccessChime();
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      const opWords = operator === '>' ? 'lớn hơn' : operator === '<' ? 'nhỏ hơn' : 'bằng';
      speakSmart(null, `Hoan hô bé! ${compLeft} ${opWords} ${compRight}!`, `Great job! ${compLeft} is ${operator === '>' ? 'greater than' : operator === '<' ? 'less than' : 'equal to'} ${compRight}!`);
      onAddStar();
    } else {
      playWrongGentle();
      speakSmart(null, `Chưa đúng rồi! Bé hãy nhìn xem bên nào có nhiều hơn nhé!`, `Try again! See which side has more strawberries.`);
    }
  };

  const nextCompareQuestion = () => {
    playPopSound();
    setCompAnswerGiven(null);
    const n1 = Math.floor(Math.random() * 6) + 1;
    const n2 = Math.floor(Math.random() * 6) + 1;
    setCompLeft(n1);
    setCompRight(n2);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-5">
      
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-3 border-indigo-200 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-700 font-['Baloo_2'] flex items-center gap-2">
            <span>🔢</span> Toán Tư Duy & Số Đếm
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Làm quen số đếm 1-10, phép cộng trực quan, so sánh lớn bé, hình khối và màu sắc.
          </p>
        </div>

        {/* 4 Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-indigo-50 p-1.5 rounded-2xl border border-indigo-200">
          <button
            onClick={() => { playPopSound(); setActiveTab('counting'); }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'counting' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <span>1️⃣</span>
            <span>Số Đếm 1-10</span>
          </button>

          <button
            onClick={() => { playPopSound(); setActiveTab('addition'); }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'addition' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Phép Cộng (2+1)</span>
          </button>

          <button
            onClick={() => { playPopSound(); setActiveTab('compare'); }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'compare' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>So Sánh (&gt; &lt; =)</span>
          </button>

          <button
            onClick={() => { playPopSound(); setActiveTab('shapes'); }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'shapes' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Shapes className="w-4 h-4" />
            <span>Hình & Màu</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SỐ ĐẾM 1 - 10 (Interactive counting) */}
      {activeTab === 'counting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Number Selector Row */}
          <div className="lg:col-span-5 bg-white p-4 rounded-3xl border-3 border-indigo-100 shadow-md">
            <div className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3 px-1">
              Chọn số muốn đếm
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {NUMBERS_DATA.map((item) => {
                const isSelected = item.number === selectedNumber.number;
                return (
                  <button
                    key={item.number}
                    onClick={() => handleSelectNumber(item)}
                    className={`aspect-square rounded-2xl font-black text-2xl font-['Baloo_2'] border-2 flex flex-col items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-600 to-blue-700 text-white border-indigo-400 scale-105 shadow-md ring-4 ring-indigo-200'
                        : 'bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                    }`}
                  >
                    <span>{item.number}</span>
                    <span className="text-xs">{item.itemEmoji}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <span className="text-xs font-black text-amber-800 uppercase block mb-1">
                Hướng dẫn cho bé
              </span>
              <p className="text-xs font-bold text-amber-950">
                Chạm lần lượt vào từng đồ vật bên phải để cùng cô tập đếm từ 1 đến {selectedNumber.number} nhé!
              </p>
            </div>
          </div>

          {/* Right: Big Interactive Counting Board */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-4 border-indigo-300 p-6 shadow-xl space-y-6 flex flex-col justify-between">
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-sky-50 px-6 py-2 rounded-2xl border-2 border-indigo-200">
                <span className="text-5xl sm:text-6xl font-black text-indigo-600 font-['Baloo_2']">
                  Số {selectedNumber.number}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-700 font-['Baloo_2']">
                  ({selectedNumber.wordVi})
                </span>
                <button
                  onClick={() => {
                    setRecordTarget({
                      id: `number_${selectedNumber.number}`,
                      title: `Số ${selectedNumber.number} (${selectedNumber.wordVi})`,
                    });
                    setShowRecordModal(true);
                  }}
                  className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full cursor-pointer"
                  title="Thu âm giọng ba mẹ đọc số này"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-bold text-slate-500">
                Bé chạm vào từng {selectedNumber.itemNameVi} để đếm nhé!
              </p>
            </div>

            {/* Interactive Fruits Array */}
            <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-200 min-h-[220px] flex flex-wrap items-center justify-center gap-4">
              {Array.from({ length: selectedNumber.number }).map((_, idx) => {
                const isTapped = tappedDots.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleTapDot(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-200 transform active:scale-90 cursor-pointer shadow-md ${
                      isTapped
                        ? 'bg-emerald-100 border-emerald-400 scale-105 ring-4 ring-emerald-200'
                        : 'bg-white hover:bg-yellow-50 border-amber-200 hover:scale-105'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl">{selectedNumber.itemEmoji}</span>
                    <span className={`text-xs font-black font-['Baloo_2'] mt-0.5 ${isTapped ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Read aloud & Counter Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold px-1">
                <span className="text-slate-500">
                  Đã đếm: {tappedDots.length} / {selectedNumber.number}
                </span>
                {tappedDots.length === selectedNumber.number && (
                  <span className="text-emerald-600 font-black">
                    ✓ Hoàn thành đếm số {selectedNumber.number}! (+1 ⭐)
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  playPopSound();
                  speakSmart(
                    `number_${selectedNumber.number}`,
                    `Số ${selectedNumber.number}. ${selectedNumber.wordVi}. ${selectedNumber.itemNameVi}`,
                    `Number ${selectedNumber.number}. ${selectedNumber.wordEn || selectedNumber.number}.`
                  );
                }}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span>Nghe Đọc Số {selectedNumber.number}</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: PHÉP CỘNG TRỰC QUAN (2 + 1 = 3) */}
      {activeTab === 'addition' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-indigo-200 shadow-xl space-y-6 text-center">
          
          <div className="space-y-1">
            <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-black px-3.5 py-1 rounded-full uppercase">
              Toán Tư Duy Trực Quan
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 font-['Baloo_2']">
              Bé hãy đếm xem có tất cả bao nhiêu quả táo?
            </h3>
          </div>

          {/* Visual Equation directly matching reference image 3 */}
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-50 rounded-3xl p-6 border-3 border-indigo-200 flex flex-wrap items-center justify-center gap-4 sm:gap-6 shadow-inner max-w-2xl mx-auto">
            
            {/* Group 1 */}
            <div className="bg-white p-4 rounded-2xl border-3 border-red-300 shadow-sm flex flex-col items-center min-w-[90px]">
              <div className="text-3xl sm:text-4xl">
                {'🍎'.repeat(addNum1)}
              </div>
              <span className="text-2xl sm:text-3xl font-black text-red-500 font-['Baloo_2'] mt-1">
                {addNum1}
              </span>
            </div>

            <span className="text-3xl sm:text-4xl font-black text-indigo-500">+</span>

            {/* Group 2 */}
            <div className="bg-white p-4 rounded-2xl border-3 border-red-300 shadow-sm flex flex-col items-center min-w-[90px]">
              <div className="text-3xl sm:text-4xl">
                {'🍎'.repeat(addNum2)}
              </div>
              <span className="text-2xl sm:text-3xl font-black text-red-500 font-['Baloo_2'] mt-1">
                {addNum2}
              </span>
            </div>

            <span className="text-3xl sm:text-4xl font-black text-indigo-500">=</span>

            {/* Mystery Box */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-yellow-400 text-amber-950 rounded-2xl border-3 border-yellow-300 shadow-md flex items-center justify-center text-4xl sm:text-5xl font-black font-['Baloo_2']">
              {addAnswerGiven !== null ? addAnswerGiven : '?'}
            </div>

          </div>

          {/* Answer Choice Buttons */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-black text-slate-400 uppercase">
              Bé chạm vào kết quả đúng:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[addNum1 + addNum2 - 1, addNum1 + addNum2, addNum1 + addNum2 + 1]
                .filter(n => n > 0)
                .sort(() => 0.5 - Math.random())
                .map((ans) => (
                  <button
                    key={ans}
                    onClick={() => handleAdditionChoice(ans)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-3 border-indigo-300 hover:border-indigo-500 font-black text-3xl sm:text-4xl font-['Baloo_2'] shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    {ans}
                  </button>
                ))}
            </div>
          </div>

          {/* Next Button if answered correctly */}
          {addAnswerGiven === addNum1 + addNum2 && (
            <div className="pt-2">
              <button
                onClick={nextAdditionQuestion}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Phép Tính Tiếp Theo ➔</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: SO SÁNH LỚN BÉ ( > < = ) */}
      {activeTab === 'compare' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-emerald-200 shadow-xl space-y-6 text-center">
          
          <div className="space-y-1">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3.5 py-1 rounded-full uppercase">
              Tập So Sánh Số Lượng
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 font-['Baloo_2']">
              Bên nào có nhiều quả dâu tây hơn?
            </h3>
          </div>

          {/* Comparison Arena */}
          <div className="bg-emerald-50/50 rounded-3xl p-6 border-3 border-emerald-200 flex flex-wrap items-center justify-center gap-4 sm:gap-8 max-w-3xl mx-auto shadow-inner">
            
            {/* Left box */}
            <div className="bg-white p-5 rounded-2xl border-3 border-emerald-300 shadow-md min-w-[120px]">
              <div className="text-4xl mb-2">{'🍓'.repeat(compLeft)}</div>
              <span className="text-3xl font-black text-emerald-700 font-['Baloo_2']">
                {compLeft} quả
              </span>
            </div>

            {/* Operator Symbol Slot */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 text-white rounded-2xl border-3 border-emerald-400 shadow-md flex items-center justify-center text-4xl sm:text-5xl font-black font-['Baloo_2']">
              {compAnswerGiven || '?'}
            </div>

            {/* Right box */}
            <div className="bg-white p-5 rounded-2xl border-3 border-emerald-300 shadow-md min-w-[120px]">
              <div className="text-4xl mb-2">{'🍓'.repeat(compRight)}</div>
              <span className="text-3xl font-black text-emerald-700 font-['Baloo_2']">
                {compRight} quả
              </span>
            </div>

          </div>

          {/* Operator Buttons: > < = */}
          <div className="space-y-3">
            <div className="text-xs font-black text-slate-400 uppercase">
              Bé chọn dấu so sánh thích hợp:
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleCompareChoice('>')}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-2xl sm:text-3xl shadow-lg border-2 border-red-300 active:scale-95 transition-transform cursor-pointer"
              >
                &gt; (Lớn hơn)
              </button>

              <button
                onClick={() => handleCompareChoice('=')}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-amber-950 rounded-2xl font-black text-2xl sm:text-3xl shadow-lg border-2 border-yellow-300 active:scale-95 transition-transform cursor-pointer"
              >
                = (Bằng nhau)
              </button>

              <button
                onClick={() => handleCompareChoice('<')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-2xl sm:text-3xl shadow-lg border-2 border-blue-300 active:scale-95 transition-transform cursor-pointer"
              >
                &lt; (Nhỏ hơn)
              </button>
            </div>
          </div>

          {compAnswerGiven && (
            <div className="pt-2">
              <button
                onClick={nextCompareQuestion}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Câu So Sánh Tiếp Theo ➔</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: HÌNH KHỐI & MÀU SẮC */}
      {activeTab === 'shapes' && (
        <div className="space-y-6">
          
          {/* Shapes Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-amber-200 shadow-md space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-amber-800 font-['Baloo_2'] flex items-center gap-2">
              <Shapes className="w-6 h-6 text-amber-600" />
              Nhận Biết Các Hình Khối Cơ Bản
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {SHAPES_DATA.map((shape) => (
                <div
                  key={shape.id}
                  onClick={() => {
                    playPopSound();
                    speakSmart(
                      `shape_${shape.id}`,
                      `Hình ${shape.nameVi}. Đây là ${shape.nameVi} nhé!`,
                      `Shape ${shape.nameEn || shape.nameVi}.`
                    );
                  }}
                  className="relative p-4 bg-amber-50/70 hover:bg-amber-100 rounded-2xl border-2 border-amber-200 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-2xs group"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecordTarget({
                        id: `shape_${shape.id}`,
                        title: `Hình ${shape.nameVi}`,
                      });
                      setShowRecordModal(true);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-white/80 hover:bg-white text-amber-800 rounded-full shadow-2xs cursor-pointer opacity-80 group-hover:opacity-100"
                    title="Thu âm giọng ba mẹ"
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                  <span className="text-5xl">{shape.emoji}</span>
                  <span className="font-black text-sm text-amber-950 font-['Baloo_2']">
                    {shape.nameVi}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Colors Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-purple-200 shadow-md space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-purple-800 font-['Baloo_2'] flex items-center gap-2">
              <Palette className="w-6 h-6 text-purple-600" />
              Nhận Biết Bảy Sắc Cầu Vồng Rực Rỡ
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {COLORS_DATA.map((color) => (
                <div
                  key={color.id}
                  onClick={() => {
                    playPopSound();
                    speakSmart(
                      `color_${color.id}`,
                      `Màu ${color.nameVi}. Màu ${color.nameVi} thật rực rỡ!`,
                      `Color ${color.nameEn || color.nameVi}.`
                    );
                  }}
                  className="relative p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-2xs group"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecordTarget({
                        id: `color_${color.id}`,
                        title: `Màu ${color.nameVi}`,
                      });
                      setShowRecordModal(true);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow-2xs cursor-pointer opacity-80 group-hover:opacity-100"
                    title="Thu âm giọng ba mẹ"
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                  <div
                    style={{ backgroundColor: color.hex }}
                    className="w-12 h-12 rounded-full border-3 border-white shadow-md"
                  />
                  <span className="font-black text-xs sm:text-sm text-slate-800 font-['Baloo_2']">
                    {color.nameVi}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Audio Recorder Modal */}
      <AudioRecorderModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        itemId={recordTarget.id}
        itemTitle={recordTarget.title}
      />

    </div>
  );
};

