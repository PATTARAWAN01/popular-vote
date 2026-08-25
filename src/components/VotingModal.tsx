'use client';

import React, { useState, useEffect } from 'react';
import { Candidate, Category } from '@/types';
import { verifyStudentId, submitVote } from '@/lib/dataService';
import { hasDeviceVotedForCategory } from '@/lib/device';
import confetti from 'canvas-confetti';
import { X, Heart, MapPin, AlertCircle, CheckCircle2, Loader2, Delete, RotateCcw, Smartphone } from 'lucide-react';

interface VotingModalProps {
  candidate: Candidate | null;
  category: Category;
  isLocationVerified: boolean;
  userLat: number;
  userLng: number;
  distanceMeters: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function VotingModal({
  candidate,
  category,
  isLocationVerified,
  userLat,
  userLng,
  distanceMeters,
  onClose,
  onSuccess,
}: VotingModalProps) {
  const [studentId, setStudentId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deviceAlreadyVoted, setDeviceAlreadyVoted] = useState<boolean>(false);

  useEffect(() => {
    if (candidate) {
      const already = hasDeviceVotedForCategory(category);
      setDeviceAlreadyVoted(already);
      if (already) {
        setErrorMessage(
          `🚫 โทรศัพท์เครื่องนี้ได้ใช้สิทธิ์โหวตในระดับ ${
            category === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'
          } ไปแล้ว (ไม่สามารถใช้เครื่องเดิมโหวตหลายรหัสนักเรียนได้)`
        );
      }
    }
  }, [candidate, category]);

  if (!candidate) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#059669', '#10b981', '#34d399', '#0284c7', '#eab308'],
      });
    } catch (e) {
      console.log('Confetti error:', e);
    }
  };

  const handleKeypadPress = (numStr: string) => {
    if (deviceAlreadyVoted) return;
    if (studentId.length < 5) {
      setStudentId((prev) => prev + numStr);
      setErrorMessage(null);
    }
  };

  const handleBackspace = () => {
    if (deviceAlreadyVoted) return;
    setStudentId((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    if (deviceAlreadyVoted) return;
    setStudentId('');
    setErrorMessage(null);
  };

  const handleVoteSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (deviceAlreadyVoted) {
      setErrorMessage(
        `🚫 โทรศัพท์เครื่องนี้ได้ใช้สิทธิ์โหวตในระดับ ${
          category === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'
        } ไปแล้ว`
      );
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = studentId.trim();

    if (!/^\d{5}$/.test(cleanId)) {
      setErrorMessage('กรุณากรอกรหัสนักเรียน 5 หลักให้ครบถ้วน');
      return;
    }

    if (!isLocationVerified) {
      setErrorMessage(
        `คุณไม่อยู่ในระยะ 40 เมตร จากสถานที่จัดงาน (ระยะทางจริง: ${distanceMeters.toFixed(
          1
        )} เมตร) กรุณาเดินทางมายังพื้นที่จัดงาน`
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Verify student ID & device restriction check
      const verification = await verifyStudentId(cleanId, category);

      if (!verification.valid || verification.alreadyVoted) {
        setErrorMessage(verification.errorMsg || 'ไม่สามารถลงคะแนนได้');
        setLoading(false);
        return;
      }

      // 2. Submit vote with device & IP logging
      const res = await submitVote(
        cleanId,
        candidate.id,
        category,
        userLat,
        userLng,
        distanceMeters
      );

      if (res.success) {
        setSuccessMessage(res.message);
        triggerConfetti();
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2200);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage('เกิดข้อผิดพลาดในการส่งคะแนน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 p-5 sm:p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-100 font-bold text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-current text-rose-300" />
            ยืนยันการโหวต ({category === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'})
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1 leading-tight">
            หมายเลข {candidate.candidateNumber}: {candidate.name}
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Device & Location Status Pills */}
          <div className="space-y-2">
            <div
              className={`p-3 rounded-2xl flex items-center gap-3 text-xs font-medium ${
                isLocationVerified
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <MapPin className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <div>
                <span className="font-bold block">
                  {isLocationVerified ? 'เช็คอินพิกัดสำเร็จ (รัศมี 40m)' : 'อยู่นอกระยะพิกัด 40 เมตร'}
                </span>
                <span>ระยะทางจริง: {distanceMeters.toFixed(1)} เมตร</span>
              </div>
            </div>

            {/* Device Token Warning Pill */}
            <div
              className={`p-2.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
                deviceAlreadyVoted
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Smartphone className={`w-4 h-4 flex-shrink-0 ${deviceAlreadyVoted ? 'text-rose-600' : 'text-emerald-600'}`} />
              <span>
                {deviceAlreadyVoted
                  ? `เครื่องนี้ใช้สิทธิ์ระดับ ${category === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'} ไปแล้ว`
                  : `ล็อกสิทธิ์ 1 โทรศัพท์ / 1 สิทธิ์ (${category === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'})`}
              </span>
            </div>
          </div>

          {/* 5-Digit Display Box */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider text-center mb-2">
              ป้อนรหัสนักเรียน 5 หลัก
            </label>

            <div className="flex justify-center gap-2 mb-2">
              {[0, 1, 2, 3, 4].map((index) => {
                const char = studentId[index] || '';
                return (
                  <div
                    key={index}
                    className={`w-12 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-2xl border transition-all ${
                      char
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {char ? char : '•'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Touch Keypad */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                disabled={loading || deviceAlreadyVoted || studentId.length >= 5}
                className="keypad-btn disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              disabled={loading || deviceAlreadyVoted || studentId.length === 0}
              className="keypad-btn text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-sm font-bold disabled:opacity-40"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              disabled={loading || deviceAlreadyVoted || studentId.length >= 5}
              className="keypad-btn disabled:opacity-40"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              disabled={loading || deviceAlreadyVoted || studentId.length === 0}
              className="keypad-btn text-slate-600 hover:bg-slate-200 disabled:opacity-40"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={() => handleVoteSubmit()}
              disabled={loading || deviceAlreadyVoted || !isLocationVerified || studentId.length !== 5}
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current text-white" />
                  ยืนยันโหวต
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
