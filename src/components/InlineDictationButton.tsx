import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';

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
  const fullTranscriptRef = useRef<string>('');
  const hasCommittedRef = useRef<boolean>(false);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUnsupported(true);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const commitTranscript = useCallback(() => {
    const textToCommit = fullTranscriptRef.current.trim();
    if (!hasCommittedRef.current && textToCommit.length > 0) {
      hasCommittedRef.current = true;
      onTranscriptRef.current(textToCommit);
    }
  }, []);

  const stopListening = useCallback(() => {
    // Commit any captured transcript immediately before stopping recognition
    commitTranscript();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setLivePreview('');
  }, [commitTranscript]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }

      fullTranscriptRef.current = '';
      hasCommittedRef.current = false;
      setLivePreview('');

      const recognition = new SpeechRecognition();
      recognition.lang = 'th-TH';
      // Enable continuous listening and interim results so words are captured in real-time as spoken
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
        console.warn('Speech Recognition notice:', event.error);
        if (event.error !== 'no-speech') {
          stopListening();
        }
      };

      recognition.onend = () => {
        commitTranscript();
        setIsListening(false);
        setLivePreview('');
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to start SpeechRecognition:', err);
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
      stopListening();
    } else {
      startListening();
    }
  };

  if (unsupported) return null;

  return (
    <div className="inline-flex items-center gap-1.5 relative">
      <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all select-none cursor-pointer active:scale-95 shadow-2xs ${
          isListening
            ? 'bg-rose-600 border-rose-600 text-white animate-pulse'
            : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800'
        } ${className}`}
        title={isListening ? 'แตะเพื่อหยุดบันทึกและแทรกข้อความ' : 'พูดเพื่อบันทึกข้อความภาษาไทย (Web Speech API)'}
      >
        {isListening ? (
          <>
            <Square className="w-3 h-3 fill-current shrink-0" />
            <span>หยุดพูด (บันทึกข้อความ)</span>
          </>
        ) : (
          <>
            <Mic className="w-3 h-3 text-blue-600 shrink-0" />
            <span>พูดเพื่อพิมพ์</span>
          </>
        )}
      </button>

      {/* Live transcript feedback indicator while recording */}
      {isListening && livePreview && (
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 max-w-[200px] truncate animate-fadeIn">
          <Volume2 className="w-2.5 h-2.5 text-amber-600 shrink-0" />
          <span className="truncate italic font-normal">"{livePreview}"</span>
        </span>
      )}
    </div>
  );
};
