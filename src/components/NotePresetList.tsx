import { useState } from 'react';
import { isiCatatan } from '../data';
import { Plus, Trash2, RotateCcw, Eye } from 'lucide-react';

interface NotePresetListProps {
  title: string;
  hint: string;
  presets: string[];
  /** Nilai lalai sistem, untuk butang "Pulihkan Senarai Asal". */
  defaults: string[];
  onChange: (presets: string[]) => void;
  placeholder: string;
  /** Tunjukkan pratonton dengan ruang ganti diisi (catatan impak sahaja). */
  showPreview?: boolean;
}

/**
 * Penyunting senarai preset catatan.
 *
 * Satu komponen digunakan untuk kedua-dua senarai (catatan kemajuan murid dan
 * catatan impak keseluruhan) kerana operasinya sama: tambah, sunting, padam,
 * pulihkan. Preset impak mengandungi ruang ganti seperti {aktiviti}, jadi ia
 * mempunyai pratonton bagi menunjukkan bentuk akhir teks kepada guru.
 */
export default function NotePresetList({
  title,
  hint,
  presets,
  defaults,
  onChange,
  placeholder,
  showPreview = false
}: NotePresetListProps) {
  const [teksBaharu, setTeksBaharu] = useState('');
  const [pratontonAktif, setPratontonAktif] = useState(false);

  const handleTambah = () => {
    const bersih = teksBaharu.trim();
    if (!bersih) return;
    if (presets.some(p => p.trim().toLowerCase() === bersih.toLowerCase())) {
      alert('Catatan ini sudah ada dalam senarai preset.');
      return;
    }
    onChange([...presets, bersih]);
    setTeksBaharu('');
  };

  const handlePadam = (index: number) => {
    onChange(presets.filter((_, i) => i !== index));
  };

  const handleSunting = (index: number, teks: string) => {
    onChange(presets.map((p, i) => (i === index ? teks : p)));
  };

  const handlePulih = () => {
    if (confirm(`Pulihkan ${title} kepada ${defaults.length} preset asal sistem? Preset yang anda tambah sendiri akan hilang.`)) {
      onChange([...defaults]);
    }
  };

  // Konteks contoh — hanya untuk pratonton, tidak pernah disimpan.
  const konteksContoh = {
    aktiviti: 'Mari Membaca Suku Kata',
    kelas: '1 INOVATIF',
    bil: 5,
    bilNaik: 3,
    subjek: 'BM'
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/8 pb-2.5">
        <div>
          <h4 className="text-xs font-black text-bright uppercase tracking-wide">{title}</h4>
          <p className="text-[11px] text-muted mt-0.5 max-w-xl leading-relaxed">{hint}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold bg-lime-core/12 text-lime-glow rounded-full px-2 py-0.5">
            {presets.length} Preset
          </span>
          {showPreview && (
            <button
              type="button"
              onClick={() => setPratontonAktif(v => !v)}
              className={`p-1.5 rounded-lg transition ${
                pratontonAktif
                  ? 'bg-lime-core/20 text-lime-glow'
                  : 'text-faint hover:text-bright hover:bg-white/8'
              }`}
              title="Tunjukkan contoh teks selepas ruang ganti diisi"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handlePulih}
            className="p-1.5 rounded-lg text-faint hover:text-lime-glow hover:bg-lime-core/12 transition"
            title="Pulihkan senarai preset asal"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showPreview && (
        <p className="text-[10.5px] text-muted rounded-xl bg-black/25 p-3 leading-relaxed">
          Ruang ganti yang boleh digunakan:{' '}
          <code className="text-lime-glow">{'{aktiviti}'}</code>{' '}
          <code className="text-lime-glow">{'{kelas}'}</code>{' '}
          <code className="text-lime-glow">{'{bil}'}</code>{' '}
          <code className="text-lime-glow">{'{bilNaik}'}</code>{' '}
          <code className="text-lime-glow">{'{subjek}'}</code>
          {' '}— ia diisi secara automatik dengan butiran rekod yang sedang dibuka.
        </p>
      )}

      {/* Tambah preset */}
      <div className="flex flex-col sm:flex-row gap-2">
        <textarea
          rows={2}
          value={teksBaharu}
          onChange={(e) => setTeksBaharu(e.target.value)}
          placeholder={placeholder}
          className="field !text-xs flex-1 resize-none"
        />
        <button
          type="button"
          onClick={handleTambah}
          className="px-4 py-2 bg-lime-core text-[#0a0f08] rounded-xl text-xs font-bold hover:bg-lime-deep transition flex items-center justify-center gap-1.5 shrink-0 h-fit sm:self-stretch sm:h-auto"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah
        </button>
      </div>

      {/* Senarai preset */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {presets.length === 0 ? (
          <p className="text-[11px] text-muted italic py-3 text-center">
            Tiada preset. Tambah satu di atas, atau tekan ikon pulih untuk mengembalikan
            senarai asal sistem.
          </p>
        ) : (
          presets.map((preset, index) => (
            <div key={index} className="rounded-xl bg-white/5 p-2.5 space-y-1">
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 shrink-0 grid place-items-center rounded-full bg-lime-core/15 text-[10px] font-extrabold text-lime-glow">
                  {index + 1}
                </span>
                <textarea
                  rows={2}
                  value={preset}
                  onChange={(e) => handleSunting(index, e.target.value)}
                  className="flex-1 bg-transparent text-[11.5px] leading-relaxed text-soft rounded px-1.5 py-0.5 hover:bg-white/5 focus:bg-black/25 focus:outline-none resize-none transition"
                />
                <button
                  type="button"
                  onClick={() => handlePadam(index)}
                  className="p-1.5 shrink-0 rounded text-faint hover:text-rose-400 hover:bg-rose-500/12 transition"
                  title="Padam preset"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {showPreview && pratontonAktif && /\{\w+\}/.test(preset) && (
                <p className="text-[10.5px] text-lime-glow/80 italic pl-7 leading-relaxed">
                  → {isiCatatan(preset, konteksContoh)}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
