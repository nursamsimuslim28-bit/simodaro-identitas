# AGENTS.md - KETENTUAN DAN BLUEPRINT UTUH SISTEM MODULAR siModArO
## SMAN 1 AMONGGEDO (ACUAN UNTUK SEMUA AGEN AI & PENGEMBANGAN SUB-MODUL)

Dokumen ini adalah acuan arsitektur utama untuk sistem **siModArO (Sistem Modular Akademik)** SMAN 1 Amonggedo. Setiap Agen AI yang ditugaskan untuk membuat, memodifikasi, atau memelihara sub-modul (Identitas Guru, Analisis CP, Analisis Alokasi Waktu, KKTP, Modul Ajar, dll.) wajib membaca, memahami, dan mematuhi blueprint ini agar seluruh ekosistem terintegrasi secara fungsional, aman, dan konsisten secara visual.

---

## 1. STRUKTUR ARSITEKTUR & ALIRAN DATA (Ecosystem Flow)
Sistem **siModArO** dibangun dengan arsitektur **Parent-Child Hub-and-Spoke** menggunakan Blogger sebagai Parent Hub dan aplikasi React (Vite + TypeScript) sebagai Child Sub-Modules:

1. **Parent Hub (Blogger Portal Hub - `tema-blogger-baru.xml`)**:
   - Berfungsi sebagai wrapper utama dengan Sidebar Identitas Guru, Kotak Saran, dan Iframe Viewer di area kanan.
   - Mengelola state global secara lokal (`localStorage` browser) dan menyinkronkan data profil dari Firebase Firestore (`school_settings/modular_theme`).
   - Menyediakan tombol pemilih modul yang akan memuat aplikasi sub-modul ke dalam Iframe.

2. **Iframe Sandbox & URL Propagation**:
   - Ketika sub-modul dimuat di dalam Iframe, Parent Hub akan otomatis menyuntikkan parameter identitas guru aktif melalui URL:
     ```
     https://<sub-modul-url>/?guruId=GURU-AM-2D565&nama=Yustiani%20Razak,%20S.Pd&gemini=AIzaSy...&embedded=true
     ```
   - Sub-modul wajib menangkap parameter query ini (`guruId`, `nama`, `gemini`, `embedded`) pada saat startup untuk mengaktifkan dirinya secara otomatis tanpa meminta login ulang.

3. **Sinkronisasi Dua Arah (Window postMessage)**:
   - Jika ada perubahan identitas di tingkat sub-modul, sub-modul harus memancarkan event ke parent:
     ```javascript
     window.parent.postMessage({
       type: "SIMODARO_UPDATE_STATE",
       guruId: newGuruId,
       namaGuru: newNamaGuru
     }, "*");
     ```
   - Sebaliknya, sub-modul wajib mendengarkan event sinkronisasi dari parent untuk memperbarui state internalnya secara realtime:
     ```javascript
     window.addEventListener("message", (event) => {
       if (event.data && event.data.type === "SIMODARO_SYNC_STATE") {
         // Update state guruId, namaGuru, geminiApiKey di sub-modul
       }
     });
     ```

---

## 2. PROTEKSI GURUID & MEKANISME "ANTI-BYPASS" (Lock Screen)
Keamanan data administrasi guru SMAN 1 Amonggedo sangat bergantung pada validitas GuruID. 

### Aturan Keamanan Utama:
- **Wajib Layar Terkunci (Lock Screen)**: Sub-modul dilarang keras dapat diakses jika parameter `guruId` kosong, tidak terdefinisi, atau bernilai placeholder. Tampilkan komponen penutup layar penuh (Lock Screen) berwarna merah/kuning dengan keterangan jelas: **"APLIKASI TERKUNCI: Silakan lengkapi atau registrasi GuruID Anda melalui Portal Hub siModArO SMAN 1 Amonggedo"**.
- **Data Simulasi & Sandbox Resmi**:
  Untuk keperluan uji coba, pengembangan lokal, dan simulasi, gunakan GuruID simulasi resmi berikut:
  - **Uji Coba GuruID**: `GURU-AM-2D565`
  - **Uji Coba Nama**: `Yustiani Razak, S.Pd`
  Sub-modul harus mengizinkan akses jika parameter URL yang dikirimkan adalah data simulasi di atas.

---

## 3. SOLUSI SANDBOX IFRAME & COMPATIBILTIY (Browser Workarounds)
Karena dijalankan di dalam Iframe Blogger, browser modern (seperti Chrome, Safari, Firefox) sering kali memblokir penyimpanan cookie pihak ketiga dan `localStorage` pihak ketiga.

### Aturan Penulisan Kode Safe-Storage:
1. **Bungkus LocalStorage dengan Try/Catch**:
   Setiap pemanggilan `localStorage` di sub-modul wajib dibungkus dengan blok `try-catch` untuk menghindari crash fatal akibat pembatasan keamanan browser (`SecurityError`):
   ```typescript
   let memoryStorage: Record<string, string> = {};

   export const safeGetItem = (key: string): string | null => {
     try {
       return localStorage.getItem(key);
     } catch (e) {
       return memoryStorage[key] || null;
     }
   };

   export const safeSetItem = (key: string, value: string): void => {
     try {
       localStorage.setItem(key, value);
     } catch (e) {
       memoryStorage[key] = value;
     }
   };
   ```

2. **Tombol "Buka di Tab Baru" (Amber Warning Fallback)**:
   Jika proses Google OAuth atau koneksi Google Drive API terhambat oleh kebijakan sandboxing iframe, sub-modul wajib mendeteksi kondisi ini atau menyediakan tombol fallback yang menonjol berwarna Amber: **"Buka di Tab Baru untuk Sinkronisasi Google Drive"**. Tombol ini akan membuka aplikasi di jendela browser utama secara standalone menggunakan:
   ```javascript
   window.open(window.location.href, '_blank');
   ```

---

## 4. ESTETIKA DESAIN & IDENTITAS VISUAL (Cosmic Slate Theme)
Seluruh sub-modul wajib menggunakan bahasa desain visual **"Cosmic Slate Theme"** yang seragam agar transisi antar modul terasa mulus dan menyatu secara visual.

### Spesifikasi Palet & UI Tailwind:
- **Background Utama**: Default mode gelap menggunakan `bg-slate-950` atau `bg-slate-900`.
- **Card / Bento Grid Panel**: Menggunakan warna solid `bg-slate-900/60` atau `bg-slate-950` dengan garis tepi tipis berkualitas tinggi `border border-slate-800/80` atau `border-slate-850`.
- **Warna Aksen Utama**: Menggunakan warna **Amber** (untuk peringatan/petunjuk) atau **Emerald** (untuk kesuksesan/simpan).
  - Judul Sub-seksi: `text-amber-400` atau `text-emerald-400`
  - Latar pendaran ikon: `bg-amber-500/10` dengan teks `text-amber-500`.
  - Tombol Utama: Menggunakan gradasi tebal `bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold font-mono` atau `from-amber-600 to-amber-500`.
- **Pewarnaan Teks Kontras Tinggi (High Contrast)**:
  - Judul / Heading tebal: `text-slate-100` (atau hitam pekat di Light Mode).
  - Teks deskripsi/paragraf: `text-slate-300` atau `text-slate-400` dengan pengaturan perataan **Rata Kiri-Kanan** (`text-justify` / `text-align: justify`) untuk memastikan keindahan cetak berstandar kenegaraan.
  - Angka, Tabel, Label, Status, & GuruID: Wajib menggunakan font **Monospace** (`font-mono` / Fira Code / JetBrains Mono).
- **Tipografi**:
  - Gunakan font Sans-serif elegan (**Inter**) untuk interface general dan dialog box.
  - Gunakan font Display futuristik (**Space Grotesk** / **Outfit**) untuk judul halaman besar.

---

## 5. REKAYASA PENYIMPANAN DATA & ATURAN HURUF KECIL (Cascading Cloud Data & Lowercase Policy)
Setiap data yang dihasilkan oleh guru harus disimpan secara terstruktur di Google Drive pribadi guru pada folder khusus `/siModArO-Database/{GuruID}/`.

### Aturan Penamaan Huruf Kecil Mutlak (All-Lowercase Policy):
Untuk mencegah kesalahan fatal sinkronisasi dan pembacaan data antar sub-modul akibat sensitivitas huruf (case-sensitivity), ditetapkan aturan mutlak berikut:
1. **Semua nama berkas JSON di Google Drive wajib menggunakan huruf kecil semua (all lowercase).**
2. **Tidak boleh menggunakan spasi.** Karakter spasi wajib diganti dengan garis bawah (underscore `_`).
3. **Format penamaan modul pendukung** jika diperlukan spesifik mata pelajaran, fase, dan kelas adalah: `{nama_modul}_{nama_mapel}_{fase}_{kelas}.json` (contoh: `identitas_kimia_f_xi.json`).

### Skema Direktori Google Drive Utama (Mengikuti Aturan Huruf Kecil):
- Berkas Identitas Guru: `/siModArO-Database/{GuruID}/identitas.json` (atau jika spesifik: `identitas_{mapel}_{fase}_{kelas}.json` semuanya dalam huruf kecil).
- Berkas Analisis CP & TP: `/siModArO-Database/{GuruID}/analisis-cp.json` (atau jika spesifik: `analisis_cp_{mapel}_{fase}_{kelas}.json` dalam huruf kecil).
- Berkas Analisis Alokasi Waktu: `/siModArO-Database/{GuruID}/alokasi-waktu.json` (atau jika spesifik: `alokasi_waktu_{mapel}_{fase}_{kelas}.json` dalam huruf kecil).
- Berkas KKTP: `/siModArO-Database/{GuruID}/kktp.json` (atau jika spesifik: `kktp_{mapel}_{fase}_{kelas}.json` dalam huruf kecil).
- Berkas Modul Ajar: `/siModArO-Database/{GuruID}/modul-ajar.json` (atau jika spesifik: `modul_ajar_{mapel}_{fase}_{kelas}.json` dalam huruf kecil).

### Fetching Folder Bersama Admin (Khusus Modul Analisis CP):
Untuk modul **Analisis CP & TP**, database CP resmi SMAN 1 Amonggedo diambil langsung dari folder Google Drive bersama milik Admin dengan ID: `1Fxz65TWY9sURsNltBU_6xw39HmSqtoge`.
Format file di dalam folder tersebut wajib dikonversi atau dicari dalam format huruf kecil penuh: `cp_{mapel}_{fase}_{kelas}.json` (contoh: `cp_kimia_e_x.json` - dengan seluruh nama mata pelajaran, fase, dan kelas diubah menjadi huruf kecil dan spasi diganti underscore). Sub-modul wajib melakukan `.toLowerCase()` sebelum melakukan query pencarian file ke Google Drive API.

---

## 6. LAYOUT STANDAR CETAK DOKUMEN (Pristine Print layout)
Dokumen yang dihasilkan oleh sub-modul (seperti analisis CP, modul ajar, Kaldik, rincian efektif) harus diformat agar siap dicetak langsung via printer atau disimpan ke PDF dengan kualitas tata letak tingkat tinggi:

1. **KOP Surat Resmi SMAN 1 Amonggedo**:
   Wajib berada di halaman paling atas cetak dokumen resmi:
   ```
   PEMERINTAH PROVINSI SULAWESI TENGGARA
   DINAS PENDIDIKAN DAN KEBUDAYAAN
   SMA NEGERI 1 AMONGGEDO
   Alamat: Jl. Poros Amonggedo, Kec. Amonggedo, Kab. Konawe, Kode Pos 93452
   ======================================================================
   (Garis pembatas ganda tebal menggunakan border-b-2 border-double border-slate-900)
   ```
   Diapit oleh Logo Provinsi Sulawesi Tenggara di sisi kiri dan Logo SMAN 1 Amonggedo di sisi kanan.

2. **Tata Letak Lembar Tanda Tangan**:
   - Kolom Validator/Kepala Sekolah/Pengawas berada di sisi kiri bawah.
   - Kolom Guru Mata Pelajaran berada di sisi kanan bawah.
   - Wajib menggunakan properti `print:break-inside-avoid` pada blok tanda tangan agar tidak terbelah sendiri di halaman kosong baru.

---

## 7. MODEL DATA UTAMA (SCHEMA TYPES)
Semua sub-modul wajib mengimplementasikan struktur data TypeScript secara tepat tanpa modifikasi nama variabel agar kompatibel satu sama lain:

```typescript
// Schema Dasar Identitas Guru (identitas.json)
export interface TeacherProfile {
  guruId: string;
  namaLengkap: string;
  nip?: string;
  pangkatGolongan?: string;
  mataPelajaran: string;
  fase: "E" | "F";
  kelas: "X" | "XI" | "XII";
  sekolah: "SMAN 1 AMONGGEDO";
}

// Schema Hasil Analisis CP & TP (analisis-cp.json)
export interface CPElement {
  id: string;
  namaElemen: string;
  deskripsiCP: string;
}

export interface TPItem {
  id: string;
  elemenId: string;
  tpText: string;
  lingkupMateri: string;
  alokasiWaktu: number;
  semester: "Ganjil" | "Genap";
  tingkatSOLO: "Unistructural" | "Multistructural" | "Relational" | "Extended Abstract";
  atpText?: string;
}
```

---

## 8. PEDAGOGY & CURRICULUM STANDARDS SMAN 1 AMONGGEDO
1. **SOLO Taxonomy**:
   - Unistructural: Level kognitif dasar, mengingat 1 aspek terisolasi.
   - Multistructural: Memahami beberapa aspek terpisah yang belum terintegrasi secara fungsional.
   - Relational: Menghubungkan konsep secara mendalam membentuk struktur pemahaman yang utuh.
   - Extended Abstract: Menganalisis kritis, evaluasi mandiri, memformulasikan hipotesis/prinsip baru (HOTS).

2. **Deep Learning (3 Stages)**:
   - **Understand (Memahami)**: Membangun konsep mendalam melalui diskusi kritis.
   - **Apply (Mengaplikasikan)**: Menerapkan konsep baru ke masalah nyata secara kontekstual.
   - **Reflect (Merefleksikan)**: Mengevaluasi dan mengulas proses berpikir secara jujur.

---

*Setiap AI Agent yang membuat modul baru di bawah ekosistem **siModArO** harus menyalin atau merujuk aturan visual, data parameter, solusi Iframe sandbox, dan database CP bersama di atas ke dalam prompt kerjanya untuk memastikan keselarasan penuh.*
