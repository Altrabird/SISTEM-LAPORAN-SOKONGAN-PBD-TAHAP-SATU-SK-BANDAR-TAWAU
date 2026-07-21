/**
 * sheetsSync — penyegerakan rekod sebenar ke Google Sheets + Drive.
 *
 * Sebelum ini tab Integrasi hanya boleh menghantar SATU muatan ujian palsu;
 * tiada laluan kod yang menghantar rekod aktiviti yang benar-benar disimpan.
 * Modul ini menyediakan penyegerakan sebenar.
 *
 * Dua perkara penting:
 *   1. Gambar kini disimpan dalam IndexedDB sebagai rujukan "idb:<id>".
 *      Rujukan itu tidak bermakna kepada Apps Script, jadi ia mesti
 *      diselesaikan menjadi data URL base64 sebelum dihantar.
 *   2. Permintaan TIDAK menggunakan mode 'no-cors'. Dengan no-cors, respons
 *      adalah legap — kod lama sentiasa melaporkan "berjaya" walaupun pelayan
 *      mengembalikan ralat. Kini kegagalan sebenar dapat dikesan.
 */

import { ActivityLog } from '../types';
import { resolveImages } from './photoStore';
import { DEFAULT_WEBAPP_URL, DEFAULT_ADMIN_TOKEN } from '../config';

export const KUNCI_URL_API = 'pbd_appscript_url';
export const KUNCI_TOKEN = 'pbd_admin_token';

/**
 * Pautan Web App yang sedang digunakan.
 *
 * Tetapan setempat diutamakan supaya sekolah lain yang menyalin sistem ini —
 * atau pentadbir yang menukar deployment — boleh menimpa nilai terbina tanpa
 * perlu membina semula aplikasi. Jika tiada, ia jatuh kembali kepada URL
 * terbina supaya guru mendapat sambungan tanpa sebarang tetapan.
 */
export const getWebAppUrl = (): string =>
  localStorage.getItem(KUNCI_URL_API)?.trim() || DEFAULT_WEBAPP_URL.trim();

/** Adakah pautan semasa datang daripada tetapan pengguna, bukan nilai terbina? */
export const isCustomWebAppUrl = (): boolean =>
  Boolean(localStorage.getItem(KUNCI_URL_API)?.trim());

export const setWebAppUrl = (url: string): void => {
  const bersih = url.trim();
  // Mengosongkan medan mengembalikan nilai terbina, bukan mematikan
  // penyegerakan — jika tidak, guru yang tersalah padam akan hilang sambungan
  // tanpa cara mudah untuk memulihkannya.
  if (bersih) localStorage.setItem(KUNCI_URL_API, bersih);
  else localStorage.removeItem(KUNCI_URL_API);
};

/**
 * Token pentadbir untuk memadam rekod daripada Google Sheets.
 *
 * Disimpan dalam localStorage pelayar sahaja, tidak pernah dimasukkan ke dalam
 * repo atau bundle. Setiap guru yang perlu memadam rekod jauh menampalnya
 * sekali pada peranti masing-masing.
 */
export const getAdminToken = (): string =>
  localStorage.getItem(KUNCI_TOKEN)?.trim() || DEFAULT_ADMIN_TOKEN.trim();

export const setAdminToken = (token: string): void => {
  const bersih = token.trim();
  if (bersih) localStorage.setItem(KUNCI_TOKEN, bersih);
  else localStorage.removeItem(KUNCI_TOKEN);
};

export interface SyncResult {
  ok: boolean;
  message: string;
  folderUrl?: string;
  photosSaved?: number;
  updated?: boolean;
}

interface ApsResponse {
  status?: string;
  message?: string;
  folderUrl?: string;
  photosSaved?: number;
  updated?: boolean;
}

/** Uji sambungan ke deployment Apps Script. */
export async function testConnection(url: string): Promise<SyncResult> {
  const bersih = url.trim();
  if (!bersih) return { ok: false, message: 'Sila masukkan pautan Web App terlebih dahulu.' };
  if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(bersih)) {
    return {
      ok: false,
      message:
        'Pautan tidak sah. Ia mesti bermula dengan https://script.google.com/ dan berakhir dengan /exec.'
    };
  }

  try {
    const jawapan = await fetch(`${bersih}?action=ping`, { method: 'GET' });
    if (!jawapan.ok) {
      return { ok: false, message: `Pelayan membalas HTTP ${jawapan.status}.` };
    }
    const data: ApsResponse = await jawapan.json();
    return data.status === 'SUCCESS'
      ? { ok: true, message: data.message || 'Sambungan berjaya.' }
      : { ok: false, message: data.message || 'Balasan pelayan tidak dijangka.' };
  } catch (err: any) {
    return {
      ok: false,
      message:
        `Gagal menghubungi pelayan (${err?.message || err}). ` +
        'Pastikan deployment ditetapkan kepada "Anyone" dan versi terkini telah di-deploy.'
    };
  }
}

/**
 * Segerakkan satu rekod aktiviti — termasuk memuat naik gambar ke Google Drive.
 * Gambar diselesaikan daripada IndexedDB kepada base64 sebelum dihantar.
 */
export async function syncActivity(activity: ActivityLog): Promise<SyncResult> {
  const url = getWebAppUrl();
  if (!url) {
    return { ok: false, message: 'Pautan Web App belum ditetapkan.' };
  }

  // Tukar rujukan IndexedDB kepada base64 sebenar; buang yang gagal dimuatkan.
  const gambarBase64 = (await resolveImages(activity.images ?? [])).filter(
    (g) => typeof g === 'string' && g.startsWith('data:')
  );

  const muatan = {
    id: activity.id,
    groupName: activity.groupName,
    teacherOnDuty: activity.teacherOnDuty,
    date: activity.date,
    day: activity.day,
    className: activity.className,
    subject: activity.subject,
    activityName: activity.activityName,
    activityDesc: activity.activityDesc,
    subjectTeacher: activity.subjectTeacher,
    students: activity.students,
    notes: activity.notes,
    images: gambarBase64
  };

  try {
    const jawapan = await fetch(url, {
      method: 'POST',
      // text/plain mengelakkan permintaan preflight CORS yang ditolak
      // oleh Apps Script, sambil tetap membenarkan respons dibaca.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(muatan)
    });

    if (!jawapan.ok) {
      return { ok: false, message: `Pelayan membalas HTTP ${jawapan.status}.` };
    }

    const data: ApsResponse = await jawapan.json();
    if (data.status !== 'SUCCESS') {
      return { ok: false, message: data.message || 'Penyegerakan ditolak oleh pelayan.' };
    }

    return {
      ok: true,
      message: data.message || 'Rekod berjaya disegerakkan.',
      folderUrl: data.folderUrl,
      photosSaved: data.photosSaved,
      updated: data.updated
    };
  } catch (err: any) {
    return { ok: false, message: `Ralat rangkaian: ${err?.message || err}` };
  }
}

/**
 * Padam satu rekod daripada Google Sheets dan buang folder gambarnya.
 *
 * Memerlukan token pentadbir yang sepadan dengan ADMIN_TOKEN dalam Code.gs.
 * Jika token tidak ditetapkan pada mana-mana pihak, operasi ini dilangkau
 * dengan senyap oleh pemanggil — padam setempat tetap diteruskan.
 */
export async function deleteFromSheets(activity: {
  id: string;
  className?: string;
  date?: string;
}): Promise<SyncResult> {
  const url = getWebAppUrl();
  const token = getAdminToken();

  if (!url) return { ok: false, message: 'Pautan Web App belum ditetapkan.' };
  if (!token) {
    return {
      ok: false,
      message:
        'Token pentadbir belum ditetapkan. Rekod dipadam pada peranti ini sahaja, ' +
        'barisnya masih kekal dalam Google Sheets.'
    };
  }

  try {
    const jawapan = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'padam',
        token,
        id: activity.id,
        className: activity.className,
        date: activity.date
      })
    });

    if (!jawapan.ok) {
      return { ok: false, message: `Pelayan membalas HTTP ${jawapan.status}.` };
    }

    const data: ApsResponse & { code?: string } = await jawapan.json();
    if (data.status !== 'SUCCESS') {
      return { ok: false, message: data.message || 'Padam ditolak oleh pelayan.' };
    }
    return { ok: true, message: data.message || 'Rekod dipadam daripada Google Sheets.' };
  } catch (err: any) {
    return { ok: false, message: `Ralat rangkaian: ${err?.message || err}` };
  }
}

/**
 * Muat turun semua rekod daripada Google Sheets.
 *
 * Tanpa ini penyegerakan hanya sehala: rekod naik ke Sheet tetapi guru yang
 * membuka sistem pada peranti lain melihat senarai kosong, kerana aplikasi
 * hanya membaca localStorage peranti itu sendiri.
 */
export async function fetchAllFromSheets(): Promise<{
  ok: boolean;
  records: ActivityLog[];
  skipped: number;
  message: string;
}> {
  const url = getWebAppUrl();
  if (!url) return { ok: false, records: [], skipped: 0, message: 'Pautan Web App tiada.' };

  try {
    const jawapan = await fetch(`${url}?action=senarai`, { method: 'GET' });
    if (!jawapan.ok) {
      return { ok: false, records: [], skipped: 0, message: `HTTP ${jawapan.status}` };
    }

    const data = await jawapan.json();
    if (data.status !== 'SUCCESS') {
      return { ok: false, records: [], skipped: 0, message: data.message || 'Ditolak pelayan.' };
    }

    return {
      ok: true,
      records: Array.isArray(data.records) ? data.records : [],
      skipped: Number(data.skipped) || 0,
      message: `${data.count ?? 0} rekod dimuat turun.`
    };
  } catch (err: any) {
    return { ok: false, records: [], skipped: 0, message: `Ralat rangkaian: ${err?.message || err}` };
  }
}

/**
 * Gabungkan rekod tempatan dengan rekod daripada Google Sheets.
 *
 * Peraturan: Sheet ialah sumber kebenaran bagi rekod yang wujud di sana,
 * kerana ia mengandungi sumbangan semua guru. Rekod yang hanya wujud secara
 * tempatan DIKEKALKAN — ia mungkin belum sempat disegerakkan (contohnya
 * disimpan semasa telefon di luar liputan), dan membuangnya bermakna
 * kehilangan kerja guru.
 */
export function mergeRecords(
  tempatan: ActivityLog[],
  jauh: ActivityLog[]
): { hasil: ActivityLog[]; baharu: number } {
  const peta = new Map<string, ActivityLog>();

  for (const r of tempatan) peta.set(r.id, r);

  let baharu = 0;
  for (const r of jauh) {
    if (!peta.has(r.id)) baharu++;
    const sedia = peta.get(r.id);
    // Kekalkan rujukan gambar tempatan jika ada — ia memuat lebih pantas
    // daripada mengambil semula gambar dari Drive.
    peta.set(r.id, {
      ...r,
      images: sedia?.images?.length ? sedia.images : r.images ?? []
    });
  }

  const hasil = Array.from(peta.values()).sort((a, b) =>
    (b.date || '').localeCompare(a.date || '')
  );
  return { hasil, baharu };
}

export interface BulkSyncProgress {
  done: number;
  total: number;
  current: string;
}

/**
 * Segerakkan beberapa rekod satu demi satu.
 *
 * Sengaja berjujukan, bukan selari: setiap rekod boleh membawa beberapa gambar,
 * dan Apps Script mempunyai had kuota pelaksanaan yang mudah dilanggar jika
 * banyak permintaan dihantar serentak.
 */
export async function syncMany(
  activities: ActivityLog[],
  onProgress?: (p: BulkSyncProgress) => void
): Promise<{ berjaya: number; gagal: number; ralat: string[] }> {
  let berjaya = 0;
  let gagal = 0;
  const ralat: string[] = [];

  for (let i = 0; i < activities.length; i++) {
    const act = activities[i];
    onProgress?.({ done: i, total: activities.length, current: act.activityName });

    const hasil = await syncActivity(act);
    if (hasil.ok) {
      berjaya++;
    } else {
      gagal++;
      ralat.push(`${act.activityName} (${act.date}): ${hasil.message}`);
    }
  }

  onProgress?.({ done: activities.length, total: activities.length, current: '' });
  return { berjaya, gagal, ralat };
}
