import { Officer } from './types';

/**
 * Sistem bermula tanpa sebarang rekod.
 *
 * Dahulunya fail ini mengandungi INITIAL_ACTIVITIES (tiga sesi rekaan dengan
 * nama murid palsu) dan PLACEHOLDER_IMAGES (foto stok Unsplash). Data itu
 * disemai ke localStorage pada muat pertama, jadi papan pemuka memaparkan
 * statistik yang kelihatan sah tetapi tidak bermakna -- dan guru terpaksa
 * memadamnya satu per satu sebelum boleh menggunakan sistem.
 *
 * Rekod sebenar sahaja kini dipaparkan; paparan kosong menunjukkan keadaan
 * kosong yang jelas.
 */

export const AVAILABLE_GROUPS = ['Ancala', 'Buana', 'Candra', 'Kencana', 'Mega', 'Pawana'];
export const MALAYSIAN_DAYS = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

/* ==========================================================================
   Kelas Tahap 1 — nama sebenar SK Bandar Tawau
   ==========================================================================
   Nama kelas berkekalan dari Tahun 1 hingga Tahun 3, jadi senarai dijana
   daripada dua paksi dan bukan ditaip satu per satu. Senarai lama ("Kritis /
   Kreatif / Progresif") mengandungi kelas rekaan yang tidak wujud di sekolah —
   guru terpaksa memilih kelas yang salah atau menaip semula setiap kali.
   ========================================================================== */

export const TAHUN_TAHAP_1 = ['1', '2', '3'];
export const NAMA_KELAS_TAHAP_1 = ['INOVATIF', 'INTELEK', 'KREATIF', 'KRITIS', 'PATRIOTIK'];

export const AVAILABLE_CLASSES = TAHUN_TAHAP_1.flatMap(tahun =>
  NAMA_KELAS_TAHAP_1.map(nama => `${tahun} ${nama}`)
);

/**
 * Kelas rekaan yang pernah dihantar bersama sistem.
 *
 * Disimpan supaya migrasi tetapan boleh mengenal pasti dan membuangnya
 * daripada localStorage guru, tanpa turut membuang kelas yang ditambah
 * sendiri oleh sekolah.
 */
export const KELAS_DUMMY_LAMA = [
  '1 Kritis', '1 Kreatif', '1 Progresif',
  '2 Kritis', '2 Kreatif', '2 Progresif',
  '3 Kritis', '3 Kreatif', '3 Progresif'
];

export const COMMON_ACTIVITIES_BM = [
  'Main Peranan (Roleplay)',
  'Bercerita (Storytelling)',
  'Mari Membaca Suku Kata',
  'Kuiz Interaktif / Kahoot',
  'Nyanyian dan Muzik Suku Kata',
  'Permainan Kad Perkataan',
  'Kerja Kumpulan (Bento PBD)',
  'Kuiz Menulis Ayat Mudah',
  'Dekod Suku Kata KV + KVKV',
  'Bacaan Berpasangan (Rakan Pembaca)',
  'Dikte Perkataan Bergambar',
  'Teka Silang Kata Mudah',
  'Papan Cerita Bergambar (Bina Ayat)',
  'Sudut Bacaan 10 Minit',
  'Bengkel Tulisan Cantik & Ejaan',
  'Gallery Walk (Labelkan Gambar)',
  'Pantun & Sajak Beraksi',
  'Cerita Rakyat Boneka Tangan',
  'Roda Perbendaharaan Kata',
  'Lakonan Situasi Harian (Kantin / Beli-Belah)'
];

export const COMMON_ACTIVITIES_BI = [
  'Roleplay / Dialogues',
  'Spelling Bee',
  'Phonics Wheel & Blending',
  'Show and Tell',
  'Vocabulary Matching Games',
  'Interactive Storytelling',
  'Sight Words Bingo',
  'Choral Speaking / Action Song',
  'Flashcard Blending Drill (CVC Words)',
  'Buddy Reading (Paired Reading)',
  'Picture Dictation',
  'Simple Crossword & Word Search',
  'Story Sequencing Cards',
  'Reading Corner 10 Minutes',
  'Handwriting & Spelling Clinic',
  'Gallery Walk (Label the Picture)',
  'Nursery Rhymes & Jazz Chants',
  'Puppet Show Storytelling',
  'Wheel of Vocabulary',
  'Daily Situation Roleplay (Canteen / Shopping)'
];

/**
 * Senarai aktiviti yang dihantar bersama versi terdahulu (8 setiap subjek).
 *
 * Diperlukan oleh migrasi tetapan: entri tersimpan yang TIDAK terkandung di
 * sini ialah aktiviti yang ditambah sendiri oleh guru, jadi ia dikekalkan.
 */
export const AKTIVITI_LAMA_BM = [
  'Main peranan (Roleplay)',
  'Bercerita (Storytelling)',
  'Mari Membaca Suku Kata',
  'Kuiz Interaktif / Kahoot',
  'Nyanyian dan Muzik Suku Kata',
  'Permainan Kad Perkataan',
  'Kerja Kumpulan (Bento PBD)',
  'Kuiz Menulis Ayat Mudah'
];

export const AKTIVITI_LAMA_BI = [
  'Roleplay / Dialogues',
  'Spelling Bee',
  'Phonics Wheel & Blending',
  'Show and Tell',
  'Vocabulary Matching Games',
  'Interactive Storytelling',
  'Sight Words Bingo',
  'Choral Speaking / Action Song'
];

/* ==========================================================================
   Preset catatan kemajuan murid (10 set)
   ==========================================================================
   Guru bertugas mengisi laporan untuk beberapa murid sekaligus, biasanya
   menggunakan telefon. Menaip catatan penuh bagi setiap murid ialah punca
   utama medan ini dibiarkan kosong. Preset ini boleh dipilih dengan satu
   ketikan, dan masih boleh disunting selepas dipilih.
   ========================================================================== */

export const PRESET_CATATAN_MURID = [
  'Menunjukkan peningkatan ketara — sudah boleh membaca dengan bimbingan minimum.',
  'Mula yakin bertutur dan memberi respons di hadapan rakan sekelas.',
  'Masih memerlukan bimbingan individu secara berterusan.',
  'Sudah boleh mengenal dan menyebut suku kata / bunyi dengan betul.',
  'Aktif memberi respons dan bekerjasama baik dalam kumpulan.',
  'Perlu latihan tambahan di rumah bersama ibu bapa atau penjaga.',
  'Tumpuan bertambah baik sepanjang sesi bimbingan berjalan.',
  'Mampu menyempurnakan tugasan tanpa bantuan rakan.',
  'Kemajuan perlahan tetapi konsisten; intervensi perlu dikekalkan.',
  'Tidak dapat mengikuti sepenuhnya kerana kerap tidak hadir ke sekolah.'
];

/* ==========================================================================
   Preset catatan impak / refleksi keseluruhan (20 set)
   ==========================================================================
   Setiap teks mengandungi ruang ganti yang diisi daripada rekod yang sedang
   dibuka, jadi catatan menyebut aktiviti, kelas dan bilangan murid yang
   sebenar — bukan ayat umum yang sama untuk semua laporan.

   Ruang ganti yang difahami: {aktiviti} {kelas} {bil} {bilNaik} {subjek}
   ========================================================================== */

export const PRESET_CATATAN_IMPAK = [
  'Aktiviti {aktiviti} berjaya dilaksanakan bersama {bil} murid {kelas}. Murid menunjukkan minat dan penglibatan aktif sepanjang sesi.',
  'Melalui {aktiviti}, {bilNaik} daripada {bil} murid berjaya meningkatkan tahap penguasaan selepas bimbingan diberikan.',
  '{aktiviti} membantu murid yang lemah membaca menyebut suku kata dengan lebih jelas dan yakin.',
  'Keyakinan murid untuk bertutur di hadapan kelas meningkat selepas sesi {aktiviti} dijalankan.',
  'Sesi {aktiviti} berjalan lancar; semua murid dapat menyiapkan tugasan dalam masa yang ditetapkan.',
  'Kerjasama dalam kumpulan bertambah baik — murid saling membantu rakan yang lemah semasa {aktiviti}.',
  'Pendekatan {aktiviti} sesuai dengan tahap murid {kelas} dan disyorkan diteruskan pada minggu berikutnya.',
  'Sebahagian murid masih memerlukan bimbingan individu; {aktiviti} akan diulang dalam kumpulan yang lebih kecil.',
  'Penggunaan bahan bantu mengajar dalam {aktiviti} berjaya menarik perhatian murid sepanjang sesi.',
  'Murid lebih bermotivasi kerana {aktiviti} dijalankan secara santai dan menyeronokkan.',
  'Guru subjek {subjek} mengesahkan penglibatan murid dalam kelas bertambah baik selepas program {aktiviti}.',
  'Sesi {aktiviti} mengurangkan rasa malu murid untuk mencuba, walaupun jawapan mereka belum tepat sepenuhnya.',
  'Kemahiran mendengar dan memberi respons murid bertambah baik melalui {aktiviti}.',
  '{aktiviti} membantu murid mengenal perbendaharaan kata baharu dan menggunakannya dalam ayat mudah.',
  'Tumpuan murid kekal baik kerana {aktiviti} melibatkan pergerakan dan unsur permainan.',
  'Bimbingan rapat semasa {aktiviti} membolehkan guru mengenal pasti kelemahan khusus setiap murid.',
  'Ibu bapa dimaklumkan tentang kemajuan murid selepas {aktiviti} bagi sokongan berterusan di rumah.',
  'Cabaran utama sesi ini ialah kekangan masa; {aktiviti} perlu dipecahkan kepada dua sesi yang lebih pendek.',
  'Kehadiran murid sasaran perlu dipantau kerana ia menjejaskan kesinambungan {aktiviti}.',
  'Secara keseluruhan, {aktiviti} mencapai objektif sokongan PBD {subjek} dan layak dikekalkan dalam takwim mingguan.'
];

/** Konteks rekod yang digunakan untuk mengisi ruang ganti preset catatan. */
export interface KonteksCatatan {
  aktiviti?: string;
  kelas?: string;
  bil?: number;
  bilNaik?: number;
  subjek?: string;
}

/**
 * Isikan ruang ganti dalam teks preset dengan butiran rekod semasa.
 *
 * Ruang ganti yang tidak mempunyai nilai dibiarkan sebagai teks generik yang
 * masih boleh dibaca ("aktiviti ini", "kelas berkenaan") supaya laporan tidak
 * pernah tercetak dengan tanda `{aktiviti}` yang mentah.
 */
export function isiCatatan(teks: string, konteks: KonteksCatatan = {}): string {
  const gantian: Record<string, string> = {
    aktiviti: konteks.aktiviti?.trim() || 'aktiviti ini',
    kelas: konteks.kelas?.trim() || 'kelas berkenaan',
    bil: String(konteks.bil ?? 0),
    bilNaik: String(konteks.bilNaik ?? 0),
    subjek:
      konteks.subjek === 'BI'
        ? 'Bahasa Inggeris'
        : konteks.subjek === 'BM'
          ? 'Bahasa Melayu'
          : 'bahasa'
  };

  return teks.replace(/\{(\w+)\}/g, (padanan, kunci: string) =>
    kunci in gantian ? gantian[kunci] : padanan
  );
}

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
