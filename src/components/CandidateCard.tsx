'use client';

import React from 'react';
import { Candidate } from '@/types';
import { Heart, Sparkles, Trophy, PieChart } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  totalCategoryVotes: number;
  isVotingOpen: boolean;
  onVoteClick: (candidate: Candidate) => void;
  rank?: number;
}

export function CandidateCard({
  candidate,
  totalCategoryVotes,
  isVotingOpen,
  onVoteClick,
  rank,
}: CandidateCardProps) {
  const percentageNum = totalCategoryVotes > 0 ? (candidate.voteCount / totalCategoryVotes) * 100 : 0;
  const formattedPercentage = percentageNum.toFixed(1);

  return (
    <div className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-200/90 hover:border-emerald-400 shadow-md hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between">
      {/* Full-bleed Photo Container (IG Story Style) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <img
          src={candidate.photoUrl}
          alt={candidate.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

        {/* Top Badges Floating Layer */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {/* Candidate Number */}
          <div className="bg-slate-900/90 text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>หมายเลข {candidate.candidateNumber}</span>
          </div>

          {/* Category Pill */}
          <div className="bg-emerald-600 text-white font-black text-[11px] px-3 py-1 rounded-full shadow-md">
            {candidate.category === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'}
          </div>
        </div>

        {/* Rank Badge if in Top 3 */}
        {rank && rank <= 3 && (
          <div className="absolute top-14 left-3 z-10 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce">
            <Trophy className="w-3.5 h-3.5 fill-current" />
            <span>อันดับ {rank}</span>
          </div>
        )}

        {/* Bottom Overlay Title & Description inside Image */}
        <div className="absolute bottom-3 left-4 right-4 z-10 space-y-1">
          <h3 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-snug line-clamp-1 group-hover:text-emerald-300 transition-colors">
            {candidate.name}
          </h3>
          <p className="text-xs text-slate-200 font-light line-clamp-2 leading-relaxed opacity-90">
            {candidate.description || 'การประกวดชุดรีไซเคิลสร้างสรรค์'}
          </p>
        </div>
      </div>

      {/* Interactive Footer & Percentage Progress */}
      <div className="p-4 sm:p-5 space-y-3 bg-white border-t border-slate-100">
        {/* Realtime Percentage Bar */}
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600 flex items-center gap-1.5 font-bold">
              <PieChart className="w-4 h-4 text-emerald-600" />
              สัดส่วนผลโหวต
            </span>
            <span className="font-black text-emerald-700 text-sm sm:text-lg font-mono">
              {formattedPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(percentageNum, 100)}%` }}
            />
          </div>
        </div>

        {/* Large Touch-friendly Vote Button */}
        <button
          onClick={() => onVoteClick(candidate)}
          disabled={!isVotingOpen}
          className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-md ${
            isVotingOpen
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:shadow-lg'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          <Heart className={`w-5 h-5 ${isVotingOpen ? 'fill-current animate-pulse' : 'fill-slate-400'}`} />
          <span>{isVotingOpen ? '⚡ กดเพื่อโหวตผู้สมัครนี้' : 'ปิดรับโหวตแล้ว'}</span>
        </button>
      </div>
    </div>
  );
}
