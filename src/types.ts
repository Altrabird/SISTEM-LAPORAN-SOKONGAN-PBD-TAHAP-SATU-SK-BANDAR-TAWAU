export interface Student {
  id: string;
  name: string;
  currentTp: number; // Tahap Penguasaan 1-6
  targetTp: number;  // Target Tahap Penguasaan 1-6
  notes?: string;
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
