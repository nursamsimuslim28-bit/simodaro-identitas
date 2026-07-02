import React from 'react';
import { GraduationCap, Shield } from 'lucide-react';

export default function KopSurat() {
  return (
    <div className="w-full border-b-4 border-slate-900 pb-6 mb-8 mt-4 flex items-center justify-between px-4 md:px-12 bg-white text-slate-900">
      <div className="w-24 h-24 flex items-center justify-center shrink-0">
        <Shield className="w-16 h-16 text-slate-700" />
      </div>
      <div className="flex-1 text-center px-4">
        <h3 className="text-lg md:text-xl font-bold tracking-wider mb-1">PEMERINTAH PROVINSI SULAWESI TENGGARA</h3>
        <h3 className="text-md md:text-lg font-semibold tracking-wide mb-1">DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">SMA NEGERI 1 AMONGGEDO</h1>
        <p className="text-sm md:text-base font-medium">Alamat: Jl. Poros Amonggedo, Kec. Amonggedo, Kab. Konawe, Kode Pos 93452</p>
      </div>
      <div className="w-24 h-24 flex items-center justify-center shrink-0">
        <GraduationCap className="w-16 h-16 text-slate-700" />
      </div>
    </div>
  );
}
