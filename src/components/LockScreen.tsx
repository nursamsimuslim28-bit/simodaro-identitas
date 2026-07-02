import React from 'react';
import { Lock } from 'lucide-react';

interface Props {
  theme?: 'light' | 'dark';
}

export default function LockScreen({ theme = 'light' }: Props) {
  const isDark = theme === 'dark';
  
  return (
    <div className={`theme-${theme} min-h-screen flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300 ${isDark ? 'bg-[#0B1226]' : 'bg-[#E2E8F0]'}`}>
      <div className={`max-w-md w-full border rounded-2xl p-10 shadow-2xl text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-amber-500/10' : 'bg-amber-100'}`}>
          <Lock className={`w-8 h-8 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
        </div>
        <h1 className={`text-3xl font-bold mb-4 tracking-tight ${isDark ? 'text-slate-100' : 'text-[#0F172A]'}`}>
          APLIKASI TERKUNCI
        </h1>
        <p className={`mb-8 leading-relaxed text-justify ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Hubungi Admin atau akses dari blog hub (link: <a href="https://admsetahun.blogspot.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://admsetahun.blogspot.com/</a>)
        </p>
        <div className={`text-xs font-mono border-t pt-6 ${isDark ? 'text-slate-600 border-slate-800' : 'text-slate-500 border-slate-200'}`}>
          &copy; {new Date().getFullYear()} siModArO
          <br />
          Protected by Admin
        </div>
      </div>
    </div>
  );
}
