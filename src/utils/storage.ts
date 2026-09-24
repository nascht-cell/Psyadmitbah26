import { PsychiatricAssessment } from '../types/assessment';
import { encryptAtRest, decryptAtRest } from './crypto';

export const FORM_DRAFT_KEY = 'ha_form_current_draft';

export interface FormDraftPayload {
  data: PsychiatricAssessment;
  savedAt: string;
}

export const saveFormDraft = async (data: PsychiatricAssessment): Promise<boolean> => {
  try {
    const payload: FormDraftPayload = {
      data,
      savedAt: new Date().toISOString(),
    };
    const plaintext = JSON.stringify(payload);
    const encrypted = await encryptAtRest(plaintext);
    localStorage.setItem(FORM_DRAFT_KEY, encrypted);
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
    // Backward compatibility check: if it starts with '{' it is plaintext draft, else decrypt
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
    // Automatically clear corrupted or undecryptable drafts for security
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
