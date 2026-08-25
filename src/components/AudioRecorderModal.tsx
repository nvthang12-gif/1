import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, Upload, Volume2, X, Check, Radio } from 'lucide-react';
import { saveCustomAudio, getCustomAudio, deleteCustomAudio } from '../utils/audioStorage';
import { playPopSound, playSuccessChime, playCustomAudioUrl } from '../utils/sound';

interface AudioRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string; // e.g. 'letter_A', 'animal_dog'
  itemTitle: string;
  onSaved?: () => void;
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemTitle,
  onSaved,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && itemId) {
      loadExistingAudio();
      setErrorMessage(null);
      setStatusSuccess(null);
    }
  }, [isOpen, itemId]);

  const loadExistingAudio = async () => {
    const audioData = await getCustomAudio(itemId);
    setExistingAudioUrl(audioData);
  };

  const startRecording = async () => {
    try {
      playPopSound();
      setErrorMessage(null);
      setStatusSuccess(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const savedBase64 = await saveCustomAudio(itemId, itemTitle, audioBlob);
        setExistingAudioUrl(savedBase64);
        setStatusSuccess('Đã lưu giọng thu âm thành công!');
        playSuccessChime();
        if (onSaved) onSaved();

        // Stop all audio tracks to turn off mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            // Auto stop after 10s
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.error('Microphone error:', err);
      setErrorMessage('Không thể mở micro. Vui lòng cho phép quyền truy cập Micro trên trình duyệt hoặc tải file âm thanh lên.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      playPopSound();
      const base64 = await saveCustomAudio(itemId, itemTitle, file);
      setExistingAudioUrl(base64);
      setStatusSuccess('Đã tải file âm thanh lên thành công!');
      playSuccessChime();
      if (onSaved) onSaved();
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMessage('Có lỗi khi đọc file âm thanh. Vui lòng thử file .mp3, .m4a hoặc .wav khác.');
    }
  };

  const handlePlayRecording = () => {
    if (!existingAudioUrl) return;
    setIsPlaying(true);
    playCustomAudioUrl(existingAudioUrl, () => {
      setIsPlaying(false);
    });
  };

  const handleDeleteRecording = async () => {
    if (window.confirm('Ba mẹ có chắc muốn xóa bản ghi âm này và trở lại giọng mẫu mặc định?')) {
      playPopSound();
      await deleteCustomAudio(itemId);
      setExistingAudioUrl(null);
      setStatusSuccess('Đã xóa ghi âm, dùng lại giọng đọc mẫu.');
      if (onSaved) onSaved();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl border-4 border-rose-300 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-6 h-6 text-yellow-300 animate-pulse" />
            <h3 className="text-base sm:text-lg font-black font-['Baloo_2']">
              Thu Âm Giọng Ba Mẹ / Tải Âm Thanh
            </h3>
          </div>
          <button
            onClick={() => {
              if (isRecording) stopRecording();
              onClose();
            }}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 text-center">
          
          {/* Target Item Name */}
          <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
            <span className="text-xs font-black text-rose-700 uppercase block mb-0.5">
              Đang cài đặt giọng đọc cho bài học:
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 font-['Baloo_2']">
              {itemTitle}
            </span>
          </div>

          {/* Current Status Preview */}
          {existingAudioUrl ? (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Đang dùng Giọng thu âm riêng
                </span>
                <button
                  onClick={handleDeleteRecording}
                  className="text-rose-600 hover:text-rose-800 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>

              <button
                onClick={handlePlayRecording}
                disabled={isPlaying}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
                <span>{isPlaying ? 'Đang phát âm thanh...' : 'Nghe Thử Giọng Thu Âm'}</span>
              </button>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              Hiện tại thẻ này đang dùng giọng máy phát âm chuẩn Tiếng Việt. Ba mẹ có thể thu âm giọng của mình để bé cảm thấy gần gũi hơn!
            </div>
          )}

          {/* Record Controls */}
          <div className="space-y-3">
            {isRecording ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-center gap-2 text-rose-600 font-black animate-pulse">
                  <Radio className="w-5 h-5" />
                  <span className="text-lg">Đang thu âm... {recordingTime}s / 10s</span>
                </div>

                <button
                  onClick={stopRecording}
                  className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black rounded-2xl text-base shadow-xl flex items-center justify-center gap-2 mx-auto cursor-pointer animate-bounce"
                >
                  <Square className="w-5 h-5 fill-white" />
                  <span>Dừng & Lưu Lại</span>
                </button>
              </div>
            ) : (
              <button
                onClick={startRecording}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-98 text-white font-black rounded-2xl text-base shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2.5 cursor-pointer transition-all border-2 border-rose-300"
              >
                <Mic className="w-5 h-5" />
                <span>Bấm Vào Đây Để Thu Âm Giọng Ba Mẹ</span>
              </button>
            )}

            {/* Upload file fallback */}
            <div className="pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Hoặc tải lên file ghi âm từ máy (.mp3, .wav, .m4a)</span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <p className="text-xs font-bold text-rose-500 bg-rose-50 p-2.5 rounded-xl">
              {errorMessage}
            </p>
          )}
          {statusSuccess && (
            <p className="text-xs font-black text-emerald-600 bg-emerald-50 p-2.5 rounded-xl">
              {statusSuccess}
            </p>
          )}

        </div>

      </div>
    </div>
  );
};
