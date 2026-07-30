import { useMemo, useState } from 'react';
import { StudentRosterEntry } from '../types';
import { huraiSenaraiMurid, kumpulIkutKelas, susunRoster, HasilHuraian } from '../lib/roster';
import {
  Users,
  Plus,
  Trash2,
  ClipboardPaste,
  Search,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

interface StudentRosterManagerProps {
  roster: StudentRosterEntry[];
  availableClasses: string[];
  onChange: (roster: StudentRosterEntry[]) => void;
}

/**
 * Senarai induk nama murid — tampal pukal, sistem susun mengikut kelas.
 *
 * Tampalan tidak dimasukkan terus. Ia dihurai dahulu dan hasilnya dipaparkan
 * untuk disemak: berapa nama masuk ke kelas mana, nama mana yang bertindih,
 * dan kelas mana yang belum ada dalam tetapan sekolah. Senarai nama murid
 * adalah data yang lambat dibina semula, jadi ia tidak sepatutnya berubah
 * berdasarkan tekaan penghurai tanpa pengesahan guru.
 */
export default function StudentRosterManager({
  roster,
  availableClasses,
  onChange
}: StudentRosterManagerProps) {
  const [teksPukal, setTeksPukal] = useState('');
  const [kelasLalai, setKelasLalai] = useState(availableClasses[0] ?? '');
  const [pratonton, setPratonton] = useState<HasilHuraian | null>(null);
  const [carian, setCarian] = useState('');

  // Borang tambah seorang murid
  const [namaTunggal, setNamaTunggal] = useState('');
  const [kelasTunggal, setKelasTunggal] = useState(availableClasses[0] ?? '');

  const kumpulan = useMemo(() => {
    const disaring = carian.trim()
      ? roster.filter(
          m =>
            m.name.toLowerCase().includes(carian.toLowerCase()) ||
            m.className.toLowerCase().includes(carian.toLowerCase())
        )
      : roster;
    return kumpulIkutKelas(disaring, availableClasses);
  }, [roster, availableClasses, carian]);

  const handleHurai = () => {
    if (!teksPukal.trim()) {
      alert('Sila tampal senarai nama murid terlebih dahulu.');
      return;
    }
    setPratonton(huraiSenaraiMurid(teksPukal, availableClasses, kelasLalai, roster));
  };

  const handleTerima = () => {
    if (!pratonton) return;

    // Nama tanpa kelas diberikan kelas lalai supaya ia tidak hilang tanpa
    // disedari — pengguna sudah melihat bilangannya dalam pratonton.
    const tambahanTanpaKelas: StudentRosterEntry[] = pratonton.tanpaKelas.map((nama, i) => ({
      id: `mrd-${Date.now().toString(36)}-tk${i}`,
      name: nama,
      className: kelasLalai
    }));

    onChange(
      susunRoster([...roster, ...pratonton.entries, ...tambahanTanpaKelas], availableClasses)
    );
    setPratonton(null);
    setTeksPukal('');
  };

  const handleTambahTunggal = () => {
    const nama = namaTunggal.trim().replace(/\s+/g, ' ');
    if (!nama || !kelasTunggal) return;

    const sudahAda = roster.some(
      m =>
        m.name.toUpperCase() === nama.toUpperCase() &&
        m.className.toUpperCase() === kelasTunggal.toUpperCase()
    );
    if (sudahAda) {
      alert(`"${nama}" sudah ada dalam kelas ${kelasTunggal}.`);
      return;
    }

    onChange(
      susunRoster(
        [...roster, { id: `mrd-${Date.now().toString(36)}`, name: nama, className: kelasTunggal }],
        availableClasses
      )
    );
    setNamaTunggal('');
  };

  const handlePadamMurid = (id: string) => {
    onChange(roster.filter(m => m.id !== id));
  };

  const handleNamaBerubah = (id: string, nama: string) => {
    onChange(roster.map(m => (m.id === id ? { ...m, name: nama } : m)));
  };

  const handlePadamKelas = (kelas: string) => {
    const bil = roster.filter(m => m.className === kelas).length;
    if (confirm(`Padam kesemua ${bil} nama murid dalam kelas ${kelas}?`)) {
      onChange(roster.filter(m => m.className !== kelas));
    }
  };

  const handlePadamSemua = () => {
    if (confirm(`Padam kesemua ${roster.length} nama murid dalam senarai induk?`)) {
      onChange([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/8 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black text-bright uppercase tracking-wider">
            Senarai Induk Nama Murid
          </h3>
          <p className="text-[11px] text-muted mt-0.5">
            Tampal senarai nama secara pukal — sistem akan menyusunnya mengikut kelas.
            Semasa merekod aktiviti, guru hanya perlu menanda nama daripada senarai ini.
          </p>
        </div>
        <span className="text-[10px] font-bold bg-lime-core/12 text-lime-glow rounded-full px-2 py-0.5 shrink-0">
          {roster.length} Murid · {kumpulIkutKelas(roster, availableClasses).length} Kelas
        </span>
      </div>

      {/* ---------------------------------------------------------------
          Tampal pukal
          --------------------------------------------------------------- */}
      <div className="rounded-2xl bg-white/5 p-4 space-y-3">
        <h4 className="text-xs font-black text-bright uppercase flex items-center gap-1.5">
          <ClipboardPaste className="h-4 w-4 text-lime-core" />
          Tampal Senarai Pukal
        </h4>

        <div className="rounded-xl bg-black/25 p-3 text-[10.5px] text-muted leading-relaxed space-y-1">
          <p className="font-bold text-soft">Format yang diterima (boleh dicampur):</p>
          <p>
            • Tajuk kelas pada barisnya sendiri, diikuti nama-nama di bawahnya —
            contohnya <code className="text-lime-glow">1 INOVATIF</code>
          </p>
          <p>
            • Satu baris satu murid: <code className="text-lime-glow">Nama Murid, 1 INTELEK</code>{' '}
            (koma, tab, <code>;</code>, <code>|</code>, atau <code> - </code>)
          </p>
          <p>• Nombor turutan di hadapan nama (1. / 1) / •) akan dibuang secara automatik</p>
          <p>• Baris tanpa kelas akan dimasukkan ke kelas lalai yang dipilih di bawah</p>
        </div>

        <textarea
          rows={8}
          value={teksPukal}
          onChange={(e) => {
            setTeksPukal(e.target.value);
            setPratonton(null);
          }}
          placeholder={
            '1 INOVATIF\n1. Ahmad Danial bin Rosli\n2. Nur Aisyah binti Kamal\n\n1 INTELEK\nMuhammad Haikal bin Zainal\nSiti Balqis binti Omar\n\nAtau: Nurul Izzah binti Ali, 2 KRITIS'
          }
          className="field !text-xs font-mono leading-relaxed"
        />

        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-faint uppercase block">
              Kelas lalai (baris tanpa kelas)
            </label>
            <select
              value={kelasLalai}
              onChange={(e) => setKelasLalai(e.target.value)}
              className="field !py-1.5 !text-xs !w-auto min-w-[140px]"
            >
              {availableClasses.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleHurai}
            className="px-4 py-2 bg-lime-core text-[#0a0f08] rounded-xl text-xs font-bold hover:bg-lime-deep transition flex items-center gap-1.5 shadow-sm"
          >
            <Search className="h-3.5 w-3.5" /> Semak Senarai
          </button>

          {teksPukal && (
            <button
              type="button"
              onClick={() => {
                setTeksPukal('');
                setPratonton(null);
              }}
              className="btn-ghost !py-2 !text-xs"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Pratonton hasil huraian */}
        {pratonton && (() => {
          const kumpulanBaharu = kumpulIkutKelas(pratonton.entries, availableClasses);
          const jumlahBaharu = pratonton.entries.length + pratonton.tanpaKelas.length;

          return (
            <div className="rounded-xl bg-lime-core/8 p-3.5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-lime-glow uppercase">
                  Hasil Semakan
                </span>
                <button
                  type="button"
                  onClick={() => setPratonton(null)}
                  className="p-1 text-faint hover:text-bright"
                  title="Tutup pratonton"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {jumlahBaharu === 0 ? (
                <p className="text-[11px] text-amber-300 flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
                  Tiada nama baharu dijumpai. Semua nama dalam tampalan ini mungkin sudah
                  ada dalam senarai induk.
                </p>
              ) : (
                <>
                  <p className="text-[11px] text-soft">
                    <strong className="text-lime-glow">{jumlahBaharu} nama</strong> sedia
                    ditambah ke dalam senarai induk:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {kumpulanBaharu.map(k => (
                      <span key={k.className} className="chip-lime">
                        {k.className}: {k.students.length}
                      </span>
                    ))}
                    {pratonton.tanpaKelas.length > 0 && (
                      <span className="chip">
                        Tanpa kelas → {kelasLalai}: {pratonton.tanpaKelas.length}
                      </span>
                    )}
                  </div>
                </>
              )}

              {pratonton.pendua.length > 0 && (
                <p className="text-[10.5px] text-amber-300 leading-relaxed">
                  <strong>{pratonton.pendua.length} nama dilangkau</strong> kerana sudah ada
                  dalam senarai: {pratonton.pendua.slice(0, 6).join('; ')}
                  {pratonton.pendua.length > 6 && ` … dan ${pratonton.pendua.length - 6} lagi`}
                </p>
              )}

              {pratonton.kelasBaharu.length > 0 && (
                <p className="text-[10.5px] text-amber-300 leading-relaxed flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
                  <span>
                    Kelas ini belum ada dalam Senarai Kelas:{' '}
                    <strong>{pratonton.kelasBaharu.join(', ')}</strong>. Murid masih boleh
                    disimpan, tetapi tambah kelas tersebut dalam tab <em>Senarai Kelas</em> supaya
                    ia boleh dipilih semasa merekod aktiviti.
                  </span>
                </p>
              )}

              {jumlahBaharu > 0 && (
                <button
                  type="button"
                  onClick={handleTerima}
                  className="px-4 py-2 bg-lime-core text-[#0a0f08] rounded-xl text-xs font-bold hover:bg-lime-deep transition flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" /> Tambah {jumlahBaharu} Nama ke Senarai Induk
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* ---------------------------------------------------------------
          Tambah seorang murid
          --------------------------------------------------------------- */}
      <div className="rounded-2xl bg-white/5 p-4 space-y-3">
        <h4 className="text-xs font-black text-bright uppercase flex items-center gap-1.5">
          <Plus className="h-4 w-4 text-lime-core" />
          Tambah Seorang Murid
        </h4>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Nama penuh murid"
            value={namaTunggal}
            onChange={(e) => setNamaTunggal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTambahTunggal();
              }
            }}
            className="field !py-2 !text-xs flex-1 min-w-[180px]"
          />
          <select
            value={kelasTunggal}
            onChange={(e) => setKelasTunggal(e.target.value)}
            className="field !py-2 !text-xs !w-auto min-w-[130px]"
          >
            {availableClasses.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleTambahTunggal}
            className="px-4 py-2 bg-lime-core text-[#0a0f08] rounded-xl text-xs font-bold hover:bg-lime-deep transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------
          Senarai semasa
          --------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-4">
          <h4 className="text-xs font-black text-bright uppercase flex items-center gap-1.5">
            <Users className="h-4 w-4 text-lime-core" />
            Senarai Semasa (Disusun Ikut Kelas)
          </h4>
          {roster.length > 0 && (
            <button
              type="button"
              onClick={handlePadamSemua}
              className="btn-danger !py-1.5 !text-[11px]"
            >
              Padam Semua
            </button>
          )}
        </div>

        {roster.length > 0 && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-faint pointer-events-none">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              placeholder="Cari nama murid atau kelas..."
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              className="field !py-2 !text-xs !pl-9"
            />
          </div>
        )}

        {roster.length === 0 ? (
          <div className="rounded-2xl bg-white/5 p-8 text-center space-y-2">
            <Users className="h-8 w-8 mx-auto text-faint stroke-1.5" />
            <p className="text-xs font-bold text-soft">Senarai induk masih kosong</p>
            <p className="text-[11px] text-muted max-w-sm mx-auto leading-relaxed">
              Tampal senarai nama murid di atas. Selepas itu, borang rekod aktiviti akan
              memaparkan senarai tanda (checklist) nama murid bagi kelas yang dipilih.
            </p>
          </div>
        ) : kumpulan.length === 0 ? (
          <p className="text-[11px] text-muted italic py-4 text-center">
            Tiada nama sepadan dengan carian "{carian}".
          </p>
        ) : (
          <div className="space-y-3">
            {kumpulan.map(k => (
              <div key={k.className} className="rounded-2xl bg-white/5 overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-lime-core/8">
                  <span className="text-xs font-black text-lime-glow uppercase tracking-wide">
                    {k.className}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-soft">
                      {k.students.length} murid
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePadamKelas(k.className)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/12 hover:text-rose-300 transition"
                      title={`Padam semua murid kelas ${k.className}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-white/5">
                  {k.students.map((murid, i) => (
                    <div key={murid.id} className="flex items-center gap-2 px-3 py-1.5">
                      <span className="text-[10px] font-mono text-faint w-6 shrink-0 text-right">
                        {i + 1}.
                      </span>
                      <input
                        type="text"
                        value={murid.name}
                        onChange={(e) => handleNamaBerubah(murid.id, e.target.value)}
                        className="flex-1 bg-transparent px-2 py-1 rounded text-xs font-semibold text-bright hover:bg-white/5 focus:bg-black/25 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handlePadamMurid(murid.id)}
                        className="p-1.5 rounded text-faint hover:text-rose-400 hover:bg-rose-500/12 transition shrink-0"
                        title="Padam murid"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
