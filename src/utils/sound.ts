// Audio synthesis, Vietnamese/English Text-to-Speech & Custom Parent Voice Engine
import { getCustomAudio } from './audioStorage';

let audioCtx: AudioContext | null = null;
let currentPlayingAudio: HTMLAudioElement | null = null;
let currentBufferSource: AudioBufferSourceNode | null = null;

// In-memory cache for generated AI speech
const aiAudioCache = new Map<string, string>();
let rateLimitCooldownUntil = 0;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {}
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    unlockAudio();
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('pointerdown', unlock);
  };
  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('pointerdown', unlock, { passive: true });
}

// ----------------- Language & Voice Settings -----------------
export type AppLanguageMode = 'vi' | 'en' | 'bilingual';

export type VietnameseVoiceType = 'female_teacher' | 'warm_female' | 'gentle_male' | 'child_like';

export let currentLanguageMode: AppLanguageMode = 'vi';
export let currentViVoiceStyle: VietnameseVoiceType = 'female_teacher';
export let speechRate = 0.85; // Toddler friendly rate (clear articulation)
export let speechPitch = 1.15; // Bright, warm teacher pitch
export let isMuted = false;

// Cached list of voices
let availableVoices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const v = window.speechSynthesis.getVoices();
    if (v && v.length > 0) {
      availableVoices = v;
    }
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

export function setAppLanguageMode(mode: AppLanguageMode) {
  currentLanguageMode = mode;
}

export function setVietnameseVoiceStyle(style: VietnameseVoiceType) {
  currentViVoiceStyle = style;
  if (style === 'female_teacher') {
    speechPitch = 1.15;
    speechRate = 0.85;
  } else if (style === 'warm_female') {
    speechPitch = 1.05;
    speechRate = 0.8;
  } else if (style === 'gentle_male') {
    speechPitch = 0.9;
    speechRate = 0.85;
  } else if (style === 'child_like') {
    speechPitch = 1.35;
    speechRate = 0.9;
  }
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
  if (muted) {
    stopCurrentPlayback();
  }
}

export function setSpeechRate(rate: number) {
  speechRate = rate;
}

function stopCurrentPlayback() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if (currentPlayingAudio) {
    currentPlayingAudio.pause();
    currentPlayingAudio = null;
  }
  if (currentBufferSource) {
    try {
      currentBufferSource.stop();
      currentBufferSource.disconnect();
    } catch {}
    currentBufferSource = null;
  }
}

// Play MP3/PCM audio base64
export function playBase64Audio(base64Data: string, mimeType = 'audio/mp3', onEnd?: () => void) {
  if (isMuted) {
    if (onEnd) onEnd();
    return;
  }

  try {
    stopCurrentPlayback();

    if (mimeType.includes('pcm')) {
      playPcmBase64(base64Data, 24000, onEnd);
      return;
    }

    // Standard MP3 / Audio stream
    const audioUrl = `data:${mimeType};base64,${base64Data}`;
    const audio = new Audio(audioUrl);
    currentPlayingAudio = audio;

    audio.onended = () => {
      currentPlayingAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      console.warn("Audio playback error, falling back:", e);
      currentPlayingAudio = null;
      if (onEnd) onEnd();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Auto-play notice:", err);
        if (onEnd) onEnd();
      });
    }
  } catch (e) {
    console.warn("Base64 play error:", e);
    if (onEnd) onEnd();
  }
}

// Play raw 24kHz 16-bit PCM base64 returned by Gemini TTS
export function playPcmBase64(base64Data: string, sampleRate = 24000, onEnd?: () => void) {
  if (isMuted) {
    if (onEnd) onEnd();
    return;
  }

  try {
    stopCurrentPlayback();

    const ctx = getAudioContext();
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Convert 16-bit signed PCM to Float32
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
    audioBuffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    currentBufferSource = source;

    source.onended = () => {
      currentBufferSource = null;
      if (onEnd) onEnd();
    };

    source.start();
  } catch (e) {
    console.warn("PCM play error:", e);
    if (onEnd) onEnd();
  }
}

interface TTSResponse {
  audio: string;
  mimeType: string;
}

// Fetch AI Vietnamese Voice from /api/tts
async function fetchAIVietnameseSpeech(text: string, tone = 'female'): Promise<TTSResponse | null> {
  const cacheKey = `${text}_${tone}`;
  if (aiAudioCache.has(cacheKey)) {
    return {
      audio: aiAudioCache.get(cacheKey)!,
      mimeType: 'audio/mp3',
    };
  }

  // If in rate limit cooldown period, immediately fallback to local Web Speech API
  if (Date.now() < rateLimitCooldownUntil) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tone }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 429) {
      rateLimitCooldownUntil = Date.now() + 25000;
      return null;
    }

    if (!res.ok) return null;
    const data = await res.json();
    if (data.audio) {
      aiAudioCache.set(cacheKey, data.audio);
      return {
        audio: data.audio,
        mimeType: data.mimeType || 'audio/mp3',
      };
    }
  } catch (_err) {
    // Network or timeout: fallback to local Web Speech
  }
  return null;
}

// Smart Speech Function: Prioritizes parent recording, then AI Vietnamese Voice / Standard Vietnamese TTS
export async function speakSmart(
  itemId: string | null,
  textVi: string,
  textEn?: string,
  onEnd?: () => void
) {
  unlockAudio();
  if (isMuted) {
    if (onEnd) onEnd();
    return;
  }

  // 1. Check if user/parent recorded custom audio for this item
  if (itemId) {
    const customAudioData = await getCustomAudio(itemId);
    if (customAudioData) {
      playCustomAudioUrl(customAudioData, onEnd);
      return;
    }
  }

  // 2. Default source language is Vietnamese (Tiếng Việt)
  if (currentLanguageMode === 'vi' || !textEn) {
    speakVietnamese(textVi, onEnd);
  } else if (currentLanguageMode === 'en' && textEn) {
    speakText(textEn, 'en-US', onEnd);
  } else if (currentLanguageMode === 'bilingual' && textEn) {
    // Bilingual mode: Speak Vietnamese first (source), then English
    speakVietnamese(textVi, () => {
      setTimeout(() => {
        speakText(textEn, 'en-US', onEnd);
      }, 350);
    });
  }
}

export async function speakVietnamese(text: string, onEnd?: () => void) {
  unlockAudio();
  if (isMuted) {
    if (onEnd) onEnd();
    return;
  }

  // Try high-speed authentic Vietnamese voice first
  const tone = currentViVoiceStyle === 'gentle_male' ? 'male' : 'female';
  const audioData = await fetchAIVietnameseSpeech(text, tone);
  if (audioData) {
    playBase64Audio(audioData.audio, audioData.mimeType, onEnd);
    return;
  }

  // Fallback to Web Speech API with tuned Vietnamese voice
  speakText(text, 'vi-VN', onEnd);
}

export function speakEnglish(text: string, onEnd?: () => void) {
  speakText(text, 'en-US', onEnd);
}

// Find best matching Vietnamese voice across browsers/OS
function getBestVietnameseVoice(): SpeechSynthesisVoice | null {
  loadVoices();
  if (!availableVoices || availableVoices.length === 0) {
    return null;
  }

  // 1. Match Vietnamese voices with priority
  const viVoices = availableVoices.filter(v => 
    v.lang.toLowerCase().includes('vi') || 
    v.lang.toLowerCase().includes('viet') || 
    v.name.toLowerCase().includes('vietnam') ||
    v.name.toLowerCase().includes('vietnamese')
  );

  if (viVoices.length > 0) {
    // Look for Google, Natural, or Microsoft Vietnamese voices
    const preferred = viVoices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') || 
      v.name.includes('HoaiMy') || 
      v.name.includes('Linh') ||
      v.name.includes('An') ||
      v.name.includes('NamMinh')
    );
    return preferred || viVoices[0];
  }

  return null;
}

export function speakText(text: string, lang: 'vi-VN' | 'en-US' = 'vi-VN', onEnd?: () => void) {
  if (isMuted || !('speechSynthesis' in window)) {
    if (onEnd) setTimeout(onEnd, 400);
    return;
  }

  try {
    stopCurrentPlayback();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    if (lang === 'vi-VN') {
      const viVoice = getBestVietnameseVoice();
      if (viVoice) {
        utterance.voice = viVoice;
      }
    } else {
      loadVoices();
      const enVoice = availableVoices.find(v => 
        (v.lang.includes('en') || v.lang.includes('EN')) && 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny'))
      );
      if (enVoice) utterance.voice = enVoice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('TTS error:', err);
    if (onEnd) onEnd();
  }
}

export function playCustomAudioUrl(audioUrl: string, onEnd?: () => void) {
  if (isMuted) {
    if (onEnd) onEnd();
    return;
  }
  try {
    stopCurrentPlayback();
    const audio = new Audio(audioUrl);
    currentPlayingAudio = audio;
    if (onEnd) {
      audio.onended = () => {
        currentPlayingAudio = null;
        onEnd();
      };
      audio.onerror = () => {
        currentPlayingAudio = null;
        onEnd();
      };
    }
    audio.play().catch(err => {
      console.warn('Audio playback error:', err);
      if (onEnd) onEnd();
    });
  } catch (e) {
    console.warn('Audio play error:', e);
    if (onEnd) onEnd();
  }
}



// Ensure voices are initialized
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

// ----------------- Web Audio API Sound Effects -----------------
export function playPopSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {
    console.error(e);
  }
}

export function playSuccessChime() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + index * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch (e) {
    console.error(e);
  }
}

export function playCheerFanfare() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const melody = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.35 },
    ];
    let time = ctx.currentTime;
    melody.forEach(m => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(m.f, time);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + m.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + m.d + 0.05);
      time += m.d;
    });
  } catch (e) {
    console.error(e);
  }
}

export function playWrongGentle() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {
    console.error(e);
  }
}

// ----------------- Animal Sound Effects Synthesizer -----------------
export function playAnimalSound(type: string, nameVi: string, nameEn?: string, itemId?: string) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'dog': {
        [0, 0.18].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(320, now + offset);
          osc.frequency.exponentialRampToValueAtTime(140, now + offset + 0.12);
          gain.gain.setValueAtTime(0.4, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.13);
        });
        break;
      }
      case 'cat': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.45);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case 'rooster': {
        const freqs = [350, 480, 520, 680];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + i * 0.12;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + (i === 3 ? 0.35 : 0.11));
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.4);
        });
        break;
      }
      case 'cow': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.6);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
        break;
      }
      case 'bird': {
        [0, 0.12, 0.24].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + offset;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200 + idx * 200, t);
          osc.frequency.exponentialRampToValueAtTime(2200, t + 0.08);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.09);
        });
        break;
      }
      case 'duck': {
        [0, 0.16].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + offset;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(360, t);
          osc.frequency.linearRampToValueAtTime(240, t + 0.12);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.13);
        });
        break;
      }
      case 'frog': {
        [0, 0.18].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + offset;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, t);
          osc.frequency.linearRampToValueAtTime(120, t + 0.1);
          gain.gain.setValueAtTime(0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.12);
        });
        break;
      }
      case 'elephant': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(540, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.48);
        break;
      }
      default:
        playPopSound();
        break;
    }
  } catch (e) {
    console.error(e);
  }

  // Follow with smart speech / custom parent voice after animal sound
  setTimeout(() => {
    speakSmart(itemId || null, nameVi, nameEn);
  }, 400);
}

// ----------------- Piano / Xylophone Keys -----------------
export const PIANO_FREQUENCIES: Record<string, { freq: number; solfege: string; color: string }> = {
  'C4': { freq: 261.63, solfege: 'Đồ', color: 'bg-red-500 hover:bg-red-600' },
  'D4': { freq: 293.66, solfege: 'Rê', color: 'bg-orange-500 hover:bg-orange-600' },
  'E4': { freq: 329.63, solfege: 'Mi', color: 'bg-amber-400 hover:bg-amber-500' },
  'F4': { freq: 349.23, solfege: 'Pha', color: 'bg-emerald-500 hover:bg-emerald-600' },
  'G4': { freq: 392.00, solfege: 'Son', color: 'bg-sky-500 hover:bg-sky-600' },
  'A4': { freq: 440.00, solfege: 'La', color: 'bg-blue-600 hover:bg-blue-700' },
  'B4': { freq: 493.88, solfege: 'Si', color: 'bg-purple-500 hover:bg-purple-600' },
  'C5': { freq: 523.25, solfege: 'Đố', color: 'bg-pink-500 hover:bg-pink-600' },
};

export function playPianoNote(noteKey: string) {
  if (isMuted) return;
  try {
    const item = PIANO_FREQUENCIES[noteKey];
    if (!item) return;
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(item.freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  } catch (e) {
    console.error(e);
  }
}

