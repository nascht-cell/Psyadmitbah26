import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  X,
  Check,
  Loader2,
  Volume2,
  AlertCircle,
  Wand2,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { PsychiatricAssessment } from '../types/assessment';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string, targetField: string, mode: 'append' | 'replace') => void;
  onApplyExtractedData?: (extractedData: Partial<PsychiatricAssessment>) => void;
  defaultTargetField?: string;
  initialText?: string;
}

export const AudioDictationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onInsertText,
  onApplyExtractedData,
  defaultTargetField = 'hpiDetails',
  initialText = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState(initialText);
  const [targetField, setTargetField] = useState(defaultTargetField);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // AI Form Extraction States
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<any | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const speechTextRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTargetField(defaultTargetField);
      if (initialText) {
        setTranscribedText(initialText);
      }
    }
  }, [isOpen, defaultTargetField, initialText]);

  const teardownAudioAndSpeech = () => {
    isRecordingRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (_) {}
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      teardownAudioAndSpeech();
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    // Teardown any previous audio stream & recognition cleanly
    teardownAudioAndSpeech();

    setErrorMessage(null);
    setRecordingTime(0);
    speechTextRef.current = '';
    audioChunksRef.current = [];
    isRecordingRef.current = true;

    // Check if browser native SpeechRecognition is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'th-TH';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            speechTextRef.current = currentTranscript.trim();
            setTranscribedText(currentTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
        };

        recognition.onend = () => {
          if (isRecordingRef.current && recognitionRef.current) {
            try {
              recognition.start();
            } catch (_) {}
          }
        };

        try {
          recognition.start();
        } catch (e) {
          console.warn('Speech recognition start retry...', e);
          setTimeout(() => {
            if (isRecordingRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (_) {}
            }
          }, 150);
        }

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition setup failed:', e);
      }
    }

    try {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error(
          'เบราว์เซอร์หรือโปรโตคอลนี้ไม่อนุญาตให้เข้าถึงไมโครโฟน (หากใช้งานผ่าน HTTP กรุณาเปลี่ยนเป็น HTTPS)'
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const combinedBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        // If Web Speech API didn't produce text, fallback to backend transcribe
        if (!speechTextRef.current.trim() && combinedBlob.size > 0) {
          transcribeAudioBlob(combinedBlob);
        }
      };

      recorder.start(250);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      isRecordingRef.current = false;
      setIsRecording(false);
      setErrorMessage(
        'ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตสิทธิ์การใช้งานไมโครโฟนในเบราว์เซอร์'
      );
    }
  };

  const stopRecording = () => {
    teardownAudioAndSpeech();
    setIsRecording(false);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const transcribeAudioBlob = async (blob: Blob) => {
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      const base64 = await blobToBase64(blob);
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64,
          mimeType: blob.type || 'audio/webm',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'ถอดความเสียงไม่สำเร็จ');
      }

      const data = await res.json();
      if (data.text) {
        setTranscribedText((prev) => (prev ? `${prev} ${data.text}` : data.text));
      }
    } catch (err: any) {
      console.error('Transcribe error:', err);
      setErrorMessage(err.message || 'ถอดความเสียงด้วย AI ไม่สำเร็จ');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!transcribedText.trim()) return;
    setIsExtracting(true);
    setExtractionError(null);
    setExtractedPreview(null);

    try {
      const res = await fetch('/api/extract-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcribedText.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'ไม่สามารถวิเคราะห์ข้อมูลด้วย AI ได้');
      }

      const data = await res.json();
      setExtractedPreview(data.extracted || {});
    } catch (err: any) {
      console.error('Extraction error:', err);
      setExtractionError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ AI');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyExtracted = () => {
    if (!extractedPreview || !onApplyExtractedData) return;
    onApplyExtractedData(extractedPreview);
    onClose();
  };

  const handleApply = () => {
    if (!transcribedText.trim()) return;
    onInsertText(transcribedText.trim(), targetField, 'append');
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFieldNameInThai = (fieldKey: string) => {
    switch (fieldKey) {
      case 'hpiDetails':
        return 'ประวัติปัจจุบัน (HPI)';
      case 'chiefComplaintOther':
        return 'อาการสำคัญ';
      case 'precipitatingFactors':
        return 'ปัจจัยกระตุ้น';
      case 'associatedSymptoms':
        return 'อาการร่วม';
      case 'psychiatricHistoryDetails':
        return 'ประวัติจิตเวชเดิม';
      default:
        return 'ฟิลด์เป้าหมาย';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Mic className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">บันทึกเสียงและถอดความ (Thai Dictation)</h3>
              <p className="text-[11px] text-slate-400">พูดเพื่อพิมพ์ หรือถอดความประวัติสกัดลงฟอร์มด้วย AI</p>
            </div>
          </div>
          <button
            onClick={() => {
              teardownAudioAndSpeech();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Clean Single Mic Record Card */}
          <div className="text-center">
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl shadow-md font-bold text-sm flex items-center justify-center gap-2 animate-pulse cursor-pointer transition-all"
              >
                <Square className="w-4 h-4 fill-current shrink-0" />
                <span>กำลังบันทึกเสียง... {formatTime(recordingTime)} (แตะเพื่อหยุด)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={isTranscribing}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-md font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <Mic className="w-4 h-4" />
                <span>เริ่มพูดบันทึกเสียง</span>
              </button>
            )}
          </div>

          {/* Transcribed Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>ข้อความถอดความ (ถอดความขณะพูด):</span>
              </label>
              {isTranscribing && (
                <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  กำลังถอดความด้วย AI...
                </span>
              )}
            </div>
            <textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              placeholder='พูดใส่ไมโครโฟน ข้อความจะปรากฏที่นี่... หรือพิมพ์/วางข้อความ เช่น "ผู้ป่วยชายไทยอายุ 65 ปี"'
              rows={4}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50/50 text-slate-800 leading-relaxed font-sans"
            />
          </div>

          {/* Select target field if inserting text */}
          <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl text-xs">
            <span className="text-slate-600 font-semibold">ช่องที่จะใส่ข้อความ:</span>
            <select
              value={targetField}
              onChange={(e) => setTargetField(e.target.value)}
              className="text-xs p-1 px-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-600"
            >
              <option value="hpiDetails">B. ประวัติปัจจุบัน (HPI)</option>
              <option value="chiefComplaintOther">B. อาการสำคัญอื่นๆ</option>
              <option value="precipitatingFactors">B. ปัจจัยกระตุ้น</option>
              <option value="associatedSymptoms">B. อาการร่วม</option>
              <option value="psychiatricHistoryDetails">C. ประวัติจิตเวชเดิม</option>
            </select>
          </div>

          {/* AI Extraction Preview Card (If extracted) */}
          {extractedPreview && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2 text-xs animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-purple-900 border-b border-purple-200 pb-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  สกัดข้อมูลสำเร็จ:
                </span>
                <button
                  type="button"
                  onClick={handleApplyExtracted}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>นำเข้าฟอร์มทันที</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {extractedPreview.gender && (
                  <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-medium">
                    เพศ: {extractedPreview.gender}
                  </span>
                )}
                {extractedPreview.age && (
                  <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-medium">
                    อายุ: {extractedPreview.age} ปี
                  </span>
                )}
                {extractedPreview.maritalStatus && (
                  <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-medium">
                    สถานภาพ: {extractedPreview.maritalStatus}
                  </span>
                )}
                {extractedPreview.duration && (
                  <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-medium">
                    ระยะเวลา: {extractedPreview.duration}
                  </span>
                )}
              </div>
            </div>
          )}

          {extractionError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{extractionError}</span>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                navigator.clipboard.writeText(transcribedText);
              }
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            disabled={!transcribedText.trim()}
            className="px-3 py-1.5 border border-slate-300 hover:bg-white disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>{copied ? 'คัดลอกแล้ว ✓' : 'คัดลอก'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAnalyzeWithAI}
              disabled={!transcribedText.trim() || isExtracting || isTranscribing}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังสกัด...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>สกัดเป็นฟอร์มด้วย AI</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!transcribedText.trim() || isTranscribing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>ใส่ลงใน{getFieldNameInThai(targetField)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
