import React, { useState } from 'react';
import { User, Activity, Calendar, Clock, CheckSquare, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { AssessmentStepProps } from './AssessmentStepProps';
import { InlineDictationButton } from '../InlineDictationButton';
import { DebouncedInput } from './DebouncedInput';
import { DebouncedTextarea } from './DebouncedTextarea';

const Step1PatientAndComplaintComponent: React.FC<AssessmentStepProps> = ({
  data,
  onChange,
  errors,
  onBlurField,
  onOpenDictation,
  onApplyExtractedData,
  toggleArrayItem,
  handleDurationChange,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [isQuickExtracting, setIsQuickExtracting] = useState(false);
  const [quickExtractSuccess, setQuickExtractSuccess] = useState(false);

  const handleQuickAiExtract = async (textToExtract?: string) => {
    const text = (textToExtract !== undefined ? textToExtract : quickInput) || data.hpiDetails || '';
    if (!text.trim()) return;

    setIsQuickExtracting(true);
    setQuickExtractSuccess(false);

    try {
      const res = await fetch('/api/extract-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('AI extraction failed');
      const json = await res.json();

      if (json.extracted && onApplyExtractedData) {
        onApplyExtractedData(json.extracted);
        setQuickExtractSuccess(true);
        setTimeout(() => setQuickExtractSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Quick extraction error:', err);
    } finally {
      setIsQuickExtracting(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* 0. Official Document Header Card (Mirrors A4 Document Header) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-auto flex items-center justify-center shrink-0">
              <img
                src="/Official_emblem_of_Bhumibol_Adulyadej_Hospital.jpg"
                alt="ตราสัญลักษณ์โรงพยาบาลภูมิพลอดุลยเดช"
                className="h-14 w-auto object-contain shrink-0 drop-shadow-sm"
                style={{ aspectRatio: '200 / 283' }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Bhumibol Adulyadej Hospital · กองจิตเวชและประสาทวิทยา
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                แบบบันทึกแรกรับผู้ป่วยจิตเวช (Mental Health Admission Form)
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <Calendar className="w-4 h-4 text-blue-400" />
              <input
                type="date"
                value={data.assessmentDate}
                onChange={e => onChange({ assessmentDate: e.target.value })}
                onBlur={e => onBlurField && onBlurField('assessmentDate', e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-4 h-4 text-blue-400" />
              <input
                type="time"
                value={data.assessmentTime}
                onChange={e => onChange({ assessmentTime: e.target.value })}
                onBlur={e => onBlurField && onBlurField('assessmentTime', e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50/70 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                แผนก
              </label>
              <input
                type="text"
                value={data.department}
                onChange={e => onChange({ department: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ประเภทการรับผู้ป่วย <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3 mt-1">
                {(['OPD', 'IPD', 'ER'] as const).map(type => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                      data.admissionType === type
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="admissionType"
                      checked={data.admissionType === type}
                      onChange={() => onChange({ admissionType: type })}
                      className="sr-only"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Clinical Presets Bar for Human Input Speed */}
          <div className="mt-4 pt-3.5 border-t border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-amber-500 font-bold">⚡</span>
                <span>1 Click Fast fill</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Preset 1: Severe MDD */}
              <button
                type="button"
                onClick={() => {
                  const indications = new Set(data.admissionIndications || []);
                  indications.add('เป็นอันตรายต่อตนเอง (Risk of Harm to Self)');
                  onChange({
                    admissionType: 'IPD',
                    chiefComplaint: ['ซึมเศร้า/ท้อแท้', 'อยากตาย/พยายามทำร้ายตนเอง'],
                    duration: '1-4 สัปดาห์',
                    onset: 'เฉียบพลัน (Acute)',
                    course: 'แย่ลงเรื่อยๆ (Progressive)',
                    associatedSymptoms: ['นอนไม่หลับ', 'เบื่ออาหาร', 'อ่อนเพลีย'],
                    appearanceBehavior: ['Retardation'],
                    speech: ['Slow/Poverty of speech'],
                    moodAffect: ['Depressed'],
                    thoughtProcess: ['Logical/Coherent'],
                    thoughtContent: ['Suicidal ideation'],
                    perception: ['Normal'],
                    suicideRisk: 'High Risk',
                    violenceRisk: 'No Risk',
                    admissionIndications: Array.from(indications),
                    safetyPlan: ['Admit สังเกตอาการใกล้ชิด', 'แจ้งญาติดูแล 24 ชม.'],
                    standardizedAssessmentStatus: 'ประเมิน',
                    phq9Score: '24',
                    nineQScore: '22',
                    diagnosticCategory: ['F30-F39 Mood d/o'],
                    primaryDiagnosis: 'Major Depressive Episode, Severe without Psychotic Features (F32.2)',
                    pharmPlan: 'ปรับ/เริ่มยาใหม่',
                    medicationGroups: ['Antidepressants', 'Anxiolytics/Sedatives'],
                    medicationDetails: 'Sertraline (100) 1 tab po pc morning, Lorazepam (1) 1 tab po hs',
                    generalAppearance: 'Normal', heent: 'Normal', cvsRs: 'Normal', abdomen: 'Normal', extremities: 'Normal',
                    cranialNerves: 'Grossly intact', motorPower: 'Grade V all', tone: 'Normal', sensory: 'Intact', reflexes: 'Normal', cerebellar: 'Normal'
                  });
                }}
                className="px-3 py-1.5 text-xs font-bold text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Severe MDD with High Suicide Risk & IPD Admission"
              >
                <span>🚨 Severe MDD</span>
              </button>

              {/* Preset 2: Psychosis Relapse */}
              <button
                type="button"
                onClick={() => {
                  onChange({
                    admissionType: 'IPD',
                    chiefComplaint: ['หูแว่ว/ประสาทหลอน', 'หวาดระแวง/หลงผิด'],
                    duration: '1-6 เดือน',
                    onset: 'ค่อยเป็นค่อยไป (Gradual)',
                    course: 'แย่ลงเรื่อยๆ (Progressive)',
                    precipitatingFactors: ['ขาดยา'],
                    associatedSymptoms: ['นอนไม่หลับ', 'พฤติกรรมแปลกไปจากเดิม'],
                    appearanceBehavior: ['Poor hygiene', 'Restless/Agitated'],
                    speech: ['Talkative/Pressured'],
                    moodAffect: ['Irritable/Angry'],
                    thoughtProcess: ['Circumstantial'],
                    thoughtContent: ['Delusion'],
                    delusionDetail: 'Persecutory delusion (ระแวงคนทำร้าย)',
                    perception: ['Auditory Hallucination'],
                    suicideRisk: 'No Risk',
                    violenceRisk: 'Moderate Risk',
                    admissionIndications: ['เป็นอันตรายต่อผู้อื่น (Risk of Harm to Others)'],
                    diagnosticCategory: ['F20-F29 Schizophrenia/Psychotic'],
                    primaryDiagnosis: 'Schizophrenia, Paranoid type (F20.0)',
                    pharmPlan: 'ปรับ/เริ่มยาใหม่',
                    medicationGroups: ['Antipsychotics'],
                    medicationDetails: 'Risperidone (2) 1 tab po hs',
                    generalAppearance: 'Normal', heent: 'Normal', cvsRs: 'Normal', abdomen: 'Normal', extremities: 'Normal',
                    cranialNerves: 'Grossly intact', motorPower: 'Grade V all', tone: 'Normal', sensory: 'Intact', reflexes: 'Normal', cerebellar: 'Normal'
                  });
                }}
                className="px-3 py-1.5 text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Psychosis Relapse with Agitation & IPD Admission"
              >
                <span>🧠 Psychosis Relapse</span>
              </button>

              {/* Preset 3: Mania Episode */}
              <button
                type="button"
                onClick={() => {
                  onChange({
                    admissionType: 'IPD',
                    chiefComplaint: ['อารมณ์ดีผิดปกติ/พูดมาก', 'นอนน้อยไม่เพลีย'],
                    duration: '1-4 สัปดาห์',
                    onset: 'เฉียบพลัน (Acute)',
                    course: 'แย่ลงเรื่อยๆ (Progressive)',
                    precipitatingFactors: ['ขาดยา'],
                    associatedSymptoms: ['ก้าวร้าว/หงุดหงิด', 'พฤติกรรมแปลกไปจากเดิม'],
                    appearanceBehavior: ['Restless/Agitated'],
                    speech: ['Talkative/Pressured'],
                    moodAffect: ['Elevated/Expansive'],
                    thoughtProcess: ['Flight of ideas'],
                    thoughtContent: ['Delusion'],
                    delusionDetail: 'Grandiose delusion',
                    perception: ['Normal'],
                    suicideRisk: 'No Risk',
                    violenceRisk: 'High Risk',
                    admissionIndications: ['เป็นอันตรายต่อผู้อื่น (Risk of Harm to Others)'],
                    safetyPlan: ['Admit สังเกตอาการใกล้ชิด', 'Restraint/Seclusion'],
                    standardizedAssessmentStatus: 'ประเมิน',
                    diagnosticCategory: ['F30-F39 Mood d/o'],
                    primaryDiagnosis: 'Bipolar I Disorder, Current Episode Manic with Psychotic Features (F31.2)',
                    pharmPlan: 'ปรับ/เริ่มยาใหม่',
                    medicationGroups: ['Mood Stabilizers', 'Antipsychotics'],
                    medicationDetails: 'Lithium Carbonate (300) 1x2 po pc, Olanzapine (10) 1 tab po hs',
                    generalAppearance: 'Normal', heent: 'Normal', cvsRs: 'Normal', abdomen: 'Normal', extremities: 'Normal',
                    cranialNerves: 'Grossly intact', motorPower: 'Grade V all', tone: 'Normal', sensory: 'Intact', reflexes: 'Normal', cerebellar: 'Normal'
                  });
                }}
                className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Bipolar Mania Episode with Agitation & IPD Admission"
              >
                <span>🔥 Mania Episode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION A: Patient Identification (Mirrors A4 Document Page 1 Box 1) */}
      <section id="section-a" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              A. Patient Identification (ข้อมูลทั่วไป)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">ส่วนข้อมูลประจำตัวผู้ป่วย</span>
        </div>

        <div className="p-6 space-y-4">
          {/* Row 1: HN, AN, Full Name */}
          <div className="flex flex-wrap items-start gap-4">
            {/* HN */}
            <div className="w-36 shrink-0">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>
                  HN <span className="text-red-500">*</span>
                </span>
                {!data.hn?.trim() && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-1 py-0.2 rounded">
                    จำเป็น
                  </span>
                )}
              </label>
              <input
                id="field-hn"
                type="text"
                value={data.hn}
                onChange={e => onChange({ hn: e.target.value.trim() })}
                onBlur={e => onBlurField && onBlurField('hn', e.target.value)}
                placeholder="เช่น 67001234"
                className={`w-full text-sm font-mono font-bold bg-white border rounded-lg px-3 py-1.5 transition-all focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                  errors.hn
                    ? 'border-red-500 bg-red-50/50'
                    : !data.hn?.trim()
                    ? 'border-slate-300 border-l-4 border-l-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              />
              {errors.hn && <p className="text-xs text-red-600 mt-1 font-medium">{errors.hn}</p>}
            </div>

            {/* AN */}
            <div className="w-36 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                AN (ถ้ามี)
              </label>
              <input
                type="text"
                value={data.an}
                onChange={e => onChange({ an: e.target.value.trim() })}
                onBlur={e => onBlurField && onBlurField('an', e.target.value)}
                placeholder="เช่น 67/0123"
                className="w-full text-sm font-mono bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Full Name */}
            <div className="flex-1 min-w-[220px] max-w-md">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>
                  ชื่อ-สกุล <span className="text-red-500">*</span>
                </span>
                {!data.fullName?.trim() && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    จำเป็นต้องระบุ
                  </span>
                )}
              </label>
              <DebouncedInput
                id="field-fullName"
                type="text"
                value={data.fullName}
                onChangeValue={val => onChange({ fullName: val })}
                onBlur={e => onBlurField && onBlurField('fullName', e.target.value)}
                placeholder="ระบุชื่อและนามสกุลผู้ป่วย"
                className={`w-full text-sm bg-white border rounded-lg px-3 py-1.5 transition-all focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                  errors.fullName
                    ? 'border-red-500 bg-red-50/50'
                    : !data.fullName?.trim()
                    ? 'border-slate-300 border-l-4 border-l-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.fullName}</p>
              )}
            </div>
          </div>

          {/* Row 2: Age, Gender, Marital Status, Occupation */}
          <div className="flex flex-wrap items-start gap-4">
            {/* Age (Compact 2-3 digits input) */}
            <div className="w-24 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>
                  อายุ <span className="text-red-500">*</span>
                </span>
                {!data.age?.trim() && (
                  <span className="text-[10px] font-semibold text-rose-600">จำเป็น</span>
                )}
              </label>
              <input
                id="field-age"
                type="number"
                min="0"
                max="130"
                value={data.age}
                onChange={e => onChange({ age: e.target.value })}
                onBlur={e => onBlurField && onBlurField('age', e.target.value)}
                placeholder="เช่น 35"
                className={`w-full text-sm bg-white border rounded-lg px-2.5 py-1.5 transition-all focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                  errors.age
                    ? 'border-red-500 bg-red-50/50'
                    : !data.age?.trim()
                    ? 'border-slate-300 border-l-4 border-l-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              />
              {errors.age && (
                <p className="text-[11px] text-red-600 mt-0.5 font-medium">{errors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div className="w-32 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                เพศ <span className="text-red-500">*</span>
              </label>
              <select
                id="field-gender"
                value={data.gender}
                onChange={e => onChange({ gender: e.target.value as any })}
                onBlur={e => onBlurField && onBlurField('gender', e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-2.5 py-1.5 transition-all focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                  errors.gender
                    ? 'border-red-500 bg-red-50/50'
                    : !data.gender
                    ? 'border-slate-300 border-l-4 border-l-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              >
                <option value="">-- เพศ --</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            {/* Marital Status */}
            <div className="w-40 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                สถานภาพสมรส
              </label>
              <select
                value={data.maritalStatus}
                onChange={e => onChange({ maritalStatus: e.target.value as any })}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="โสด">โสด</option>
                <option value="สมรส">สมรส</option>
                <option value="หม้าย/หย่า/แยก">หม้าย/หย่า/แยก</option>
              </select>
            </div>

            {/* Occupation */}
            <div className="w-48 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                อาชีพ
              </label>
              <input
                type="text"
                value={data.occupation}
                onChange={e => onChange({ occupation: e.target.value })}
                placeholder="เช่น ค้าขาย, ข้าราชการ"
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Education Level, Informant, Reliability */}
          <div className="flex flex-wrap items-start gap-4 pt-1">
            {/* Education Level (ระดับการศึกษาสูงสุด: ประถมศึกษา, มัธยมศึกษา, ปริญญาตรีหรือสูงกว่า, Default = มัธยมศึกษา) */}
            <div className="w-56 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ระดับการศึกษาสูงสุด
              </label>
              <select
                value={data.educationLevel || 'มัธยมศึกษา'}
                onChange={e => onChange({ educationLevel: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="ประถมศึกษา">ประถมศึกษา</option>
                <option value="มัธยมศึกษา">มัธยมศึกษา</option>
                <option value="ปริญญาตรีหรือสูงกว่า">ปริญญาตรีหรือสูงกว่า</option>
              </select>
            </div>

            {/* Informant */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ผู้ให้ข้อมูลหลัก (Informant)
              </label>
              <div className="flex gap-3 items-center h-9">
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="informant"
                    checked={data.informant === 'ผู้ป่วยเอง'}
                    onChange={() => onChange({ informant: 'ผู้ป่วยเอง' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>ผู้ป่วยเอง</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="informant"
                    checked={data.informant === 'ญาติ/ผู้ดูแล'}
                    onChange={() => onChange({ informant: 'ญาติ/ผู้ดูแล' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>ญาติ/ผู้ดูแล</span>
                </label>
              </div>
            </div>

            {/* Informant Detail if relative */}
            {data.informant === 'ญาติ/ผู้ดูแล' && (
              <div className="w-36 shrink-0">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  ระบุความเกี่ยวข้อง
                </label>
                <DebouncedInput
                  type="text"
                  value={data.informantDetail}
                  onChangeValue={val => onChange({ informantDetail: val })}
                  placeholder="เช่น มารดา, สามี"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            )}

            {/* Reliability */}
            <div className="w-48 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ความน่าเชื่อถือของข้อมูล (Reliability)
              </label>
              <select
                value={data.reliability}
                onChange={e => onChange({ reliability: e.target.value as any })}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="ดี (Good)">ดี (Good)</option>
                <option value="พอใช้ (Fair)">พอใช้ (Fair)</option>
                <option value="เชื่อถือไม่ได้ (Poor)">เชื่อถือไม่ได้ (Poor)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: Chief Complaint & HPI (Mirrors A4 Document Page 1 Box 2) */}
      <section id="section-b" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              B. Chief Complaint & History of Present Illness (อาการสำคัญและประวัติปัจจุบัน)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">อาการสำคัญและประวัติเจ็บป่วย</span>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick AI Extraction Banner */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/90 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                  สกัดข้อมูลเข้าฟอร์มสั้น/ยาวด้วย AI (AI Quick Parser)
                </span>
              </div>
              <span className="text-[11px] text-purple-700 font-medium">
                พิมพ์/วางข้อความ เช่น "ผู้ป่วยชายไทยอายุ 65 ปี มาด้วยสับสน 3 วัน" แล้วกดสกัด
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                placeholder='พิมพ์หรือวางข้อความ เช่น "ผู้ป่วยชายไทยอายุ 65 ปี" หรือ "ผู้ป่วยหญิง 40 ปี นอนไม่หลับ 2 สัปดาห์"'
                className="flex-1 text-xs bg-white border border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickAiExtract();
                  }
                }}
              />
              <button
                type="button"
                disabled={isQuickExtracting || !quickInput.trim()}
                onClick={() => handleQuickAiExtract()}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isQuickExtracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังวิเคราะห์...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>สกัดเข้าฟอร์มด้วย AI</span>
                  </>
                )}
              </button>
            </div>

            {quickExtractSuccess && (
              <div className="text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>วิเคราะห์และกรอกข้อมูลเพศ, อายุ, อาการสกัดเข้าฟอร์มเรียบร้อยแล้ว!</span>
              </div>
            )}
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              อาการสำคัญ (Chief Complaint) <span className="text-xs font-normal text-slate-500">(เลือกได้มากกว่า 1 ข้อ)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {[
                'ซึมเศร้า/ท้อแท้',
                'หงุดหงิด/ก้าวร้าว',
                'หูแว่ว/ประสาทหลอน',
                'หวาดระแวง/หลงผิด',
                'สับสน/หลงลืม',
                'ทำร้ายตนเอง',
                'มีปัญหาพฤติกรรม',
              ].map(item => {
                const isSelected = data.chiefComplaint.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem('chiefComplaint', item)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckSquare
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-blue-600' : 'text-slate-300'
                      }`}
                    />
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">ระบุอาการสำคัญอื่นๆ เพิ่มเติม (ถ้ามี)</span>
                <InlineDictationButton
                  onTranscript={text => {
                    const existing = data.chiefComplaintOther || '';
                    onChange({ chiefComplaintOther: existing ? `${existing} ${text}` : text });
                  }}
                />
              </div>
              <DebouncedInput
                type="text"
                value={data.chiefComplaintOther}
                onChangeValue={val => onChange({ chiefComplaintOther: val })}
                onBlur={e => onBlurField && onBlurField('chiefComplaintOther', e.target.value)}
                placeholder="ระบุอาการสำคัญอื่นๆ สั้นๆ..."
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Duration, Onset, Course */}
          <div className="flex flex-wrap items-start gap-4 pt-3 border-t border-slate-100">
            <div className="w-48 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ระยะเวลาที่มีอาการ
              </label>
              <select
                value={data.duration}
                onChange={e => handleDurationChange(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">-- เลือกระยะเวลา --</option>
                <option value="1 วัน">1 วัน</option>
                <option value="< 1 สัปดาห์">&lt; 1 สัปดาห์</option>
                <option value="1-4 สัปดาห์">1-4 สัปดาห์</option>
                <option value="1-6 เดือน">1-6 เดือน</option>
                <option value="> 6 เดือน">&gt; 6 เดือน</option>
              </select>
            </div>

            <div className="w-52 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ลักษณะการเกิดอาการ (Onset)
              </label>
              <select
                value={data.onset}
                onChange={e => onChange({ onset: e.target.value as any })}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="เฉียบพลัน (Acute)">เฉียบพลัน (Acute)</option>
                <option value="ค่อยเป็นค่อยไป (Gradual)">ค่อยเป็นค่อยไป (Gradual)</option>
              </select>
            </div>

            <div className="w-56 shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                การดำเนินโรค (Course)
              </label>
              <select
                value={data.course}
                onChange={e => onChange({ course: e.target.value as any })}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="ดีขึ้นสลับแย่ลง (Fluctuating)">ดีขึ้นสลับแย่ลง (Fluctuating)</option>
                <option value="แย่ลงเรื่อยๆ (Progressive)">แย่ลงเรื่อยๆ (Progressive)</option>
                <option value="คงที่ (Stable)">คงที่ (Stable)</option>
              </select>
            </div>
          </div>

          {/* Precipitating Factors & Associated Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                ปัจจัยกระตุ้น (Precipitating factors)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'ปัญหาครอบครัว/ความสัมพันธ์',
                  'การเงิน/การงาน',
                  'ขาดยา',
                  'ใช้สารเสพติด',
                  'โรคทางกายกำเริบ',
                  'ไม่พบปัจจัยชัดเจน',
                ].map(factor => {
                  const active = data.precipitatingFactors.includes(factor);
                  return (
                    <button
                      key={factor}
                      type="button"
                      onClick={() => toggleArrayItem('precipitatingFactors', factor)}
                      className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-100 text-blue-800 border-blue-400 font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {factor}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                อาการร่วมที่สำคัญ (Associated symptoms)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'นอนไม่หลับ',
                  'เบื่ออาหาร',
                  'น้ำหนักลด/เพิ่ม',
                  'อ่อนเพลีย',
                  'แยกตัว',
                  'พฤติกรรมแปลกไปจากเดิม',
                ].map(symptom => {
                  const active = data.associatedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleArrayItem('associatedSymptoms', symptom)}
                      className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-100 text-blue-800 border-blue-400 font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

            {/* Detailed HPI text */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  รายละเอียดประวัติปัจจุบันเพิ่มเติม (HPI Details)
                </label>
                <InlineDictationButton
                  onTranscript={text => {
                    const existing = data.hpiDetails || '';
                    onChange({ hpiDetails: existing ? `${existing} ${text}` : text });
                  }}
                />
                <button
                  type="button"
                  disabled={isQuickExtracting || !data.hpiDetails?.trim()}
                  onClick={() => handleQuickAiExtract(data.hpiDetails)}
                  className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 shadow-2xs"
                  title="สกัดข้อมูลเพศ อายุ และอาการสำคัญจาก HPI นี้ลงฟอร์มด้วย AI"
                >
                  <Sparkles className="w-3 h-3 text-purple-700" />
                  <span>สกัดเข้าฟอร์มด้วย AI</span>
                </button>
              </div>
            </div>

            <DebouncedTextarea
              rows={3}
              value={data.hpiDetails}
              onChangeValue={val => onChange({ hpiDetails: val })}
              onBlur={e => onBlurField && onBlurField('hpiDetails', e.target.value)}
              placeholder="บันทึกเรื่องราวการเจ็บป่วย เหตุการณ์นำมา ลำดับอาการ พฤติกรรมที่สังเกตได้..."
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Previous treatment & response */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                การรักษาก่อนหน้า
              </label>
              <select
                value={data.previousTreatment}
                onChange={e => {
                  const val = e.target.value as any;
                  onChange({
                    previousTreatment: val,
                    ...(val === 'ไม่เคยรักษาจิตเวชมาก่อน' ? { previousHospital: '', previousResponse: '' } : {}),
                  });
                }}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="ไม่เคยรักษาจิตเวชมาก่อน">ไม่เคยรักษาจิตเวชมาก่อน</option>
                <option value="เคยรักษา">เคยรักษา</option>
              </select>
            </div>

            {data.previousTreatment === 'เคยรักษา' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    เคยรักษาที่ (ระบุ รพ./คลินิก)
                  </label>
                  <DebouncedInput
                    type="text"
                    value={data.previousHospital}
                    onChangeValue={val => onChange({ previousHospital: val })}
                    placeholder="ระบุสถานพยาบาลเดิม"
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    ผลการรักษาเดิม
                  </label>
                  <select
                    value={data.previousResponse}
                    onChange={e => onChange({ previousResponse: e.target.value as any })}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">-- เลือกผลการรักษา --</option>
                    <option value="ตอบสนองดี">ตอบสนองดี</option>
                    <option value="ตอบสนองบางส่วน">ตอบสนองบางส่วน</option>
                    <option value="ไม่ตอบสนอง">ไม่ตอบสนอง</option>
                    <option value="มีผลข้างเคียงจากยา">มีผลข้างเคียงจากยา</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export const Step1PatientAndComplaint = React.memo(Step1PatientAndComplaintComponent, (prevProps, nextProps) => {
  const step1Keys: (keyof typeof prevProps.data)[] = [
    'assessmentDate',
    'assessmentTime',
    'admissionType',
    'fullName',
    'age',
    'gender',
    'hn',
    'an',
    'maritalStatus',
    'occupation',
    'educationLevel',
    'informant',
    'informantDetail',
    'reliability',
    'chiefComplaint',
    'chiefComplaintOther',
    'duration',
    'onset',
    'course',
    'precipitatingFactors',
    'precipitatingFactorsOther',
    'associatedSymptoms',
    'hpiDetails',
    'previousTreatment',
    'previousHospital',
    'previousResponse'
  ];

  for (const key of step1Keys) {
    if (prevProps.data[key] !== nextProps.data[key]) {
      return false;
    }
  }

  const errorKeys = ['hn', 'fullName', 'age', 'gender'];
  for (const key of errorKeys) {
    if (prevProps.errors[key] !== nextProps.errors[key]) {
      return false;
    }
  }

  return true;
});
