import { useState } from 'react';
import { ActivityLog } from '../types';
import { syncMany } from '../lib/sheetsSync';
import { Database, CheckCircle, AlertCircle, Loader, Cloud } from 'lucide-react';

interface CloudSettingsProps {
  activities: ActivityLog[];
}

/**
 * Segerak semula rekod ke Google Sheets & Drive.
 *
 * Medan konfigurasi (pautan Web App dan token pentadbir) telah dibuang —
 * kedua-duanya kini terbina dalam aplikasi, jadi guru tidak perlu menetapkan
 * apa-apa dan panel tetapan itu hanya mengelirukan.
 *
 * Tindakan segerak semula DIKEKALKAN kerana ia masih diperlukan:
 * rekod disegerakkan secara automatik semasa disimpan, tetapi penyegerakan itu
 * boleh gagal apabila telefon berada di luar liputan atau rangkaian sekolah
 * terputus. Tanpa butang ini, rekod yang gagal hanya boleh dihantar semula
 * dengan menyunting dan menyimpan setiap satu secara manual.
 */
export default function CloudSettings({ activities }: CloudSettingsProps) {
  const [status, setStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [mesej, setMesej] = useState('');

  const segerakSemua = async () => {
    if (!activities.length) {
      alert('Tiada rekod aktiviti untuk disegerakkan.');
      return;
    }
    if (
      !confirm(
        `Hantar semula ${activities.length} rekod ke Google Sheets?\n\n` +
          'Rekod yang sudah ada akan dikemas kini, bukan diduplikasi. ' +
          'Gambar turut dimuat naik semula, jadi proses ini mungkin mengambil ' +
          'masa beberapa minit.'
      )
    ) {
      return;
    }

    setStatus('SYNCING');
    setMesej(`Menyegerakkan 0 daripada ${activities.length} rekod…`);

    const hasil = await syncMany(activities, p =>
      setMesej(
        `Menyegerakkan ${p.done} daripada ${p.total} rekod…` + (p.current ? ` (${p.current})` : '')
      )
    );

    if (hasil.gagal === 0) {
      setStatus('SUCCESS');
      setMesej(`Selesai — ${hasil.berjaya} rekod disegerakkan ke Google Sheets & Drive.`);
    } else {
      setStatus('ERROR');
      setMesej(
        `${hasil.berjaya} berjaya, ${hasil.gagal} gagal.\n\n` +
          hasil.ralat.slice(0, 3).join('\n') +
          (hasil.ralat.length > 3 ? `\n…dan ${hasil.ralat.length - 3} lagi.` : '')
      );
    }
  };

  const sedangSibuk = status === 'SYNCING';

  return (
    <div className="glass-inset space-y-3 p-5">
      <div className="flex items-center gap-2.5">
        <Cloud className="h-5 w-5 text-lime-core" />
        <h4 className="text-sm font-bold text-bright">Hantar Semula ke Google Sheets</h4>
      </div>

      <p className="text-[11px] leading-relaxed text-muted">
        Rekod dihantar ke Google Sheets secara automatik setiap kali disimpan. Gunakan
        butang ini hanya jika penyegerakan pernah gagal — contohnya semasa telefon di
        luar liputan. Rekod yang sudah ada dikemas kini, bukan diduplikasi.
      </p>

      <button
        type="button"
        onClick={segerakSemua}
        disabled={sedangSibuk || activities.length === 0}
        className="btn-primary w-full"
      >
        {sedangSibuk ? (
          <Loader className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Database className="h-3.5 w-3.5" />
        )}
        {activities.length > 0
          ? `Hantar Semula ${activities.length} Rekod`
          : 'Tiada Rekod Untuk Dihantar'}
      </button>

      {status !== 'IDLE' && (
        <div
          className={`flex gap-3 pt-1 text-xs leading-relaxed ${
            status === 'SUCCESS'
              ? 'text-emerald-300'
              : status === 'ERROR'
                ? 'text-rose-300'
                : 'text-amber-300'
          }`}
        >
          {status === 'SUCCESS' ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : status === 'ERROR' ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <Loader className="h-4 w-4 shrink-0 animate-spin" />
          )}
          <span className="whitespace-pre-line">{mesej}</span>
        </div>
      )}
    </div>
  );
}
