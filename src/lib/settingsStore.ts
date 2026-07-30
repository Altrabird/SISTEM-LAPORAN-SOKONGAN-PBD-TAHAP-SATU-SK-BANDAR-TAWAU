/**
 * settingsStore — satu tempat sahaja yang mentakrifkan tetapan lalai.
 *
 * Sebelum ini objek tetapan lalai ditulis semula tiga kali dalam App.tsx
 * (muat awal, set semula semua, set semula tetapan sahaja). Menambah satu
 * medan bermakna menyunting tiga tempat, dan medan yang terlepas hanya
 * kelihatan selepas pengguna menekan "Set Semula" — jauh daripada punca.
 *
 * Modul ini juga menjalankan MIGRASI. Tetapan tinggal dalam localStorage,
 * jadi guru yang pernah membuka sistem ini akan terus melihat senarai lama
 * (kelas rekaan, 8 aktiviti) walaupun kod sudah dikemas kini. Migrasi
 * membuang entri lalai lama sambil MENGEKALKAN apa-apa yang ditambah sendiri
 * oleh sekolah.
 */

import { AppSettings, StudentRosterEntry } from '../types';
import {
  AVAILABLE_CLASSES,
  KELAS_DUMMY_LAMA,
  COMMON_ACTIVITIES_BM,
  COMMON_ACTIVITIES_BI,
  AKTIVITI_LAMA_BM,
  AKTIVITI_LAMA_BI,
  TANGGUNGJAWAB_UMUM,
  OFFICIAL_DUTY_GROUPS,
  DEFAULT_PELAPOR,
  DEFAULT_PENYEMAK,
  PRESET_CATATAN_MURID,
  PRESET_CATATAN_IMPAK
} from '../data';

export const KUNCI_TETAPAN = 'lapor_pbd_settings';

/** Versi skema tetapan semasa. Naikkan apabila nilai lalai perlu diganti. */
export const VERSI_TETAPAN = 2;

export function tetapanLalai(): AppSettings {
  return {
    schoolName: 'SK BANDAR TAWAU',
    schoolShortCode: 'SKBT',
    footerText: 'LaporPBD v1.3.0 • SKBT 2026',
    availableClasses: [...AVAILABLE_CLASSES],
    commonActivitiesBm: [...COMMON_ACTIVITIES_BM],
    commonActivitiesBi: [...COMMON_ACTIVITIES_BI],
    tanggungjawabUmum: [...TANGGUNGJAWAB_UMUM],
    dutyGroups: OFFICIAL_DUTY_GROUPS,
    pelaporList: DEFAULT_PELAPOR,
    penyemakList: DEFAULT_PENYEMAK,
    studentRoster: [],
    catatanMuridPresets: [...PRESET_CATATAN_MURID],
    catatanImpakPresets: [...PRESET_CATATAN_IMPAK],
    settingsVersion: VERSI_TETAPAN
  };
}

/** Buang pendua sambil mengekalkan susunan asal. */
function unik(senarai: string[]): string[] {
  return Array.from(new Set(senarai.map(s => s.trim()).filter(Boolean)));
}

/**
 * Gabungkan senarai lalai baharu dengan tambahan pengguna.
 *
 * Entri tersimpan yang terkandung dalam `lalaiLama` ialah nilai yang dihantar
 * bersama sistem, jadi ia digantikan oleh senarai baharu. Selain itu ia
 * dianggap tambahan sekolah dan dikekalkan di hujung senarai.
 */
function gabungSenarai(
  tersimpan: string[] | undefined,
  lalaiBaharu: string[],
  lalaiLama: string[]
): string[] {
  const lama = new Set(lalaiLama);
  const baharu = new Set(lalaiBaharu);
  const tambahanPengguna = (tersimpan ?? []).filter(
    item => !lama.has(item) && !baharu.has(item)
  );
  return unik([...lalaiBaharu, ...tambahanPengguna]);
}

/** Pastikan setiap entri senarai murid mempunyai id, nama dan kelas yang sah. */
function bersihkanRoster(senarai: unknown): StudentRosterEntry[] {
  if (!Array.isArray(senarai)) return [];
  return senarai
    .filter((m): m is StudentRosterEntry => Boolean(m) && typeof m === 'object')
    .map((m, i) => ({
      id: typeof m.id === 'string' && m.id ? m.id : `mrd-${Date.now()}-${i}`,
      name: String(m.name ?? '').trim(),
      className: String(m.className ?? '').trim()
    }))
    .filter(m => m.name && m.className);
}

/**
 * Bawa tetapan tersimpan ke skema terkini.
 *
 * Selamat dijalankan berulang kali: tetapan yang sudah pada versi terkini
 * dikembalikan seperti sedia ada (hanya medan yang benar-benar tiada diisi).
 */
export function migrasiTetapan(tersimpan: Partial<AppSettings> | null): AppSettings {
  const lalai = tetapanLalai();
  if (!tersimpan) return lalai;

  const versi = tersimpan.settingsVersion ?? 1;

  // Medan yang sentiasa diisi jika tiada — tanpa mengira versi, kerana
  // tetapan yang disandarkan daripada versi lama boleh diimport bila-bila.
  const asas: AppSettings = {
    ...lalai,
    ...tersimpan,
    studentRoster: bersihkanRoster(tersimpan.studentRoster),
    catatanMuridPresets: tersimpan.catatanMuridPresets?.length
      ? unik(tersimpan.catatanMuridPresets)
      : lalai.catatanMuridPresets,
    catatanImpakPresets: tersimpan.catatanImpakPresets?.length
      ? unik(tersimpan.catatanImpakPresets)
      : lalai.catatanImpakPresets,
    settingsVersion: VERSI_TETAPAN
  };

  if (versi >= VERSI_TETAPAN) return asas;

  /*
   * Migrasi v1 → v2
   *   • Kelas rekaan ("1 Kritis", "2 Progresif", …) dibuang dan digantikan
   *     dengan kelas sebenar Tahap 1. Kelas yang ditambah sendiri oleh
   *     sekolah dikekalkan.
   *   • Senarai aktiviti dinaikkan daripada 8 kepada 20 setiap subjek.
   *   • Preset catatan diisi kerana ia tidak wujud dalam v1.
   */
  return {
    ...asas,
    availableClasses: gabungSenarai(
      tersimpan.availableClasses,
      AVAILABLE_CLASSES,
      KELAS_DUMMY_LAMA
    ),
    commonActivitiesBm: gabungSenarai(
      tersimpan.commonActivitiesBm,
      COMMON_ACTIVITIES_BM,
      AKTIVITI_LAMA_BM
    ),
    commonActivitiesBi: gabungSenarai(
      tersimpan.commonActivitiesBi,
      COMMON_ACTIVITIES_BI,
      AKTIVITI_LAMA_BI
    ),
    catatanMuridPresets: asas.catatanMuridPresets?.length
      ? asas.catatanMuridPresets
      : lalai.catatanMuridPresets,
    catatanImpakPresets: asas.catatanImpakPresets?.length
      ? asas.catatanImpakPresets
      : lalai.catatanImpakPresets
  };
}

/** Muatkan tetapan daripada localStorage, sudah dimigrasikan. */
export function muatTetapan(): AppSettings {
  const mentah = localStorage.getItem(KUNCI_TETAPAN);
  if (!mentah) return tetapanLalai();

  try {
    return migrasiTetapan(JSON.parse(mentah));
  } catch (e) {
    console.error('Tetapan tersimpan rosak — kembali kepada nilai lalai', e);
    return tetapanLalai();
  }
}

export function simpanTetapan(tetapan: AppSettings): void {
  localStorage.setItem(KUNCI_TETAPAN, JSON.stringify(tetapan));
}
