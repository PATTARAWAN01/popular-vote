'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle2, XCircle, RefreshCw, AlertTriangle, Compass } from 'lucide-react';
import { calculateDistanceMeters, formatDistance } from '@/lib/geo';

interface LocationCheckCardProps {
  targetLat: number;
  targetLng: number;
  radiusMeters: number;
  onLocationVerified?: (verified: boolean, lat: number, lng: number, distance: number) => void;
}

export function LocationCheckCard({
  targetLat,
  targetLng,
  radiusMeters = 100,
  onLocationVerified,
}: LocationCheckCardProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);

  const checkLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('อุปกรณ์นี้ไม่รองรับระบบระบุตำแหน่ง GPS');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        setCurrentLat(lat);
        setCurrentLng(lng);
        setAccuracy(acc);

        const dist = calculateDistanceMeters(lat, lng, targetLat, targetLng);
        setDistance(dist);

        // Account for GPS accuracy tolerance buffer
        const effectiveRadius = radiusMeters + Math.min(acc || 0, 30);
        const pass = dist <= effectiveRadius;
        setIsWithinRadius(pass);
        setLoading(false);

        if (onLocationVerified) {
          onLocationVerified(pass, lat, lng, dist);
        }
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setErrorMsg('กรุณากด "อนุญาต" (Allow) ให้เบราว์เซอร์เข้าถึง GPS ตำแหน่งของคุณ');
            break;
          case err.POSITION_UNAVAILABLE:
            setErrorMsg('ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาเปิด GPS/Location ในมือถือ');
            break;
          case err.TIMEOUT:
            setErrorMsg('หมดเวลาค้นหาตำแหน่ง GPS กรุณากดปุ่มลองใหม่อีกครั้ง');
            break;
          default:
            setErrorMsg('เกิดข้อผิดพลาดในการดึงตำแหน่ง GPS');
        }
        if (onLocationVerified) {
          onLocationVerified(false, 0, 0, 999999);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    checkLocation();
  }, [targetLat, targetLng, radiusMeters]);

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-3 rounded-2xl text-white flex-shrink-0 ${
              isWithinRadius === true
                ? 'bg-emerald-600 shadow-md shadow-emerald-600/30'
                : isWithinRadius === false
                ? 'bg-rose-500 shadow-md shadow-rose-500/30'
                : 'bg-slate-700'
            }`}
          >
            <MapPin className="w-6 h-6 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                เช็คอินพิกัดสถานที่จัดงาน
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                รัศมี {radiusMeters}m
              </span>
            </div>

            {loading ? (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-light">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                กำลังจับพิกัดความแม่นยำสูง GPS มือถือ...
              </p>
            ) : errorMsg ? (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            ) : distance !== null ? (
              <div className="space-y-1 mt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-light text-slate-600">
                    ระยะห่างจริง: <strong className="text-slate-900 font-bold">{formatDistance(distance)}</strong>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isWithinRadius
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {isWithinRadius ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        อยู่ในรัศมี (ผ่านเงื่อนไข)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        อยู่นอกระยะ {radiusMeters}m
                      </>
                    )}
                  </span>
                </div>

                {accuracy !== null && (
                  <p className="text-[11px] text-slate-400 font-light flex items-center gap-1">
                    <Compass className="w-3 h-3 text-slate-400" />
                    ความแม่นยำเสาสัญญาณมือถือ: ±{Math.round(accuracy)}m
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-1 font-light">
                กดปุ่มอัปเดตตำแหน่งเพื่อระบุพิกัด GPS
              </p>
            )}
          </div>
        </div>

        <button
          onClick={checkLocation}
          disabled={loading}
          className="self-stretch sm:self-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all border border-transparent active:scale-95 disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'กำลังจับพิกัด...' : 'อัปเดตพิกัด GPS ใหม่'}
        </button>
      </div>
    </div>
  );
}
