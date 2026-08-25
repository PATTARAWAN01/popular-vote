import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { Candidate, Category, Student, SystemSettings } from '@/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCwmUYrNDDT8OOc6u3AkN8TTlZ51ICc--Q',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'nwsp-popular-vote.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://nwsp-popular-vote-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nwsp-popular-vote',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nwsp-popular-vote.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '684832325377',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:684832325377:web:485edb4ffcb003eb68e500',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const DEFAULT_SETTINGS: SystemSettings = {
  targetLat: 13.7563, // Default location (Can be updated in admin)
  targetLng: 100.5018,
  radiusMeters: 40,
  votingEndTime: new Date(Date.now() + 86400000 * 2).toISOString(),
  isVotingOpen: true,
  eventTitle: 'Popular Vote ชุดรีไซเคิล โรงเรียนหนองวัวซอพิทยาคม 2569',
};

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'junior-1',
    candidateNumber: '01',
    name: 'ชุดเทพีพลาสติกมินิมอล',
    category: 'junior',
    photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    description: 'ตัวแทนชั้น ม.1/2 - ตัดเย็บจากแก้วพลาสติกรีไซเคิล',
    voteCount: 0,
  },
  {
    id: 'junior-2',
    candidateNumber: '02',
    name: 'ชุดอัศวินกล่องกระดาษ',
    category: 'junior',
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    description: 'ตัวแทนชั้น ม.2/1 - สร้างสรรค์จากกล่องพัสดุรีไซเคิล 100%',
    voteCount: 0,
  },
  {
    id: 'junior-3',
    candidateNumber: '03',
    name: 'ชุดราตรีฝาขวดอลังการ',
    category: 'junior',
    photoUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&auto=format&fit=crop&q=80',
    description: 'ตัวแทนชั้น ม.3/4 - ร้อยฝาขวดน้ำหลากสีมากกว่า 500 ฝา',
    voteCount: 0,
  },
  {
    id: 'senior-1',
    candidateNumber: '01',
    name: 'ชุดฟีนิกซ์จากหนังสือพิมพ์เก่า',
    category: 'senior',
    photoUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    description: 'ตัวแทนชั้น ม.4/2 - ออกแบบสไตล์โอต์กูตูร์จากหนังสือพิมพ์พับกลีบ',
    voteCount: 0,
  },
  {
    id: 'senior-2',
    candidateNumber: '02',
    name: 'ชุดคอร์เซ็ทกระป๋องอัดลม',
    category: 'senior',
    photoUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    description: 'ตัวแทนชั้น ม.5/1 - ตัดเย็บจากห่วงและแผ่นกระป๋องอลูมิเนียม',
    voteCount: 0,
  },
  {
    id: 'senior-3',
    candidateNumber: '03',
    name: 'ชุดควีนถุงซักผ้าและพลาสติกห่อ',
    category: 'senior',
    photoUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    description: 'ตัวแทนชั้น ม.6/3 - กระโปรงสุ่มฟูฟ่องจากพลาสติกใสรีไซเคิล',
    voteCount: 0,
  },
];

export const INITIAL_STUDENTS: Record<string, Student> = {
  '11111': { studentId: '11111', name: 'นายทดสอบ ระบบหนึ่ง', hasVotedJunior: false, hasVotedSenior: false },
  '22222': { studentId: '22222', name: 'นางสาววิภาดา เรียนดี', hasVotedJunior: false, hasVotedSenior: false },
  '33333': { studentId: '33333', name: 'นายณัฐพงษ์ ตั้งใจเรียน', hasVotedJunior: false, hasVotedSenior: false },
  '12345': { studentId: '12345', name: 'นักเรียน ตัวอย่าง', hasVotedJunior: false, hasVotedSenior: false },
};

export function isFirebaseConfigured(): boolean {
  return true; // Live Firebase active!
}
