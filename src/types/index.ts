export type Category = 'junior' | 'senior';

export interface Candidate {
  id: string;
  candidateNumber: string; // e.g. "01", "02"
  name: string;
  category: Category; // 'junior' (ม.ต้น) or 'senior' (ม.ปลาย)
  photoUrl: string;
  description: string;
  voteCount: number;
  createdAt?: any;
}

export interface Student {
  studentId: string; // 5 digits
  name?: string;
  hasVotedJunior: boolean;
  hasVotedSenior: boolean;
  votedJuniorDeviceToken?: string;
  votedSeniorDeviceToken?: string;
}

export interface SystemSettings {
  targetLat: number;
  targetLng: number;
  radiusMeters: number; // default 40
  votingEndTime: string; // ISO string
  isVotingOpen: boolean;
  eventTitle?: string;
  updatedAt?: any;
}

export interface VoteLog {
  id?: string;
  studentId: string;
  candidateId: string;
  candidateNumber?: string;
  candidateName?: string;
  category: Category;
  voterLat: number;
  voterLng: number;
  distanceMeters: number;
  deviceToken: string;
  voterIp: string;
  timestamp: any;
}
