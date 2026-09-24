import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Volume2, AlertCircle } from 'lucide-react';

interface InlineDictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const InlineDictationButton: React.FC<InlineDictationButtonProps> = ({
  onTranscript,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [livePreview, setLivePreview] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fullTranscriptRef = useRef<string>('');
  const isListeningRef = useRef<boolean>(false);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUnsupported(true);
    }

    return () => {
      stopAndCleanup();
    };
  }, []);

  const stopAndCleanup = useCallback(() => {
    isListeningRef.current = false;

    // 1. Commit captured text if any
    const textToCommit = fullTranscriptRef.current.trim();
    if (textToCommit.length > 0) {
      onTranscriptRef.current(textToCommit);
      fullTranscriptRef.current = '';
    }

    // 2. Stop audio stream tracks
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (_) {}
      mediaStreamRef.current = null;
    }

    // 3. Abort speech recognition instance
    if (recognitionRef.current) {
      try {
        const rec = recognitionRef.current;
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    setIsListening(false);
    setLivePreview('');
  }, []);

  const startListening = async () => {
    // Teardown any previous active audio/recognition instance first
    stopAndCleanup();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setUnsupported(true);
      return;
    }

    fullTranscriptRef.current = '';
    isListeningRef.current = true;
    setLivePreview('');

    // Request active audio hardware stream first to unlock Chrome/Safari media permissions
    try {
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      }
    } catch (err) {
      console.warn('Microphone stream error:', err);
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'th-TH';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalSegment = '';
        let interimSegment = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalSegment += res[0].transcript;
          } else {
            interimSegment += res[0].transcript;
          }
        }

        const combined = (finalSegment + ' ' + interimSegment).trim();
        if (combined) {
          fullTranscriptRef.current = combined;
          setLivePreview(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          stopAndCleanup();
          alert('ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตสิทธิ์ใช้งานไมโครโฟนในเบราว์เซอร์');
        }
      };

      recognition.onend = () => {
        // If user didn't press Stop, auto-restart if Chrome auto-closed due to silence
        if (isListeningRef.current && recognitionRef.current) {
          try {
            recognition.start();
            return;
          } catch (_) {}
        }
        setIsListening(false);
        setLivePreview('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start SpeechRecognition:', err);
      setIsListening(false);
      setLivePreview('');
    }
  };

  const toggleListening = () => {
    if (unsupported) {
      alert('เบราว์เซอร์นี้ไม่รองรับ Speech Recognition ดั้งเดิม กรุณาใช้งานผ่าน Safari บน iOS/iPadOS หรือ Google Chrome');
      return;
    }

    if (isListening) {
      stopAndCleanup();
    } else {
      startListening();
    }
  };

  if (unsupported) return null;

  return (
    <div className="inline-flex items-center gap-1.5 relative shrink-0">
      <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all select-none cursor-pointer active:scale-95 shadow-2xs ${
          isListening
            ? 'bg-rose-600 border-rose-600 text-white animate-pulse'
            : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800'
        } ${className}`}
        title={isListening ? 'กดเพื่อหยุดและพิมพ์ข้อความลงฟิลด์' : 'กดแล้วพูดเพื่อพิมพ์ข้อความภาษาไทย'}
      >
        {isListening ? (
          <>
            <Square className="w-3 h-3 fill-current shrink-0" />
            <span>หยุดพูด</span>
          </>
        ) : (
          <>
            <Mic className="w-3 h-3 text-blue-600 shrink-0" />
            <span>พูดเพื่อพิมพ์</span>
          </>
        )}
      </button>

      {/* Live transcript preview indicator */}
      {isListening && (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-900 bg-amber-50 border border-amber-300 rounded-md px-2 py-0.5 max-w-[220px] truncate animate-fadeIn">
          <Volume2 className="w-3 h-3 text-amber-600 shrink-0 animate-pulse" />
          <span className="truncate italic">{livePreview || 'กำลังฟังเสียงพูด...'}</span>
        </span>
      )}
    </div>
  );
};
