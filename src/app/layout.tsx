import type { Metadata, Viewport } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Recycle, Award, Lock, Sparkles, Flame } from 'lucide-react';

const promptFont = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-prompt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Popular Vote ชุดรีไซเคิล - โรงเรียนหนองวัวซอพิทยาคม',
  description: 'Popular Vote ชุดรีไซเคิล ในงานสัปดาห์วิทยาศาสตร์แห่งชาติ ปีการศึกษา 2569 โรงเรียนหนองวัวซอพิทยาคม',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${promptFont.variable}`}>
      <body className="font-prompt bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-950">
        {/* Background Ambient Gradients */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-teal-100/50 rounded-full blur-[160px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-100/30 rounded-full blur-[180px]" />
        </div>

        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-emerald-100/80 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 p-[2px] shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-emerald-600">
                  <Recycle className="w-6 h-6 sm:w-7 sm:h-7 animate-spin-slow" />
                </div>
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-2">
                  Popular Vote
                  <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    ชุดรีไซเคิล 2569
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 font-light hidden sm:block">
                  โรงเรียนหนองวัวซอพิทยาคม
                </p>
              </div>
            </Link>

            {/* Navigation Actions */}
            <nav className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/leaderboard"
                className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 transition-all shadow-sm"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>ผลโหวต</span>
              </Link>

              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>แอดมิน</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 bg-white/80 backdrop-blur-md border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-light">
            <div className="flex items-center gap-2 text-slate-700">
              <Flame className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-900">โรงเรียนหนองวัวซอพิทยาคม</span>
            </div>
            <p className="text-slate-500">งานสัปดาห์วิทยาศาสตร์แห่งชาติ ปีการศึกษา 2569</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
