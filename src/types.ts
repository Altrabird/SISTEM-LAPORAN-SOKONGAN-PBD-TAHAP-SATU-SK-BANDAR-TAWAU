export interface Student {
  id: string;
  name: string;
  currentTp: number; // TP Sebelum — tahap penguasaan sebelum aktiviti (1-6)
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
  images: string[];       // Array of Base64 strings or Object URLs for pictorial report
  imageCaptions?: string[]; // Captions for each uploaded image
  createdAt?: string;     // Timestamp rekod dibuat
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
}

/** Pegawai lalai bagi senarai, atau yang pertama jika tiada ditanda. */
export function defaultOfficer(senarai: Officer[] = []): Officer | undefined {
  return senarai.find(o => o.isDefault) ?? senarai[0];
}

