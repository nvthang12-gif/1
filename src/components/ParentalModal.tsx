import React, { useState, useEffect } from 'react';
import { X, Heart, ShieldCheck, Clock, Award, BookOpen, Volume2, Sparkles, RefreshCcw, Mic, Trash2, Languages, Play, Check } from 'lucide-react';
import { 
  playPopSound, 
  currentLanguageMode, 
  setAppLanguageMode, 
  AppLanguageMode, 
  playCustomAudioUrl,
  setVietnameseVoiceStyle,
  currentViVoiceStyle,
  VietnameseVoiceType,
  speakVietnamese
} from '../utils/sound';
import { getAllCustomAudioList, deleteCustomAudio, CustomAudioEntry } from '../utils/audioStorage';

interface ParentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  stars: number;
  onResetProgress: () => void;
}

export const ParentalModal: React.FC<ParentalModalProps> = ({
  isOpen,
  onClose,
  stars,
  onResetProgress,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [customList, setCustomList] = useState<CustomAudioEntry[]>([]);
  const [langMode, setLangMode] = useState<AppLanguageMode>(currentLanguageMode);
  const [viVoiceStyle, setViVoiceStyle] = useState<VietnameseVoiceType>(currentViVoiceStyle);

  useEffect(() => {
    if (unlocked) {
      loadRecordings();
    }
  }, [unlocked]);

  const loadRecordings = async () => {
    const list = await getAllCustomAudioList();
    setCustomList(list);
  };

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() === '7') {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleDeleteRecording = async (itemId: string) => {
    playPopSound();
    await deleteCustomAudio(itemId);
    await loadRecordings();
  };

  const handlePlayRecording = (dataUrl: string) => {
    playCustomAudioUrl(dataUrl);
  };

  const handleLanguageChange = (mode: AppLanguageMode) => {
    playPopSound();
    setLangMode(mode);
    setAppLanguageMode(mode);
    if (mode === 'vi') {
      speakVietnamese('Giọng đọc Tiếng Việt chuẩn');
    }
  };

  const handleVoiceStyleChange = (style: VietnameseVoiceType) => {
    playPopSound();
    setViVoiceStyle(style);
    setVietnameseVoiceStyle(style);
    if (style === 'female_teacher') {
      speakVietnamese('Xin chào bé yêu! Chúng mình cùng học bài nhé!');
    } else if (style === 'warm_female') {
      speakVietnamese('Chào con yêu, chúc con học thật vui!');
    } else if (style === 'gentle_male') {
      speakVietnamese('Bé học rất giỏi, cố gắng lên nhé!');
    } else if (style === 'child_like') {
      speakVietnamese('Chào bạn nhỏ! Cùng chơi nào!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl border-4 border-sky-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-yellow-300" />
            <h3 className="text-lg sm:text-xl font-black font-['Baloo_2']">
              Góc Dành Cho Phụ Huynh (Ba Mẹ)
            </h3>
          </div>

          <button
            onClick={() => {
              playPopSound();
              onClose();
              setUnlocked(false);
              setAnswer('');
            }}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {!unlocked ? (
            /* Parental Gate */
            <form onSubmit={handleVerify} className="space-y-4 text-center py-4">
              <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                🔒
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-slate-800 font-['Baloo_2']">
                  Xác nhận người lớn
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  Để đảm bảo an toàn cho bé, vui lòng trả lời phép tính:
                </p>
              </div>

              <div className="text-2xl font-black text-indigo-600 bg-indigo-50 py-2 px-6 rounded-2xl inline-block border border-indigo-200">
                3 + 4 = ?
              </div>

              <div className="max-w-xs mx-auto space-y-2">
                <input
                  type="number"
                  placeholder="Nhập kết quả..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-4 py-2.5 text-center text-lg font-black rounded-xl border-2 border-slate-300 focus:border-sky-500 outline-none"
                  autoFocus
                />
                {error && (
                  <p className="text-xs font-bold text-rose-500">
                    Chưa đúng, ba mẹ thử lại nhé!
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-black rounded-xl shadow-md transition-all cursor-pointer text-sm"
                >
                  Mở Khóa Góc Phụ Huynh
                </button>
              </div>
            </form>
          ) : (
            /* Unlocked Guide, Custom Voice Management & Stats */
            <div className="space-y-5">
              
              {/* Learning Stats */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🌟</span>
                  <div>
                    <div className="text-xs font-black text-amber-800 uppercase">
                      Tổng số sao bé đã đạt được
                    </div>
                    <div className="text-2xl font-black text-amber-950 font-['Baloo_2']">
                      {stars} Ngôi Sao Xuất Sắc
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Ba mẹ có chắc muốn đặt lại số sao của bé về 0?')) {
                      onResetProgress();
                    }
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Đặt Lại</span>
                </button>
              </div>

              {/* Source Language & Vietnamese Voice Styles */}
              <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-sky-900 uppercase">
                    <Languages className="w-4 h-4 text-sky-600" />
                    <span>Ngôn Ngữ Nguồn (Mặc định: Tiếng Việt)</span>
                  </div>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                    🇻🇳 Chuẩn Tiếng Việt
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleLanguageChange('vi')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      langMode === 'vi'
                        ? 'bg-sky-600 text-white border-sky-500 shadow-sm ring-2 ring-sky-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-100/50'
                    }`}
                  >
                    <span>🇻🇳 Tiếng Việt</span>
                    <span className="text-[10px] opacity-80">(Mặc định chính)</span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      langMode === 'en'
                        ? 'bg-sky-600 text-white border-sky-500 shadow-sm ring-2 ring-sky-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-100/50'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    <span className="text-[10px] opacity-80">(Tiếng Anh)</span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('bilingual')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      langMode === 'bilingual'
                        ? 'bg-sky-600 text-white border-sky-500 shadow-sm ring-2 ring-sky-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-100/50'
                    }`}
                  >
                    <span>🌐 Song Ngữ</span>
                    <span className="text-[10px] opacity-80">(Việt trước, Anh sau)</span>
                  </button>
                </div>

                {/* Tone / Style of Vietnamese Voice */}
                <div className="pt-2 border-t border-sky-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Giọng đọc Tiếng Việt cho bé:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleVoiceStyleChange('female_teacher')}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        viVoiceStyle === 'female_teacher'
                          ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-100/50'
                      }`}
                    >
                      👩‍🏫 Cô Giáo Mầm Non
                    </button>
                    <button
                      onClick={() => handleVoiceStyleChange('warm_female')}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        viVoiceStyle === 'warm_female'
                          ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-100/50'
                      }`}
                    >
                      🌸 Giọng Mẹ Dịu Dàng
                    </button>
                    <button
                      onClick={() => handleVoiceStyleChange('gentle_male')}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        viVoiceStyle === 'gentle_male'
                          ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-100/50'
                      }`}
                    >
                      👨‍🏫 Giọng Ba Ấm Áp
                    </button>
                    <button
                      onClick={() => handleVoiceStyleChange('child_like')}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        viVoiceStyle === 'child_like'
                          ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-100/50'
                      }`}
                    >
                      🎈 Giọng Vui Tươi
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Recorded Voices List */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-rose-500" />
                    Thu âm giọng thật của Ba Mẹ ({customList.length})
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 lowercase">
                    (Ưu tiên phát thay cho máy)
                  </span>
                </h4>

                {customList.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs font-semibold text-slate-500">
                    Chưa có file thu âm nào. Ba mẹ có thể bấm biểu tượng 🎙️ trên các thẻ chữ, con vật, cờ để thu âm giọng thật tiếng Việt của mình cho bé nghe!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customList.map((entry) => (
                      <div
                        key={entry.itemId}
                        className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-center justify-between text-xs"
                      >
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="p-1 bg-rose-200 rounded-full text-rose-700">
                            <Mic className="w-3 h-3" />
                          </span>
                          <span className="font-['Baloo_2'] text-sm">
                            {entry.itemId}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePlayRecording(entry.dataUrl)}
                            className="p-1.5 bg-white hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                            title="Nghe thử"
                          >
                            <Play className="w-3.5 h-3.5 fill-rose-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecording(entry.itemId)}
                            className="p-1.5 bg-white hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Xóa thu âm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Age Guide */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-sky-500" />
                  Lộ trình đồng hành theo từng độ tuổi
                </h4>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 space-y-1">
                    <span className="font-black text-sky-900 block">
                      🌱 Giai đoạn 2 - 3 tuổi (Khai mở thính giác & giác quan):
                    </span>
                    <p className="text-slate-600 font-semibold">
                      Khuyến khích bé nghe tiếng kêu con vật, nhận biết màu sắc cơ bản và đồ vật quen thuộc trong nhà. Ba mẹ cùng lặp lại các âm thanh để kích thích ngôn ngữ đầu đời.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
                    <span className="font-black text-emerald-900 block">
                      🌿 Giai đoạn 3 - 4 tuổi (Mở rộng từ vựng & thói quen):
                    </span>
                    <p className="text-slate-600 font-semibold">
                      Cùng bé học 29 chữ cái, xem các hành động tốt (tưới hoa, rửa tay, chào hỏi), đếm số 1-5 và chơi trò ghép bóng phát triển tư duy thị giác.
                    </p>
                  </div>

                  <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-1">
                    <span className="font-black text-indigo-900 block">
                      🌳 Giai đoạn 4 - 5 tuổi (Tiền tiểu học & tư duy logic):
                    </span>
                    <p className="text-slate-600 font-semibold">
                      Tập viết nét chữ tương tác, thử sức với phép cộng trực quan (2+1=3), so sánh lớn bé (&gt; &lt; =), khám phá lá cờ các nước và đàn Xylophone 8 nốt.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips for screen time */}
              <div className="bg-amber-100/60 p-3.5 rounded-2xl border border-amber-200 text-xs font-bold text-amber-950 flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <span className="font-black">Khuyến nghị thời gian biểu:</span> Mỗi ngày nên cho bé học 15-20 phút, nghỉ ngơi vận động ngoài trời để bảo vệ thị giác và sức khỏe toàn diện.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};


