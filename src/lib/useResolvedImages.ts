import { useEffect, useState } from 'react';
import { resolveImages } from './photoStore';

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
