export interface PsychiatricAssessment {
  id: string; // unique record ID (or HN_timestamp)
  createdAt: string;
  updatedAt: string;

  // Header
  hospitalName: string; // กองจิตเวชและประสาทวิทยา โรงพยาบาลภูมิพลอดุลยเดช
  department: string; // จิตเวชศาสตร์
  assessmentDate: string; // วันที่
  assessmentTime: string; // เวลา
  admissionType: 'OPD' | 'IPD' | 'ER' | ''; // ประเภทการรับผู้ป่วย

  // Section A: Patient Identification
  fullName: string;
  age: string;
  gender: 'ชาย' | 'หญิง' | 'อื่นๆ' | '';
  hn: string;
  an: string;
  maritalStatus: 'โสด' | 'สมรส' | 'คู่' | 'หม้าย/หย่า/แยก' | '';
  occupation: string;
  educationLevel: string;
  informant: 'ผู้ป่วยเอง' | 'ญาติ/ผู้ดูแล' | '';
  informantDetail: string; // ระบุความเกี่ยวข้อง
  reliability: 'ดี (Good)' | 'พอใช้ (Fair)' | 'เชื่อถือไม่ได้ (Poor)' | '';

  // Section B: Chief Complaint & History of Present Illness
  chiefComplaint: string[]; // ซึมเศร้า/ท้อแท้, หงุดหงิด/ก้าวร้าว, หูแว่ว/ประสาทหลอน, etc.
  chiefComplaintOther: string;
  duration: '1 วัน' | '< 1 สัปดาห์' | '1-4 สัปดาห์' | '1-6 เดือน' | '> 6 เดือน' | '';
  onset: 'เฉียบพลัน (Acute)' | 'ค่อยเป็นค่อยไป (Gradual)' | '';
  course: 'ดีขึ้นสลับแย่ลง (Fluctuating)' | 'แย่ลงเรื่อยๆ (Progressive)' | 'คงที่ (Stable)' | '';
  precipitatingFactors: string[]; // ปัญหาครอบครัว/ความสัมพันธ์, การเงิน/การงาน, etc.
  precipitatingFactorsOther?: string;
  associatedSymptoms: string[]; // นอนไม่หลับ, เบื่ออาหาร, น้ำหนักลด/เพิ่ม, etc.
  hpiDetails: string;
  previousTreatment: 'ไม่เคยรักษาจิตเวชมาก่อน' | 'เคยรักษา' | '';
  previousHospital: string;
  previousResponse: 'ร่วมมือดี อาการสงบ' | 'ขาดยาบ่อย' | 'ปฏิเสธการเจ็บป่วย/ไม่ยอมทานยา' | '';

  // Section C: Psychiatric / Medical / Medication History
  psychiatricHistory: 'ไม่มีประวัติ' | 'มีประวัติ' | '';
  psychiatricDisorders: string[]; // Depressive d/o, Bipolar d/o, etc.
  psychiatricDisorderOther: string;
  admitHistory: 'ไม่เคย' | 'เคย' | '';
  admitLastYear: string;
  medicalHistory: 'ไม่มีโรคประจำตัว' | 'มีโรคประจำตัว' | '';
  medicalConditions: string[]; // HT, DM, DLP, Thyroid, Epilepsy/Seizure, Stroke/Neuro, Heart disease, CKD, etc.
  medicalHistoryOther: string;
  allergy: 'ปฏิเสธการแพ้' | 'แพ้' | '';
  allergyDetail: string;
  substanceHistory: 'ปฏิเสธการใช้' | 'มีประวัติ' | '';
  alcoholUse: 'นานๆ ครั้ง' | 'ดื่มประจำ/ติด' | 'เพิ่งดื่มล่าสุด < 24 ชม.' | '';
  smokingUse: 'นานๆ ครั้ง' | 'สูบประจำ' | '';
  cigarettesPerDay: string;
  methUse: 'เคยใช้ในอดีต (เลิกแล้ว)' | 'ปัจจุบันยังใช้' | 'เพิ่งใช้ล่าสุด < 24 ชม.' | '';
  otherSubstances: string[]; // กัญชา, กระท่อม, สารระเหย, Opioid, สารอื่นๆ
  otherSubstancesDetail: string;

  // Section D: Mental Status Examination
  appearanceBehavior: string[]; // Normal, Unkempt, Restless/Agitated, Retarded, Uncooperative, EPS
  speech: string[]; // Normal, Talkative/Pressured, Slow/Poverty of speech, Mute, Slurred
  moodAffect: string[]; // Euthymic, Depressed, Irritable/Angry, Elevated/Expansive, Blunted/Flat, Inappropriate
  thoughtProcess: string[]; // Logical/Coherent, Circumstantial, Tangential, Flight of ideas, Loosening of association
  thoughtContent: string[]; // Normal, Delusion, Obsession/Compulsion, Phobia, Suicidal ideation
  delusionDetail: string;
  perception: string[]; // Normal, Auditory Hallucination, Visual Hallucination, Illusion, Depersonalization
  orientationTime: boolean;
  orientationPlace: boolean;
  orientationPerson: boolean;
  attentionMemory: 'Intact' | 'Impaired' | '';
  insight: '1(Denial)' | '2' | '3' | '4' | '5' | '6(True)' | '';
  judgment: 'Intact' | 'Impaired' | '';

  // Section E: Safety & Risk Assessment
  suicideRisk: 'No Risk' | 'Low Risk' | 'Moderate Risk' | 'High Risk' | '';
  violenceRisk: 'No Risk' | 'Low Risk' | 'Moderate Risk' | 'High Risk' | '';
  otherRisks: string[]; // Falls, Wandering/Elopement, Abuse/Neglect, Medication ADR, None
  safetyPlan: string[]; // Admit สังเกตอาการใกล้ชิด, แจ้งญาติดูแล 24 ชม., Restraint/Seclusion, อื่นๆ
  safetyPlanOther: string;

  // Section F: Physical & Functional Assessment
  bpSys: string;
  bpDia: string;
  pulseRate: string;
  respRate: string;
  temperature: string;
  spo2: string;
  painScore: string; // 'No pain' or number 0-10
  generalAppearance: 'Normal' | 'Abnormal' | '';
  generalAppearanceDetail: string;
  heent: 'Normal' | 'Abnormal' | '';
  heentDetail: string;
  cvsRs: 'Normal' | 'Abnormal' | '';
  cvsRsDetail: string;
  abdomen: 'Normal' | 'Abnormal' | '';
  abdomenDetail: string;
  extremities: 'Normal' | 'Abnormal' | '';
  extremitiesDetail: string;
  cranialNerves: 'Grossly intact' | 'Abnormal' | '';
  cranialNervesDetail: string;
  motorPower: 'Grade V all' | 'Abnormal' | '';
  motorPowerDetail: string;
  tone: 'Normal' | 'Rigidity' | 'Spasticity' | 'Flaccid' | '';
  toneDetail?: string;
  sensory: 'Intact' | 'Impaired' | '';
  sensoryDetail: string;
  reflexes: 'Normal' | 'Hyperreflexia' | 'Hyporeflexia' | 'Abnormal' | '';
  reflexesDetail: string;
  cerebellar: 'Normal' | 'Abnormal' | '';
  cerebellarDetail: string;
  motorSensory?: 'Grossly intact' | 'Abnormal' | '';
  motorSensoryDetail?: string;
  reflexesCerebellar?: 'Normal' | 'Abnormal' | '';
  reflexesCerebellarDetail?: string;
  nutrition: 'Normal' | 'Impaired' | '';
  sleep?: 'Normal' | 'Impaired' | '';
  adl: 'Independent' | 'Dependent' | '';

  // Section G: Psychosocial Assessment
  psychosocialStressors: string[]; // ปัญหาความสัมพันธ์/ครอบครัว, ปัญหาการเงิน/หนี้สิน, etc.
  livingEnvironment: 'ปลอดภัยและเหมาะสม' | 'ไม่ปลอดภัย/ไม่เหมาะสมต่อการฟื้นฟู' | '';
  livingEnvironmentDetail: string;

  // Section H: Standardized Assessment
  standardizedAssessmentStatus: 'ไม่ได้ประเมิน' | 'ประเมิน' | '';
  phq9Score: string;
  nineQScore: string;
  mmseMocaScore: string;
  otherToolName: string;
  otherToolScore: string;

  // Section I: Investigation
  investigationStatus: 'ไม่จำเป็นต้องส่งตรวจ' | 'ส่งตรวจ Lab' | '';
  labTests: string[]; // CBC, BUN/Cr, Electrolyte, LFT, TFT, U-Tox (สารเสพติด), VDRL/Anti-HIV, อื่นๆ
  labOther: string;
  neuroimaging: string;

  // Section J: Diagnosis
  diagnosticCategory: string[]; // F00-F09, F10-F19, F20-F29, F30-F39, F40-F48, อื่นๆ
  diagnosticCategoryOther: string;
  primaryDiagnosis: string; // ICD-10 & Detail
  differentialDiagnosis: string;
  comorbidDiagnosis: string;

  // Section K: Care Plan & Medical Intervention
  pharmPlan: 'ไม่มีการสั่งยาจิตเวช' | 'มียาจิตเวชเดิม (ไม่ปรับเปลี่ยน)' | 'ปรับ/เริ่มยาใหม่' | '';
  medicationGroups: string[]; // Antidepressants, Antipsychotics, Mood Stabilizers, Anxiolytics/Sedatives, Anticholinergics (แก้ EPS), อื่นๆ
  medicationDetails: string;
  nonPharmTreatments: string[]; // Psychoeducation, Supportive Psychotherapy, CBT / Specific Psychotherapy, Family Therapy / Counseling
  mdtConsult: 'ไม่ส่ง' | 'ส่ง' | '';
  mdtRoles: string[]; // นักจิตวิทยาคลินิก, นักสังคมสงเคราะห์, นักกิจกรรมบำบัด, แพทย์เฉพาะทางอื่นๆ
  mdtOther: string;

  // Section L: Patient & Family Involvement
  explainedDiagnosis: boolean;
  explainedCarePlan: boolean;
  explainedSideEffects: boolean;
  explainedWarningSigns: boolean;
  concernsStatus: 'ไม่มี' | 'มี' | '';
  concernsDetail: string;

  // Section M: Indication for Admission & Follow-up Plan
  admissionIndications: string[]; // เป็นอันตรายต่อตนเอง, เป็นอันตรายต่อผู้อื่น, ผลการรักษาแบบผู้ป่วยนอกล้มเหลว, ต้องการการปรับยาหรือเฝ้าระวังผลข้างเคียงอย่างใกล้ชิด
  disposition: 'รับไว้รักษาต่อที่ รพ. (IPD)' | 'นัดติดตามอาการ (OPD)' | 'Refer' | '';
  referTo: string;
  followUpDate: string;
  reassessmentFocus: string[]; // อาการทางจิตเวช, ผลข้างเคียงยา, ความเสี่ยงการทำร้ายตนเอง/ผู้อื่น, ผล Lab
  physicianName: string;
  licenseNumber: string;
  signatureText: string;
  assessmentDateTimeDone: string;
  allowPage4?: boolean;
}

export const initialAssessmentData: PsychiatricAssessment = {
  id: '',
  createdAt: '',
  updatedAt: '',
  hospitalName: 'กองจิตเวชและประสาทวิทยา โรงพยาบาลภูมิพลอดุลยเดช',
  department: 'จิตเวชศาสตร์',
  assessmentDate: new Date().toISOString().split('T')[0],
  assessmentTime: new Date().toTimeString().slice(0, 5),
  admissionType: 'OPD',

  // Section A
  fullName: '',
  age: '',
  gender: '',
  hn: '',
  an: '',
  maritalStatus: 'โสด',
  occupation: '',
  educationLevel: 'มัธยมศึกษา',
  informant: 'ผู้ป่วยเอง',
  informantDetail: '',
  reliability: 'ดี (Good)',

  // Section B
  chiefComplaint: [],
  chiefComplaintOther: '',
  duration: '',
  onset: 'ค่อยเป็นค่อยไป (Gradual)',
  course: 'แย่ลงเรื่อยๆ (Progressive)',
  precipitatingFactors: [],
  precipitatingFactorsOther: '',
  associatedSymptoms: [],
  hpiDetails: '',
  previousTreatment: 'ไม่เคยรักษาจิตเวชมาก่อน',
  previousHospital: '',
  previousResponse: '',

  // Section C
  psychiatricHistory: 'ไม่มีประวัติ',
  psychiatricDisorders: [],
  psychiatricDisorderOther: '',
  admitHistory: 'ไม่เคย',
  admitLastYear: '',
  medicalHistory: 'ไม่มีโรคประจำตัว',
  medicalConditions: [],
  medicalHistoryOther: '',
  allergy: 'ปฏิเสธการแพ้',
  allergyDetail: '',
  substanceHistory: 'ปฏิเสธการใช้',
  alcoholUse: '',
  smokingUse: '',
  cigarettesPerDay: '',
  methUse: '',
  otherSubstances: [],
  otherSubstancesDetail: '',

  // Section D
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
  attentionMemory: 'Impaired',
  insight: '6(True)',
  judgment: 'Impaired',

  // Section E
  suicideRisk: 'No Risk',
  violenceRisk: 'No Risk',
  otherRisks: ['None'],
  safetyPlan: [],
  safetyPlanOther: '',

  // Section F
  bpSys: '120',
  bpDia: '80',
  pulseRate: '76',
  respRate: '18',
  temperature: '36.6',
  spo2: '99',
  painScore: 'No pain',
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
  motorSensory: 'Grossly intact',
  motorSensoryDetail: '',
  reflexesCerebellar: 'Normal',
  reflexesCerebellarDetail: '',
  nutrition: 'Normal',
  sleep: 'Normal',
  adl: 'Independent',

  // Section G
  psychosocialStressors: ['ไม่มี/ไม่ชัดเจน'],
  livingEnvironment: 'ปลอดภัยและเหมาะสม',
  livingEnvironmentDetail: '',

  // Section H
  standardizedAssessmentStatus: 'ไม่ได้ประเมิน',
  phq9Score: '',
  nineQScore: '',
  mmseMocaScore: '',
  otherToolName: '',
  otherToolScore: '',

  // Section I
  investigationStatus: 'ไม่จำเป็นต้องส่งตรวจ',
  labTests: [],
  labOther: '',
  neuroimaging: '',

  // Section J
  diagnosticCategory: [],
  diagnosticCategoryOther: '',
  primaryDiagnosis: '',
  differentialDiagnosis: '',
  comorbidDiagnosis: '',

  // Section K
  pharmPlan: 'ไม่มีการสั่งยาจิตเวช',
  medicationGroups: [],
  medicationDetails: '',
  nonPharmTreatments: ['Psychoeducation'],
  mdtConsult: 'ไม่ส่ง',
  mdtRoles: [],
  mdtOther: '',

  // Section L
  explainedDiagnosis: true,
  explainedCarePlan: true,
  explainedSideEffects: true,
  explainedWarningSigns: true,
  concernsStatus: 'ไม่มี',
  concernsDetail: '',

  // Section M
  admissionIndications: [],
  disposition: 'นัดติดตามอาการ (OPD)',
  referTo: '',
  followUpDate: '',
  reassessmentFocus: ['อาการทางจิตเวช'],
  physicianName: '',
  licenseNumber: '',
  signatureText: '',
  assessmentDateTimeDone: `${new Date().toLocaleDateString('th-TH')} ${new Date().toTimeString().slice(0, 5)} น.`,
  allowPage4: false,
};

export const samplePatientData: PsychiatricAssessment = {
  ...initialAssessmentData,
  id: '67001234',
  hn: '67001234',
  an: '',
  fullName: 'นายสมศักดิ์ รักสงบ',
  age: '38',
  gender: 'ชาย',
  maritalStatus: 'สมรส',
  occupation: 'พนักงานบริษัทเอกชน',
  educationLevel: 'ปริญญาตรี',
  informant: 'ผู้ป่วยเอง',
  reliability: 'ดี (Good)',
  admissionType: 'OPD',
  assessmentDate: new Date().toISOString().split('T')[0],
  assessmentTime: '09:30',

  chiefComplaint: ['ซึมเศร้า/ท้อแท้', 'ทำร้ายตนเอง'],
  chiefComplaintOther: '',
  duration: '1-4 สัปดาห์',
  onset: 'เฉียบพลัน (Acute)',
  course: 'แย่ลงเรื่อยๆ (Progressive)',
  precipitatingFactors: ['การเงิน/การงาน', 'ปัญหาครอบครัว/ความสัมพันธ์'],
  associatedSymptoms: ['นอนไม่หลับ', 'เบื่ออาหาร', 'อ่อนเพลีย'],
  hpiDetails: 'ผู้ป่วยมีอาการซึมเศร้า ท้อแท้ เบื่อหน่าย ไม่อยากทำอะไรมาประมาณ 3 สัปดาห์ รู้สึกหมดพลังในการทำงาน เบื่ออาหาร น้ำหนักลดลง 2 กก. มีความคิดทำร้ายตนเอง มีความเครียดจากงานที่เพิ่มขึ้นและภาระค่าใช้จ่าย',
  previousTreatment: 'ไม่เคยรักษาจิตเวชมาก่อน',

  psychiatricHistory: 'ไม่มีประวัติ',
  admitHistory: 'ไม่เคย',
  medicalHistory: 'มีโรคประจำตัว',
  medicalConditions: ['DLP'],
  allergy: 'ปฏิเสธการแพ้',
  substanceHistory: 'มีประวัติ',
  alcoholUse: 'นานๆ ครั้ง',
  smokingUse: 'นานๆ ครั้ง',

  appearanceBehavior: ['Poor hygiene', 'Restless/Agitated'],
  speech: ['Slow/Poverty of speech'],
  moodAffect: ['Depressed'],
  thoughtProcess: ['Circumstantial'],
  thoughtContent: ['Suicidal ideation'],
  perception: ['Normal'],
  orientationTime: true,
  orientationPlace: true,
  orientationPerson: true,
  attentionMemory: 'Impaired',
  insight: '5',
  judgment: 'Impaired',

  suicideRisk: 'Moderate Risk',
  violenceRisk: 'No Risk',
  otherRisks: ['Escape'],
  safetyPlan: ['แจ้งญาติดูแล 24 ชม.', 'Admit สังเกตอาการใกล้ชิด'],

  bpSys: '128',
  bpDia: '82',
  pulseRate: '78',
  respRate: '18',
  temperature: '36.5',
  spo2: '98',
  painScore: 'No pain',

  psychosocialStressors: ['ปัญหาการเงิน/หนี้สิน', 'ปัญหาการงาน/การเรียน'],
  livingEnvironment: 'ปลอดภัยและเหมาะสม',

  standardizedAssessmentStatus: 'ประเมิน',
  phq9Score: '14',
  nineQScore: '13',

  investigationStatus: 'ส่งตรวจ Lab',
  labTests: ['CBC', 'BUN/Cr', 'Electrolyte', 'LFT', 'TFT'],

  diagnosticCategory: ['F30-F39 Mood d/o'],
  primaryDiagnosis: 'Major Depressive Disorder, Single Episode, Moderate (F32.1)',
  differentialDiagnosis: 'Adjustment disorder with depressed mood (F43.21)',

  pharmPlan: 'ปรับ/เริ่มยาใหม่',
  medicationGroups: ['Antidepressants', 'Anxiolytics/Sedatives'],
  medicationDetails: 'Sertraline (50 mg) 1 tab po pc morning, Lorazepam (0.5 mg) 1 tab po hs prn for insomnia',
  nonPharmTreatments: ['Psychoeducation', 'Supportive Psychotherapy', 'CBT / Specific Psychotherapy'],
  mdtConsult: 'ส่ง',
  mdtRoles: ['นักจิตวิทยาคลินิก'],

  explainedDiagnosis: true,
  explainedCarePlan: true,
  explainedSideEffects: true,
  explainedWarningSigns: true,
  concernsStatus: 'มี',
  concernsDetail: 'กังวลเรื่องการติดยาคลายกังวล และระยะเวลาการทานยาต้านเศร้า',

  disposition: 'นัดติดตามอาการ (OPD)',
  followUpDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  reassessmentFocus: ['อาการทางจิตเวช', 'ผลข้างเคียงยา', 'ความเสี่ยงการทำร้ายตนเอง/ผู้อื่น'],
  physicianName: 'พญ. นภาพร แพทย์เวชกรรม',
  licenseNumber: 'ว. 45892',
  signatureText: 'พญ. นภาพร แพทย์เวชกรรม',
  allowPage4: false,
};
