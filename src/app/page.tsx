'use client';

import React, { useState, useEffect } from 'react';
import { Candidate, Category, SystemSettings } from '@/types';
import { subscribeCandidates, subscribeSettings } from '@/lib/dataService';
import { CountdownTimer } from '@/components/CountdownTimer';
import { LocationCheckCard } from '@/components/LocationCheckCard';
import { CandidateCard } from '@/components/CandidateCard';
import { VotingModal } from '@/components/VotingModal';
import { Sparkles, GraduationCap, School, Heart } from 'lucide-react';

export default function HomePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('junior');

  // Location check state (Default true so voting works instantly without GPS check)
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(true);
  const [userLat, setUserLat] = useState<number>(0);
  const [userLng, setUserLng] = useState<number>(0);
  const [distanceMeters, setDistanceMeters] = useState<number>(0);

  // Selected candidate for voting modal
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const unsubCandidates = subscribeCandidates((data) => {
      setCandidates(data);
    });

    const unsubSettings = subscribeSettings((data) => {
      setSettings(data);
      if (data && data.requireGpsCheck === false) {
        setIsLocationVerified(true);
      }
    });

    return () => {
      unsubCandidates();
      unsubSettings();
    };
  }, []);

  const filteredCandidates = candidates.filter((c) => c.category === activeCategory);
  const maxVotes = Math.max(...filteredCandidates.map((c) => c.voteCount), 1);
  const totalCategoryVotes = filteredCandidates.reduce((acc, curr) => acc + curr.voteCount, 0);

  const isVotingOpen = settings ? settings.isVotingOpen && new Date(settings.votingEndTime) > new Date() : true;

  return (
    <div className="space-y-6 pb-16">
      {/* Light Eco Hero Banner with School Title */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-emerald-600/20">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-extrabold tracking-wide backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
            งานสัปดาห์วิทยาศาสตร์แห่งชาติ ปีการศึกษา 2569
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Popular Vote ชุดรีไซเคิล <br className="hidden sm:inline" />
            <span className="text-amber-300">โรงเรียนหนองวัวซอพิทยาคม</span>
          </h1>

          <p className="text-emerald-50 text-xs sm:text-base font-light leading-relaxed">
            เลือกโหวตผู้สมัครขวัญใจมหาชนในระดับ <strong>ม.ต้น</strong> และ <strong>ม.ปลาย</strong> (สามารถโหวตได้ระดับละ 1 ครั้ง)
          </p>
        </div>
      </div>

      {/* Real-time Countdown Timer */}
      {settings && (
        <CountdownTimer
          endTimeIso={settings.votingEndTime}
          isVotingOpen={settings.isVotingOpen}
        />
      )}

      {/* Location GPS Check Card (Only rendered when Admin explicitly turns ON requireGpsCheck) */}
      {settings && settings.requireGpsCheck && (
        <LocationCheckCard
          targetLat={settings.targetLat}
          targetLng={settings.targetLng}
          radiusMeters={settings.radiusMeters || 100}
          requireGpsCheck={settings.requireGpsCheck}
          onLocationVerified={(verified, lat, lng, dist) => {
            setIsLocationVerified(verified);
            setUserLat(lat);
            setUserLng(lng);
            setDistanceMeters(dist);
          }}
        />
      )}

      {/* Category Segmented Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setActiveCategory('junior')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-300 ${
              activeCategory === 'junior'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <School className="w-4 h-4" />
            <span>ระดับ ม.ต้น</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white font-bold">
              {candidates.filter((c) => c.category === 'junior').length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('senior')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-300 ${
              activeCategory === 'senior'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>ระดับ ม.ปลาย</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white font-bold">
              {candidates.filter((c) => c.category === 'senior').length}
            </span>
          </button>
        </div>

        {/* Percentage Display Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>แสดงสัดส่วนคะแนนเป็นเปอร์เซ็นต์ (%)</span>
        </div>
      </div>

      {/* Candidate Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">ยังไม่มีรายชื่อผู้สมัครในระดับนี้</h3>
          <p className="text-xs text-slate-500 font-light">
            แอดมินสามารถเพิ่มรายชื่อและรูปภาพผู้สมัครได้ที่หน้าหลังบ้าน
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              totalCategoryVotes={totalCategoryVotes}
              isVotingOpen={isVotingOpen}
              onVoteClick={(c) => setSelectedCandidate(c)}
            />
          ))}
        </div>
      )}

      {/* Voting Modal */}
      {selectedCandidate && (
        <VotingModal
          candidate={selectedCandidate}
          category={activeCategory}
          isLocationVerified={isLocationVerified}
          userLat={userLat}
          userLng={userLng}
          distanceMeters={distanceMeters}
          onClose={() => setSelectedCandidate(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
