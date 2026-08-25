'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CountdownTimerProps {
  endTimeIso: string;
  isVotingOpen: boolean;
  onExpire?: () => void;
}

export function CountdownTimer({ endTimeIso, isVotingOpen, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(endTimeIso).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTimeIso, onExpire]);

  const active = isVotingOpen && !timeLeft.isExpired;

  return (
    <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-sm border border-emerald-100">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Status */}
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${active ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-rose-100 text-rose-700'}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                สถานะเวลาโหวต
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                active ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {active ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    กำลังเปิดรับโหวต
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    ปิดรับโหวตแล้ว
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-light mt-0.5">
              {active ? 'เวลาที่เหลือก่อนปิดการโหวต' : 'หมดเวลาลงคะแนนแล้ว'}
            </p>
          </div>
        </div>

        {/* Countdown Box Grid */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center justify-center bg-slate-900 text-white w-14 sm:w-16 h-14 sm:h-16 rounded-2xl shadow-md">
            <span className="text-lg sm:text-xl font-black font-mono leading-none">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1">วัน</span>
          </div>

          <span className="text-slate-400 font-bold text-lg">:</span>

          <div className="flex flex-col items-center justify-center bg-slate-900 text-white w-14 sm:w-16 h-14 sm:h-16 rounded-2xl shadow-md">
            <span className="text-lg sm:text-xl font-black font-mono leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1">ชั่วโมง</span>
          </div>

          <span className="text-slate-400 font-bold text-lg">:</span>

          <div className="flex flex-col items-center justify-center bg-slate-900 text-white w-14 sm:w-16 h-14 sm:h-16 rounded-2xl shadow-md">
            <span className="text-lg sm:text-xl font-black font-mono leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1">นาที</span>
          </div>

          <span className="text-slate-400 font-bold text-lg">:</span>

          <div className="flex flex-col items-center justify-center bg-emerald-600 text-white w-14 sm:w-16 h-14 sm:h-16 rounded-2xl shadow-lg shadow-emerald-600/30">
            <span className="text-lg sm:text-xl font-black font-mono leading-none">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-emerald-100 font-bold mt-1">วินาที</span>
          </div>
        </div>
      </div>
    </div>
  );
}
