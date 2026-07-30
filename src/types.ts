/**
 * Pilihan TP Asal (sebelum aktiviti) — hanya TP 1 dan TP 2.
 *
 * Aktiviti sokongan PBD disasarkan kepada murid yang BELUM menguasai. Murid
 * pada TP 3 dan ke atas tidak berada dalam kumpulan sasaran, jadi menawarkan
 * TP 3-6 di ruangan "asal" hanya membuka ruang salah pilih dan menghasilkan
 * statistik intervensi yang tidak benar.
 */
export const PILIHAN_TP_ASAL = [1, 2];

/** Pilihan TP Sasaran dan TP Selepas — keseluruhan skala PBD. */
export const PILIHAN_TP_PENUH = [1, 2, 3, 4, 5, 6];

export interface Student {
  id: string;
  name: string;
  currentTp: number; // TP Asal — tahap penguasaan sebelum aktiviti (1-2)
  targetTp: number;  // TP Sasaran — tahap yang disasarkan oleh guru (1-6)
  /**
   * TP Selepas — tahap penguasaan yang BENAR-BENAR dicapai selepas aktiviti (1-6).
   *
   * Dibiarkan undefined sehingga guru menilai murid selepas sesi. Ini berbeza
   * daripada targetTp: sasaran ialah hasrat, manakala tpAfter ialah bukti impak.
   * Laporan dan carta hendaklah menggunakan tpAfter untuk mengukur pencapaian,
   * dan hanya jatuh semula kepada targetTp jika penilaian belum dibuat.
   */
  tpAfter?: number;
  notes?: string;
}

/** Kenaikan TP sebenar bagi seorang murid, atau null jika belum dinilai. */
export function tpGain(student: Student): number | null {
  if (typeof student.tpAfter !== 'number') return null;
  return student.tpAfter - student.currentTp;
}

/** TP hasil yang hendak dipaparkan: keputusan sebenar jika ada, jika tidak sasaran. */
export function tpOutcome(student: Student): number {
  return typeof student.tpAfter === 'number' ? student.tpAfter : student.targetTp;
}

/** Adakah murid ini sudah dinilai selepas aktiviti? */
export function isAssessed(student: Student): boolean {
  return typeof student.tpAfter === 'number';
}

export interface ActivityLog {
  id: string;
  groupName: string;      // Kumpulan (e.g. Ancala, Baluran, Ceremai)
  teacherOnDuty: string;  // Guru Bertugas (e.g. Siti Noraidah)
  date: string;           // Tarikh (YYYY-MM-DD)
  day: string;            // Hari (Isnin, Selasa, etc.)
  className: string;      // Kelas (e.g. 1 Kritis, 2 Kritis, 3 Kritis)
  subject: 'BM' | 'BI';   // Subjek
  activityName: string;   // Nama Aktiviti (e.g. Main peranan)
  activityDesc: string;   // Deskripsi Aktiviti
  subjectTeacher: string; // Guru Subjek yang terlibat (e.g. Samsiah Sundu)
  students: Student[];    // Murid yang terlibat
  notes: string;          // Catatan / Impak
  images: string[];       // Rujukan "idb:<id>" ke gambar dalam IndexedDB peranti ini
  imageCaptions?: string[]; // Captions for each uploaded image
  createdAt?: string;     // Timestamp rekod dibuat
  /**
   * ID fail Google Drive bagi setiap gambar, diisi selepas penyegerakan.
   *
   * Rujukan `images` hanya bermakna pada peranti yang memuat naik gambar
   * berkenaan — IndexedDB tidak dikongsi antara peranti. Apabila rekod
   * dimuatkan pada telefon lain, ID inilah yang membolehkan gambar dipaparkan,
   * melalui https://lh3.googleusercontent.com/d/<id>.
   */
  driveImages?: string[];
  /** Cap masa penyegerakan terakhir ke Google Sheets. */
  syncedAt?: string;
}

export interface PbdStrategyRequest {
  subject: 'BM' | 'BI';
  topic: string;
  currentTp: number;
  targetTp: number;
  studentCount: number;
}

export interface DutyWeek {
  number: number;
  dates: string;
  holidays?: string[];
}

export interface DutyMember {
  name: string;
  role: string;
}

export interface DutyGroup {
  name: string;
  weeks: DutyWeek[];
  members: DutyMember[];
  holidays?: string[];
  perananKetua?: string[];
}

/**
 * Pegawai yang menandatangani laporan.
 *
 * Laporan bergambar mempunyai dua ruangan tandatangan: pihak yang menyediakan
 * (pelapor — biasanya guru bertugas) dan pihak yang menyemak/mengesahkan
 * (penyemak — pentadbir sekolah). Nama dan jawatan disimpan bersama supaya
 * blok tandatangan sentiasa tepat tanpa perlu ditaip semula setiap kali.
 */
export interface Officer {
  id: string;
  name: string;
  position: string;
  /** Dipaparkan dahulu dalam senarai pilihan dan menjadi pilihan lalai. */
  isDefault?: boolean;
}

/**
 * Seorang murid dalam senarai induk sekolah.
 *
 * Senarai ini diisi sekali (secara tampal pukal) dan kemudian digunakan
 * semula pada setiap laporan: guru menanda murid daripada senarai kelas
 * berkenaan, bukan menaip nama penuh setiap kali pada telefon.
 */
export interface StudentRosterEntry {
  id: string;
  name: string;
  className: string;
}

export interface AppSettings {
  schoolName: string;
  schoolShortCode: string;
  footerText: string;
  availableClasses: string[];
  commonActivitiesBm: string[];
  commonActivitiesBi: string[];
  tanggungjawabUmum: string[];
  dutyGroups: DutyGroup[];
  /** Guru yang menyediakan laporan. */
  pelaporList?: Officer[];
  /** Pentadbir yang menyemak dan mengesahkan laporan. */
  penyemakList?: Officer[];
  /** Senarai induk nama murid, dikumpulkan mengikut kelas. */
  studentRoster?: StudentRosterEntry[];
  /** Preset catatan kemajuan bagi seorang murid. */
  catatanMuridPresets?: string[];
  /** Preset catatan impak / refleksi keseluruhan sesi. */
  catatanImpakPresets?: string[];
  /**
   * Versi skema tetapan yang tersimpan.
   *
   * Tetapan disimpan dalam localStorage, jadi guru yang pernah membuka sistem
   * ini akan terus melihat senarai lama (termasuk kelas rekaan) walaupun kod
   * telah dikemas kini. Nombor ini membolehkan migrasi dijalankan sekali.
   */
  settingsVersion?: number;
}

/** Pegawai lalai bagi senarai, atau yang pertama jika tiada ditanda. */
export function defaultOfficer(senarai: Officer[] = []): Officer | undefined {
  return senarai.find(o => o.isDefault) ?? senarai[0];
}

