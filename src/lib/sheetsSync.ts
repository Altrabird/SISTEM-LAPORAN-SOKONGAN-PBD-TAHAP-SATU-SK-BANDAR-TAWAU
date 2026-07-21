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

export const KUNCI_URL_API = 'pbd_appscript_url';
export const KUNCI_TOKEN = 'pbd_admin_token';

export const getWebAppUrl = (): string =>
  localStorage.getItem(KUNCI_URL_API)?.trim() || '';

export const setWebAppUrl = (url: string): void => {
  localStorage.setItem(KUNCI_URL_API, url.trim());
};

/**
 * Token pentadbir untuk memadam rekod daripada Google Sheets.
 *
 * Disimpan dalam localStorage pelayar sahaja, tidak pernah dimasukkan ke dalam
 * repo atau bundle. Setiap guru yang perlu memadam rekod jauh menampalnya
 * sekali pada peranti masing-masing.
 */
export const getAdminToken = (): string =>
  localStorage.getItem(KUNCI_TOKEN)?.trim() || '';

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
