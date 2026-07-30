/**
 * dutySchedule — mengira minggu bertugas SEMASA daripada tarikh hari ini.
 *
 * Jadual guru bertugas menyimpan tempohnya sebagai teks Bahasa Melayu yang
 * ditaip guru ("12 - 16 JANUARI", "27 APRIL - 01 MEI", "30 NOV - 04 DIS").
 * Papan pemuka dahulunya membuka minggu 25 secara berkod keras — nombor yang
 * dipilih pada hari ia ditulis. Selepas minggu itu berlalu, paparan kekal
 * menunjukkan kumpulan bertugas yang salah, dan tiada apa-apa dalam antara
 * muka yang memberi petunjuk bahawa ia sudah lapuk.
 *
 * Modul ini menghuraikan teks tempoh tersebut menjadi tarikh sebenar supaya
 * paparan mengikut kalendar dengan sendirinya.
 */

import { DutyGroup } from '../types';

/* --------------------------------------------------------------------------
   Nama bulan
   --------------------------------------------------------------------------
   Termasuk singkatan kerana jadual rasmi mencampurkan kedua-duanya
   ("30 NOV - 04 DIS" bersebelahan "21 - 25 SEPTEMBER"), dan medan ini boleh
   disunting bebas oleh pentadbir melalui Tetapan & Admin.
   -------------------------------------------------------------------------- */

const BULAN: Record<string, number> = {
  JANUARI: 0, JAN: 0,
  FEBRUARI: 1, FEB: 1,
  MAC: 2, MAR: 2,
  APRIL: 3, APR: 3,
  MEI: 4, MAY: 4,
  JUN: 5, JUNE: 5,
  JULAI: 6, JUL: 6,
  OGOS: 7, OGO: 7, AUG: 7,
  SEPTEMBER: 8, SEPT: 8, SEP: 8,
  OKTOBER: 9, OKT: 9, OCT: 9,
  NOVEMBER: 10, NOV: 10,
  DISEMBER: 11, DIS: 11, DEC: 11
};

export const NAMA_BULAN_PENUH = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

export const NAMA_HARI = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

/** Tengah malam tempatan bagi tarikh yang diberi — buang komponen masa. */
export function awalHari(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface Tempoh {
  mula: Date;
  /** Tengah malam hari TERAKHIR minggu itu — perbandingan dibuat inklusif. */
  tamat: Date;
}

/**
 * Hurai teks tempoh minggu menjadi tarikh mula dan tamat.
 *
 * Tahun sengaja diambil daripada `tahunRujukan` dan bukan daripada teks,
 * walaupun sebahagian entri mengandungi "2026". Jadual ini ialah kitaran
 * tahunan yang ditaip semula setiap sesi; jika satu entri berpaut pada 2026
 * manakala jirannya mengikut tahun semasa, susunan minggu menjadi bercelaru
 * dan minggu itu tidak akan pernah dikira sebagai "semasa". Satu tahun
 * rujukan untuk seluruh jadual mengekalkan ketekalannya.
 *
 * @returns null jika teks tidak dapat difahami — pemanggil mesti mengendalikan
 *          keadaan ini, kerana teks ini boleh disunting bebas oleh pengguna.
 */
export function huraiTempohMinggu(teksTempoh: string, tahunRujukan: number): Tempoh | null {
  if (!teksTempoh) return null;

  const teks = teksTempoh
    .toUpperCase()
    .replace(/[–—]/g, '-')          // sengkang panjang → sengkang biasa
    .replace(/\b20\d{2}\b/g, ' ')   // buang tahun; lihat nota di atas
    .replace(/[^A-Z0-9\- ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!teks) return null;

  const bahagian = teks.split('-').map(b => b.trim()).filter(Boolean);
  if (bahagian.length === 0 || bahagian.length > 2) return null;

  /** "12", "12 JANUARI", "JANUARI 12" → { hari, bulan? } */
  const huraiSebelah = (s: string): { hari: number; bulan?: number } | null => {
    const nombor = s.match(/\d{1,2}/);
    if (!nombor) return null;
    const hari = parseInt(nombor[0], 10);
    if (hari < 1 || hari > 31) return null;

    const perkataan = s.match(/[A-Z]+/);
    const bulan = perkataan ? BULAN[perkataan[0]] : undefined;
    if (perkataan && bulan === undefined) return null; // perkataan bukan nama bulan

    return { hari, bulan };
  };

  const kiri = huraiSebelah(bahagian[0]);
  const kanan = bahagian.length === 2 ? huraiSebelah(bahagian[1]) : kiri;
  if (!kiri || !kanan) return null;

  // "12 - 16 JANUARI": bulan hanya dinyatakan di sebelah kanan.
  const bulanMula = kiri.bulan ?? kanan.bulan;
  const bulanTamat = kanan.bulan ?? kiri.bulan;
  if (bulanMula === undefined || bulanTamat === undefined) return null;

  const mula = new Date(tahunRujukan, bulanMula, kiri.hari);
  let tamat = new Date(tahunRujukan, bulanTamat, kanan.hari);

  // Tarikh tidak sah (contohnya 31 Februari) tergolek ke bulan berikutnya.
  if (mula.getDate() !== kiri.hari || tamat.getDate() !== kanan.hari) return null;

  // Minggu yang melangkaui hujung tahun: "30 DIS - 03 JAN".
  if (tamat < mula) tamat = new Date(tahunRujukan + 1, bulanTamat, kanan.hari);

  return { mula, tamat };
}

export interface MingguBertugas {
  weekNum: number;
  dates: string;
  groupName: string;
  holidays?: string[];
  /** null jika teks tempoh tidak dapat dihurai. */
  tempoh: Tempoh | null;
}

/**
 * Kumpulkan semua minggu daripada setiap kumpulan, disusun mengikut tarikh.
 *
 * Disusun mengikut tarikh sebenar dan bukan nombor minggu, kerana nombor
 * boleh disunting pengguna dan tidak dijamin mengikut urutan kalendar.
 */
export function senaraiMinggu(
  dutyGroups: DutyGroup[],
  tahunRujukan: number
): MingguBertugas[] {
  const senarai: MingguBertugas[] = [];

  for (const kumpulan of dutyGroups) {
    for (const wk of kumpulan.weeks) {
      senarai.push({
        weekNum: wk.number,
        dates: wk.dates,
        groupName: kumpulan.name,
        holidays: wk.holidays,
        tempoh: huraiTempohMinggu(wk.dates, tahunRujukan)
      });
    }
  }

  return senarai.sort((a, b) => {
    if (a.tempoh && b.tempoh) return a.tempoh.mula.getTime() - b.tempoh.mula.getTime();
    if (a.tempoh) return -1;   // minggu tanpa tarikh sah diletakkan di akhir
    if (b.tempoh) return 1;
    return a.weekNum - b.weekNum;
  });
}

export type StatusMinggu =
  | 'semasa'       // hari ini berada dalam tempoh minggu ini
  | 'akan-datang'  // di luar mana-mana tempoh (hujung minggu / cuti penggal)
  | 'tamat'        // semua minggu dalam jadual sudah berlalu
  | 'tiada';       // jadual kosong atau tiada tempoh yang boleh dihurai

export interface HasilMingguSemasa {
  minggu: MingguBertugas | null;
  status: StatusMinggu;
  /** Bilangan hari sampai minggu bermula — hanya bagi status 'akan-datang'. */
  hariLagi?: number;
}

/**
 * Cari minggu bertugas yang berkaitan dengan hari ini.
 *
 * Jika hari ini jatuh dalam satu tempoh, itulah minggu semasa. Jika tidak
 * — hujung minggu, cuti penggal, atau jurang antara minggu bertugas — minggu
 * BERIKUTNYA dikembalikan, kerana itulah maklumat yang dicari guru pada hari
 * Sabtu atau semasa cuti: siapa bertugas apabila sekolah bermula semula.
 */
export function cariMingguSemasa(
  senarai: MingguBertugas[],
  hariIni: Date = new Date()
): HasilMingguSemasa {
  const hari = awalHari(hariIni);
  const bertarikh = senarai.filter(m => m.tempoh);

  if (bertarikh.length === 0) {
    return { minggu: senarai[0] ?? null, status: 'tiada' };
  }

  const semasa = bertarikh.find(
    m => hari >= m.tempoh!.mula && hari <= m.tempoh!.tamat
  );
  if (semasa) return { minggu: semasa, status: 'semasa' };

  const akanDatang = bertarikh.find(m => m.tempoh!.mula > hari);
  if (akanDatang) {
    const hariLagi = Math.round(
      (akanDatang.tempoh!.mula.getTime() - hari.getTime()) / 86_400_000
    );
    return { minggu: akanDatang, status: 'akan-datang', hariLagi };
  }

  return { minggu: bertarikh[bertarikh.length - 1], status: 'tamat' };
}

/**
 * Cuti yang jatuh tepat pada hari ini.
 *
 * Teks cuti ditulis sebagai "AWAL MUHARRAM (17 JUN 2026)" atau
 * "HARI RAYA AIDILFITRI (19 - 20 MAC 2026)". Tarikh dalam tanda kurungan
 * dihurai supaya papan pemuka boleh memberitahu guru bahawa hari ini
 * sendiri ialah hari cuti, bukan sekadar menyenaraikan cuti minggu itu.
 */
export function cutiPadaHari(
  holidays: string[] | undefined,
  hariIni: Date,
  tahunRujukan: number
): string[] {
  if (!holidays?.length) return [];
  const hari = awalHari(hariIni);

  return holidays.filter(teks => {
    const kurungan = teks.match(/\(([^)]+)\)/);
    if (!kurungan) return false;
    const tempoh = huraiTempohMinggu(kurungan[1], tahunRujukan);
    if (!tempoh) return false;
    return hari >= tempoh.mula && hari <= tempoh.tamat;
  });
}

/** "Khamis, 30 Julai 2026" */
export function tarikhPanjang(d: Date): string {
  return `${NAMA_HARI[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN_PENUH[d.getMonth()]} ${d.getFullYear()}`;
}
