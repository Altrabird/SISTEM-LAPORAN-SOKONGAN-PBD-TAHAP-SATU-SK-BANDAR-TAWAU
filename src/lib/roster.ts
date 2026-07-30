/**
 * roster — senarai induk nama murid.
 *
 * Guru menerima senarai nama murid dalam bentuk salinan daripada Excel, PDF
 * jadual kelas, atau mesej WhatsApp. Bentuknya tidak seragam: kadang satu
 * kelas satu blok dengan tajuk di atas, kadang "nama, kelas" setiap baris,
 * kadang bernombor. Penghurai di sini menerima kesemuanya supaya guru boleh
 * menampal apa yang ada di tangan dan bukan menyusun semula secara manual.
 */

import { StudentRosterEntry } from '../types';

/* --------------------------------------------------------------------------
   Penormalan nama kelas
   -------------------------------------------------------------------------- */

/** Ratakan ruang berganda dan huruf besar/kecil untuk perbandingan. */
function kunciKelas(teks: string): string {
  return teks.trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Padankan teks kelas dengan senarai kelas rasmi.
 *
 * "1 inovatif", "1  INOVATIF" dan "1 Inovatif" semuanya merujuk kelas yang
 * sama; tanpa penormalan ini satu kelas boleh terpecah menjadi tiga kumpulan
 * berasingan dalam senarai induk.
 */
export function normalKelas(teks: string, senaraiKelas: string[]): string {
  const kunci = kunciKelas(teks);
  const padanan = senaraiKelas.find(k => kunciKelas(k) === kunci);
  return padanan ?? teks.trim().replace(/\s+/g, ' ');
}

/** Adakah baris ini kelihatan seperti tajuk kelas dan bukan nama murid? */
function adalahTajukKelas(baris: string, senaraiKelas: string[]): string | null {
  const bersih = baris.replace(/^(kelas|class)\s*[:\-]?\s*/i, '').trim();
  if (!bersih) return null;

  const kunci = kunciKelas(bersih);

  // Padanan tepat dengan kelas rasmi — paling jelas.
  if (senaraiKelas.some(k => kunciKelas(k) === kunci)) {
    return normalKelas(bersih, senaraiKelas);
  }

  /*
   * Bentuk "TAHUN + NAMA" tanpa apa-apa lagi, contohnya "3 PATRIOTIK".
   * Nama murid Malaysia hampir tidak pernah bermula dengan angka tunggal,
   * jadi corak ini selamat dianggap tajuk kelas — ini juga membolehkan
   * sekolah menampal kelas yang belum ada dalam senarai tetapan.
   */
  if (/^[1-6][\s-]+[A-Za-z][A-Za-z'\s]{2,}$/.test(bersih) && bersih.length <= 24) {
    return normalKelas(bersih, senaraiKelas);
  }

  return null;
}

/* --------------------------------------------------------------------------
   Penghuraian tampalan pukal
   -------------------------------------------------------------------------- */

export interface HasilHuraian {
  /** Murid yang berjaya dikenal pasti bersama kelasnya. */
  entries: StudentRosterEntry[];
  /** Nama yang tiada kelas — pemanggil menentukan kelas lalai untuknya. */
  tanpaKelas: string[];
  /** Nama yang sudah wujud dalam senarai induk (kelas sama). */
  pendua: string[];
  /** Kelas yang belum ada dalam senarai tetapan sekolah. */
  kelasBaharu: string[];
}

/** Buang nombor turutan di hadapan nama: "1.", "12)", "03 -", "•". */
function buangNombor(teks: string): string {
  return teks.replace(/^\s*(?:[•*\-–]|\d{1,3}\s*[.)\-:])\s*/, '').trim();
}

/**
 * Hurai teks tampalan menjadi senarai murid.
 *
 * @param teks         Kandungan yang ditampal pengguna.
 * @param senaraiKelas Kelas rasmi sekolah, untuk penormalan nama kelas.
 * @param kelasLalai   Kelas bagi baris yang tidak menyatakan kelas sendiri.
 * @param sediaAda     Senarai induk semasa, untuk mengesan pendua.
 */
export function huraiSenaraiMurid(
  teks: string,
  senaraiKelas: string[],
  kelasLalai: string,
  sediaAda: StudentRosterEntry[] = []
): HasilHuraian {
  const entries: StudentRosterEntry[] = [];
  const tanpaKelas: string[] = [];
  const pendua: string[] = [];
  const kelasDijumpai = new Set<string>();

  // Kunci pendua meliputi tampalan ini sendiri, bukan hanya senarai sedia
  // ada — senarai yang ditampal sering mengandungi nama berulang.
  const dilihat = new Set<string>(
    sediaAda.map(m => `${kunciKelas(m.className)}::${m.name.toUpperCase()}`)
  );

  let kelasSemasa = '';
  let bilangan = 0;

  for (const barisMentah of teks.split(/\r?\n/)) {
    const baris = barisMentah.trim();
    if (!baris) continue;

    // 1. Tajuk kelas — menetapkan konteks untuk baris seterusnya.
    const tajuk = adalahTajukKelas(baris, senaraiKelas);
    if (tajuk) {
      kelasSemasa = tajuk;
      kelasDijumpai.add(tajuk);
      continue;
    }

    /*
     * 2. Baris "nama <pemisah> kelas". Tab diutamakan kerana ia datang
     *    daripada Excel; tanda sengkang hanya dianggap pemisah jika bahagian
     *    kanannya benar-benar kelihatan seperti kelas, kerana nama Malaysia
     *    sendiri boleh mengandungi sengkang.
     */
    let nama = baris;
    let kelasBaris = '';

    const bahagian = baris.split(/\t+|\s*[;|]\s*|\s*,\s*/).filter(Boolean);
    if (bahagian.length >= 2) {
      const calon = bahagian[bahagian.length - 1];
      if (adalahTajukKelas(calon, senaraiKelas)) {
        kelasBaris = normalKelas(calon, senaraiKelas);
        nama = bahagian.slice(0, -1).join(' ');
      } else {
        // Koma dalam nama ("BIN ALI, MUHAMMAD") — kekalkan baris sepenuhnya.
        nama = baris;
      }
    } else {
      const sengkang = baris.split(/\s+[-–]\s+/);
      if (sengkang.length >= 2) {
        const calon = sengkang[sengkang.length - 1];
        if (adalahTajukKelas(calon, senaraiKelas)) {
          kelasBaris = normalKelas(calon, senaraiKelas);
          nama = sengkang.slice(0, -1).join(' ');
        }
      }
    }

    nama = buangNombor(nama).replace(/\s+/g, ' ').trim();
    if (!nama) continue;

    const kelas = kelasBaris || kelasSemasa || kelasLalai.trim();
    bilangan++;

    if (!kelas) {
      tanpaKelas.push(nama);
      continue;
    }

    kelasDijumpai.add(kelas);

    const kunci = `${kunciKelas(kelas)}::${nama.toUpperCase()}`;
    if (dilihat.has(kunci)) {
      pendua.push(`${nama} (${kelas})`);
      continue;
    }
    dilihat.add(kunci);

    entries.push({
      id: `mrd-${Date.now().toString(36)}-${bilangan}-${Math.random().toString(36).slice(2, 7)}`,
      name: nama,
      className: kelas
    });
  }

  const rasmi = new Set(senaraiKelas.map(kunciKelas));
  const kelasBaharu = Array.from(kelasDijumpai).filter(k => !rasmi.has(kunciKelas(k)));

  return { entries, tanpaKelas, pendua, kelasBaharu };
}

/* --------------------------------------------------------------------------
   Susunan & kumpulan
   -------------------------------------------------------------------------- */

/**
 * Susun senarai induk mengikut kelas, kemudian nama.
 *
 * Susunan kelas mengikut senarai tetapan sekolah (Tahun 1 dahulu, kemudian
 * Tahun 2 dan 3) supaya senarai yang dipaparkan sama dengan susunan pada
 * senarai kelas rasmi. Kelas yang tiada dalam tetapan diletakkan di akhir.
 */
export function susunRoster(
  senarai: StudentRosterEntry[],
  senaraiKelas: string[]
): StudentRosterEntry[] {
  const urutan = new Map(senaraiKelas.map((k, i) => [kunciKelas(k), i]));

  return [...senarai].sort((a, b) => {
    const ia = urutan.get(kunciKelas(a.className)) ?? Number.MAX_SAFE_INTEGER;
    const ib = urutan.get(kunciKelas(b.className)) ?? Number.MAX_SAFE_INTEGER;
    if (ia !== ib) return ia - ib;

    // Kelas asing disusun mengikut abjad supaya kedudukannya tetap.
    const bandingKelas = a.className.localeCompare(b.className, 'ms');
    if (bandingKelas !== 0) return bandingKelas;

    return a.name.localeCompare(b.name, 'ms');
  });
}

export interface KumpulanKelas {
  className: string;
  students: StudentRosterEntry[];
}

/** Kumpulkan senarai induk yang sudah disusun mengikut kelas. */
export function kumpulIkutKelas(
  senarai: StudentRosterEntry[],
  senaraiKelas: string[]
): KumpulanKelas[] {
  const tersusun = susunRoster(senarai, senaraiKelas);
  const kumpulan: KumpulanKelas[] = [];

  for (const murid of tersusun) {
    const akhir = kumpulan[kumpulan.length - 1];
    if (akhir && kunciKelas(akhir.className) === kunciKelas(murid.className)) {
      akhir.students.push(murid);
    } else {
      kumpulan.push({ className: murid.className, students: [murid] });
    }
  }

  return kumpulan;
}

/** Murid bagi satu kelas sahaja, sudah disusun mengikut nama. */
export function muridDalamKelas(
  senarai: StudentRosterEntry[],
  kelas: string
): StudentRosterEntry[] {
  const kunci = kunciKelas(kelas);
  return senarai
    .filter(m => kunciKelas(m.className) === kunci)
    .sort((a, b) => a.name.localeCompare(b.name, 'ms'));
}
