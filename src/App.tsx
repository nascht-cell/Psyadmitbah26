/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import {
  Save,
  Download,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  Sparkles,
  Printer,
  History,
  Mic,
  RefreshCw,
  Check,
} from 'lucide-react';
import { PsychiatricAssessment, initialAssessmentData, samplePatientData } from './types/assessment';
import { PsychiatricAssessmentForm } from './components/PsychiatricAssessmentForm';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
} from './utils/storage';

// Code-split heavy modals and printable components for ultra-fast initial page load
const PdfPreviewModal = React.lazy(() =>
  import('./components/PdfPreviewModal').then(m => ({ default: m.PdfPreviewModal }))
);
const AudioDictationModal = React.lazy(() =>
  import('./components/AudioDictationModal').then(m => ({ default: m.AudioDictationModal }))
);
const AssessmentPdfDocument = React.lazy(() =>
  import('./components/AssessmentPdfDocument').then(m => ({ default: m.AssessmentPdfDocument }))
);

const REQUIRED_FIELDS = [
  { key: 'hn', id: 'field-hn', label: 'HN', error: 'กรุณาระบุเลข HN ของผู้ป่วย' },
  { key: 'fullName', id: 'field-fullName', label: 'ชื่อ-สกุลผู้ป่วย', error: 'กรุณาระบุชื่อและนามสกุลผู้ป่วย' },
  { key: 'age', id: 'field-age', label: 'อายุ (ปี)', error: 'กรุณาระบุอายุของผู้ป่วย' },
  { key: 'gender', id: 'field-gender', label: 'เพศ', error: 'กรุณาระบุเพศของผู้ป่วย' },
  { key: 'physicianName', id: 'field-physicianName', label: 'ชื่อแพทย์ผู้ประเมิน', error: 'กรุณาระบุชื่อแพทย์ผู้ประเมิน' },
] as const;

export default function App() {
  const [formData, setFormData] = useState<PsychiatricAssessment>(initialAssessmentData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<'wizard' | 'full'>('wizard');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDictationModalOpen, setIsDictationModalOpen] = useState(false);
  const [dictationTargetField, setDictationTargetField] = useState('hpiDetails');
  const [isSavingAndExporting, setIsSavingAndExporting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description: string;
  } | null>(null);

  // Auto-save status and debounce tracking
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);
  const isInitialMountRef = useRef(true);
  const isRestoringDraftRef = useRef(false);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Restore autosaved draft on first load
  useEffect(() => {
    const restoreDraft = async () => {
      const draft = await loadFormDraft();
      if (draft && draft.data) {
        const d = draft.data;
        const hasContent = Boolean(
          d.hn?.trim() ||
          d.fullName?.trim() ||
          d.hpiDetails?.trim() ||
          (d.chiefComplaint && d.chiefComplaint.length > 0) ||
          d.physicianName?.trim()
        );

        if (hasContent) {
          isRestoringDraftRef.current = true;
          setFormData(d);
          const timeStr = new Date(draft.savedAt).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastAutoSavedTime(timeStr);
          setAutoSaveStatus('saved');
          showToast(
            'info',
            'กู้คืนร่างที่บันทึกอัตโนมัติ (Auto-save Restored)',
            `ดึงข้อมูลร่างล่าสุด (${timeStr}) ที่ทำงานค้างไว้กลับมาให้ท่านทำงานต่อได้ทันที`
          );
        }
      }
    };
    restoreDraft();
  }, []);

  // Periodic debounced auto-save effect (1.2s after user stops typing)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (isRestoringDraftRef.current) {
      isRestoringDraftRef.current = false;
      return;
    }

    const isEmpty = !formData.hn?.trim() && !formData.fullName?.trim();
    if (isEmpty) {
      setAutoSaveStatus('idle');
      return;
    }

    setAutoSaveStatus('saving');

    const debounceTimer = setTimeout(async () => {
      await saveFormDraft(formData);

      const nowStr = new Date().toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastAutoSavedTime(nowStr);
      setAutoSaveStatus('saved');
    }, 1200);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [formData]);

  // Security inactivity protection: safe session save without destroying active work abruptly
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const isFormNotEmpty = Boolean(formDataRef.current.hn?.trim() || formDataRef.current.fullName?.trim());
        if (isFormNotEmpty) {
          await saveFormDraft(formDataRef.current);
          const nowStr = new Date().toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastAutoSavedTime(nowStr);
          setAutoSaveStatus('saved');
        }
      }, 15 * 60 * 1000); // 15 minutes inactive auto-checkpoint
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    const opts = { passive: true };
    const handleEvent = () => resetTimer();
    
    events.forEach(evt => window.addEventListener(evt, handleEvent, opts));
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(evt => window.removeEventListener(evt, handleEvent));
    };
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description: string) => {
    setToastMessage({ type, title, description });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const scrollToAndFocusField = (fieldId: string) => {
    const el = document.getElementById(fieldId);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      el.focus();
      el.classList.add('ring-4', 'ring-rose-500', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-rose-500', 'ring-offset-2');
      }, 2000);
    }, 350);
  };

  const emptyRequiredFields = useMemo(() => {
    return REQUIRED_FIELDS.filter(field => {
      const val = formData[field.key as keyof PsychiatricAssessment];
      return typeof val === 'string' ? !val.trim() : !val;
    });
  }, [formData.hn, formData.fullName, formData.age, formData.gender, formData.physicianName]);

  const handleFormChange = useCallback((updated: Partial<PsychiatricAssessment>) => {
    setFormData((prev) => ({
      ...prev,
      ...updated,
    }));

    // Clear specific errors in real-time as user fills the field
    setErrors((prev) => {
      let hasChanges = false;
      const next = { ...prev };
      Object.keys(updated).forEach(key => {
        const val = updated[key as keyof PsychiatricAssessment];
        const isFilled = typeof val === 'string' ? val.trim().length > 0 : Boolean(val);
        if (isFilled && next[key]) {
          delete next[key];
          hasChanges = true;
        }
      });
      return hasChanges ? next : prev;
    });
  }, []);

  const handleBlurField = useCallback((field: string, value: any) => {
    const reqField = REQUIRED_FIELDS.find(f => f.key === field);
    if (reqField) {
      const isFilled = typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
      if (!isFilled) {
        setErrors(prev => ({ ...prev, [field]: reqField.error }));
      } else {
        setErrors(prev => {
          if (!prev[field]) return prev;
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    }
  }, []);

  const handleApplyWnlMse = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      appearanceBehavior: ['Normal'],
      speech: ['Normal'],
      moodAffect: ['Euthymic'],
      thoughtProcess: ['Logical/Coherent'],
      thoughtContent: ['Normal'],
      delusionDetail: '',
      perception: ['Normal'],
      orientationTime: true,
      orientationPlace: true,
      orientationPerson: true,
      attentionMemory: 'Intact',
      insight: '6(True)',
      judgment: 'Intact',
    }));
    showToast('info', 'ตั้งค่าสภาพจิตปกติ (WNL)', 'ปรับสถานะการตรวจสภาพจิต (MSE) ทั้งหมดเป็นปกติเรียบร้อย');
  }, []);

  const handleApplyWnlPhysical = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      generalAppearance: 'Normal',
      generalAppearanceDetail: '',
      heent: 'Normal',
      heentDetail: '',
      cvsRs: 'Normal',
      cvsRsDetail: '',
      abdomen: 'Normal',
      abdomenDetail: '',
      extremities: 'Normal',
      extremitiesDetail: '',
      cranialNerves: 'Grossly intact',
      cranialNervesDetail: '',
      motorPower: 'Grade V all',
      motorPowerDetail: '',
      tone: 'Normal',
      toneDetail: '',
      sensory: 'Intact',
      sensoryDetail: '',
      reflexes: 'Normal',
      reflexesDetail: '',
      cerebellar: 'Normal',
      cerebellarDetail: '',
      nutrition: 'Normal',
      adl: 'Independent',
    }));
    showToast('info', 'ตั้งค่าการตรวจร่างกายปกติ (WNL)', 'ปรับสถานะสัญญาณชีพ/ร่างกายและระบบประสาททั้งหมดเป็นปกติเรียบร้อย');
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const emptyFields = emptyRequiredFields;

    emptyFields.forEach(field => {
      newErrors[field.key] = field.error;
    });

    setErrors(newErrors);

    if (emptyFields.length > 0) {
      const first = emptyFields[0];
      
      // Auto-switch to the step containing the missing required field
      if (['hn', 'fullName', 'age', 'gender'].includes(first.key)) {
        setCurrentStep(1);
      } else if (['physicianName'].includes(first.key)) {
        setCurrentStep(4);
      }

      setTimeout(() => {
        scrollToAndFocusField(first.id);
      }, 150);

      showToast(
        'error',
        'ข้อมูลจำเป็นยังไม่ครบถ้วน',
        `ยังไม่ได้ระบุ "${first.label}" ระบบสลับไปยังขั้นตอนที่เกี่ยวข้องและเน้นช่องนี้ให้อัตโนมัติ`
      );
      return false;
    }

    return true;
  };

  // Explicit window.print() trigger for Native Browser Print Dialog
  const handleNativePrint = () => {
    window.print();
  };

  // 1. Download PDF (Main user requirement 1) with TH Sarabun PSK 16pt (Preserves active data for clinician review)
  const handleSaveAndDownloadPdf = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSavingAndExporting(true);

    const cleanHn = formData.hn.replace(/\D/g, '');
    const fileName = `${cleanHn || 'Admission'} Admission note.pdf`;
    try {
      const { exportElementToA4Pdf } = await import('./utils/pdfGenerator');
      await exportElementToA4Pdf('offscreen-pdf-document', fileName, formData);

      // Save draft securely so clinician can reference or edit if needed
      await saveFormDraft(formData);
      const nowStr = new Date().toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastAutoSavedTime(nowStr);
      setAutoSaveStatus('saved');

      showToast(
        'success',
        'ดาวน์โหลด PDF สำเร็จแล้ว',
        `ส่งออก PDF ฟอนต์ TH Sarabun PSK ขนาด ๑๖ พอยท์ เรียบร้อย (ข้อมูลทั้งหมดในฟอร์มยังคงอยู่ครบถ้วน)`
      );
    } catch (e) {
      console.error(e);
      showToast(
        'error',
        'เกิดข้อผิดพลาดในการสร้าง PDF',
        `ไม่สามารถดาวน์โหลด PDF ได้ หากท่านต้องการพิมพ์ สามารถใช้ปุ่มพิมพ์ด่วนหรือดูตัวอย่างได้`
      );
    } finally {
      setIsSavingAndExporting(false);
    }
  };

  const handleLoadSamplePatient = async () => {
    setFormData(samplePatientData);
    await saveFormDraft(samplePatientData);
    const nowStr = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLastAutoSavedTime(nowStr);
    setAutoSaveStatus('saved');
    setErrors({});
    showToast(
      'info',
      'โหลดข้อมูลตัวอย่างแล้ว',
      'ใส่ข้อมูลผู้ป่วยตัวอย่าง นายสมศักดิ์ รักสงบ (HN: 67001234) ให้ทดสอบระบบ'
    );
  };

  const handleResetForm = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmResetForm = () => {
    clearFormDraft();
    setFormData({
      ...initialAssessmentData,
      assessmentDate: new Date().toISOString().split('T')[0],
      assessmentTime: new Date().toTimeString().slice(0, 5),
    });
    setErrors({});
    setAutoSaveStatus('idle');
    setLastAutoSavedTime(null);
    setIsResetConfirmOpen(false);
    showToast('info', 'สร้างแบบฟอร์มใหม่', 'พร้อมสำหรับการกรอกข้อมูลผู้ป่วยรายใหม่ (ล้างร่างอัตโนมัติแล้ว)');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Audio dictation text insertion
  const handleInsertTranscribedText = (
    text: string,
    targetField: string,
    mode: 'append' | 'replace'
  ) => {
    setFormData((prev: any) => {
      const currentVal = prev[targetField] || '';
      const newVal =
        mode === 'append'
          ? currentVal
            ? `${currentVal}\n${text}`
            : text
          : text;
      return {
        ...prev,
        [targetField]: newVal,
      };
    });

    showToast(
      'success',
      'แทรกข้อความจากเสียงพูดสำเร็จ',
      `ถอดความเสียงด้วย gemini-3.5-transcribe และใส่ใน ${targetField} เรียบร้อยแล้ว`
    );
  };

  // AI Form Extraction handler for speech/paragraph input
  const handleApplyExtractedData = (extracted: any) => {
    if (!extracted || typeof extracted !== 'object') return;

    setFormData((prev) => {
      const updated = { ...prev };

      if (extracted.gender) updated.gender = extracted.gender;
      if (extracted.age) updated.age = String(extracted.age);
      if (extracted.maritalStatus) updated.maritalStatus = extracted.maritalStatus;
      if (extracted.duration) updated.duration = extracted.duration;

      if (extracted.chiefComplaint && Array.isArray(extracted.chiefComplaint) && extracted.chiefComplaint.length > 0) {
        updated.chiefComplaint = Array.from(new Set([...(prev.chiefComplaint || []), ...extracted.chiefComplaint]));
      }

      if (extracted.precipitatingFactors && Array.isArray(extracted.precipitatingFactors) && extracted.precipitatingFactors.length > 0) {
        updated.precipitatingFactors = Array.from(new Set([...(prev.precipitatingFactors || []), ...extracted.precipitatingFactors]));
      }

      if (extracted.associatedSymptoms && Array.isArray(extracted.associatedSymptoms) && extracted.associatedSymptoms.length > 0) {
        updated.associatedSymptoms = Array.from(new Set([...(prev.associatedSymptoms || []), ...extracted.associatedSymptoms]));
      }

      if (extracted.hpiDetails) {
        updated.hpiDetails = prev.hpiDetails ? `${prev.hpiDetails}\n${extracted.hpiDetails}` : extracted.hpiDetails;
      }

      if (extracted.thoughtContent && Array.isArray(extracted.thoughtContent) && extracted.thoughtContent.length > 0) {
        updated.thoughtContent = Array.from(new Set([...(prev.thoughtContent || []), ...extracted.thoughtContent]));
      }

      if (extracted.suicideRisk) updated.suicideRisk = extracted.suicideRisk;

      return updated;
    });

    showToast(
      'success',
      'วิเคราะห์และนำเข้าฟอร์มสำเร็จด้วย AI',
      'สกัดข้อมูลเพศ, สถานภาพ, ระยะเวลา, อาการสำคัญ และปัจจัยกระตุ้น ลงฟอร์มเรียบร้อยแล้ว'
    );
  };

  const openDictationForField = useCallback((field: string) => {
    setDictationTargetField(field);
    setIsDictationModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 w-full max-w-full overflow-x-hidden">
      {/* Top Bar - Clean and Static */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 h-14 sm:h-16">
          {/* Zone 1: Single brand title wordmark with live patient status badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img
              src="/Official_emblem_of_Bhumibol_Adulyadej_Hospital.jpg"
              alt="ตราสัญลักษณ์ รพ.ภูมิพลอดุลยเดช"
              className="w-auto object-contain shrink-0 drop-shadow-xs h-10"
              style={{ aspectRatio: '200 / 283' }}
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold tracking-tight text-slate-900 block leading-tight text-sm sm:text-base">
                  แบบบันทึกแรกรับผู้ป่วยจิตเวช
                </span>
                {formData.hn ? (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] font-bold font-mono border border-blue-200">
                    HN: {formData.hn}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded text-[10px] font-semibold border border-amber-200">
                    ผู้ป่วยใหม่
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:block animate-fadeIn mt-0.5">
                {formData.fullName ? (
                  <span className="text-slate-700 font-semibold">แก้ไข: {formData.fullName} ({formData.age} ปี)</span>
                ) : (
                  'รพ.ภูมิพลอดุลยเดช · Mental Health Admission Form'
                )}
              </span>
            </div>
          </div>

          {/* Zone 3: Primary Actions (Compact) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <PWAInstallButton />

            {/* Keyboard Shortcut Indicator */}
            <div
              className="hidden lg:flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md"
              title="คีย์ลัดเร่งความเร็ว: Ctrl+S บันทึกร่าง"
            >
              <kbd className="bg-white border border-slate-300 rounded px-1 shadow-2xs">Ctrl</kbd>+<kbd className="bg-white border border-slate-300 rounded px-1 shadow-2xs">S</kbd> บันทึก
            </div>

            {/* ข้อมูลตัวอย่าง */}
            <button
              type="button"
              onClick={handleLoadSamplePatient}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer px-2.5 sm:px-3 py-1.5"
              title="ใส่ข้อมูลผู้ป่วยสมมติเพื่อทดสอบหน้าเอกสารและการพิมพ์"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden md:inline">ข้อมูลตัวอย่าง</span>
            </button>

            {/* ล้างฟอร์มใหม่ */}
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer px-2 py-1.5"
              title="ล้างข้อมูลทั้งหมดในฟอร์มเพื่อเริ่มประเมินผู้ป่วยรายใหม่"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="hidden sm:inline">ล้างฟอร์ม</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 no-print">
          {toastMessage.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          {toastMessage.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          {toastMessage.type === 'info' && (
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900">{toastMessage.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {toastMessage.description}
            </p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-sm leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="w-full min-w-0">
          <PsychiatricAssessmentForm
            data={formData}
            onChange={handleFormChange}
            errors={errors}
            onBlurField={handleBlurField}
            onOpenDictation={openDictationForField}
            onApplyWnlMse={handleApplyWnlMse}
            onApplyWnlPhysical={handleApplyWnlPhysical}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Sticky Compact Action Footer */}
        <div className="sticky bottom-3 sm:bottom-4 z-30 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl sm:rounded-xl shadow-xl px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 border border-slate-700/80 no-print max-w-full">
          {/* Status info - condensed on mobile */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs min-w-0">
            <span className="font-semibold text-slate-200 truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
              {formData.hn ? `HN ${formData.hn}` : 'รอระบุ HN'}
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            {autoSaveStatus === 'saving' ? (
              <span className="hidden xs:flex items-center gap-1 text-amber-400 font-medium animate-pulse text-[11px] sm:text-xs">
                <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin text-amber-400 shrink-0" />
                <span className="hidden md:inline">กำลังบันทึกอัตโนมัติ...</span>
              </span>
            ) : lastAutoSavedTime ? (
              <span className="hidden xs:flex items-center gap-1 text-emerald-400 font-medium text-[11px] sm:text-xs">
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="hidden md:inline">บันทึกแล้ว ({lastAutoSavedTime})</span>
              </span>
            ) : (
              <span className="hidden md:inline text-slate-400 font-mono text-[11px]">
                TH Sarabun 16pt
              </span>
            )}
            {emptyRequiredFields.length > 0 && (
              <>
                <span className="hidden md:inline text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => scrollToAndFocusField(emptyRequiredFields[0].id)}
                  className="hidden sm:flex items-center gap-1 text-[11px] sm:text-xs text-rose-300 hover:text-rose-100 font-medium underline cursor-pointer shrink-0"
                  title="คลิกเพื่อเลื่อนไปยังช่องจำเป็นที่ยังว่าง"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <span>ขาด {emptyRequiredFields.length} ช่อง</span>
                </button>
              </>
            )}
          </div>

          {/* Action Buttons - ultra slim & compact on iPhone */}
          {/* Action Buttons - ultra slim & compact on iPhone */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Native Browser Print button */}
            <button
              onClick={handleNativePrint}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-600 flex items-center gap-1.5"
              title="สั่งพิมพ์เอกสาร A4 (window.print)"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden sm:inline">พิมพ์ (A4)</span>
            </button>

            {/* Preview A4 */}
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-600 flex items-center gap-1.5"
              title="ดูตัวอย่างเอกสาร A4 ฟอนต์ TH Sarabun PSK 16pt"
            >
              <Eye className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="hidden md:inline">ดูตัวอย่าง</span>
            </button>

            {/* Main Action: Save & Download PDF */}
            <button
              onClick={handleSaveAndDownloadPdf}
              disabled={isSavingAndExporting}
              className="px-3 py-1.5 sm:px-4 sm:py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSavingAndExporting ? (
                <>
                  <span className="inline-block animate-spin text-xs">⏳</span>
                  <span className="hidden sm:inline">กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>บันทึก & PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-semibold text-slate-700">
            กองจิตเวชและประสาทวิทยา โรงพยาบาลภูมิพลอดุลยเดช (Bhumibol Adulyadej Hospital)
          </p>
          <p className="mt-1 text-slate-400">
            แบบบันทึกแรกรับผู้ป่วยจิตเวช (Mental Health Admission Form) · ฟอนต์ TH Sarabun PSK ขนาด ๑๖ พอยท์ · พิมพ์ขนาด A4
          </p>
        </div>
      </footer>

      {/* Printable & PDF Export Container */}
      <Suspense fallback={null}>
        <div id="printable-document" className="print-only hidden print:block">
          <AssessmentPdfDocument data={formData} />
        </div>
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: '-9999px',
            width: '210mm',
            height: '0px',
            overflow: 'hidden',
            visibility: 'hidden',
            zIndex: -9999,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <div id="offscreen-pdf-document">
            <AssessmentPdfDocument data={formData} />
          </div>
        </div>
      </Suspense>

      {/* On-Demand Modals */}
      <Suspense fallback={null}>
        {isPreviewModalOpen && (
          <PdfPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            data={formData}
          />
        )}

        {isDictationModalOpen && (
          <AudioDictationModal
            isOpen={isDictationModalOpen}
            onClose={() => setIsDictationModalOpen(false)}
            onInsertText={handleInsertTranscribedText}
            onApplyExtractedData={handleApplyExtractedData}
            defaultTargetField={dictationTargetField}
          />
        )}
      </Suspense>

      {/* In-app Reset Form Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-5 max-w-sm w-full">
            <h4 className="text-base font-bold text-slate-900 mb-1.5">
              สร้างแบบฟอร์มใหม่
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              คุณต้องการล้างข้อมูลในฟอร์มเพื่อเริ่มประเมินผู้ป่วยรายใหม่ใช่หรือไม่? (ข้อมูลปัจจุบันในแบบร่างจะถูกทำลายเพื่อความปลอดภัยของข้อมูลผู้ป่วย)
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmResetForm}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                ยืนยันล้างฟอร์ม
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for AI Voice Dictation */}
      <div className="fixed bottom-24 right-6 lg:right-8 z-40 no-print flex flex-col items-end gap-2 group">
        <button
          onClick={() => openDictationForField('hpiDetails')}
          className="w-14 h-14 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 active:from-red-700 active:to-rose-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer relative border-2 border-white focus:outline-none focus:ring-4 focus:ring-rose-300/50"
          title="ถอดความเสียงด้วย AI (gemini-3.5-transcribe)"
        >
          <Mic className="w-6 h-6 text-white shrink-0" />
          {/* Pulsing ring indicator */}
          <span className="absolute -inset-1 rounded-full border-2 border-red-500 animate-ping opacity-25 pointer-events-none" />
        </button>
        <div className="bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md border border-slate-700/60 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          ถอดความเสียงด้วย AI
        </div>
      </div>

      <OfflineIndicator />
    </div>
  );
}
