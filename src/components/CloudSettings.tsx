import { useState } from 'react';
import { ActivityLog } from '../types';
import {
  testConnection,
  syncMany,
  getWebAppUrl,
  setWebAppUrl,
  getAdminToken,
  setAdminToken
} from '../lib/sheetsSync';
import { Cloud, Play, Database, KeyRound, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface CloudSettingsProps {
  activities: ActivityLog[];
}

/**
 * Tetapan penyegerakan Google Sheets & Drive.
 *
 * Menggantikan tab "Integrasi Excel & GD" yang dahulu turut memuatkan panduan
 * pemasangan, jadual blueprint lajur dan keseluruhan kod Apps Script untuk
 * disalin. Semua itu hanya berguna sekali semasa persediaan; setelah backend
 * berjalan ia sekadar mengaburkan tetapan yang benar-benar digunakan.
 */
export default function CloudSettings({ activities }: CloudSettingsProps) {
  const [url, setUrl] = useState(() => getWebAppUrl());
  const [token, setToken] = useState(() => getAdminToken());
  const [status, setStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [mesej, setMesej] = useState('');

  const simpanUrl = () => {
    setWebAppUrl(url);
    setStatus('IDLE');
    setMesej('');
    alert(url.trim() ? 'Pautan Web App disimpan.' : 'Pautan dikosongkan — penyegerakan dimatikan.');
  };

  const simpanToken = () => {
    setAdminToken(token);
    alert(
      token.trim()
        ? 'Token pentadbir disimpan dalam pelayar ini sahaja.'
        : 'Token dikosongkan. Memadam rekod tidak akan membuangnya daripada Sheets.'
    );
  };

  const uji = async () => {
    setStatus('SYNCING');
    setMesej('Menghubungi deployment Apps Script…');
    const hasil = await testConnection(url);
    setStatus(hasil.ok ? 'SUCCESS' : 'ERROR');
    setMesej(hasil.message);
  };

  const segerakSemua = async () => {
    if (!activities.length) {
      alert('Tiada rekod aktiviti untuk disegerakkan.');
      return;
    }
    if (!getWebAppUrl()) {
      alert('Sila simpan pautan Web App terlebih dahulu.');
      return;
    }
    if (
      !confirm(
        `Segerakkan ${activities.length} rekod ke Google Sheets?\n\n` +
          'Gambar turut dimuat naik ke Google Drive, jadi proses ini mungkin ' +
          'mengambil masa beberapa minit.'
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
    <div className="space-y-6">
      <div className="border-b border-white/8 pb-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-bright">
          Google Sheets &amp; Drive
        </h3>
        <p className="mt-0.5 text-[11px] text-muted">
          Pangkalan data awan untuk rekod dan gambar laporan.
        </p>
      </div>

      {/* Pautan Web App */}
      <div className="space-y-2">
        <label htmlFor="url-webapp" className="flex items-center gap-2 text-xs font-bold text-soft">
          <Cloud className="h-3.5 w-3.5 text-lime-core" />
          Pautan Web App Apps Script
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="url-webapp"
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/…/exec"
            className="field flex-1 font-mono text-[11px]"
          />
          <button type="button" onClick={simpanUrl} className="btn-ghost whitespace-nowrap">
            Simpan
          </button>
          <button
            type="button"
            onClick={uji}
            disabled={sedangSibuk || !url.trim()}
            className="btn-primary whitespace-nowrap"
          >
            {sedangSibuk ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Uji
          </button>
        </div>
      </div>

      {/* Token pentadbir */}
      <div className="space-y-2">
        <label htmlFor="token-admin" className="flex items-center gap-2 text-xs font-bold text-soft">
          <KeyRound className="h-3.5 w-3.5 text-lime-core" />
          Token Pentadbir
          <span className="font-normal text-faint">(untuk memadam rekod)</span>
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="token-admin"
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Tampal token daripada janaAdminToken()"
            className="field flex-1 font-mono text-[11px]"
          />
          <button type="button" onClick={simpanToken} className="btn-ghost whitespace-nowrap">
            Simpan
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-muted">
          Tanpa token, memadam rekod dalam aplikasi <strong className="text-soft">tidak</strong>{' '}
          membuang barisnya daripada Google Sheets. Jalankan{' '}
          <code className="rounded bg-black/30 px-1 py-0.5 font-mono text-[10px] text-lime-core">
            janaAdminToken()
          </code>{' '}
          dalam editor Apps Script, tetapkan{' '}
          <code className="rounded bg-black/30 px-1 py-0.5 font-mono text-[10px] text-lime-core">
            ADMIN_TOKEN
          </code>{' '}
          dalam Code.gs, deploy versi baharu, kemudian tampal token yang sama di sini.
        </p>
        <p className="text-[11px] text-amber-300">
          Disimpan dalam pelayar ini sahaja — jangan kongsi atau commit ke GitHub.
        </p>
      </div>

      {/* Segerak */}
      <div className="space-y-2 border-t border-white/8 pt-5">
        <h4 className="text-xs font-bold text-soft">Segerakkan Rekod</h4>
        <p className="text-[11px] leading-relaxed text-muted">
          Menghantar {activities.length} rekod tersimpan ke Google Sheets berserta memuat naik
          gambar ke Drive. Rekod dengan ID yang sama dikemas kini, bukan diduplikasi.
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
            ? `Segerakkan ${activities.length} Rekod`
            : 'Tiada Rekod Untuk Disegerakkan'}
        </button>
      </div>

      {/* Maklum balas */}
      {status !== 'IDLE' && (
        <div
          className={`glass-inset flex gap-3 p-4 text-xs leading-relaxed ${
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
