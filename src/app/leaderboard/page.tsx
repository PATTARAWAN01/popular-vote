'use client';

import React, { useState, useEffect } from 'react';
import { Candidate, Category } from '@/types';
import { subscribeCandidates } from '@/lib/dataService';
import { Trophy, Flame, School, GraduationCap } from 'lucide-react';

export default function LeaderboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('junior');

  useEffect(() => {
    const unsub = subscribeCandidates((data) => {
      setCandidates(data);
    });
    return () => unsub();
  }, []);

  const filtered = candidates
    .filter((c) => c.category === activeCategory)
    .sort((a, b) => b.voteCount - a.voteCount);

  const top1 = filtered[0];
  const top2 = filtered[1];
  const top3 = filtered[2];

  const maxVotes = Math.max(...filtered.map((c) => c.voteCount), 1);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-300">
          <Trophy className="w-4 h-4 text-amber-600" />
          REAL-TIME LIVE LEADERBOARD
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          ผลคะแนนสด <span className="text-emerald-600">ขวัญใจมหาชน</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-light">
          อัปเดตคะแนนแบบเรียลไทม์พร้อมอนิเมชันสำหรับเปิดแสดงผลหน้างาน
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveCategory('junior')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeCategory === 'junior'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            อันดับ ม.ต้น
          </button>

          <button
            onClick={() => setActiveCategory('senior')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeCategory === 'senior'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            อันดับ ม.ปลาย
          </button>
        </div>
      </div>

      {/* Podium Top 3 View */}
      {filtered.length >= 2 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-3xl mx-auto pt-6">
          {/* Rank 2 (Left) */}
          {top2 ? (
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-200 text-center space-y-3 flex flex-col items-center">
              <div className="relative">
                <img
                  src={top2.photoUrl}
                  alt={top2.name}
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-slate-300 shadow-md"
                />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black text-sm flex items-center justify-center shadow">
                  🥈
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  หมายเลข {top2.candidateNumber}
                </span>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{top2.name}</h3>
              </div>
              <div className="w-full bg-slate-100 py-1.5 px-2 rounded-xl text-xs font-black text-slate-800 border border-slate-200">
                {top2.voteCount.toLocaleString()} คะแนน
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* Rank 1 (Center - Highest) */}
          {top1 && (
            <div className="bg-gradient-to-b from-amber-50 via-white to-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-amber-400 text-center space-y-3 flex flex-col items-center -translate-y-4">
              <div className="relative">
                <img
                  src={top1.photoUrl}
                  alt={top1.name}
                  className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-amber-400 shadow-lg animate-pulse-glow"
                />
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shadow-lg">
                  🥇
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase block">
                  ผู้นำอันดับ 1 (หมายเลข {top1.candidateNumber})
                </span>
                <h3 className="font-extrabold text-sm sm:text-xl text-slate-900 line-clamp-1">{top1.name}</h3>
              </div>
              <div className="w-full bg-amber-400 text-slate-950 py-2 px-3 rounded-xl text-sm sm:text-base font-black shadow-md">
                {top1.voteCount.toLocaleString()} คะแนน
              </div>
            </div>
          )}

          {/* Rank 3 (Right) */}
          {top3 ? (
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-200 text-center space-y-3 flex flex-col items-center">
              <div className="relative">
                <img
                  src={top3.photoUrl}
                  alt={top3.name}
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-amber-700/40 shadow-md"
                />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow">
                  🥉
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  หมายเลข {top3.candidateNumber}
                </span>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{top3.name}</h3>
              </div>
              <div className="w-full bg-slate-100 py-1.5 px-2 rounded-xl text-xs font-black text-slate-800 border border-slate-200">
                {top3.voteCount.toLocaleString()} คะแนน
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 max-w-4xl mx-auto space-y-4">
        <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
          <Flame className="w-5 h-5 text-emerald-600" />
          สรุปอันดับผู้สมัครทั้งหมด (ระดับ {activeCategory === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'})
        </h2>

        <div className="space-y-3">
          {filtered.map((candidate, idx) => {
            const pct = maxVotes > 0 ? Math.min(Math.round((candidate.voteCount / maxVotes) * 100), 100) : 0;
            return (
              <div
                key={candidate.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    #{idx + 1}
                  </div>
                  <img
                    src={candidate.photoUrl}
                    alt={candidate.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-slate-500">
                      หมายเลข {candidate.candidateNumber}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                      {candidate.name}
                    </h4>
                  </div>
                </div>

                {/* Progress Bar & Vote count */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-light">{pct}% ของคะแนนนำ</span>
                    <span className="font-black text-emerald-700 text-sm">
                      {candidate.voteCount.toLocaleString()} คะแนน
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
