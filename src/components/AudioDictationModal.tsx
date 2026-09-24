import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  X,
  Check,
  RotateCcw,
  Loader2,
  Volume2,
  AlertCircle,
  Wand2,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import { PsychiatricAssessment } from '../types/assessment';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string, targetField: string, mode: 'append' | 'replace') => void;
  onApplyExtractedData?: (extractedData: Partial<PsychiatricAssessment>) => void;
  defaultTargetField?: string;
}

export const AudioDictationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onInsertText,
  onApplyExtractedData,
  defaultTargetField = 'hpiDetails',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [targetField, setTargetField] = useState(defaultTargetField);
  const [insertMode, setInsertMode] = useState<'append' | 'replace'>('append');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // AI Form Extraction States
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<any | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [actionTab, setActionTab] = useState<'ai' | 'manual'>('ai');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const speechTextRef = useRef<string>('');

  useEffect(() => {
    setTargetField(defaultTargetField);
  }, [defaultTargetField]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  const startRecording = async () => {
    setErrorMessage(null);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    speechTextRef.current = '';
    audioChunksRef.current = [];

    // Check if browser native SpeechRecognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let recognitionStarted = false;

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

        recognition.start();
        recognitionRef.current = recognition;
        recognitionStarted = true;
      } catch (e) {
        console.warn('Speech recognition start failed, using mediaRecorder:', e);
      }
    }

    try {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('เบราว์เซอร์หรือโปรโตคอลนี้ไม่อนุญาตให้เข้าถึงไมโครโฟน (หากใช้งานผ่าน HTTP กรุณาเปลี่ยนเป็น HTTPS)');
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
        setAudioBlob(combinedBlob);
        const url = URL.createObjectURL(combinedBlob);
        setAudioUrl(url);

        // If Web Speech API didn't produce text, try backend transcribe
        if (!speechTextRef.current.trim()) {
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
      setErrorMessage(
        'ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตสิทธิ์การใช้งานไมโครโฟนในเบราว์เซอร์'
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
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
      setTranscribedText(data.text || '');
    } catch (err: any) {
      console.error('Transcribe error:', err);
      setErrorMessage(
        err.message || 'เกิดข้อผิดพลาดในการถอดความเสียงด้วย gemini-3.5-transcribe'
      );
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
    onInsertText(transcribedText.trim(), targetField, insertMode);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                บันทึกเสียงและถอดความ (Speech-to-Text)
                <span className="text-[10px] font-medium bg-slate-800 text-blue-300 px-2 py-0.5 rounded">
                  Thai Dictation
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Recording & Audio Control Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
            {isRecording ? (
              <div className="flex flex-col items-center space-y-2 py-1">
                <div className="flex items-center gap-2 text-sm font-bold text-red-600 font-mono">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <span>กำลังบันทึกเสียง... {formatTime(recordingTime)}</span>
                </div>
                <button
                  onClick={stopRecording}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>หยุดและถอดความ (Stop & Transcribe)</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-1">
                <button
                  onClick={startRecording}
                  disabled={isTranscribing}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>เริ่มบันทึกเสียงด้วยไมโครโฟน</span>
                </button>
              </div>
            )}

            {/* Audio Playback if recorded */}
            {audioUrl && !isRecording && (
              <div className="pt-2 border-t border-slate-200 flex items-center justify-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <audio controls src={audioUrl} className="h-8 max-w-xs" />
                <button
                  onClick={() => audioBlob && transcribeAudioBlob(audioBlob)}
                  disabled={isTranscribing}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium ml-2"
                  title="ถอดความใหม่อีกครั้ง"
                >
                  <RotateCcw className="w-3 h-3" /> ถอดความใหม่
                </button>
              </div>
            )}
          </div>

          {/* Transcribed Text Preview / Edit Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                ข้อความที่ถอดความได้ (Transcribed Text)
              </label>
              {isTranscribing && (
                <span className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  กำลังประมวลผลถอดความเสียง...
                </span>
              )}
            </div>
            <textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              placeholder="ข้อความที่ถอดความจะแสดงที่นี่ สามารถแก้ไขเพิ่มเติมได้ตามต้องการ..."
              rows={4}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-800 leading-relaxed font-sans"
            />
          </div>

          {/* Action Tabs: AI Auto-Extract vs Manual Single-Field Insert */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex border-b border-slate-200 text-xs font-medium mb-3">
              <button
                type="button"
                onClick={() => setActionTab('ai')}
                className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 font-bold cursor-pointer transition-all ${
                  actionTab === 'ai'
                    ? 'border-purple-600 text-purple-900 bg-purple-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-purple-600" />
                <span>วิเคราะห์ด้วย AI (AI Form Fill)</span>
              </button>
              <button
                type="button"
                onClick={() => setActionTab('manual')}
                className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 font-bold cursor-pointer transition-all ${
                  actionTab === 'manual'
                    ? 'border-blue-600 text-blue-900 bg-blue-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>ใส่ลงช่องเฉพาะ (Manual Field)</span>
              </button>
            </div>

            {actionTab === 'ai' ? (
              <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-purple-950 font-semibold">
                    สกัดข้อมูล (เพศ, สถานภาพ, ระยะเวลา, CC, ปัจจัยกระตุ้น) ลงฟอร์มอัตโนมัติ
                  </span>
                  {!extractedPreview && (
                    <button
                      type="button"
                      onClick={handleAnalyzeWithAI}
                      disabled={!transcribedText.trim() || isExtracting || isTranscribing}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-300 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังวิเคราะห์...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>สกัดข้อมูลด้วย AI</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {extractionError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{extractionError}</span>
                  </div>
                )}

                {extractedPreview && (
                  <div className="p-2.5 bg-white border border-purple-300 rounded-md space-y-2 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                      <span className="font-bold text-purple-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ข้อมูลที่สกัดได้:
                      </span>
                      <button
                        type="button"
                        onClick={handleApplyExtracted}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-2xs flex items-center gap-1 cursor-pointer"
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
                      {extractedPreview.suicideRisk && (
                        <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-bold">
                          Suicide Risk: {extractedPreview.suicideRisk}
                        </span>
                      )}
                    </div>

                    {extractedPreview.chiefComplaint && extractedPreview.chiefComplaint.length > 0 && (
                      <div className="text-[11px]">
                        <span className="text-slate-500 font-medium">อาการสำคัญ:</span>{' '}
                        <span className="font-semibold text-slate-800">{extractedPreview.chiefComplaint.join(', ')}</span>
                      </div>
                    )}

                    {extractedPreview.precipitatingFactors && extractedPreview.precipitatingFactors.length > 0 && (
                      <div className="text-[11px]">
                        <span className="text-slate-500 font-medium">ปัจจัยกระตุ้น:</span>{' '}
                        <span className="font-semibold text-slate-800">{extractedPreview.precipitatingFactors.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ช่องข้อมูลที่จะนำข้อความไปใส่:
                  </label>
                  <select
                    value={targetField}
                    onChange={(e) => setTargetField(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="hpiDetails">B. รายละเอียดประวัติปัจจุบัน (HPI Details)</option>
                    <option value="chiefComplaintOther">B. อาการสำคัญอื่นๆ (CC Other)</option>
                    <option value="precipitatingFactors">B. ปัจจัยกระตุ้น (Precipitating)</option>
                    <option value="associatedSymptoms">B. อาการร่วม (Associated Symptoms)</option>
                    <option value="psychiatricHistoryDetails">C. ประวัติจิตเวชเดิม (Psych Details)</option>
                    <option value="delusionDetails">D. รายละเอียด Delusion (Thought Content)</option>
                    <option value="safetyPlan">E. Safety Plan (แผนความปลอดภัย)</option>
                    <option value="medicationDetails">K. รายละเอียดคำสั่งยา (Medication)</option>
                    <option value="concernsDetail">L. ข้อกังวลของผู้ป่วย/ญาติ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    รูปแบบการใส่ข้อความ:
                  </label>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="insertMode"
                        value="append"
                        checked={insertMode === 'append'}
                        onChange={() => setInsertMode('append')}
                        className="text-blue-600"
                      />
                      <span>ต่อท้ายเดิม (Append)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="insertMode"
                        value="replace"
                        checked={insertMode === 'replace'}
                        onChange={() => setInsertMode('replace')}
                        className="text-blue-600"
                      />
                      <span>แทนที่เดิม (Replace)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                  navigator.clipboard.writeText(transcribedText);
                } else {
                  const ta = document.createElement('textarea');
                  ta.value = transcribedText;
                  ta.style.position = 'fixed';
                  ta.style.opacity = '0';
                  document.body.appendChild(ta);
                  ta.focus();
                  ta.select();
                  try {
                    document.execCommand('copy');
                  } catch (_) {}
                  document.body.removeChild(ta);
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              disabled={!transcribedText.trim()}
              className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-slate-700'
              }`}
            >
              {copied ? 'คัดลอกแล้ว ✓' : 'คัดลอกข้อความ'}
            </button>
            {actionTab === 'ai' ? (
              extractedPreview ? (
                <button
                  onClick={handleApplyExtracted}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>นำเข้าฟอร์มทันที</span>
                </button>
              ) : (
                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={!transcribedText.trim() || isExtracting || isTranscribing}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-300 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isExtracting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  <span>สกัดข้อมูลเข้าฟอร์มด้วย AI</span>
                </button>
              )
            ) : (
              <button
                onClick={handleApply}
                disabled={!transcribedText.trim() || isTranscribing}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>นำข้อความไปใส่ในช่อง</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
