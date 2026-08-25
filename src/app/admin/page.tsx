'use client';

import React, { useState, useEffect } from 'react';
import { Candidate, Category, Student, SystemSettings, VoteLog } from '@/types';
import {
  subscribeCandidates,
  subscribeSettings,
  subscribeStudents,
  subscribeVoteLogs,
  saveCandidate,
  deleteCandidate,
  uploadCandidateImage,
  updateSystemSettings,
  importStudentIds,
  resetAllVotes,
} from '@/lib/dataService';
import Papa from 'papaparse';
import {
  Lock,
  Plus,
  Trash2,
  Edit,
  Upload,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  School,
  GraduationCap,
  Save,
  Key,
  FileSpreadsheet,
  Link as LinkIcon,
  Globe,
  Smartphone,
  Activity,
  Search,
  Check,
  X,
  UserCheck,
  Calendar,
} from 'lucide-react';

export default function AdminPage() {
  // Password State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // System Data
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [voteLogs, setVoteLogs] = useState<VoteLog[]>([]);

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'junior' | 'senior' | 'students' | 'logs' | 'settings'>('junior');

  // Candidate Modal / Form State
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState<boolean>(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [formNumber, setFormNumber] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<Category>('junior');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Student Search & Import State
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [singleStudentId, setSingleStudentId] = useState<string>('');
  const [singleStudentName, setSingleStudentName] = useState<string>('');
  const [studentNotice, setStudentNotice] = useState<string | null>(null);
  const [lastImportTime, setLastImportTime] = useState<string>('');

  // Settings Form State
  const [settingsLat, setSettingsLat] = useState<number>(13.7563);
  const [settingsLng, setSettingsLng] = useState<number>(100.5018);
  const [settingsRadius, setSettingsRadius] = useState<number>(40);
  const [settingsEndTime, setSettingsEndTime] = useState<string>('');
  const [settingsIsOpen, setSettingsIsOpen] = useState<boolean>(true);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('admin_authenticated');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubCandidates = subscribeCandidates((data) => setCandidates(data));
    const unsubSettings = subscribeSettings((data) => {
      setSettings(data);
      if (data) {
        setSettingsLat(data.targetLat);
        setSettingsLng(data.targetLng);
        setSettingsRadius(data.radiusMeters || 40);
        setSettingsIsOpen(data.isVotingOpen);
        try {
          const d = new Date(data.votingEndTime);
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setSettingsEndTime(localIso);
        } catch {
          setSettingsEndTime('');
        }
      }
    });
    const unsubStudents = subscribeStudents((data) => setStudentsList(data));
    const unsubLogs = subscribeVoteLogs((data) => setVoteLogs(data));

    if (typeof window !== 'undefined') {
      const storedLastTime = localStorage.getItem('popular_vote_last_import_time');
      if (storedLastTime) setLastImportTime(storedLastTime);
    }

    return () => {
      unsubCandidates();
      unsubSettings();
      unsubStudents();
      unsubLogs();
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'nwsp1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setAuthError(null);
    } else {
      setAuthError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleOpenCandidateModal = (candidate?: Candidate, defaultCat: Category = 'junior') => {
    if (candidate) {
      setEditingCandidate(candidate);
      setFormNumber(candidate.candidateNumber);
      setFormName(candidate.name);
      setFormCategory(candidate.category);
      setFormDesc(candidate.description || '');
      setFormPhotoUrl(candidate.photoUrl || '');
    } else {
      setEditingCandidate(null);
      setFormNumber('');
      setFormName('');
      setFormCategory(defaultCat);
      setFormDesc('');
      setFormPhotoUrl('');
    }
    setIsCandidateModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadCandidateImage(file);
      setFormPhotoUrl(url);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + (err.message || 'ไฟล์เสียหาย'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber || !formName) {
      alert('กรุณากรอกหมายเลขและชื่อผู้สมัคร');
      return;
    }

    await saveCandidate({
      id: editingCandidate?.id,
      candidateNumber: formNumber.padStart(2, '0'),
      name: formName,
      category: formCategory,
      description: formDesc,
      photoUrl:
        formPhotoUrl ||
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    });

    setIsCandidateModalOpen(false);
  };

  const handleDeleteCandidate = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบผู้สมัคร "${name}" หรือไม่?`)) {
      await deleteCandidate(id);
    }
  };

  const handleAddSingleStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = singleStudentId.trim();
    if (!/^\d{5}$/.test(cleanId)) {
      alert('รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก');
      return;
    }

    const res = await importStudentIds([{ studentId: cleanId, name: singleStudentName }]);
    setLastImportTime(res.timestamp);
    setStudentNotice(`✅ เพิ่มรหัสนักเรียน ${cleanId} สำเร็จ (บันทึกเมื่อ ${res.timestamp})`);
    setSingleStudentId('');
    setSingleStudentName('');
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: async (results) => {
        const studentList: { studentId: string; name?: string }[] = [];
        results.data.forEach((row: any) => {
          let id = '';
          let name = '';
          if (Array.isArray(row)) {
            id = String(row[0] || '').trim();
            name = String(row[1] || '').trim();
          } else if (typeof row === 'object' && row !== null) {
            id = String(row.studentId || row.id || row.รหัสนักเรียน || '').trim();
            name = String(row.name || row.ชื่อ || '').trim();
          }

          if (/^\d{5}$/.test(id)) {
            studentList.push({ studentId: id, name });
          }
        });

        if (studentList.length > 0) {
          const res = await importStudentIds(studentList);
          setLastImportTime(res.timestamp);
          setStudentNotice(`✅ นำเข้ารหัสนักเรียนสำเร็จทั้งหมด ${res.count} รายการ (อัปเดตเมื่อ ${res.timestamp})`);
        } else {
          alert('ไม่พบรหัสนักเรียน 5 หลักในไฟล์ CSV');
        }
      },
      error: () => alert('อ่านไฟล์ CSV ล้มเหลว'),
    });
  };

  const handleGetAdminLocation = () => {
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ไม่รองรับ GPS');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettingsLat(pos.coords.latitude);
        setSettingsLng(pos.coords.longitude);
        setSettingsNotice('ดึงพิกัดปัจจุบันของแอดมินสำเร็จ!');
      },
      (err) => alert('ไม่สามารถดึงตำแหน่ง GPS ได้: ' + err.message)
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSystemSettings({
      targetLat: settingsLat,
      targetLng: settingsLng,
      radiusMeters: settingsRadius,
      isVotingOpen: settingsIsOpen,
      votingEndTime: settingsEndTime ? new Date(settingsEndTime).toISOString() : new Date().toISOString(),
    });
    setSettingsNotice('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
  };

  const handleResetVotesClick = async () => {
    if (confirm('⚠️ เตือน: คุณต้องการรีเซ็ตคะแนนโหวตและสิทธิ์การโหวตทั้งหมดใช่หรือไม่?')) {
      await resetAllVotes();
      alert('รีเซ็ตคะแนนโหวตทั้งหมดเรียบร้อยแล้ว');
    }
  };

  // Filtered Students List for Search
  const filteredStudents = studentsList.filter((s) => {
    const q = studentSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return s.studentId.includes(q) || (s.name && s.name.toLowerCase().includes(q));
  });

  const juniorVotedCount = studentsList.filter((s) => s.hasVotedJunior).length;
  const seniorVotedCount = studentsList.filter((s) => s.hasVotedSenior).length;

  // --- 1. Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">เข้าสู่ระบบหลังบ้าน (Admin)</h2>
            <p className="text-xs text-slate-500 mt-1 font-light">
              โรงเรียนหนองวัวซอพิทยาคม
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="กรอกรหัสผ่านแอดมิน"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-center text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                autoFocus
              />
              <Key className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>

            {authError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl shadow-md active:scale-95 transition-all"
            >
              เข้าสู่ระบบ Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. Admin Dashboard ---
  const juniorCandidates = candidates.filter((c) => c.category === 'junior');
  const seniorCandidates = candidates.filter((c) => c.category === 'senior');

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              แผงควบคุมผู้ดูแลระบบ (Admin Dashboard)
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-light mt-0.5">
            โรงเรียนหนองวัวซอพิทยาคม - ล็อกสิทธิ์ 1 โทรศัพท์ / 1 สิทธิ์ & บันทึก IP Address
          </p>
        </div>

        <button
          onClick={() => {
            sessionStorage.removeItem('admin_authenticated');
            setIsAuthenticated(false);
          }}
          className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-2xl text-xs font-bold transition-colors border border-rose-200"
        >
          ออกจากระบบ Admin
        </button>
      </div>

      {/* Main Admin Sub-tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab('junior')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
            activeTab === 'junior'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <School className="w-4 h-4" />
          ผู้สมัคร ม.ต้น ({juniorCandidates.length})
        </button>

        <button
          onClick={() => setActiveTab('senior')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
            activeTab === 'senior'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          ผู้สมัคร ม.ปลาย ({seniorCandidates.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
            activeTab === 'students'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          ฐานข้อมูลนักเรียน ({studentsList.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
            activeTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          ประวัติการโหวต & ตรวจสอบ IP ({voteLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          เวลา & พิกัด GPS 40m
        </button>
      </div>

      {/* --- TAB CONTENT: Junior / Senior Candidate Management --- */}
      {(activeTab === 'junior' || activeTab === 'senior') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-extrabold text-slate-900 text-base">
              รายชื่อผู้สมัคร {activeTab === 'junior' ? 'ระดับ ม.ต้น' : 'ระดับ ม.ปลาย'}
            </h2>

            <button
              onClick={() => handleOpenCandidateModal(undefined, activeTab)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              เพิ่มผู้สมัคร {activeTab === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeTab === 'junior' ? juniorCandidates : seniorCandidates).map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 flex gap-4 items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={candidate.photoUrl}
                  alt={candidate.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full inline-block mb-1">
                    หมายเลข {candidate.candidateNumber}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 truncate">{candidate.name}</h3>
                  <p className="text-xs text-emerald-700 font-bold mt-0.5">
                    {candidate.voteCount.toLocaleString()} คะแนน
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleOpenCandidateModal(candidate, activeTab)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                    title="แก้ไข"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: Student Database --- */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">นักเรียนทั้งหมดในระบบ</span>
                <span className="text-2xl font-black text-slate-900">{studentsList.length.toLocaleString()} คน</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">อัปเดต CSV ล่าสุดเมื่อ</span>
                <span className="text-xs font-bold text-slate-800">{lastImportTime || 'ยังไม่มีข้อมูลการอัปโหลด'}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">จำนวนผู้ใช้สิทธิ์โหวตแล้ว</span>
                <span className="text-xs font-bold text-slate-900 block">
                  ม.ต้น: <strong className="text-emerald-700">{juniorVotedCount}</strong> | ม.ปลาย: <strong className="text-teal-700">{seniorVotedCount}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                จัดการฐานข้อมูลรหัสนักเรียน 5 หลัก
              </h2>
              <p className="text-xs text-slate-500 font-light mt-1">
                ใช้สำหรับรีเช็คว่ารหัสนักเรียนที่นำมาโหวตเป็นนักเรียนในโรงเรียนจริงหรือไม่ และป้องกันการโหวตซ้ำ
              </p>
            </div>

            {studentNotice && (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 border border-emerald-300 animate-fade-in shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{studentNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CSV Import */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  นำเข้าด้วยไฟล์ CSV (Bulk Import)
                </div>
                <p className="text-xs text-slate-500 font-light">
                  อัปโหลดไฟล์ `.csv` ที่มีคอลัมน์รหัสนักเรียน 5 หลัก (เช่น Column 1: 12345, Column 2: ชื่อนักเรียน)
                </p>
                <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 cursor-pointer transition-colors shadow-sm">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>เลือกไฟล์ CSV เพื่อนำเข้า</span>
                  <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                </label>
              </div>

              {/* Individual Addition */}
              <form onSubmit={handleAddSingleStudent} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  เพิ่มรหัสนักเรียนรายบุคคล
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={5}
                    value={singleStudentId}
                    onChange={(e) => setSingleStudentId(e.target.value.replace(/\D/g, ''))}
                    placeholder="รหัส 5 หลัก"
                    className="w-1/3 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                  <input
                    type="text"
                    value={singleStudentName}
                    onChange={(e) => setSingleStudentName(e.target.value)}
                    placeholder="ชื่อนักเรียน (ถ้ามี)"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold"
                >
                  + เพิ่มรหัสนักเรียน
                </button>
              </form>
            </div>

            {/* Student Search & Real-time Table */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-extrabold text-sm text-slate-900">
                  ตารางรายชื่อนักเรียนในระบบ ({filteredStudents.length} รายการ)
                </h3>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="ค้นหารหัส 5 หลัก หรือชื่อ..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">รหัสนักเรียน</th>
                      <th className="p-3">ชื่อ - นามสกุล</th>
                      <th className="p-3 text-center">สิทธิ์โหวต ม.ต้น</th>
                      <th className="p-3 text-center">สิทธิ์โหวต ม.ปลาย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 text-xs font-medium">
                          ไม่พบข้อมูลนักเรียนตามเงื่อนไขที่ค้นหา
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-black text-slate-900">{student.studentId}</td>
                          <td className="p-3 font-medium text-slate-800">{student.name || '-'}</td>
                          <td className="p-3 text-center">
                            {student.hasVotedJunior ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <Check className="w-3 h-3 text-emerald-600" /> โหวตแล้ว
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                <X className="w-3 h-3 text-slate-400" /> ยังไม่โหวต
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {student.hasVotedSenior ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                                <Check className="w-3 h-3 text-teal-600" /> โหวตแล้ว
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                <X className="w-3 h-3 text-slate-400" /> ยังไม่โหวต
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: Audit Vote Logs & IP --- */}
      {activeTab === 'logs' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              ประวัติการโหวต & ตรวจสอบ IP Address ย้อนหลัง
            </h2>
            <p className="text-xs text-slate-500 font-light mt-1">
              แสดงรายการโหวตแบบ Real-time พร้อมเลขรหัสนักเรียน, เลข IP Address, รหัสเครื่อง (Device Token) และระยะห่างพิกัด GPS
            </p>
          </div>

          {voteLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-medium">
              ยังไม่มีประวัติการโหวตในระบบ
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">รหัสนักเรียน</th>
                    <th className="p-3">ระดับชั้น</th>
                    <th className="p-3">ผู้สมัครที่โหวต</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">ระยะห่าง GPS</th>
                    <th className="p-3">Device Token</th>
                    <th className="p-3">เวลาโหวต</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {voteLogs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{log.studentId}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.category === 'junior' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {log.category === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {log.candidateNumber ? `หมายเลข ${log.candidateNumber}` : ''} {log.candidateName}
                      </td>
                      <td className="p-3 font-mono text-slate-600 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        {log.voterIp || 'Unknown'}
                      </td>
                      <td className="p-3 text-slate-600">
                        {log.distanceMeters !== undefined ? `${log.distanceMeters.toFixed(1)}m` : '-'}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-400 max-w-[120px] truncate" title={log.deviceToken}>
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-slate-400" />
                          {log.deviceToken ? log.deviceToken.substring(0, 12) + '...' : '-'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-light">
                        {log.timestamp ? new Date(log.timestamp?.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString('th-TH') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: Settings & GPS --- */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              ตั้งค่าระบบนับถอยหลัง & พิกัด GPS 40m
            </h2>
            <p className="text-xs text-slate-500 font-light mt-1">
              กำหนดเวลาปิดโหวต และระบุพิกัดเป้าหมายสถานที่จัดงานเพื่อใช้คำนวณรัศมีเช็คอิน
            </p>
          </div>

          {settingsNotice && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {settingsNotice}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
            {/* Voting Toggle & End Time */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">สถานะเปิด/ปิดรับโหวต</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsIsOpen}
                    onChange={(e) => setSettingsIsOpen(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  กำหนดเวลานับถอยหลังปิดโหวต (Date & Time)
                </label>
                <input
                  type="datetime-local"
                  value={settingsEndTime}
                  onChange={(e) => setSettingsEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            {/* GPS Location Config */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  พิกัดเป้าหมาย (Latitude, Longitude) & รัศมี
                </span>
                <button
                  type="button"
                  onClick={handleGetAdminLocation}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-xl text-xs font-bold border border-emerald-300 transition-colors"
                >
                  📍 ใช้ตำแหน่งปัจจุบันของ Admin
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={settingsLat}
                    onChange={(e) => setSettingsLat(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={settingsLng}
                    onChange={(e) => setSettingsLng(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">รัศมี (เมตร)</label>
                  <input
                    type="number"
                    value={settingsRadius}
                    onChange={(e) => setSettingsRadius(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-center text-slate-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              บันทึกการตั้งค่าระบบ
            </button>
          </form>

          {/* Reset All Votes */}
          <div className="pt-6 border-t border-slate-200">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  โซนอันตราย: รีเซ็ตคะแนนโหวตทั้งหมด
                </h4>
                <p className="text-[11px] text-rose-700 font-light">
                  ล้างคะแนนโหวตของผู้สมัครทั้งหมดให้เป็น 0 คืนสิทธิ์ให้แก่นักเรียนและอุปกรณ์ทุกเครื่อง
                </p>
              </div>
              <button
                onClick={handleResetVotesClick}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                รีเซ็ตคะแนนโหวต
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Candidate Add / Edit Modal --- */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-lg">
              {editingCandidate ? 'แก้ไขข้อมูลผู้สมัคร' : 'เพิ่มผู้สมัครใหม่'}
            </h3>

            <form onSubmit={handleSaveCandidateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">หมายเลขผู้สมัคร</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 01"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ระดับชั้น</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="junior">ระดับ ม.ต้น</option>
                    <option value="senior">ระดับ ม.ปลาย</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อชุด / ชื่อผู้สมัคร</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ชุดเทพีพลาสติกมินิมอล"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียด / ตัวแทนชั้น</label>
                <textarea
                  rows={2}
                  placeholder="เช่น ตัวแทนชั้น ม.1/2 - ตัดเย็บจากแก้วพลาสติก"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Image Input Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  รูปภาพผู้สมัคร (เลือกอัปโหลดจากไฟล์ หรือวางลิงก์ URL)
                </label>

                {/* Direct Image URL input */}
                <div className="relative">
                  <input
                    type="url"
                    placeholder="วางลิงก์รูปภาพ (URL) เช่น https://images.unsplash.com/..."
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                  <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>

                {/* File Upload Button with Auto-Compression */}
                <div className="flex items-center gap-3 pt-1">
                  {formPhotoUrl && (
                    <img
                      src={formPhotoUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{uploadingImage ? 'กำลังบีบอัดและอัปโหลดรูป...' : '📷 อัปโหลดรูปจากมือถือ (ระบบย่อขนาดให้อัตโนมัติ)'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCandidateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md"
                >
                  บันทึกผู้สมัคร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
