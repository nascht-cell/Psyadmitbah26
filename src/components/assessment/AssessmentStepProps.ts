import { PsychiatricAssessment } from '../../types/assessment';

export interface AssessmentStepProps {
  data: PsychiatricAssessment;
  onChange: (updated: Partial<PsychiatricAssessment>) => void;
  errors: Record<string, string>;
  onBlurField?: (fieldKey: string, value: any) => void;
  onApplyExtractedData?: (extractedData: Partial<PsychiatricAssessment>) => void;
  onApplyWnlMse?: () => void;
  onApplyWnlPhysical?: () => void;
  toggleArrayItem: (field: keyof PsychiatricAssessment, item: string) => void;
  toggleMseItem: (field: keyof PsychiatricAssessment, item: string) => void;
  handleDurationChange: (dur: string) => void;
  handleSuicideRiskChange: (risk: 'No Risk' | 'Low Risk' | 'Moderate Risk' | 'High Risk') => void;
  handleViolenceRiskChange: (risk: 'No Risk' | 'Low Risk' | 'Moderate Risk' | 'High Risk') => void;
}
