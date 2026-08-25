import React, { useState } from 'react';
import { ACTIONS_DATA } from '../data/actionsData';
import { ActionItem } from '../types';
import { speakSmart, playPopSound, playSuccessChime, playWrongGentle, currentLanguageMode } from '../utils/sound';
import { AudioRecorderModal } from './AudioRecorderModal';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, Heart, CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, Mic } from 'lucide-react';

interface ActionsViewProps {
  onAddStar: () => void;
}

export const ActionsView: React.FC<ActionsViewProps> = ({ onAddStar }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const currentAction = ACTIONS_DATA[selectedIndex];
  const actionKey = `action_${currentAction.id}`;

  // Quiz State
  const [quizQuestion, setQuizQuestion] = useState<{
    prompt: string;
    correctActionId: string;
    options: ActionItem[];
  }>({
    prompt: 'Trước khi ăn cơm, bé cần làm gì để bàn tay luôn sạch sẽ?',
    correctActionId: 'washing-hands',
    options: [ACTIONS_DATA[1], ACTIONS_DATA[0], ACTIONS_DATA[7]],
  });
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean>(false);

  const handleSelectAction = (index: number) => {
    playPopSound();
    setSelectedIndex(index);
    const act = ACTIONS_DATA[index];
    speakSmart(
      `action_${act.id}`,
      `${act.titleVi}. ${act.descriptionVi}`,
      `${act.titleEn || act.titleVi}. ${act.descriptionVi}`
    );
  };

  const handleSpeakCurrentAction = () => {
    playPopSound();
    speakSmart(
      actionKey,
      `${currentAction.titleVi}. ${currentAction.descriptionVi}`,
      `${currentAction.titleEn || currentAction.titleVi}.`
    );
  };

  const handleSpeakRelatedItem = (item: string) => {
    playPopSound();
    speakSmart(null, item, item);
  };

  const handleNext = () => {
    const nextIdx = (selectedIndex + 1) % ACTIONS_DATA.length;
    handleSelectAction(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (selectedIndex - 1 + ACTIONS_DATA.length) % ACTIONS_DATA.length;
    handleSelectAction(prevIdx);
  };

  const startRandomQuiz = () => {
    playPopSound();
    setAnsweredCorrectly(false);
    const questions = [
      {
        prompt: 'Trước khi ăn cơm và sau khi chơi, bé làm gì để bàn tay sạch sẽ?',
        correctActionId: 'washing-hands',
      },
      {
        prompt: 'Để cây hoa trong vườn luôn tươi tốt, bé cần làm gì?',
        correctActionId: 'watering-flowers',
      },
      {
        prompt: 'Để hàm răng luôn trắng sáng và thơm tho, bé cần làm gì?',
        correctActionId: 'brushing-teeth',
      },
      {
        prompt: 'Chơi đồ chơi xong, bé ngoan sẽ làm gì?',
        correctActionId: 'tidying-toys',
      },
      {
        prompt: 'Khi gặp ông bà, cha mẹ hoặc thầy cô, bé làm gì?',
        correctActionId: 'saying-hello',
      },
    ];

    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    const correctAct = ACTIONS_DATA.find(a => a.id === randomQ.correctActionId)!;
    const others = ACTIONS_DATA.filter(a => a.id !== correctAct.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const shuffled = [correctAct, ...others].sort(() => 0.5 - Math.random());

    setQuizQuestion({
      prompt: randomQ.prompt,
      correctActionId: randomQ.correctActionId,
      options: shuffled,
    });

    setTimeout(() => {
      speakSmart(null, randomQ.prompt, randomQ.prompt);
    }, 200);
  };

  const handleAnswerQuiz = (action: ActionItem) => {
    playPopSound();
    if (action.id === quizQuestion.correctActionId) {
      setAnsweredCorrectly(true);
      playSuccessChime();
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      speakSmart(
        `action_${action.id}`,
        `Hoan hô bé! Chính xác là ${action.titleVi}! Bé thật là ngoan ngoãn!`,
        `Great job! That is ${action.titleEn || action.titleVi}!`
      );
      onAddStar();
    } else {
      playWrongGentle();
      speakSmart(null, `Chưa đúng rồi! Bé hãy suy nghĩ lại và chọn hành động đúng nhé!`, `Try again! Choose the right action!`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-3 border-emerald-200 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-700 font-['Baloo_2'] flex items-center gap-2">
            <span>🌻</span> Hành Động & Thói Quen Của Bé
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Luyện đọc hiểu câu, hình thành thói quen tốt, thu âm giọng ba mẹ và rèn kỹ năng sống tự lập cho bé 2 - 5 tuổi.
          </p>
        </div>

        <button
          id="btn-toggle-action-quiz"
          onClick={() => {
            playPopSound();
            const nextMode = !isQuizMode;
            setIsQuizMode(nextMode);
            if (nextMode) startRandomQuiz();
          }}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
            isQuizMode
              ? 'bg-purple-600 text-white border-2 border-purple-400'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-emerald-300'
          }`}
        >
          {isQuizMode ? (
            <>
              <span>📖</span>
              <span>Xem Thẻ Hành Động</span>
            </>
          ) : (
            <>
              <HelpCircle className="w-5 h-5" />
              <span>Đố Bé Thói Quen Tốt ⭐</span>
            </>
          )}
        </button>
      </div>

      {/* QUIZ MODE */}
      {isQuizMode ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-purple-200 shadow-xl space-y-6 text-center">
          <div className="space-y-2">
            <span className="inline-block bg-purple-100 text-purple-800 text-xs font-black px-3.5 py-1 rounded-full uppercase">
              Bé ngoan hiểu biết
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 font-['Baloo_2']">
              {quizQuestion.prompt}
            </h3>
            <button
              onClick={() => speakSmart(null, quizQuestion.prompt, quizQuestion.prompt)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-full cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe lại câu hỏi</span>
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
            {quizQuestion.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAnswerQuiz(opt)}
                className={`p-6 rounded-3xl border-4 transition-all duration-200 transform active:scale-95 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-md ${
                  answeredCorrectly && opt.id === quizQuestion.correctActionId
                    ? 'bg-emerald-100 border-emerald-400 ring-4 ring-emerald-200 scale-105'
                    : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-6xl">{opt.iconEmoji}</span>
                <span className="text-lg font-black text-slate-800 font-['Baloo_2']">
                  {opt.titleVi}
                </span>
              </button>
            ))}
          </div>

          {answeredCorrectly && (
            <div className="pt-4 space-y-3">
              <div className="text-xl font-black text-emerald-600 animate-bounce">
                🌟 Bé giỏi lắm! Bé biết chăm sóc bản thân và gia đình! (+1 ⭐)
              </div>
              <button
                onClick={startRandomQuiz}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-2xl font-black text-base shadow-lg shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Câu Tiếp Theo ➔</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* STUDY READING MODE (Matching reference image 2: "LUYỆN ĐỌC HIỂU") */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Interactive Big Reading Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl border-4 border-emerald-300 p-6 shadow-xl space-y-6">
            
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase">
                  Luyện Đọc Hiểu & Kỹ Năng
                </span>
                <button
                  onClick={() => setShowRecordModal(true)}
                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 cursor-pointer shadow-2xs"
                  title="Thu âm giọng đọc của ba mẹ cho hành động này"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold transition-all active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-extrabold text-slate-400">
                  {selectedIndex + 1} / {ACTIONS_DATA.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold transition-all active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Visual Action Banner (Like "BÉ TƯỚI HOA" in reference image 2) */}
            <div 
              onClick={handleSpeakCurrentAction}
              className="bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 rounded-3xl p-6 sm:p-8 border-3 border-emerald-200 text-center space-y-4 shadow-inner cursor-pointer hover:border-emerald-400 transition-all active:scale-98 group"
              title="Chạm để nghe cô giáo đọc câu chuyện và bài học"
            >
              <div className="text-7xl sm:text-8xl group-hover:scale-110 transition-transform animate-bounce">
                {currentAction.iconEmoji}
              </div>

              {/* Big High-contrast reading sentence */}
              <div className="inline-block bg-white px-6 py-3 rounded-2xl border-2 border-emerald-300 shadow-sm group-hover:border-emerald-500 transition-all">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-emerald-800 font-['Baloo_2'] tracking-wide">
                    {currentAction.titleVi}
                  </h3>
                  <Volume2 className="w-6 h-6 text-emerald-600 animate-pulse" />
                </div>
                {currentAction.titleEn && currentLanguageMode !== 'vi' && (
                  <p className="text-sm font-bold text-slate-500 mt-1">
                    {currentAction.titleEn}
                  </p>
                )}
              </div>

              <p className="text-base sm:text-lg font-bold text-slate-700 max-w-lg mx-auto leading-relaxed">
                {currentAction.descriptionVi}
              </p>
              
              <div className="text-xs font-black text-emerald-600 uppercase tracking-wide">
                🔊 Chạm vào thẻ để nghe phát âm Tiếng Việt
              </div>
            </div>

            {/* Related Elements Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Đồ vật & Biểu tượng liên quan:</span>
                <span className="text-[11px] text-emerald-600 font-bold">Chạm để nghe từng từ</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {currentAction.relatedItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSpeakRelatedItem(item)}
                    className="px-3.5 py-2 bg-white hover:bg-emerald-100 active:scale-95 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl border-2 border-slate-200 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    title={`Nghe đọc: ${item}`}
                  >
                    <span>{item}</span>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Big Read Aloud Button */}
            <button
              id="btn-speak-action"
              onClick={handleSpeakCurrentAction}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-98 text-white rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 border-2 border-emerald-300 transition-all cursor-pointer"
            >
              <Volume2 className="w-6 h-6 animate-pulse" />
              <span>Bé Nghe Phát Âm / Giọng Ba Mẹ</span>
            </button>

          </div>

          {/* Right: Quick List of All Actions */}
          <div className="lg:col-span-4 bg-white p-4 rounded-3xl border-3 border-emerald-100 shadow-md flex flex-col justify-between">
            <div>
              <div className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3 px-1">
                Danh sách hành động quen thuộc
              </div>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {ACTIONS_DATA.map((act, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={act.id}
                      onClick={() => handleSelectAction(idx)}
                      className={`w-full p-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all text-left cursor-pointer border-2 ${
                        isSelected
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                          : 'bg-emerald-50/50 hover:bg-emerald-100/70 text-slate-800 border-emerald-100'
                      }`}
                    >
                      <span className="text-2xl">{act.iconEmoji}</span>
                      <span className="font-['Baloo_2'] text-base flex-1">{act.titleVi}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-yellow-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Audio Recorder Modal */}
      <AudioRecorderModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        itemId={actionKey}
        itemTitle={`Hành động: ${currentAction.titleVi}`}
      />

    </div>
  );
};

