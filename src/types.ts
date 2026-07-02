export interface SchoolIdentity {
  namaSekolah: "SMAN 1 Amonggedo";
  namaGuru: string;
  nip: string;
  mataPelajaran: string;
  fase: "A" | "B" | "C" | "D" | "E" | "F";
  kelas: "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX" | "X" | "XI" | "XII";
  tahunPelajaran: string;
  namaKepalaSekolah?: string;
  nipKepalaSekolah?: string;
  formatTandaTangan?: string;
  tanggalValidasi?: string;
  logoProvinsi?: string;
  logoSekolah?: string;
  guruId: string; // Validated GuruID from Admin (Strict Protection)
}
