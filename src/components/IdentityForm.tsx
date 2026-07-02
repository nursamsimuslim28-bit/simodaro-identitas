import React, { useState, useEffect } from 'react';
import { SchoolIdentity } from '../types';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  guruId: string;
  initialData: Partial<SchoolIdentity> | null;
  onSave: (data: SchoolIdentity) => Promise<void>;
  theme?: 'light' | 'dark';
}

const MATA_PELAJARAN = [
  "Pendidikan Agama Islam dan Budi Pekerti",
  "Pendidikan Agama Hindu dan Budi Pekerti",
  "Pendidikan Pancasila",
  "Bahasa Indonesia",
  "Matematika",
  "Koding dan Kecerdasan Artificial (KKA)",
  "Bahasa Inggris",
  "Sejarah",
  "Pendidikan Jasmani Olahraga dan Kesehatan",
  "Informatika",
  "Biologi",
  "Fisika",
  "Kimia",
  "Ekonomi",
  "Geografi",
  "Sosiologi",
  "Seni Budaya"
];

const FASE_KELAS_MAP: Record<string, string[]> = {
  "A": ["I", "II"],
  "B": ["III", "IV"],
  "C": ["V", "VI"],
  "D": ["VII", "VIII", "IX"],
  "E": ["X"],
  "F": ["XI", "XII"]
};

export default function IdentityForm({ guruId, initialData, onSave, theme = 'light' }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const isDark = theme === 'dark';

  const [isCustomMapel, setIsCustomMapel] = useState(() => {
    return initialData?.mataPelajaran && !MATA_PELAJARAN.includes(initialData.mataPelajaran) ? true : false;
  });

  const [formData, setFormData] = useState<Partial<SchoolIdentity>>({
    namaSekolah: "SMAN 1 Amonggedo",
    namaGuru: initialData?.namaGuru || '',
    nip: initialData?.nip || '',
    mataPelajaran: initialData?.mataPelajaran || MATA_PELAJARAN[0],
    fase: initialData?.fase || 'E',
    kelas: initialData?.kelas || 'X',
    tahunPelajaran: initialData?.tahunPelajaran || '2026/2027',
    namaKepalaSekolah: initialData?.namaKepalaSekolah || 'Hapri, S.Pd., M.Pd',
    nipKepalaSekolah: initialData?.nipKepalaSekolah || '19710172005021002',
    formatTandaTangan: initialData?.formatTandaTangan || 'Amonggedo,       Juli 2027',
    guruId: guruId
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'mapelSelect') {
      if (value === 'Lainnya') {
        setIsCustomMapel(true);
        setFormData(prev => ({ ...prev, mataPelajaran: '' }));
      } else {
        setIsCustomMapel(false);
        setFormData(prev => ({ ...prev, mataPelajaran: value }));
      }
      return;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-update kelas if fase changes
      if (name === 'fase') {
        const availableKelas = FASE_KELAS_MAP[value];
        if (availableKelas && !availableKelas.includes(updated.kelas as string)) {
          updated.kelas = availableKelas[0] as any;
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    if (!formData.namaGuru || !formData.nip || !formData.mataPelajaran || !formData.fase || !formData.kelas || !formData.tahunPelajaran || !formData.namaKepalaSekolah || !formData.nipKepalaSekolah || !formData.formatTandaTangan) {
      alert("Harap lengkapi semua formulir sebelum menyimpan. Tidak boleh ada yang kosong.");
      return;
    }

    if (formData.nip !== '-' && !/^\d+$/.test(formData.nip || '')) {
      alert("NIP Guru hanya boleh berisi angka atau tulis '-' jika honorer.");
      return;
    }

    if (formData.nip !== '-' && formData.nip?.length !== 18) {
      alert("NIP Guru harus 18 digit angka atau tulis '-' jika honorer.");
      return;
    }

    if (formData.nipKepalaSekolah !== '-' && !/^\d+$/.test(formData.nipKepalaSekolah || '')) {
      alert("NIP Kepala Sekolah hanya boleh berisi angka atau tulis '-' jika tidak memiliki NIP.");
      return;
    }
    
    if (formData.nipKepalaSekolah !== '-' && formData.nipKepalaSekolah?.length !== 18) {
      alert("NIP Kepala Sekolah harus 18 digit angka atau tulis '-' jika tidak memiliki NIP.");
      return;
    }

    setIsSaving(true);
    setShowSuccess(false);
    try {
      await onSave(formData as SchoolIdentity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data ke Google Drive.");
    } finally {
      setIsSaving(false);
    }
  };

  const availableKelas = FASE_KELAS_MAP[formData.fase || 'E'] || [];

  return (
    <div className={`max-w-4xl mx-auto rounded-2xl shadow-sm border pb-12 mb-12 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
      <div className="px-8 md:px-16 pt-12">
        <div className={`mb-10 border-b pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="max-w-2xl">
            <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-[#0F172A]'}`}>Formulir Identitas Guru</h2>
            <p className={`mt-3 text-justify leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Lengkapi data profil di bawah ini secara teliti. Data ini akan digunakan sebagai basis informasi untuk mencetak dokumen modul ajar dan RPP secara otomatis. Pastikan penulisan gelar dan NIP sudah benar.
            </p>
          </div>
          <div className={`text-sm font-mono px-4 py-2 rounded-xl border shadow-sm shrink-0 ${isDark ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
            ID: <span className="font-bold text-emerald-500">{guruId}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 tracking-wide ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>Nama Lengkap & Gelar</label>
              <input required type="text" name="namaGuru" value={formData.namaGuru} onChange={handleChange} placeholder="Contoh: Yustiani Razak, S.Pd." className={`w-full px-5 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium ${isDark ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-[#F8FAFC] border-slate-300 text-[#0F172A]'}`} />
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 tracking-wide ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>NIP</label>
              <input required type="text" name="nip" value={formData.nip} onChange={handleChange} placeholder="18 digit angka atau '-'" className={`w-full px-5 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-base ${isDark ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-[#F8FAFC] border-slate-300 text-[#0F172A]'}`} />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 tracking-wide ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>Mata Pelajaran</label>
              <select name="mapelSelect" value={isCustomMapel ? 'Lainnya' : formData.mataPelajaran} onChange={handleChange} className={`w-full px-5 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium cursor-pointer ${isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-[#F8FAFC] border-slate-300 text-[#0F172A]'}`}>
                {MATA_PELAJARAN.map(mp => <option key={mp} value={mp}>{mp}</option>)}
                <option value="Lainnya">Lainnya...</option>
              </select>
              {isCustomMapel && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input required type="text" name="mataPelajaran" value={formData.mataPelajaran} onChange={handleChange} placeholder="Masukkan mata pelajaran baru..." className={`w-full px-5 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium ${isDark ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-[#F8FAFC] border-slate-300 text-[#0F172A]'}`} />
                </div>
              )}
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 tracking-wide ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>Fase</label>
              <select name="fase" value={formData.fase} onChange={handleChange} className={`w-full px-5 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium cursor-pointer ${isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-[#F8FAFC] border-slate-300 text-[#0F172A]'}`}>
                {Object.keys(FASE_KELAS_MAP).map(f => (
                  <option key={f} value={f}>Fase {f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 tracking-wide ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>Kelas</label>
              <select name="kelas" value={formData.kelas} onChange={handleChange} className={`w-full px-5 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium cursor-pointer ${isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-[#F8FAFC] border-slate-300 text-[#0F172A]'}`}>
                {availableKelas.map(k => (
                  <option key={k} value={k}>Kelas {k}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 tracking-wide ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>Tahun Pelajaran</label>
              <input required type="text" name="tahunPelajaran" value={formData.tahunPelajaran} onChange={handleChange} placeholder="YYYY/YYYY" className={`w-full px-5 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-base ${isDark ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-[#F8FAFC] border-slate-300 text-[#0F172A]'}`} />
            </div>

            <div className={`md:col-span-2 border-t pt-8 mt-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <label className={`block text-sm font-bold mb-2 tracking-wide ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>Nama Kepala Sekolah</label>
              <input required type="text" name="namaKepalaSekolah" value={formData.namaKepalaSekolah} onChange={handleChange} className={`w-full px-5 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium ${isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-[#F8FAFC] border-slate-300 text-[#0F172A]'}`} />
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 tracking-wide ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>NIP Kepala Sekolah</label>
              <input required type="text" name="nipKepalaSekolah" value={formData.nipKepalaSekolah} onChange={handleChange} className={`w-full px-5 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-base ${isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-[#F8FAFC] border-slate-300 text-[#0F172A]'}`} />
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 tracking-wide ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>Format Tanda Tangan</label>
              <input required type="text" name="formatTandaTangan" value={formData.formatTandaTangan} onChange={handleChange} placeholder="Contoh: Amonggedo,            Juli 2027" className={`w-full px-5 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium ${isDark ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600' : 'bg-[#F8FAFC] border-slate-300 text-[#0F172A]'}`} />
            </div>
          </div>

          <div className={`pt-10 mt-4 flex justify-end items-center border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {showSuccess && (
              <span className="flex items-center text-emerald-500 mr-6 font-bold tracking-wide">
                <CheckCircle2 className="w-6 h-6 mr-2" />
                Data Berhasil Disimpan
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className={`px-10 py-4 rounded-xl font-bold flex items-center transition-all disabled:opacity-70 shadow-lg ${isDark ? 'bg-emerald-500 hover:bg-emerald-600 text-[#0B1226] shadow-emerald-500/10' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'}`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6 mr-3" />
                  Simpan Identitas
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
