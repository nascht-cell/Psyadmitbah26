import React, { useRef } from 'react';
import { User, Activity, Calendar, Clock, CheckSquare, History, FolderOpen, ShieldCheck, Upload } from 'lucide-react';
import { AssessmentStepProps } from './AssessmentStepProps';
import { DebouncedInput } from './DebouncedInput';
import { DebouncedTextarea } from './DebouncedTextarea';
import { SearchableTokenMultiSelect } from './SearchableTokenMultiSelect';

const Step1PatientAndComplaintComponent: React.FC<AssessmentStepProps> = ({
  data,
  onChange,
  errors,
  onBlurField,
  toggleArrayItem,
  handleDurationChange,
  onOpenHistoryModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const assessmentData = parsed.data || parsed;
        if (assessmentData && (assessmentData.hospitalName !== undefined || assessmentData.hn !== undefined)) {
          onChange(assessmentData);
          const { saveToLocalHistory } = await import('../../utils/storage');
          await saveToLocalHistory(assessmentData);
        }
      } catch (err) {
        console.error('Error importing JSON file:', err);
      }
    };
    reader.readAsText(file);
    if (e.target) {
      e.target.value = '';
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

      {/* Local Storage & Saved Records Browser Quick Bar */}
      <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900">
                ประวัติการบันทึกในเครื่อง (Local Storage Records)
              </h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-md border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>บันทึกเฉพาะในเครื่อง 100% (Offline & Private)</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              ดึงข้อมูลผู้ป่วยที่เคยบันทึกไว้ในเบราว์เซอร์ของเครื่องนี้กลับมาแก้ไขใหม่ได้ง่ายๆ พร้อมวันที่บันทึกกำกับชัดเจน (ข้อมูลไม่ถูกส่งขึ้นอินเทอร์เน็ต)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Browse Saved Records in localStorage */}
          <button
            type="button"
            onClick={() => onOpenHistoryModal && onOpenHistoryModal()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="เปิดดูรายการประวัติที่บันทึกไว้ในเครื่องเพื่อโหลดกลับมาแก้ไข"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>ดูประวัติการบันทึก</span>
          </button>

          {/* Hidden File Input for Native JSON Local File Browsing */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleDirectFileImport}
            className="sr-only"
          />

          {/* Browse Local File (.json) directly */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="เปิดไฟล์แบบประเมิน .json จากเครื่องของคุณ"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>เปิดไฟล์จากเครื่อง (.json)</span>
          </button>
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

          {/* Row 2: Age, Gender, Marital Status */}
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
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                เพศ <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                {(['ชาย', 'หญิง', 'อื่นๆ'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onChange({ gender: g })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      data.gender === g
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Marital Status */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                สถานภาพสมรส
              </label>
              <div className="flex flex-wrap gap-1">
                {(['โสด', 'สมรส', 'หม้าย/หย่า/แยก'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onChange({ maritalStatus: m })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.maritalStatus || 'โสด') === m
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Occupation (4 buttons: พลทหาร, ข้าราชการ, เอกชน, ว่างงาน with default ว่างงาน) */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                อาชีพ (Occupation) <span className="text-slate-400 font-normal text-[11px]">(Default: ว่างงาน)</span>
              </label>
              <div className="flex flex-wrap gap-1">
                {(['พลทหาร', 'ข้าราชการ', 'เอกชน', 'ว่างงาน'] as const).map(occ => {
                  const isSelected = (data.occupation || 'ว่างงาน') === occ;
                  return (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => onChange({ occupation: occ })}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs ring-1 ring-blue-400'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {occ}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Education Level, Informant, Reliability */}
          <div className="flex flex-wrap items-start gap-4 pt-1">
            {/* Education Level */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ระดับการศึกษาสูงสุด
              </label>
              <div className="flex flex-wrap gap-1">
                {(['ประถมศึกษา', 'มัธยมศึกษา', 'ปริญญาตรีหรือสูงกว่า'] as const).map(edu => (
                  <button
                    key={edu}
                    type="button"
                    onClick={() => onChange({ educationLevel: edu })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.educationLevel || 'มัธยมศึกษา') === edu
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {edu}
                  </button>
                ))}
              </div>
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
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ความน่าเชื่อถือของข้อมูล (Reliability)
              </label>
              <div className="flex gap-1">
                {(['ดี (Good)', 'พอใช้ (Fair)', 'เชื่อถือไม่ได้ (Poor)'] as const).map(rel => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => onChange({ reliability: rel })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.reliability || 'ดี (Good)') === rel
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
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
          {/* Chief Complaint */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              อาการสำคัญ (Chief Complaint) <span className="text-xs font-normal text-slate-500">(เลือกหรือพิมพ์ค้นหาได้มากกว่า 1 ข้อ)</span>
            </label>
            <SearchableTokenMultiSelect
              options={[
                'ซึมเศร้า/ท้อแท้',
                'หงุดหงิด/ก้าวร้าว',
                'หูแว่ว/ประสาทหลอน',
                'หวาดระแวง/หลงผิด',
                'สับสน/หลงลืม',
                'ทำร้ายตนเอง',
                'มีปัญหาพฤติกรรม',
              ]}
              selected={data.chiefComplaint || []}
              onToggle={item => toggleArrayItem('chiefComplaint', item)}
              placeholder="เลือกหรือค้นหาอาการสำคัญ..."
              searchPlaceholder="พิมพ์ค้นหา / กด Enter เพื่อเพิ่ม..."
              tokenColorClass="bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100"
            />

            <div className="mt-2 space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">ระบุอาการสำคัญอื่นๆ เพิ่มเติม (ถ้ามี)</span>
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
            {/* Duration */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ระยะเวลาที่มีอาการ (Duration)
              </label>
              <div className="flex flex-wrap gap-1">
                {(['1 วัน', '< 1 สัปดาห์', '1-4 สัปดาห์', '1-6 เดือน', '> 6 เดือน'] as const).map(dur => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleDurationChange(dur)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      data.duration === dur
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Onset */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ลักษณะการเกิดอาการ (Onset)
              </label>
              <div className="flex gap-1">
                {(['เฉียบพลัน (Acute)', 'ค่อยเป็นค่อยไป (Gradual)'] as const).map(on => (
                  <button
                    key={on}
                    type="button"
                    onClick={() => onChange({ onset: on })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.onset || 'ค่อยเป็นค่อยไป (Gradual)') === on
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {on}
                  </button>
                ))}
              </div>
            </div>

            {/* Course */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                การดำเนินโรค (Course)
              </label>
              <div className="flex flex-wrap gap-1">
                {(['ดีขึ้นสลับแย่ลง (Fluctuating)', 'แย่ลงเรื่อยๆ (Progressive)', 'คงที่ (Stable)'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange({ course: c })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.course || 'แย่ลงเรื่อยๆ (Progressive)') === c
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Precipitating Factors & Associated Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                ปัจจัยกระตุ้น (Precipitating factors)
              </label>
              <SearchableTokenMultiSelect
                options={[
                  'ปัญหาครอบครัว/ความสัมพันธ์',
                  'การเงิน/การงาน',
                  'ขาดยา',
                  'ใช้สารเสพติด',
                  'โรคทางกายกำเริบ',
                  'ไม่พบปัจจัยชัดเจน',
                ]}
                selected={data.precipitatingFactors || []}
                onToggle={item => toggleArrayItem('precipitatingFactors', item)}
                placeholder="เลือกหรือค้นหาปัจจัยกระตุ้น..."
                searchPlaceholder="ค้นหาปัจจัยกระตุ้น..."
                tokenColorClass="bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                อาการร่วมที่สำคัญ (Associated symptoms)
              </label>
              <SearchableTokenMultiSelect
                options={[
                  'นอนไม่หลับ',
                  'เบื่ออาหาร',
                  'น้ำหนักลด/เพิ่ม',
                  'อ่อนเพลีย',
                  'แยกตัว',
                  'พฤติกรรมแปลกไปจากเดิม',
                ]}
                selected={data.associatedSymptoms || []}
                onToggle={item => toggleArrayItem('associatedSymptoms', item)}
                placeholder="เลือกหรือค้นหาอาการร่วม..."
                searchPlaceholder="ค้นหาอาการร่วม..."
                tokenColorClass="bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100"
              />
            </div>
          </div>

          {/* Detailed HPI text */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                รายละเอียดประวัติปัจจุบันเพิ่มเติม (HPI Details)
              </label>
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
              <div className="flex flex-wrap gap-1">
                {(['ไม่เคยรักษาจิตเวชมาก่อน', 'เคยรักษา'] as const).map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => {
                      onChange({
                        previousTreatment: pt,
                        ...(pt === 'ไม่เคยรักษาจิตเวชมาก่อน' ? { previousHospital: '', previousResponse: '' } : {}),
                      });
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      (data.previousTreatment || 'ไม่เคยรักษาจิตเวชมาก่อน') === pt
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
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
                  <div className="flex flex-wrap gap-1">
                    {(['ร่วมมือดี อาการสงบ', 'ขาดยาบ่อย', 'ปฏิเสธการเจ็บป่วย/ไม่ยอมทานยา'] as const).map(resp => (
                      <button
                        key={resp}
                        type="button"
                        onClick={() => onChange({ previousResponse: resp })}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          data.previousResponse === resp
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {resp}
                      </button>
                    ))}
                  </div>
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
