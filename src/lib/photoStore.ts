/**
 * photoStore — storan gambar berasaskan IndexedDB.
 *
 * Sebelum ini gambar disimpan sebagai base64 terus di dalam localStorage
 * bersama-sama rekod aktiviti. Kuota localStorage hanya ~5 MB, manakala satu
 * gambar telefon boleh mencecah 4–8 MB selepas pengekodan base64 — bermakna
 * satu rekod bergambar sudah cukup untuk menyebabkan QuotaExceededError dan
 * kegagalan menyimpan secara senyap.
 *
 * Penyelesaian:
 *   1. Gambar dimampatkan (lebar maks 1280px, JPEG q0.72) sebelum disimpan.
 *   2. Gambar disimpan dalam IndexedDB (kuota ratusan MB), bukan localStorage.
 *   3. Rekod aktiviti hanya menyimpan rujukan ringkas "idb:<id>".
 *
 * Rujukan lama (base64 mentah) masih boleh dibaca — lihat resolveImage().
 */

const NAMA_DB = 'pbd_photos';
const NAMA_STOR = 'photos';
const AWALAN = 'idb:';

export interface StoredPhoto {
  id: string;
  dataUrl: string;
  createdAt: string;
}

let sambungan: IDBDatabase | null = null;

function buka(): Promise<IDBDatabase> {
  if (sambungan) return Promise.resolve(sambungan);
  return new Promise((selesai, gagal) => {
    const permintaan = indexedDB.open(NAMA_DB, 1);
    permintaan.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(NAMA_STOR)) {
        db.createObjectStore(NAMA_STOR, { keyPath: 'id' });
      }
    };
    permintaan.onsuccess = (e) => {
      sambungan = (e.target as IDBOpenDBRequest).result;
      selesai(sambungan);
    };
    permintaan.onerror = () => gagal(permintaan.error);
  });
}

function urusniaga<T>(
  mod: IDBTransactionMode,
  kerja: (stor: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return buka().then(
    (db) =>
      new Promise<T>((selesai, gagal) => {
        const t = db.transaction(NAMA_STOR, mod);
        const permintaan = kerja(t.objectStore(NAMA_STOR));
        permintaan.onsuccess = () => selesai(permintaan.result);
        permintaan.onerror = () => gagal(permintaan.error);
      })
  );
}

/* ------------------------------------------------------------------ */
/*  Mampatan                                                           */
/* ------------------------------------------------------------------ */

/** Mampatkan fail imej kepada data URL JPEG yang jauh lebih kecil. */
export function compressImage(
  file: File,
  lebarMaks = 1280,
  kualiti = 0.72
): Promise<string> {
  return new Promise((selesai, gagal) => {
    const pembaca = new FileReader();
    pembaca.onerror = () => gagal(new Error('Gagal membaca fail gambar.'));
    pembaca.onload = () => {
      const img = new Image();
      img.onerror = () => gagal(new Error('Fail gambar tidak sah.'));
      img.onload = () => {
        const nisbah = Math.min(1, lebarMaks / img.width);
        const kanvas = document.createElement('canvas');
        kanvas.width = Math.round(img.width * nisbah);
        kanvas.height = Math.round(img.height * nisbah);
        const ctx = kanvas.getContext('2d');
        if (!ctx) return gagal(new Error('Canvas tidak disokong.'));
        ctx.drawImage(img, 0, 0, kanvas.width, kanvas.height);
        selesai(kanvas.toDataURL('image/jpeg', kualiti));
      };
      img.src = pembaca.result as string;
    };
    pembaca.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/*  Operasi asas                                                       */
/* ------------------------------------------------------------------ */

const janaId = () =>
  'ph-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

export const isPhotoRef = (nilai: string) =>
  typeof nilai === 'string' && nilai.startsWith(AWALAN);

const idDaripadaRef = (ref: string) => ref.slice(AWALAN.length);

/** Simpan satu data URL dan pulangkan rujukan "idb:<id>". */
export async function savePhoto(dataUrl: string): Promise<string> {
  const id = janaId();
  await urusniaga('readwrite', (s) =>
    s.put({ id, dataUrl, createdAt: new Date().toISOString() } as StoredPhoto)
  );
  cache.set(id, dataUrl);
  return AWALAN + id;
}

/** Mampat + simpan sekali gus. */
export async function saveImageFile(file: File): Promise<string> {
  return savePhoto(await compressImage(file));
}

const cache = new Map<string, string>();

/**
 * Tukar satu nilai gambar kepada data URL yang boleh dipaparkan.
 * Menerima rujukan "idb:<id>" ATAU base64/URL lama (dipulangkan seadanya),
 * supaya rekod sedia ada tidak rosak.
 */
export async function resolveImage(nilai: string): Promise<string> {
  if (!nilai) return '';
  if (!isPhotoRef(nilai)) return nilai; // base64 lama atau URL biasa

  const id = idDaripadaRef(nilai);
  const disimpan = cache.get(id);
  if (disimpan !== undefined) return disimpan;

  try {
    const rekod = await urusniaga<StoredPhoto | undefined>('readonly', (s) => s.get(id));
    const dataUrl = rekod?.dataUrl ?? '';
    cache.set(id, dataUrl);
    return dataUrl;
  } catch {
    return '';
  }
}

/** Tukar senarai rujukan kepada senarai data URL (kekal susunan). */
export async function resolveImages(senarai: string[] = []): Promise<string[]> {
  return Promise.all(senarai.map(resolveImage));
}

/** Padam gambar yang dirujuk. Rujukan bukan-IndexedDB diabaikan. */
export async function deletePhotos(senarai: string[] = []): Promise<void> {
  for (const nilai of senarai) {
    if (!isPhotoRef(nilai)) continue;
    const id = idDaripadaRef(nilai);
    try {
      await urusniaga('readwrite', (s) => s.delete(id));
      cache.delete(id);
    } catch {
      /* abaikan — pemadaman gambar tidak boleh menggagalkan operasi utama */
    }
  }
}

/** Buang semua gambar (digunakan oleh "Set Semula Semua Data"). */
export async function clearPhotos(): Promise<void> {
  try {
    await urusniaga('readwrite', (s) => s.clear());
    cache.clear();
  } catch {
    /* abaikan */
  }
}

/* ------------------------------------------------------------------ */
/*  Migrasi                                                            */
/* ------------------------------------------------------------------ */

/**
 * Pindahkan gambar base64 sedia ada daripada localStorage ke IndexedDB.
 * Dipanggil sekali semasa aplikasi dimuatkan. Selamat dijalankan berulang —
 * rekod yang sudah menggunakan rujukan "idb:" akan dilangkau.
 *
 * Pulangan: senarai aktiviti yang telah dikemas kini, atau null jika tiada
 * apa-apa yang berubah (supaya pemanggil boleh elak penulisan tidak perlu).
 */
export async function migrateInlineImages<
  T extends { id: string; images?: string[] }
>(aktiviti: T[]): Promise<T[] | null> {
  let berubah = false;

  const hasil = await Promise.all(
    aktiviti.map(async (act) => {
      const gambar = act.images ?? [];
      // Hanya base64 tertanam yang perlu dipindahkan.
      if (!gambar.some((g) => g && g.startsWith('data:'))) return act;

      const baharu = await Promise.all(
        gambar.map(async (g) => {
          if (!g || !g.startsWith('data:')) return g;
          try {
            return await savePhoto(g);
          } catch {
            return g; // biarkan seadanya jika gagal
          }
        })
      );
      berubah = true;
      return { ...act, images: baharu };
    })
  );

  return berubah ? hasil : null;
}
