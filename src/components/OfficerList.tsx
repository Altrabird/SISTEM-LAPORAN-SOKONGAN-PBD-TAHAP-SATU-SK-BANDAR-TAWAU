import { useState } from 'react';
import { Officer } from '../types';
import { Plus, Trash2, Star, User } from 'lucide-react';

interface OfficerListProps {
  title: string;
  hint: string;
  officers: Officer[];
  idPrefix: string;
  onChange: (senarai: Officer[]) => void;
}

/**
 * Senarai pegawai yang boleh disunting — pelapor atau penyemak.
 *
 * Kedua-dua senarai berkelakuan sama, jadi ia dikongsi sebagai satu komponen
 * dan bukan disalin dua kali. Seorang pegawai boleh ditanda sebagai lalai;
 * dialah yang muncul dalam blok tandatangan laporan bergambar.
 */
export default function OfficerList({
  title,
  hint,
  officers,
  idPrefix,
  onChange
}: OfficerListProps) {
  const [nama, setNama] = useState('');
  const [jawatan, setJawatan] = useState('');

  const tambah = () => {
    const n = nama.trim();
    const j = jawatan.trim();
    if (!n || !j) {
      alert('Sila isi kedua-dua nama dan jawatan.');
      return;
    }
    // Elak nama berganda dengan jawatan yang sama
    const wujud = officers.some(
      o => o.name.toLowerCase() === n.toLowerCase() && o.position.toLowerCase() === j.toLowerCase()
    );
    if (wujud) {
      alert('Pegawai dengan nama dan jawatan yang sama sudah ada dalam senarai.');
      return;
    }

    onChange([
      ...officers,
      {
        id: `${idPrefix}-${Date.now()}`,
        name: n,
        position: j,
        // Kemasukan pertama menjadi lalai supaya senarai tidak pernah tanpa lalai
        isDefault: officers.length === 0
      }
    ]);
    setNama('');
    setJawatan('');
  };

  const buang = (id: string) => {
    const baki = officers.filter(o => o.id !== id);
    // Jika yang lalai dibuang, naikkan yang pertama supaya laporan tetap
    // mempunyai nama untuk dicetak.
    if (baki.length && !baki.some(o => o.isDefault)) baki[0].isDefault = true;
    onChange(baki);
  };

  const jadikanLalai = (id: string) => {
    onChange(officers.map(o => ({ ...o, isDefault: o.id === id })));
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-bright">{title}</h4>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">{hint}</p>
      </div>

      {/* Borang tambah */}
      <div className="glass-inset grid grid-cols-1 gap-2 p-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          type="text"
          value={nama}
          onChange={e => setNama(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tambah()}
          placeholder="Nama penuh"
          aria-label={`Nama ${title}`}
          className="field"
        />
        <input
          type="text"
          value={jawatan}
          onChange={e => setJawatan(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tambah()}
          placeholder="Jawatan (cth: Guru Besar)"
          aria-label={`Jawatan ${title}`}
          className="field"
        />
        <button type="button" onClick={tambah} className="btn-primary whitespace-nowrap">
          <Plus className="h-3.5 w-3.5" />
          Tambah
        </button>
      </div>

      {/* Senarai */}
      {officers.length === 0 ? (
        <div className="glass-inset flex flex-col items-center gap-2 px-4 py-8 text-center">
          <User className="h-6 w-6 text-faint" />
          <p className="text-xs text-muted">
            Belum ada {title.toLowerCase()}. Tambah sekurang-kurangnya seorang supaya
            blok tandatangan laporan tidak kosong.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {officers.map(o => (
            <li
              key={o.id}
              className="glass glass-hover flex items-center gap-3 p-3"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-black ${
                  o.isDefault
                    ? 'bg-lime-core text-[#0a0f08]'
                    : 'bg-white/8 text-muted'
                }`}
              >
                {o.name.trim().charAt(0).toUpperCase() || '?'}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-bright">{o.name}</p>
                <p className="truncate text-[11px] text-muted">{o.position}</p>
              </div>

              {o.isDefault && <span className="chip-lime shrink-0">Lalai</span>}

              <button
                type="button"
                onClick={() => jadikanLalai(o.id)}
                disabled={o.isDefault}
                title={o.isDefault ? 'Sudah menjadi pilihan lalai' : 'Jadikan pilihan lalai'}
                aria-label={`Jadikan ${o.name} pilihan lalai`}
                className="shrink-0 rounded-lg p-2 text-faint transition-colors hover:bg-white/8 hover:text-lime-core disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
              >
                <Star className={`h-3.5 w-3.5 ${o.isDefault ? 'fill-current text-lime-core' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => buang(o.id)}
                aria-label={`Buang ${o.name}`}
                className="shrink-0 rounded-lg p-2 text-faint transition-colors hover:bg-rose-500/15 hover:text-rose-300 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
