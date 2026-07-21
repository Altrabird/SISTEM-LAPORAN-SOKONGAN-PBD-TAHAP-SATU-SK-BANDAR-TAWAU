import { useState, useMemo } from 'react';
import { ActivityLog, isAssessed, tpGain } from '../types';
import { useResolvedImage } from '../lib/useResolvedImages';
import { getWebAppUrl, getAdminToken } from '../lib/sheetsSync';
import {
  Search,
  BookOpen,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  Sparkles,
  Filter
} from 'lucide-react';

/**
 * Lakaran kecil bagi kad aktiviti.
 *
 * Diasingkan menjadi komponen sendiri kerana gambar kini disimpan dalam
 * IndexedDB dan perlu diselesaikan melalui hook — hook tidak boleh dipanggil
 * di dalam .map() komponen induk.
 */
function ActivityThumbnail({ imageRef, alt }: { imageRef: string; alt: string }) {
  const url = useResolvedImage(imageRef);

  if (!url) {
    // Ruang dikekalkan semasa gambar dimuatkan supaya susun atur tidak melompat.
    return <div className="w-full h-full bg-white/8 animate-pulse" aria-hidden="true" />;
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
      referrerPolicy="no-referrer"
    />
  );
}

interface ActivityListProps {
  activities: ActivityLog[];
  onViewReport: (activity: ActivityLog) => void;
  onEditActivity: (activity: ActivityLog) => void;
  onDeleteActivity: (id: string) => void;
  onAddNew: () => void;
}

export default function ActivityList({
  activities,
  onViewReport,
  onEditActivity,
  onDeleteActivity,
  onAddNew
}: ActivityListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<'ALL' | 'BM' | 'BI'>('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Extract all unique classes for filtering
  const allUniqueClasses = useMemo(() => {
    const classes = activities.map(act => act.className);
    return ['ALL', ...Array.from(new Set(classes))];
  }, [activities]);

  // Search and filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      // 1. Subject filter
      if (selectedSubject !== 'ALL' && act.subject !== selectedSubject) {
        return false;
      }

      // 2. Class filter
      if (selectedClass !== 'ALL' && act.className !== selectedClass) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim() === '') return true;
      const query = searchQuery.toLowerCase();
      
      const matchActivityName = act.activityName.toLowerCase().includes(query);
      const matchTeacher = act.subjectTeacher.toLowerCase().includes(query) || act.teacherOnDuty.toLowerCase().includes(query);
      const matchClass = act.className.toLowerCase().includes(query);
      const matchNotes = act.notes.toLowerCase().includes(query);
      const matchGroup = act.groupName.toLowerCase().includes(query);
      
      const matchStudents = act.students.some(stud => 
        stud.name.toLowerCase().includes(query) || 
        (stud.notes && stud.notes.toLowerCase().includes(query))
      );

      return matchActivityName || matchTeacher || matchClass || matchNotes || matchGroup || matchStudents;
    });
  }, [activities, searchQuery, selectedSubject, selectedClass]);

  /**
   * Pengesahan padam.
   *
   * Amaran menyatakan dengan tepat apa yang akan hilang, kerana akibatnya
   * berbeza bergantung pada konfigurasi: dengan token pentadbir, baris Sheet
   * dan folder Drive turut dibuang secara kekal. Pengguna berhak tahu skop
   * sebenar sebelum menekan, bukan selepasnya.
   */
  const confirmDelete = (id: string, name: string) => {
    const adaAwan = Boolean(getWebAppUrl());
    const adaToken = Boolean(getAdminToken());

    let amaran = `Padam rekod aktiviti "${name}"?\n\nGambarnya dalam pelayar ini akan turut dibuang.`;

    if (adaAwan && adaToken) {
      amaran +=
        '\n\nBaris dalam Google Sheets dan folder gambarnya dalam Google Drive ' +
        'juga akan dipadam. Tindakan ini tidak boleh dibatalkan.';
    } else if (adaAwan) {
      amaran +=
        '\n\nNOTA: baris dalam Google Sheets TIDAK akan dipadam kerana token ' +
        'pentadbir belum ditetapkan. Anda perlu membuangnya secara manual.';
    }

    if (confirm(amaran)) {
      onDeleteActivity(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header bar */}
      <div className="glass p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-bright">Senarai Aktiviti Sokongan PBD</h2>
            <p className="text-xs text-muted mt-1">Cari, tapis, dan urus rekod bimbingan akademik sekolah.</p>
          </div>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-core px-4 py-2.5 text-sm font-bold text-[#0a0f08] transition hover:bg-lime-deep shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Rekod Sesi Baru
          </button>
        </div>

        {/* Filters and Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {/* Search box */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-faint">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Cari guru, murid, aktiviti, kumpulan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field !pl-10"
            />
          </div>

          {/* Subject Selector */}
          <div className="flex gap-1.5 bg-white/5 p-1.5 rounded-xl">
            <button
              onClick={() => setSelectedSubject('ALL')}
              className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all ${
                selectedSubject === 'ALL'
                  ? 'bg-white/5 text-bright shadow-sm'
                  : 'text-muted hover:text-bright'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedSubject('BM')}
              className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all ${
                selectedSubject === 'BM'
                  ? 'bg-lime-core text-[#0a0f08] shadow-sm'
                  : 'text-muted hover:text-bright'
              }`}
            >
              BM
            </button>
            <button
              onClick={() => setSelectedSubject('BI')}
              className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-all ${
                selectedSubject === 'BI'
                  ? 'bg-fuchsia-400 text-[#160a12] shadow-sm'
                  : 'text-muted hover:text-bright'
              }`}
            >
              BI
            </button>
          </div>

          {/* Class Select */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-faint pointer-events-none">
              <Filter className="h-4 w-4" />
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="field !pl-10"
            >
              {allUniqueClasses.map(cls => (
                <option key={cls} value={cls}>
                  {cls === 'ALL' ? 'Semua Kelas' : `Kelas: ${cls}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of list elements */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const isBM = act.subject === 'BM';
            // Hanya kira murid yang sudah dinilai (TP Selepas diisi).
            const improvementCount = act.students.filter(
              s => isAssessed(s) && (tpGain(s) ?? 0) > 0
            ).length;
            const pendingCount = act.students.filter(s => !isAssessed(s)).length;
            const hasImages = act.images && act.images.length > 0;

            return (
              <div
                key={act.id}
                className="glass glass-hover overflow-hidden flex flex-col justify-between group"
              >
                {/* Image Section or Subject Banner */}
                <div className="relative aspect-video w-full bg-white/5 overflow-hidden">
                  {hasImages ? (
                    <ActivityThumbnail imageRef={act.images[0]} alt={act.activityName} />
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center gap-1.5 ${
                      isBM ? 'bg-gradient-to-br from-blue-50 to-indigo-100/70 text-lime-glow' : 'bg-gradient-to-br from-pink-50 to-rose-100/70 text-fuchsia-300'
                    }`}>
                      <BookOpen className="h-8 w-8 stroke-1.5" />
                      <span className="text-xs font-semibold">Tiada Gambar Laporan</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase shadow-sm ${
                      isBM ? 'bg-lime-core text-[#0a0f08]' : 'bg-fuchsia-400 text-[#160a12]'
                    }`}>
                      {isBM ? 'Bahasa Melayu' : 'English (BI)'}
                    </span>
                    <span className="inline-flex items-center rounded-lg bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-bright shadow-sm">
                      {act.className}
                    </span>
                  </div>

                  <span className="absolute bottom-3 right-3 inline-flex items-center rounded-lg bg-gray-900/75 backdrop-blur-md px-2.5 py-1 text-[9px] font-semibold text-white shadow-sm">
                    Kump: {act.groupName}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    {/* Date / Day */}
                    <div className="flex items-center gap-1.5 text-[10px] text-faint font-semibold">
                      <Calendar className="h-3.5 w-3.5 text-faint" />
                      <span>{act.date} ({act.day})</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-bright text-sm md:text-base group-hover:text-lime-core transition truncate" title={act.activityName}>
                      {act.activityName}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {act.activityDesc}
                    </p>
                  </div>

                  {/* Student participation summary */}
                  <div className="rounded-xl bg-white/5 p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted uppercase">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Murid Terlibat
                      </span>
                      <span className="text-lime-core">{act.students.length} Orang</span>
                    </div>
                    {/* Names inline */}
                    <div className="text-[11px] text-soft font-medium truncate">
                      {act.students.map(s => s.name).join(', ')}
                    </div>
                    
                    {/* Progress Badge */}
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                      <Sparkles className="h-3 w-3" />
                      <span>{improvementCount} orang meningkat Tahap Penguasaan (TP)</span>
                    </div>
                  </div>

                  {/* Metadata teacher */}
                  <div className="flex items-center justify-between text-[10px] text-faint pt-1.5 border-t border-white/8">
                    <span>Guru BM/BI: <strong>{act.subjectTeacher}</strong></span>
                    <span>Bertugas: <strong>{act.teacherOnDuty}</strong></span>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="grid grid-cols-3 border-t border-white/8 bg-white/5 text-center">
                  <button
                    onClick={() => onViewReport(act)}
                    className="inline-flex items-center justify-center gap-1 py-3 text-xs font-semibold text-lime-core hover:bg-blue-50/50 hover:text-lime-glow transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Laporan
                  </button>
                  <button
                    onClick={() => onEditActivity(act)}
                    className="inline-flex items-center justify-center gap-1 py-3 text-xs font-semibold text-soft border-x border-white/8 hover:bg-gray-150/50 hover:text-bright transition"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Ubah
                  </button>
                  <button
                    onClick={() => confirmDelete(act.id, act.activityName)}
                    className="inline-flex items-center justify-center gap-1 py-3 text-xs font-semibold text-rose-400 hover:bg-rose-500/12 hover:text-rose-300 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-faint mb-4">
            <Search className="h-6 w-6 stroke-1.5" />
          </div>
          <h3 className="text-base font-bold text-bright">Tiada Rekod Dijumpai</h3>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Tiada rekod aktiviti sokongan PBD yang sepadan dengan carian atau tapisan anda. Cuba tukar kriteria carian atau tambah rekod baru.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            {(selectedSubject !== 'ALL' || selectedClass !== 'ALL' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('ALL');
                  setSelectedClass('ALL');
                }}
                className="px-4 py-2 text-xs font-bold text-soft bg-white/5 hover:bg-white/8 rounded-xl transition"
              >
                Set Semula Penapis
              </button>
            )}
            <button
              onClick={onAddNew}
              className="px-4 py-2 text-xs font-bold text-white bg-lime-core hover:bg-lime-glow rounded-xl transition"
            >
              Daftar Rekod Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
