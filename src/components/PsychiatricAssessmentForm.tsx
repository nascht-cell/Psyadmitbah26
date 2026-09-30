import React, { useCallback, useRef, useMemo } from 'react';
import { PsychiatricAssessment } from '../types/assessment';
import { Step1PatientAndComplaint } from './assessment/Step1PatientAndComplaint';
import { Step2PastAndPsychosocial } from './assessment/Step2PastAndPsychosocial';
import { Step3MseAndRisk } from './assessment/Step3MseAndRisk';
import { Step4PhysicalAndPlan } from './assessment/Step4PhysicalAndPlan';
import { CheckCircle2, ChevronRight, ChevronLeft, LayoutList, Layers, Sparkles } from 'lucide-react';

interface Props {
  data: PsychiatricAssessment;
  onChange: (updated: Partial<PsychiatricAssessment>) => void;
  errors: Record<string, string>;
  onBlurField?: (field: string, value: any) => void;
  collapsedSections?: Record<string, boolean>;
  onToggleSection?: (sectionKey: string) => void;
  onApplyWnlMse?: () => void;
  onApplyWnlPhysical?: () => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  viewMode?: 'wizard' | 'full';
  onViewModeChange?: (mode: 'wizard' | 'full') => void;
  onOpenHistoryModal?: () => void;
}

const STEPS = [
  {
    id: 1,
    title: 'ผู้ป่วย & อาการสำคัญ',
    shortTitle: '1. ผู้ป่วย & อาการ',
    subtitle: 'ข้อมูลทั่วไป, อาการสำคัญ และประวัติการป่วยปัจจุบัน (HPI)',
  },
  {
    id: 2,
    title: 'ประวัติอดีต & ครอบครัว',
    shortTitle: '2. ประวัติอดีต',
    subtitle: 'ประวัติทางจิตเวช, โรคประจำตัว, ยาเดิม, สารเสพติด และครอบครัว',
  },
  {
    id: 3,
    title: 'ตรวจสภาพจิต (MSE) & ความเสี่ยง',
    shortTitle: '3. ตรวจสภาพจิต',
    subtitle: 'การตรวจสภาพจิตอย่างละเอียด และการประเมินความเสี่ยงทำร้ายตนเอง/ผู้อื่น',
  },
  {
    id: 4,
    title: 'ตรวจร่างกาย, วินิจฉัย & แผน',
    shortTitle: '4. ร่างกาย & แผน',
    subtitle: 'สัญญาณชีพ, การตรวจร่างกาย/ประสาท, โรคที่วินิจฉัย (ICD-10) และแผนการรักษา',
  },
];

const PsychiatricAssessmentFormComponent: React.FC<Props> = ({
  data,
  onChange,
  errors,
  onBlurField,
  onApplyWnlMse,
  onApplyWnlPhysical,
  currentStep = 1,
  onStepChange,
  viewMode = 'wizard',
  onViewModeChange,
  onOpenHistoryModal,
}) => {
  const dataRef = useRef(data);
  dataRef.current = data;

  const activeStep = currentStep || 1;

  const setActiveStep = (step: number) => {
    if (onStepChange) {
      onStepChange(step);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleArrayItem = useCallback((field: keyof PsychiatricAssessment, item: string) => {
    const current = (dataRef.current[field] as string[]) || [];

    // Precipitating Factors mutual exclusion
    if (field === 'precipitatingFactors') {
      const isNone = item === 'ไม่พบปัจจัยชัดเจน' || item === 'ไม่มี/ไม่ชัดเจน' || item === 'ไม่มี';
      if (isNone) {
        const updated = current.includes(item) ? [] : [item];
        onChange({ [field]: updated });
        return;
      } else {
        const withoutNone = current.filter(
          i => i !== 'ไม่พบปัจจัยชัดเจน' && i !== 'ไม่มี/ไม่ชัดเจน' && i !== 'ไม่มี'
        );
        const updated = withoutNone.includes(item)
          ? withoutNone.filter(i => i !== item)
          : [...withoutNone, item];
        onChange({ [field]: updated });
        return;
      }
    }

    // Psychosocial Stressors mutual exclusion
    if (field === 'psychosocialStressors') {
      const isNone = item === 'ไม่มี/ไม่ชัดเจน' || item === 'ไม่มี';
      if (isNone) {
        const updated = current.includes(item) ? [] : [item];
        onChange({ [field]: updated });
        return;
      } else {
        const withoutNone = current.filter(i => i !== 'ไม่มี/ไม่ชัดเจน' && i !== 'ไม่มี');
        const updated = withoutNone.includes(item)
          ? withoutNone.filter(i => i !== item)
          : [...withoutNone, item];
        onChange({ [field]: updated });
        return;
      }
    }

    // Other Risks mutual exclusion
    if (field === 'otherRisks') {
      const isNone = item === 'None' || item === 'ไม่มี';
      if (isNone) {
        const updated = current.includes(item) ? [] : [item];
        onChange({ [field]: updated });
        return;
      } else {
        const withoutNone = current.filter(i => i !== 'None' && i !== 'ไม่มี');
        const updated = withoutNone.includes(item)
          ? withoutNone.filter(i => i !== item)
          : [...withoutNone, item];
        onChange({ [field]: updated });
        return;
      }
    }

    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    onChange({ [field]: updated });
  }, [onChange]);

  const isNormalMseOption = useCallback((field: keyof PsychiatricAssessment, item: string): boolean => {
    const lower = item.toLowerCase().trim();
    if (lower === 'normal') return true;
    if (field === 'moodAffect' && lower === 'euthymic') return true;
    if (field === 'thoughtProcess' && (lower === 'logical/coherent' || lower.includes('coherent'))) return true;
    return false;
  }, []);

  const toggleMseItem = useCallback((field: keyof PsychiatricAssessment, item: string) => {
    const current = (dataRef.current[field] as string[]) || [];
    const isNormal = isNormalMseOption(field, item);

    if (current.includes(item)) {
      onChange({ [field]: current.filter(i => i !== item) });
    } else {
      if (isNormal) {
        const extraUpdates: Partial<PsychiatricAssessment> = {};
        if (field === 'thoughtContent') {
          extraUpdates.delusionDetail = '';
        }
        onChange({ [field]: [item], ...extraUpdates });
      } else {
        const filtered = current.filter(i => !isNormalMseOption(field, i));
        onChange({ [field]: [...filtered, item] });
      }
    }
  }, [onChange, isNormalMseOption]);

  const handleDurationChange = useCallback((dur: string) => {
    let newOnset = dataRef.current.onset;
    if (dur === '1 วัน' || dur === '< 1 สัปดาห์' || dur === '1-4 สัปดาห์') {
      newOnset = 'เฉียบพลัน (Acute)';
    } else if (dur === '1-6 เดือน' || dur === '> 6 เดือน') {
      newOnset = 'ค่อยเป็นค่อยไป (Gradual)';
    }
    onChange({ duration: dur as any, onset: newOnset });
  }, [onChange]);

  const handleSuicideRiskChange = useCallback((risk: 'No Risk' | 'Low Risk' | 'Moderate Risk' | 'High Risk') => {
    const indications = new Set(dataRef.current.admissionIndications || []);
    const item = 'เป็นอันตรายต่อตนเอง (Risk of Harm to Self)';
    if (risk === 'Moderate Risk' || risk === 'High Risk') {
      indications.add(item);
    } else {
      indications.delete(item);
    }
    onChange({ suicideRisk: risk, admissionIndications: Array.from(indications) });
  }, [onChange]);

  const handleViolenceRiskChange = useCallback((risk: 'No Risk' | 'Low Risk' | 'Moderate Risk' | 'High Risk') => {
    const indications = new Set(dataRef.current.admissionIndications || []);
    const item = 'เป็นอันตรายต่อผู้อื่น (Risk of Harm to Others)';
    if (risk === 'Moderate Risk' || risk === 'High Risk') {
      indications.add(item);
    } else {
      indications.delete(item);
    }
    onChange({ violenceRisk: risk, admissionIndications: Array.from(indications) });
  }, [onChange]);

  // Step Completion Check
  const stepCompletionStatus = useMemo(() => {
    const step1 = Boolean(data.hn?.trim() && data.fullName?.trim() && data.age && data.gender && (data.chiefComplaint?.length || data.hpiDetails?.trim()));
    const step2 = Boolean(data.psychiatricHistory || data.medicalHistory || data.substanceHistory);
    const step3 = Boolean(data.appearanceBehavior?.length || data.moodAffect?.length || data.suicideRisk);
    const step4 = Boolean(data.primaryDiagnosis?.trim() && data.physicianName?.trim());

    return { 1: step1, 2: step2, 3: step3, 4: step4 };
  }, [data]);

  const stepProps = {
    data,
    onChange,
    errors,
    onBlurField,
    onApplyWnlMse,
    onApplyWnlPhysical,
    toggleArrayItem,
    toggleMseItem,
    handleDurationChange,
    handleSuicideRiskChange,
    handleViolenceRiskChange,
    onOpenHistoryModal,
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Sticky Step Header & View Mode Switcher (Clay Floating Bar) */}
      <div className="clay-surface p-3 sm:p-4 sticky top-20 z-30 bg-white/95 backdrop-blur-md mb-6">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100/90 px-3 py-1 rounded-xl shadow-2xs">
              โหมดการประเมิน
            </span>
            <span className="text-xs text-slate-600 font-bold hidden sm:inline">
              {viewMode === 'wizard' ? 'กรอกทีละขั้นตอน (Wizard Mode)' : 'แสดงฟอร์มทั้งหมดบนหน้าเดียว (Full Form)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange && onViewModeChange('wizard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'wizard'
                  ? 'clay-pill-active'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ทีละขั้นตอน</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange && onViewModeChange('full')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'full'
                  ? 'clay-pill-active'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>แสดงทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3">
          {STEPS.map((step) => {
            const isActive = activeStep === step.id;
            const isCompleted = stepCompletionStatus[step.id as keyof typeof stepCompletionStatus];
            const hasError = Object.keys(errors).some(k => {
              if (step.id === 1) return ['hn', 'fullName', 'age', 'gender'].includes(k);
              if (step.id === 4) return ['physicianName'].includes(k);
              return false;
            });

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`relative text-left p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                  isActive
                    ? 'clay-card-blue ring-2 ring-blue-400 font-extrabold text-blue-950 scale-[1.02]'
                    : hasError
                    ? 'clay-card-rose text-rose-950 hover:scale-[1.01]'
                    : isCompleted
                    ? 'clay-card-mint text-emerald-950 hover:scale-[1.01]'
                    : 'clay-surface text-slate-800 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-[11px] font-extrabold uppercase tracking-tight text-slate-600">
                    ขั้นตอน {step.id}
                  </span>
                  {hasError ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full border border-rose-300">
                      ข้อมูลไม่ครบ
                    </span>
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : null}
                </div>

                <div className="text-xs sm:text-sm font-extrabold truncate mt-1">
                  {step.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content Rendering */}
      {viewMode === 'wizard' ? (
        <div className="space-y-6">
          {activeStep === 1 && <Step1PatientAndComplaint {...stepProps} />}
          {activeStep === 2 && <Step2PastAndPsychosocial {...stepProps} />}
          {activeStep === 3 && <Step3MseAndRisk {...stepProps} />}
          {activeStep === 4 && <Step4PhysicalAndPlan {...stepProps} />}

          {/* Bottom Wizard Navigation Footer Bar */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>ย้อนกลับ (ขั้นตอน {activeStep - 1})</span>
              </button>
            ) : (
              <div />
            )}

            <div className="text-xs font-semibold text-slate-500 hidden sm:block">
              ขั้นตอนที่ {activeStep} จาก 4: {STEPS[activeStep - 1].title}
            </div>

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ml-auto"
              >
                <span>ขั้นตอนถัดไป ({activeStep + 1}/4)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 ml-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ครบทั้ง 4 ขั้นตอน พร้อมออกรายงาน PDF</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full Form View */
        <div className="space-y-8">
          <section id="step-section-1" className="scroll-mt-32">
            <Step1PatientAndComplaint {...stepProps} />
          </section>
          <section id="step-section-2" className="scroll-mt-32">
            <Step2PastAndPsychosocial {...stepProps} />
          </section>
          <section id="step-section-3" className="scroll-mt-32">
            <Step3MseAndRisk {...stepProps} />
          </section>
          <section id="step-section-4" className="scroll-mt-32">
            <Step4PhysicalAndPlan {...stepProps} />
          </section>
        </div>
      )}
    </div>
  );
};

export const PsychiatricAssessmentForm = React.memo(PsychiatricAssessmentFormComponent);

