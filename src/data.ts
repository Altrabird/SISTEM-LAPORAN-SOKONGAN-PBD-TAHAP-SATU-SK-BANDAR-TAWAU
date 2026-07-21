import { ActivityLog, Officer } from './types';

// Beautiful SVG placeholders as mock base64/image URLs to simulate uploaded photos
export const PLACEHOLDER_IMAGES = {
  classroom1: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800',
  classroom2: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
  classroom3: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
  groupLearning: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800'
};

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-001',
    groupName: 'Ancala',
    teacherOnDuty: 'Siti Noraidah',
    date: '2026-07-20',
    day: 'Isnin',
    className: '3 Kritis',
    subject: 'BM',
    activityName: 'Main Peranan (Kemahiran Bertutur)',
    activityDesc: 'Murid melakonkan watak dan berdialog berdasarkan skrip bertema "Kerjasama di Kampung". Setiap murid memainkan peranan berbeza untuk melatih nada suara, intonasi, dan sebutan yang betul.',
    subjectTeacher: 'Samsiah Sundu',
    students: [
      { id: 'stud-101', name: 'Akram', currentTp: 2, targetTp: 3, notes: 'Berjaya bertutur dengan lancar menggunakan ayat mudah.' },
      { id: 'stud-102', name: 'M. Yusuf', currentTp: 2, targetTp: 3, notes: 'Menunjukkan peningkatan sebutan perkataan yang mengandungi digraf.' },
      { id: 'stud-103', name: 'Adam', currentTp: 1, targetTp: 2, notes: 'Mula berani melafazkan dialog ringkas dengan bimbingan guru.' },
      { id: 'stud-104', name: 'Rayyan', currentTp: 2, targetTp: 3, notes: 'Dapat melakonkan watak sampingan dengan intonasi yang sesuai.' }
    ],
    notes: 'Semua murid yang terlibat berjaya melakonkan watak berdasarkan dialog masing-masing dengan penuh keyakinan. Murid menunjukkan minat tinggi dalam aktiviti hands-on.',
    images: [PLACEHOLDER_IMAGES.classroom1, PLACEHOLDER_IMAGES.groupLearning],
    imageCaptions: ['Murid-murid berbincang dan memilih watak masing-masing.', 'Sesi simulasi main peranan di hadapan kelas disaksikan guru bertugas.'],
    createdAt: '2026-07-20T10:30:00Z'
  },
  {
    id: 'act-002',
    groupName: 'Baluran',
    teacherOnDuty: 'Ahmad Rafiqi',
    date: '2026-07-21',
    day: 'Selasa',
    className: '2 Kreatif',
    subject: 'BI',
    activityName: 'Interactive Spelling Bee & Phonics Wheel',
    activityDesc: 'Students spin the "Phonics Wheel" to choose a sound family, then spell and read 3 letters or 4 letters CVC words. Supports students to recognize phonemes and improve blending.',
    subjectTeacher: 'Michelle Wong',
    students: [
      { id: 'stud-201', name: 'Arissa Sofia', currentTp: 2, targetTp: 3, notes: 'Successfully blended "sh" and "ch" word sounds.' },
      { id: 'stud-202', name: 'Khairul Ikhwan', currentTp: 2, targetTp: 3, notes: 'Read short sentences containing sight words with ease.' },
      { id: 'stud-203', name: 'Haikal Danish', currentTp: 1, targetTp: 2, notes: 'Aided by visual cards to segment vowel sounds.' }
    ],
    notes: 'Students enjoyed the gamified wheel. Haikal showed a big leap in recognizing the short "a" sound. Arissa is ready to move to TP3.',
    images: [PLACEHOLDER_IMAGES.classroom2],
    imageCaptions: ['Students queue up eagerly to spin the Phonics Wheel and spell words.'],
    createdAt: '2026-07-21T09:15:00Z'
  },
  {
    id: 'act-003',
    groupName: 'Ceremai',
    teacherOnDuty: 'Fatimah Az-Zahra',
    date: '2026-07-16',
    day: 'Khamis',
    className: '1 Progresif',
    subject: 'BM',
    activityName: 'Mari Membaca: Suku Kata Terbuka',
    activityDesc: 'Sesi bimbingan intensif individu menggunakan kad imbasan suku kata (KVKV) interaktif. Murid mencantumkan suku kata menjadi perkataan bermakna dan memadankan dengan gambar yang betul.',
    subjectTeacher: 'Samsiah Sundu',
    students: [
      { id: 'stud-301', name: 'Nurul Iman', currentTp: 1, targetTp: 3, notes: 'Dapat mengeja suku kata KV dengan lancar.' },
      { id: 'stud-302', name: 'M. Danial', currentTp: 2, targetTp: 3, notes: 'Membaca ayat tunggal pendek tanpa mengeja.' }
    ],
    notes: 'Iman menunjukkan perkembangan luar biasa, sudah mula boleh mencantum dua suku kata terbuka tanpa meragu-ragu.',
    images: [PLACEHOLDER_IMAGES.classroom3],
    imageCaptions: ['Bimbingan rapat secara bersemuka bagi meningkatkan keupayaan mengeja suku kata terbuka.'],
    createdAt: '2026-07-16T11:00:00Z'
  }
];

export const AVAILABLE_GROUPS = ['Ancala', 'Buana', 'Candra', 'Kencana', 'Mega', 'Pawana'];
export const MALAYSIAN_DAYS = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
export const AVAILABLE_CLASSES = ['1 Kritis', '1 Kreatif', '1 Progresif', '2 Kritis', '2 Kreatif', '2 Progresif', '3 Kritis', '3 Kreatif', '3 Progresif'];
export const COMMON_ACTIVITIES_BM = [
  'Main peranan (Roleplay)',
  'Bercerita (Storytelling)',
  'Mari Membaca Suku Kata',
  'Kuiz Interaktif / Kahoot',
  'Nyanyian dan Muzik Suku Kata',
  'Permainan Kad Perkataan',
  'Kerja Kumpulan (Bento PBD)',
  'Kuiz Menulis Ayat Mudah'
];
export const COMMON_ACTIVITIES_BI = [
  'Roleplay / Dialogues',
  'Spelling Bee',
  'Phonics Wheel & Blending',
  'Show and Tell',
  'Vocabulary Matching Games',
  'Interactive Storytelling',
  'Sight Words Bingo',
  'Choral Speaking / Action Song'
];
export const TAHAP_PENGUASAAN_DESCS = [
  'TP1: Tahu (Murid tahu perkara asas / sangat terhad)',
  'TP2: Tahu dan faham (Murid menunjukkan kefahaman untuk bertukar maklumat)',
  'TP3: Tahu, faham dan boleh buat (Murid menggunakan pengetahuan untuk melaksanakan tugasan asas)',
  'TP4: Tahu, faham dan boleh buat dengan beradab (Murid melaksanakan tugasan dengan betul dan sopan)',
  'TP5: Tahu, faham dan boleh buat dengan beradab terpuji (Murid melaksanakan tugasan secara konsisten dan kreatif)',
  'TP6: Tahu, faham dan boleh buat dengan beradab mithali (Murid menjadi contoh / menghasilkan karya kreatif baharu)'
];

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

export const OFFICIAL_DUTY_GROUPS: DutyGroup[] = [
  {
    name: 'Ancala',
    weeks: [
      { number: 1, dates: '12 - 16 JANUARI' },
      { number: 8, dates: '02 - 06 MAC' },
      { number: 14, dates: '20 - 24 APRIL' },
      { number: 20, dates: '15 - 19 JUN', holidays: ['AWAL MUHARRAM (17 JUN 2026)'] },
      { number: 26, dates: '27 - 31 JULAI' },
      { number: 32, dates: '14 - 18 SEPTEMBER', holidays: ['HARI MALAYSIA (16 SEPTEMBER 2026)'] },
      { number: 38, dates: '26 - 30 OKTOBER' }
    ],
    members: [
      { name: 'SITI NORAIDAH', role: 'Ketua/Perhimpunan' },
      { name: 'MOHD. FAWWAZ', role: 'Kebersihan/Disiplin' },
      { name: 'SUTINAH', role: 'Kehadiran Kelas' },
      { name: 'NUR KHUZAIMAH', role: 'RMT/Kantin' }
    ],
    holidays: [
      'AWAL MUHARRAM (17 JUN 2026)',
      'HARI MALAYSIA (16 SEPTEMBER 2026)'
    ],
    perananKetua: [
      'Memastikan semua ahli melaksanakan tugas dan merekodkan laporan dalam format OPR.',
      'Memastikan OPR laporan Perhimpunan Mingguan disediakan.',
      'Memastikan rekod kehadiran murid dilaporkan dan direkodkan.',
      'Mengubah kitaran agihan tugas berdasarkan perbincangan sesama ahli kumpulan.',
      'Membantu mengurus dan merekod murid sakit, cedera dan sebagainya.',
      'Memastikan ada guru yang menyambut murid datang dan memantau penyuraian murid.'
    ]
  },
  {
    name: 'Buana',
    weeks: [
      { number: 2, dates: '19 - 23 JANUARI' },
      { number: 9, dates: '09 - 13 MAC' },
      { number: 15, dates: '27 APRIL - 01 MEI', holidays: ['HARI PEKERJA (01 MEI 2026)'] },
      { number: 21, dates: '22 - 26 JUN' },
      { number: 27, dates: '03 - 07 OGOS' },
      { number: 33, dates: '21 - 25 SEPTEMBER 2026' },
      { number: 39, dates: '02 - 06 NOVEMBER' }
    ],
    members: [
      { name: 'HARSIDI', role: 'Ketua/Perhimpunan' },
      { name: 'SENABE', role: 'Kebersihan/Disiplin' },
      { name: 'MISRAH', role: 'Kehadiran Kelas' },
      { name: 'IDRISSIAH', role: 'RMT/Kantin' }
    ],
    holidays: [
      'HARI PEKERJA (01 MEI 2026)'
    ],
    perananKetua: [
      'Memastikan semua ahli melaksanakan tugas dan merekodkan laporan dalam format OPR.',
      'Memastikan OPR laporan Perhimpunan Mingguan disediakan.',
      'Memastikan rekod kehadiran murid dilaporkan dan direkodkan.',
      'Mengubah kitaran agihan tugas berdasarkan perbincangan sesama ahli kumpulan.',
      'Membantu mengurus dan merekod murid sakit, cedera dan sebagainya.',
      'Memastikan ada guru yang menyambut murid datang dan memantau penyuraian murid.'
    ]
  },
  {
    name: 'Candra',
    weeks: [
      { number: 3, dates: '26 - 30 JANUARI' },
      { number: 10, dates: '16 - 20 MAC', holidays: ['HARI RAYA AIDILFITRI (19 - 20 MAC 2026)'] },
      { number: 16, dates: '04 - 08 MEI' },
      { number: 22, dates: '29 JUN - 03 JULAI' },
      { number: 28, dates: '10 - 14 OGOS' },
      { number: 34, dates: '28 SEPTEMBER - 02 OKTOBER' },
      { number: 40, dates: '09 - 13 NOVEMBER' }
    ],
    members: [
      { name: 'SITI KHAIRAH', role: 'Ketua/Perhimpunan' },
      { name: 'HAYATI', role: 'Kebersihan/Disiplin' },
      { name: 'NORSIMAH', role: 'Kehadiran Kelas' },
      { name: 'MARSIAH', role: 'RMT/Kantin' },
      { name: 'ANWAR', role: 'Guru Penyayang' }
    ],
    holidays: [
      'HARI RAYA AIDILFITRI (19 - 20 MAC 2026)'
    ],
    perananKetua: [
      'Memastikan semua ahli melaksanakan tugas dan merekodkan laporan dalam format OPR.',
      'Memastikan OPR laporan Perhimpunan Mingguan disediakan.',
      'Memastikan rekod kehadiran murid dilaporkan dan direkodkan.',
      'Mengubah kitaran agihan tugas berdasarkan perbincangan sesama ahli kumpulan.',
      'Membantu mengurus dan merekod murid sakit, cedera dan sebagainya.',
      'Memastikan ada guru yang menyambut murid datang dan memantau penyuraian murid.'
    ]
  },
  {
    name: 'Kencana',
    weeks: [
      { number: 4, dates: '02 - 06 FEBRUARI' },
      { number: 11, dates: '30 MAC - 03 APRIL', holidays: ['HARI JADI TYT (30 MAC 2026)', 'GOOD FRIDAY (03 APRIL 2026)'] },
      { number: 17, dates: '11 - 15 MEI' },
      { number: 23, dates: '06 - 10 JULAI' },
      { number: 29, dates: '17 - 21 OGOS' },
      { number: 35, dates: '05 - 09 OKTOBER' },
      { number: 41, dates: '16 - 20 NOVEMBER' }
    ],
    members: [
      { name: 'SARIDAH', role: 'Ketua/Perhimpunan' },
      { name: 'MARTINA', role: 'Kebersihan/Disiplin' },
      { name: 'MARLINA', role: 'Kehadiran Kelas' },
      { name: 'BAMBINA', role: 'RMT/Kantin' }
    ],
    holidays: [
      'HARI JADI TYT (30 MAC 2026)',
      'GOOD FRIDAY (03 APRIL 2026)'
    ],
    perananKetua: [
      'Memastikan semua ahli melaksanakan tugas dan merekodkan laporan dalam format OPR.',
      'Memastikan OPR laporan Perhimpunan Mingguan disediakan.',
      'Memastikan rekod kehadiran murid dilaporkan dan direkodkan.',
      'Mengubah kitaran agihan tugas berdasarkan perbincangan sesama ahli kumpulan.',
      'Membantu mengurus dan merekod murid sakit, cedera dan sebagainya.',
      'Memastikan ada guru yang menyambut murid datang dan memantau penyuraian murid.'
    ]
  },
  {
    name: 'Mega',
    weeks: [
      { number: 5, dates: '09 - 13 FEBRUARI' },
      { number: 12, dates: '06 - 10 APRIL' },
      { number: 18, dates: '18 - 22 MEI' },
      { number: 24, dates: '13 - 17 JULAI' },
      { number: 30, dates: '24 - 28 OGOS', holidays: ['MAULIDUR RASUL (25 OGOS 2026)'] },
      { number: 36, dates: '12 - 16 OKTOBER' },
      { number: 42, dates: '23 - 27 NOVEMBER' }
    ],
    members: [
      { name: 'SUHARITINI', role: 'Ketua/Perhimpunan' },
      { name: 'MOHD. RADZLEE', role: 'Kebersihan/Disiplin' },
      { name: 'NUR SHAZWANI', role: 'Kehadiran Kelas' },
      { name: 'WAN NUR ATHIRAH', role: 'RMT/Kantin' },
      { name: 'SITI NUR YUMNI', role: 'Guru Penyayang' }
    ],
    holidays: [
      'MAULIDUR RASUL (25 OGOS 2026)'
    ],
    perananKetua: [
      'Memastikan semua ahli melaksanakan tugas dan merekodkan laporan dalam format OPR.',
      'Memastikan OPR laporan Perhimpunan Mingguan disediakan.',
      'Memastikan rekod kehadiran murid dilaporkan dan direkodkan.',
      'Mengubah kitaran agihan tugas berdasarkan perbincangan sesama ahli kumpulan.',
      'Membantu mengurus dan merekod murid sakit, cedera dan sebagainya.',
      'Memastikan ada guru yang menyambut murid datang dan memantau penyuraian murid.'
    ]
  },
  {
    name: 'Pawana',
    weeks: [
      { number: 6, dates: '16 - 20 FEBRUARI', holidays: ['TAHUN BAHARU CINA (16 - 20 FEBRUARI 2026)'] },
      { number: 7, dates: '23 - 27 FEBRUARI' },
      { number: 13, dates: '13 - 17 APRIL' },
      { number: 19, dates: '08 - 12 JUN' },
      { number: 25, dates: '20 - 24 JULAI' },
      { number: 31, dates: '07 - 11 SEPTEMBER' },
      { number: 37, dates: '19 - 23 OKTOBER' },
      { number: 43, dates: '30 NOV - 04 DIS' }
    ],
    members: [
      { name: 'SARINAH', role: 'Ketua/Perhimpunan' },
      { name: 'HAIDAH', role: 'Kebersihan/Disiplin' },
      { name: 'W. FADHILAH HANAN', role: 'Kehadiran Kelas' },
      { name: 'SITI AISAH', role: 'RMT/Kantin' },
      { name: 'RIYANTI', role: 'Guru Penyayang' }
    ],
    holidays: [
      'TAHUN BAHARU CINA (16 - 20 FEBRUARI 2026)'
    ],
    perananKetua: [
      'Memastikan semua ahli melaksanakan tugas dan merekodkan laporan dalam format OPR.',
      'Memastikan OPR laporan Perhimpunan Mingguan disediakan.',
      'Memastikan rekod kehadiran murid dilaporkan dan direkodkan.',
      'Mengubah kitaran agihan tugas berdasarkan perbincangan sesama ahli kumpulan.',
      'Membantu mengurus dan merekod murid sakit, cedera dan sebagainya.',
      'Memastikan ada guru yang menyambut murid datang dan memantau penyuraian murid.'
    ]
  }
];

export const TANGGUNGJAWAB_UMUM = [
  'Memastikan semua murid keluar dari kelas selepas tamat sesi persekolahan.',
  'Memastikan semua suis ditutup jika tidak digunakan.',
  'Memastikan semua bilik khas ditutup dan dikunci selepas tamat sesi persekolahan.',
  'Memastikan kebersihan persekitaran, tandas, kantin dan tempat-tempat lain dijaga.',
  'Memastikan aktiviti sokongan PBD dilaksanakan sebelum sesi PdPc.'
];

/* ==========================================================================
   Pegawai penandatangan laporan
   ==========================================================================
   Diambil daripada "KEMAS KINI JADUAL GURU BERTUGAS SESI PETANG 2026":
   ketua setiap kumpulan bertugas menyediakan laporan, manakala blok
   tandatangan dokumen rasmi menamakan GPK Petang sebagai penyedia dan
   Guru Besar sebagai pengesah.

   Kesemuanya boleh disunting melalui Tetapan & Menu Admin — senarai ini
   hanyalah titik permulaan supaya guru tidak bermula dengan borang kosong.
   ========================================================================== */

export const DEFAULT_PELAPOR: Officer[] = [
  { id: 'plp-1', name: 'Siti Noraidah', position: 'Ketua Kumpulan Ancala', isDefault: true },
  { id: 'plp-2', name: 'Harsidi', position: 'Ketua Kumpulan Buana' },
  { id: 'plp-3', name: 'Siti Khairah', position: 'Ketua Kumpulan Candra' },
  { id: 'plp-4', name: 'Saridah', position: 'Ketua Kumpulan Kencana' },
  { id: 'plp-5', name: 'Suharitini', position: 'Ketua Kumpulan Mega' },
  { id: 'plp-6', name: 'Sarinah', position: 'Ketua Kumpulan Pawana' },
  { id: 'plp-7', name: 'Samsiah binti Sundu', position: 'Guru Penolong Kanan Petang' }
];

export const DEFAULT_PENYEMAK: Officer[] = [
  { id: 'psk-1', name: 'Samsiah binti Sundu', position: 'Guru Penolong Kanan Petang', isDefault: true },
  { id: 'psk-2', name: 'Abidin bin Moen', position: 'Guru Besar' }
];
