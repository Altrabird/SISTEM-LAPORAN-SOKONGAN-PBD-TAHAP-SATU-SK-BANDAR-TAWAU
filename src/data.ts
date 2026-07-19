import { ActivityLog } from './types';

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

export const AVAILABLE_GROUPS = ['Ancala', 'Baluran', 'Ceremai', 'Dataran', 'Kinabalu', 'Ledang'];
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
