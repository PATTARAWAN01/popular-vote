import {
  db,
  DEFAULT_SETTINGS,
  INITIAL_CANDIDATES,
  INITIAL_STUDENTS,
  isFirebaseConfigured,
} from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  increment,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { Candidate, Category, Student, SystemSettings, VoteLog } from '@/types';
import {
  getOrCreateDeviceToken,
  hasDeviceVotedForCategory,
  markDeviceVotedForCategory,
  getVoterPublicIp,
} from './device';

const STORAGE_KEY_CANDIDATES = 'popular_vote_candidates';
const STORAGE_KEY_STUDENTS = 'popular_vote_students';
const STORAGE_KEY_SETTINGS = 'popular_vote_settings';
const STORAGE_KEY_VOTES = 'popular_vote_votes';
const STORAGE_KEY_INITIALIZED = 'popular_vote_initialized';
const STORAGE_KEY_LAST_IMPORT = 'popular_vote_last_import_time';

// --- Local Storage Helpers ---
function getLocalCandidates(): Candidate[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY_CANDIDATES);
  const isInit = localStorage.getItem(STORAGE_KEY_INITIALIZED);

  if (!stored && !isInit) {
    localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    return INITIAL_CANDIDATES;
  }

  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalCandidates(candidates: Candidate[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    window.dispatchEvent(new Event('local-candidates-update'));
  }
}

export function getLocalStudents(): Record<string, Student> {
  if (typeof window === 'undefined') return INITIAL_STUDENTS;
  const stored = localStorage.getItem(STORAGE_KEY_STUDENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_STUDENTS;
  }
}

function saveLocalStudents(students: Record<string, Student>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    window.dispatchEvent(new Event('local-students-update'));
  }
}

function getLocalSettings(): SystemSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveLocalSettings(settings: SystemSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('local-settings-update'));
  }
}

export function getLocalVoteLogs(): VoteLog[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_VOTES) || '[]');
  } catch {
    return [];
  }
}

// --- Realtime Subscriptions ---

export function subscribeCandidates(callback: (candidates: Candidate[]) => void) {
  if (isFirebaseConfigured()) {
    const candidatesRef = collection(db, 'candidates');
    return onSnapshot(
      candidatesRef,
      (snapshot) => {
        const list: Candidate[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Candidate);
        });
        list.sort((a, b) => a.candidateNumber.localeCompare(b.candidateNumber));
        callback(list);
      },
      (error) => {
        console.warn('Firestore error, falling back to local:', error);
        callback(getLocalCandidates());
      }
    );
  } else {
    const handler = () => callback(getLocalCandidates());
    window.addEventListener('local-candidates-update', handler);
    callback(getLocalCandidates());
    return () => window.removeEventListener('local-candidates-update', handler);
  }
}

export function subscribeSettings(callback: (settings: SystemSettings) => void) {
  if (isFirebaseConfigured()) {
    const settingsRef = doc(db, 'settings', 'config');
    return onSnapshot(
      settingsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as SystemSettings);
        } else {
          setDoc(settingsRef, DEFAULT_SETTINGS);
          callback(DEFAULT_SETTINGS);
        }
      },
      (error) => {
        console.warn('Firestore settings error, fallback local:', error);
        callback(getLocalSettings());
      }
    );
  } else {
    const handler = () => callback(getLocalSettings());
    window.addEventListener('local-settings-update', handler);
    callback(getLocalSettings());
    return () => window.removeEventListener('local-settings-update', handler);
  }
}

export function subscribeStudents(callback: (students: Student[]) => void) {
  if (isFirebaseConfigured()) {
    const studentsRef = collection(db, 'students');
    return onSnapshot(
      studentsRef,
      (snapshot) => {
        const list: Student[] = [];
        snapshot.forEach((doc) => {
          list.push({ studentId: doc.id, ...doc.data() } as Student);
        });
        list.sort((a, b) => a.studentId.localeCompare(b.studentId));
        callback(list);
      },
      (error) => {
        console.warn('Firestore students error, fallback local:', error);
        const map = getLocalStudents();
        callback(Object.values(map));
      }
    );
  } else {
    const handler = () => callback(Object.values(getLocalStudents()));
    window.addEventListener('local-students-update', handler);
    callback(Object.values(getLocalStudents()));
    return () => window.removeEventListener('local-students-update', handler);
  }
}

export function subscribeVoteLogs(callback: (votes: VoteLog[]) => void) {
  if (isFirebaseConfigured()) {
    const votesQuery = query(collection(db, 'votes'), orderBy('timestamp', 'desc'), limit(200));
    return onSnapshot(
      votesQuery,
      (snapshot) => {
        const list: VoteLog[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as VoteLog);
        });
        callback(list);
      },
      (error) => {
        console.warn('Firestore votes log error:', error);
        callback(getLocalVoteLogs());
      }
    );
  } else {
    callback(getLocalVoteLogs());
    return () => {};
  }
}

// --- Student ID & Device Check ---

export async function verifyStudentId(
  studentId: string,
  category: Category
): Promise<{ valid: boolean; studentName?: string; alreadyVoted: boolean; errorMsg?: string }> {
  const cleanId = studentId.trim();
  if (!/^\d{5}$/.test(cleanId)) {
    return { valid: false, alreadyVoted: false, errorMsg: 'กรุณากรอกรหัสนักเรียน 5 หลักให้ถูกต้อง' };
  }

  // 1. Device Token Restriction Check
  if (hasDeviceVotedForCategory(category)) {
    return {
      valid: false,
      alreadyVoted: true,
      errorMsg: `🚫 โทรศัพท์เครื่องนี้ได้ใช้สิทธิ์โหวตในระดับ ${
        category === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'
      } ไปแล้ว (ไม่สามารถใช้เครื่องเดิมโหวตรหัสนักเรียนอื่นซ้ำได้)`,
    };
  }

  // 2. Student Whitelist Check
  if (isFirebaseConfigured()) {
    try {
      const studentDocRef = doc(db, 'students', cleanId);
      const docSnap = await getDoc(studentDocRef);

      if (!docSnap.exists()) {
        return {
          valid: false,
          alreadyVoted: false,
          errorMsg: `ไม่พบรหัสนักเรียน ${cleanId} ในระบบ (กรุณาติดต่อแอดมินหรือครูผู้ดูแล)`,
        };
      }

      const data = docSnap.data() as Student;
      const alreadyVoted = category === 'junior' ? !!data.hasVotedJunior : !!data.hasVotedSenior;

      return {
        valid: true,
        studentName: data.name || `นักเรียนรหัส ${cleanId}`,
        alreadyVoted,
        errorMsg: alreadyVoted
          ? `รหัสนักเรียน ${cleanId} ได้ใช้สิทธิ์โหวตในระดับ ${category === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'} ไปแล้ว`
          : undefined,
      };
    } catch (e) {
      console.warn('Error checking Firestore student:', e);
    }
  }

  const students = getLocalStudents();
  const student = students[cleanId];
  if (!student) {
    return {
      valid: false,
      alreadyVoted: false,
      errorMsg: `ไม่พบรหัสนักเรียน ${cleanId} ในระบบ (กรุณาติดต่อแอดมินหรือครูผู้ดูแล)`,
    };
  }

  const alreadyVoted = category === 'junior' ? !!student.hasVotedJunior : !!student.hasVotedSenior;
  return {
    valid: true,
    studentName: student.name || `นักเรียนรหัส ${cleanId}`,
    alreadyVoted,
    errorMsg: alreadyVoted
      ? `รหัสนักเรียน ${cleanId} ได้ใช้สิทธิ์โหวตในระดับ ${category === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'} ไปแล้ว`
      : undefined,
  };
}

/**
 * Cast a vote with Device Token & IP Address logging
 */
export async function submitVote(
  studentId: string,
  candidateId: string,
  category: Category,
  voterLat: number,
  voterLng: number,
  distanceMeters: number
): Promise<{ success: boolean; message: string }> {
  const cleanId = studentId.trim();
  const deviceToken = getOrCreateDeviceToken();
  const voterIp = await getVoterPublicIp();

  const candidates = getLocalCandidates();
  const targetCandidate = candidates.find((c) => c.id === candidateId);

  markDeviceVotedForCategory(category);

  if (isFirebaseConfigured()) {
    try {
      const candidateRef = doc(db, 'candidates', candidateId);
      const studentRef = doc(db, 'students', cleanId);
      const updateField = category === 'junior' ? { hasVotedJunior: true } : { hasVotedSenior: true };

      // Execute all 3 Firestore write operations concurrently for maximum speed!
      await Promise.all([
        updateDoc(candidateRef, { voteCount: increment(1) }),
        updateDoc(studentRef, updateField),
        addDoc(collection(db, 'votes'), {
          studentId: cleanId,
          candidateId,
          candidateNumber: targetCandidate?.candidateNumber || '',
          candidateName: targetCandidate?.name || '',
          category,
          voterLat,
          voterLng,
          distanceMeters,
          deviceToken,
          voterIp,
          timestamp: serverTimestamp(),
        }),
      ]);

      return { success: true, message: 'ลงคะแนนโหวตสำเร็จ! ขอบคุณสำหรับการโหวต' };
    } catch (err: any) {
      console.error('Error submitting vote to Firestore:', err);
    }
  }

  const targetIndex = candidates.findIndex((c) => c.id === candidateId);
  if (targetIndex !== -1) {
    candidates[targetIndex].voteCount = (candidates[targetIndex].voteCount || 0) + 1;
    saveLocalCandidates(candidates);
  }

  const students = getLocalStudents();
  if (students[cleanId]) {
    if (category === 'junior') students[cleanId].hasVotedJunior = true;
    else students[cleanId].hasVotedSenior = true;
    saveLocalStudents(students);
  }

  const votes: VoteLog[] = getLocalVoteLogs();
  votes.unshift({
    studentId: cleanId,
    candidateId,
    candidateNumber: targetCandidate?.candidateNumber || '',
    candidateName: targetCandidate?.name || '',
    category,
    voterLat,
    voterLng,
    distanceMeters,
    deviceToken,
    voterIp,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(votes));

  return { success: true, message: 'ลงคะแนนโหวตสำเร็จ! ขอบคุณสำหรับการโหวต' };
}

// --- Admin Operations ---

export async function saveCandidate(candidate: Omit<Candidate, 'id' | 'voteCount'> & { id?: string }) {
  if (isFirebaseConfigured()) {
    try {
      if (candidate.id) {
        const ref = doc(db, 'candidates', candidate.id);
        await updateDoc(ref, {
          candidateNumber: candidate.candidateNumber,
          name: candidate.name,
          category: candidate.category,
          photoUrl: candidate.photoUrl,
          description: candidate.description,
        });
      } else {
        const newRef = doc(collection(db, 'candidates'));
        await setDoc(newRef, {
          ...candidate,
          id: newRef.id,
          voteCount: 0,
          createdAt: serverTimestamp(),
        });
      }
      return;
    } catch (e) {
      console.error('Error saving candidate to Firestore:', e);
    }
  }

  const candidates = getLocalCandidates();
  if (candidate.id) {
    const idx = candidates.findIndex((c) => c.id === candidate.id);
    if (idx !== -1) {
      candidates[idx] = { ...candidates[idx], ...candidate };
    }
  } else {
    const newId = `c_${Date.now()}`;
    candidates.push({
      ...candidate,
      id: newId,
      voteCount: 0,
    });
  }
  saveLocalCandidates(candidates);
}

export async function deleteCandidate(candidateId: string) {
  if (isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'candidates', candidateId));
      return;
    } catch (e) {
      console.error('Error deleting candidate:', e);
    }
  }

  const candidates = getLocalCandidates().filter((c) => c.id !== candidateId);
  saveLocalCandidates(candidates);
}

export async function updateSystemSettings(settings: Partial<SystemSettings>) {
  const current = isFirebaseConfigured() ? (await getDoc(doc(db, 'settings', 'config'))).data() as SystemSettings || DEFAULT_SETTINGS : getLocalSettings();
  const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };

  if (isFirebaseConfigured()) {
    try {
      await setDoc(doc(db, 'settings', 'config'), updated, { merge: true });
      return;
    } catch (e) {
      console.error('Error updating settings in Firestore:', e);
    }
  }

  saveLocalSettings(updated);
}

export function compressImageFile(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('ไม่สามารถโหลดไฟล์รูปภาพได้'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.readAsDataURL(file);
  });
}

export async function uploadCandidateImage(file: File): Promise<string> {
  return await compressImageFile(file, 800, 0.8);
}

export async function importStudentIds(studentList: { studentId: string; name?: string }[]): Promise<{ count: number; timestamp: string }> {
  const studentsMap: Record<string, Student> = {};
  const importTime = new Date().toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  studentList.forEach((s) => {
    const cleanId = s.studentId.trim();
    if (/^\d{5}$/.test(cleanId)) {
      studentsMap[cleanId] = {
        studentId: cleanId,
        name: s.name || `นักเรียนรหัส ${cleanId}`,
        hasVotedJunior: false,
        hasVotedSenior: false,
      };
    }
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_LAST_IMPORT, importTime);
  }

  if (isFirebaseConfigured()) {
    try {
      for (const [id, student] of Object.entries(studentsMap)) {
        await setDoc(doc(db, 'students', id), student, { merge: true });
      }
      await setDoc(doc(db, 'settings', 'config'), { lastImportTime: importTime }, { merge: true });
      return { count: Object.keys(studentsMap).length, timestamp: importTime };
    } catch (e) {
      console.error('Error importing students to Firestore:', e);
    }
  }

  const current = getLocalStudents();
  const merged = { ...current, ...studentsMap };
  saveLocalStudents(merged);
  return { count: Object.keys(studentsMap).length, timestamp: importTime };
}

export async function resetAllVotes() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('popular_vote_device_voted_categories');
    localStorage.removeItem(STORAGE_KEY_VOTES);
  }

  if (isFirebaseConfigured()) {
    try {
      const candidates = getLocalCandidates();
      for (const c of candidates) {
        await updateDoc(doc(db, 'candidates', c.id), { voteCount: 0 });
      }
    } catch (e) {
      console.error('Error resetting votes:', e);
    }
  }

  const candidates = getLocalCandidates().map((c) => ({ ...c, voteCount: 0 }));
  saveLocalCandidates(candidates);

  const students = getLocalStudents();
  Object.keys(students).forEach((id) => {
    students[id].hasVotedJunior = false;
    students[id].hasVotedSenior = false;
  });
  saveLocalStudents(students);
}
