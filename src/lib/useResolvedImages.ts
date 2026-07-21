import { useEffect, useState } from 'react';
import { resolveImages } from './photoStore';

/** Pautan paparan terus bagi fail Drive yang dikongsi "sesiapa dengan pautan". */
const urlDrive = (fileId: string) => `https://lh3.googleusercontent.com/d/${fileId}`;

/**
 * Selesaikan gambar dengan sandaran Google Drive.
 *
 * Rujukan "idb:" hanya wujud pada peranti yang memuat naik gambar berkenaan.
 * Apabila rekod dimuat turun daripada Google Sheets ke telefon lain, rujukan
 * itu tidak akan ditemui — jadi kita jatuh balik kepada ID fail Drive yang
 * disimpan bersama rekod.
 */
export function useResolvedImagesWithDrive(
  refs: string[] | undefined,
  driveIds: string[] | undefined
): string[] {
  const [urls, setUrls] = useState<string[]>([]);
  const kunci = `${(refs ?? []).join('|')}::${(driveIds ?? []).join('|')}`;

  useEffect(() => {
    let dibatalkan = false;
    const senarai = refs ?? [];
    const drive = driveIds ?? [];

    if (!senarai.length && !drive.length) {
      setUrls([]);
      return;
    }

    // Jika tiada rujukan tempatan langsung, terus guna Drive.
    if (!senarai.length) {
      setUrls(drive.map(urlDrive));
      return;
    }

    resolveImages(senarai)
      .then(hasil => {
        if (dibatalkan) return;
        setUrls(hasil.map((u, i) => u || (drive[i] ? urlDrive(drive[i]) : '')));
      })
      .catch(() => {
        if (!dibatalkan) setUrls(drive.map(urlDrive));
      });

    return () => {
      dibatalkan = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci]);

  return urls;
}

/**
 * Tukar senarai rujukan gambar ("idb:<id>" atau base64 lama) kepada
 * senarai data URL yang boleh terus digunakan pada <img src>.
 *
 * Gambar dimuatkan secara tak segerak daripada IndexedDB, jadi pulangan
 * awal ialah array kosong — komponen perlu mengendalikan keadaan itu.
 */
export function useResolvedImages(refs: string[] | undefined): string[] {
  const [urls, setUrls] = useState<string[]>([]);
  const kunci = (refs ?? []).join('|');

  useEffect(() => {
    let dibatalkan = false;

    if (!refs || refs.length === 0) {
      setUrls([]);
      return;
    }

    resolveImages(refs)
      .then((hasil) => {
        if (!dibatalkan) setUrls(hasil);
      })
      .catch(() => {
        if (!dibatalkan) setUrls([]);
      });

    return () => {
      dibatalkan = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci]);

  return urls;
}

/** Versi satu gambar — berguna untuk lakaran kecil (thumbnail). */
export function useResolvedImage(ref: string | undefined): string {
  const senarai = useResolvedImages(ref ? [ref] : []);
  return senarai[0] ?? '';
}
