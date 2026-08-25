import React, { useState, useEffect } from 'react';
import { NURSERY_SONGS } from '../data/songsData';
import { ANIMALS_DATA } from '../data/animalsData';
import { PIANO_FREQUENCIES, playPianoNote, playPopSound, playSuccessChime, playWrongGentle, speakSmart } from '../utils/sound';
import confetti from 'canvas-confetti';
import { Music, Sparkles, Brain, Puzzle, Volume2, RotateCcw, Play, Check } from 'lucide-react';

interface GamesHubProps {
  onAddStar: () => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ onAddStar }) => {
  const [selectedGame, setSelectedGame] = useState<'piano' | 'shadow' | 'memory' | 'speed'>('piano');

  // ----------------- Piano State -----------------
  const [activeSong, setActiveSong] = useState(NURSERY_SONGS[0]);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [highlightedNote, setHighlightedNote] = useState<string | null>(null);

  const handlePlayKey = (key: string) => {
    playPianoNote(key);
    setHighlightedNote(key);
    setTimeout(() => setHighlightedNote(null), 250);
  };

  const handlePlayNurserySong = async () => {
    if (isPlayingSong) return;
    setIsPlayingSong(true);
    speakSmart(null, `Bài hát: ${activeSong.title}. Cùng nghe nhé!`, `Song: ${activeSong.title}`);

    for (let i = 0; i < activeSong.notes.length; i++) {
      const item = activeSong.notes[i];
      playPianoNote(item.note);
      setHighlightedNote(item.note);
      await new Promise(r => setTimeout(r, item.duration));
      setHighlightedNote(null);
    }
    setIsPlayingSong(false);
    playSuccessChime();
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    onAddStar();
  };

  // ----------------- Shadow Matching Game State -----------------
  const shadowCandidates = ANIMALS_DATA.slice(0, 6);
  const [targetShadowAnimal, setTargetShadowAnimal] = useState(shadowCandidates[0]);
  const [shadowOptions, setShadowOptions] = useState(shadowCandidates.slice(0, 3));
  const [shadowSolved, setShadowSolved] = useState(false);

  const initShadowGame = () => {
    setShadowSolved(false);
    const randomTarget = shadowCandidates[Math.floor(Math.random() * shadowCandidates.length)];
    setTargetShadowAnimal(randomTarget);
    const others = shadowCandidates.filter(a => a.id !== randomTarget.id).slice(0, 2);
    const opts = [randomTarget, ...others].sort(() => 0.5 - Math.random());
    setShadowOptions(opts);
  };

  const handleChooseShadow = (animalId: string) => {
    if (animalId === targetShadowAnimal.id) {
      setShadowSolved(true);
      playSuccessChime();
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      speakSmart(`animal_${targetShadowAnimal.id}`, `Chính xác! Bé đã ghép đúng bóng của con ${targetShadowAnimal.nameVi}!`, `Correct! ${targetShadowAnimal.nameEn || targetShadowAnimal.nameVi}!`);
      onAddStar();
    } else {
      playWrongGentle();
      speakSmart(null, `Chưa đúng rồi! Bé hãy nhìn kỹ hình dáng chiếc bóng đen nhé!`, `Try again! Look at the shadow carefully.`);
    }
  };

  // ----------------- Memory Flip Game State -----------------
  interface CardItem {
    id: number;
    emoji: string;
    nameVi: string;
    matched: boolean;
  }
  const memoryIcons = [
    { emoji: '🐶', name: 'Chó con' },
    { emoji: '🐱', name: 'Mèo con' },
    { emoji: '🍎', name: 'Quả táo' },
    { emoji: '🚗', name: 'Xe hơi' },
  ];
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const initMemoryGame = () => {
    const deck: CardItem[] = [];
    let idCounter = 0;
    memoryIcons.forEach(item => {
      deck.push({ id: idCounter++, emoji: item.emoji, nameVi: item.name, matched: false });
      deck.push({ id: idCounter++, emoji: item.emoji, nameVi: item.name, matched: false });
    });
    setCards(deck.sort(() => 0.5 - Math.random()));
    setFlippedCards([]);
  };

  useEffect(() => {
    initMemoryGame();
    initShadowGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].matched || flippedCards.includes(index)) return;

    playPopSound();
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);
    const card = cards[index];
    speakSmart(null, card.nameVi, card.nameVi);

    if (newFlipped.length === 2) {
      const first = cards[newFlipped[0]];
      const second = cards[newFlipped[1]];

      if (first.emoji === second.emoji) {
        // Matched
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === newFlipped[0] || i === newFlipped[1] ? { ...c, matched: true } : c));
          setFlippedCards([]);
          playSuccessChime();
          speakSmart(null, `Đúng rồi! Hai hình ${first.nameVi}! Bé giỏi quá!`, `Great! Two ${first.nameVi}!`);
          onAddStar();
        }, 400);
      } else {
        // Not matched
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-5">
      
      {/* Top Header & Game Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-3 border-purple-200 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-purple-700 font-['Baloo_2'] flex items-center gap-2">
            <span>🎮</span> Trò Chơi Trí Tuệ & Âm Nhạc
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Rèn luyện thính giác, tư duy quan sát, trí nhớ và phối hợp tay mắt.
          </p>
        </div>

        {/* 3 Game Tabs */}
        <div className="flex items-center gap-1.5 bg-purple-50 p-1.5 rounded-2xl border border-purple-200">
          <button
            onClick={() => { playPopSound(); setSelectedGame('piano'); }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedGame === 'piano' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Đàn Xylophone</span>
          </button>

          <button
            onClick={() => { playPopSound(); setSelectedGame('shadow'); }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedGame === 'shadow' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Puzzle className="w-4 h-4" />
            <span>Ghép Bóng</span>
          </button>

          <button
            onClick={() => { playPopSound(); setSelectedGame('memory'); }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedGame === 'memory' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Lật Thẻ Nhớ</span>
          </button>
        </div>
      </div>

      {/* GAME 1: ĐÀN PIANO / XYLOPHONE 8 NỐT RỰC RỠ */}
      {selectedGame === 'piano' && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border-4 border-pink-200 shadow-xl space-y-6 text-center">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-3 text-left">
            <div>
              <h3 className="text-2xl font-black text-pink-600 font-['Baloo_2'] flex items-center gap-2">
                <Music className="w-6 h-6 text-pink-500" />
                Đàn Xylophone 8 Nốt Vui Nhộn
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Bé chạm vào từng phím đàn nhiều màu để tự sáng tác nhạc hoặc nghe các bài đồng dao mẫu!
              </p>
            </div>

            {/* Song Autoplayer Button */}
            <div className="flex items-center gap-2">
              <select
                value={activeSong.id}
                onChange={(e) => {
                  const s = NURSERY_SONGS.find(song => song.id === e.target.value);
                  if (s) setActiveSong(s);
                }}
                className="text-xs sm:text-sm font-bold bg-pink-50 text-pink-900 border border-pink-200 rounded-xl px-3 py-2 cursor-pointer outline-none"
              >
                {NURSERY_SONGS.map((song) => (
                  <option key={song.id} value={song.id}>
                    🎵 {song.title}
                  </option>
                ))}
              </select>

              <button
                id="btn-play-song"
                disabled={isPlayingSong}
                onClick={handlePlayNurserySong}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isPlayingSong ? 'Đang Đàn...' : 'Đàn Cho Bé Nghe'}</span>
              </button>
            </div>
          </div>

          {/* 8 Rainbow Xylophone Keys */}
          <div className="bg-gradient-to-b from-slate-100 to-slate-200 rounded-3xl p-6 sm:p-8 border-3 border-slate-300 shadow-inner flex items-end justify-center gap-2 sm:gap-4 h-72 sm:h-80 max-w-3xl mx-auto">
            {Object.entries(PIANO_FREQUENCIES).map(([noteKey, item], idx) => {
              const isNoteActive = highlightedNote === noteKey;
              // Height increases slightly for lower notes, standard xylophone shape
              const heights = ['h-64', 'h-60', 'h-56', 'h-52', 'h-48', 'h-44', 'h-40', 'h-36'];
              return (
                <button
                  key={noteKey}
                  onClick={() => handlePlayKey(noteKey)}
                  className={`flex-1 ${heights[idx]} ${item.color} rounded-2xl sm:rounded-3xl border-3 border-white text-white font-black flex flex-col items-center justify-between py-4 shadow-lg transition-all duration-100 transform active:scale-95 cursor-pointer ${
                    isNoteActive ? 'scale-105 ring-4 ring-yellow-300 shadow-2xl brightness-125' : ''
                  }`}
                >
                  <span className="w-3 h-3 bg-white/40 rounded-full" />
                  
                  <div className="space-y-0.5">
                    <span className="text-xl sm:text-2xl font-black font-['Baloo_2'] block drop-shadow">
                      {item.solfege}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-white/80 uppercase">
                      {noteKey}
                    </span>
                  </div>

                  <span className="w-3 h-3 bg-white/40 rounded-full" />
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-500">
            {activeSong.lyrics}
          </div>

        </div>
      )}

      {/* GAME 2: GHÉP BÓNG THÔNG MINH (Shadow Matching) */}
      {selectedGame === 'shadow' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-200 shadow-xl space-y-6 text-center">
          
          <div className="space-y-1">
            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-black px-3.5 py-1 rounded-full uppercase">
              Quan Sát & Phối Hợp Thị Giác
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 font-['Baloo_2']">
              Bé hãy tìm con vật tương ứng với chiếc bóng đen này nhé!
            </h3>
          </div>

          {/* Shadow Display */}
          <div className="flex justify-center my-4">
            <div className="w-40 h-40 bg-slate-900 rounded-3xl border-4 border-amber-300 shadow-xl flex items-center justify-center relative overflow-hidden">
              <span className="text-7xl filter brightness-0 invert opacity-90">
                {targetShadowAnimal.emoji}
              </span>
              <div className="absolute top-2 right-2 text-xs font-black text-yellow-300">
                ?
              </div>
            </div>
          </div>

          {/* 3 Color Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {shadowOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleChooseShadow(opt.id)}
                className="p-5 bg-amber-50 hover:bg-amber-100 rounded-3xl border-3 border-amber-200 hover:border-amber-400 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <span className="text-6xl">{opt.emoji}</span>
                <span className="text-lg font-black text-slate-800 font-['Baloo_2']">
                  {opt.nameVi}
                </span>
              </button>
            ))}
          </div>

          {shadowSolved && (
            <div className="pt-2">
              <button
                onClick={initShadowGame}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Câu Tiếp Theo ➔</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* GAME 3: LẬT THẺ TRÍ NHỚ (Memory Match) */}
      {selectedGame === 'memory' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-indigo-200 shadow-xl space-y-6 text-center">
          
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <div>
              <h3 className="text-2xl font-black text-indigo-700 font-['Baloo_2'] text-left">
                Lật Thẻ Ghi Nhớ Cặp Đôi
              </h3>
              <p className="text-xs text-slate-500 font-semibold text-left">
                Lật mở 2 thẻ giống nhau để ghi điểm và rèn luyện trí nhớ ngắn hạn.
              </p>
            </div>

            <button
              onClick={() => { playPopSound(); initMemoryGame(); }}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi Lại</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto">
            {cards.map((card, idx) => {
              const isFlipped = flippedCards.includes(idx) || card.matched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className={`aspect-square rounded-2xl border-3 font-black flex items-center justify-center transition-all duration-300 transform cursor-pointer shadow-md ${
                    isFlipped
                      ? 'bg-gradient-to-br from-amber-100 to-yellow-50 border-amber-300 scale-100'
                      : 'bg-indigo-500 hover:bg-indigo-600 border-indigo-400 text-white active:scale-95'
                  }`}
                >
                  {isFlipped ? (
                    <span className="text-4xl sm:text-5xl animate-in zoom-in-75">
                      {card.emoji}
                    </span>
                  ) : (
                    <span className="text-2xl font-['Baloo_2'] text-indigo-200">
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {cards.length > 0 && cards.every(c => c.matched) && (
            <div className="space-y-3 pt-2">
              <div className="text-xl font-black text-emerald-600 animate-bounce">
                🎉 Hoan hô! Bé đã tìm được tất cả các cặp thẻ!
              </div>
              <button
                onClick={initMemoryGame}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                Chơi Ván Mới ➔
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
