import { PsychiatricAssessment } from '../types/assessment';
import { encryptAtRest, decryptAtRest } from './crypto';

export const FORM_DRAFT_KEY = 'ha_form_current_draft';
export const LOCAL_HISTORY_KEY = 'ha_form_saved_records_history';

export interface FormDraftPayload {
  data: PsychiatricAssessment;
  savedAt: string;
}

export interface SavedRecordItem {
  id: string;
  hn: string;
  fullName: string;
  age: string;
  department: string;
  admissionType: string;
  primaryDiagnosis: string;
  assessmentDate: string;
  savedAt: string;
  data: PsychiatricAssessment;
}

// ----------------------------------------------------
// Active Draft Handling
// ----------------------------------------------------

export const saveFormDraft = async (data: PsychiatricAssessment): Promise<boolean> => {
  try {
    const payload: FormDraftPayload = {
      data,
      savedAt: new Date().toISOString(),
    };
    const plaintext = JSON.stringify(payload);
    const encrypted = await encryptAtRest(plaintext);
    localStorage.setItem(FORM_DRAFT_KEY, encrypted);

    // Also auto-checkpoint to local history if it has significant content
    const hasContent = Boolean(data.hn?.trim() || data.fullName?.trim());
    if (hasContent) {
      await saveToLocalHistory(data);
    }

    return true;
  } catch (error) {
    console.error('Error saving encrypted form draft:', error);
    return false;
  }
};

export const loadFormDraft = async (): Promise<FormDraftPayload | null> => {
  try {
    const raw = localStorage.getItem(FORM_DRAFT_KEY);
    if (!raw) return null;

    let plaintext = '';
    if (raw.trim().startsWith('{')) {
      plaintext = raw;
    } else {
      plaintext = await decryptAtRest(raw);
    }

    const parsed = JSON.parse(plaintext);
    if (parsed && parsed.data) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Error loading or decrypting form draft:', error);
    clearFormDraft();
    return null;
  }
};

export const clearFormDraft = (): void => {
  try {
    localStorage.removeItem(FORM_DRAFT_KEY);
  } catch (error) {
    console.error('Error clearing form draft:', error);
  }
};

// ----------------------------------------------------
// Multi-Record Local Storage History (Browser Only - 100% Private)
// ----------------------------------------------------

export const loadLocalHistory = async (): Promise<SavedRecordItem[]> => {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (!raw) return [];

    let plaintext = '';
    if (raw.trim().startsWith('[')) {
      plaintext = raw;
    } else {
      plaintext = await decryptAtRest(raw);
    }

    const items: SavedRecordItem[] = JSON.parse(plaintext);
    if (Array.isArray(items)) {
      // Sort newest first
      return items.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    }
    return [];
  } catch (error) {
    console.error('Error loading local history:', error);
    return [];
  }
};

export const saveToLocalHistory = async (data: PsychiatricAssessment): Promise<boolean> => {
  try {
    const cleanHn = data.hn?.trim();
    const cleanName = data.fullName?.trim() || 'ผู้ป่วยไม่ระบุชื่อ';
    const dateStr = data.assessmentDate || new Date().toISOString().split('T')[0];
    const recordId = cleanHn ? `rec_hn_${cleanHn}_${dateStr}` : `rec_patient_${cleanName}_${dateStr}`;

    const currentList = await loadLocalHistory();

    const newRecord: SavedRecordItem = {
      id: recordId,
      hn: cleanHn || 'ไม่ระบุ HN',
      fullName: cleanName,
      age: data.age?.trim() || '',
      department: data.department?.trim() || 'จิตเวชศาสตร์',
      admissionType: data.admissionType || 'OPD',
      primaryDiagnosis: data.primaryDiagnosis?.trim() || 'ยังไม่ระบุการวินิจฉัย',
      assessmentDate: dateStr,
      savedAt: new Date().toISOString(),
      data: { ...data },
    };

    // Filter out previous version of this specific patient's record on the same date or update it
    const filtered = currentList.filter(item => item.id !== recordId);
    const updatedList = [newRecord, ...filtered].slice(0, 50); // Keep last 50 records in local storage

    const plaintext = JSON.stringify(updatedList);
    const encrypted = await encryptAtRest(plaintext);
    localStorage.setItem(LOCAL_HISTORY_KEY, encrypted);
    return true;
  } catch (error) {
    console.error('Error saving to local history:', error);
    return false;
  }
};

export const deleteFromLocalHistory = async (id: string): Promise<boolean> => {
  try {
    const currentList = await loadLocalHistory();
    const updatedList = currentList.filter(item => item.id !== id);

    const plaintext = JSON.stringify(updatedList);
    const encrypted = await encryptAtRest(plaintext);
    localStorage.setItem(LOCAL_HISTORY_KEY, encrypted);
    return true;
  } catch (error) {
    console.error('Error deleting item from local history:', error);
    return false;
  }
};

export const clearAllLocalHistory = async (): Promise<boolean> => {
  try {
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing all local history:', error);
    return false;
  }
};
