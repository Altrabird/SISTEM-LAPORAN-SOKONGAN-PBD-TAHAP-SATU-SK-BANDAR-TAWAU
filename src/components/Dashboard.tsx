import { useState, useMemo } from 'react';
import { ActivityLog, Student, DutyGroup, isAssessed, tpGain } from '../types';
import { OFFICIAL_DUTY_GROUPS, TANGGUNGJAWAB_UMUM } from '../data';
import {
  WARNA_SUBJEK,
  WARNA_TP,
  warnaSiri,
  GRID_STROKE,
  TICK,
  TOOLTIP_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_CURSOR,
  LEGEND_STYLE
} from '../lib/chartTheme';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BookOpen,
  Award,
  Users,
  TrendingUp,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  Calendar,
  ClipboardList,
  GraduationCap,
  Info,
  Search,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  activities: ActivityLog[];
  onNavigate: (tab: string) => void;
  dutyGroups?: DutyGroup[];
  tanggungjawabUmum?: string[];
}

export default function Dashboard({
  activities,
  onNavigate,
  dutyGroups = OFFICIAL_DUTY_GROUPS,
  tanggungjawabUmum = TANGGUNGJAWAB_UMUM
}: DashboardProps) {
  // State for Duty Schedule Interactive Panel
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(25); // Default to Week 25 (20 - 24 Julai, Pawana) as it falls close to July 19th 2026!
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'weeks' | 'groups'>('weeks');

  // Helper lists & selectors
  const allWeeks = useMemo(() => {
    const list: { weekNum: number; dates: string; groupName: string; holidays?: string[] }[] = [];
    dutyGroups.forEach(group => {
      group.weeks.forEach(wk => {
        list.push({
          weekNum: wk.number,
          dates: wk.dates,
          groupName: group.name,
          holidays: wk.holidays
        });
      });
    });
    return list.sort((a, b) => a.weekNum - b.weekNum);
  }, [dutyGroups]);

  const filteredWeeks = useMemo(() => {
    return allWeeks.filter(wk => {
      const matchesSearch = searchQuery === '' ||
        `minggu ${wk.weekNum}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wk.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wk.dates.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dutyGroups.find(g => g.name === wk.groupName)?.members.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMonth = filterMonth === 'all' ||
        wk.dates.toLowerCase().includes(filterMonth.toLowerCase());

      return matchesSearch && matchesMonth;
    });
  }, [allWeeks, searchQuery, filterMonth, dutyGroups]);

  const selectedWeekDetail = useMemo(() => {
    const wk = allWeeks.find(w => w.weekNum === selectedWeekNum);
    if (!wk) return null;
    const group = dutyGroups.find(g => g.name === wk.groupName);
    return {
      weekNum: wk.weekNum,
      dates: wk.dates,
      group,
      holidays: wk.holidays
    };
  }, [allWeeks, selectedWeekNum, dutyGroups]);

  const groupStyleHelpers = {
    getBadge: (name: string) => {
      switch (name.toLowerCase()) {
        case 'ancala': return 'bg-lime-core/12 border-lime-core/30 text-lime-glow';
        case 'buana': return 'bg-emerald-400/12 border-emerald-400/30 text-emerald-300';
        case 'candra': return 'bg-yellow-400/12 border-yellow-400/30 text-yellow-300';
        case 'kencana': return 'bg-orange-400/12 border-orange-400/30 text-orange-300';
        case 'mega': return 'bg-sky-400/12 border-sky-400/30 text-sky-300';
        case 'pawana': return 'bg-purple-400/12 border-purple-400/30 text-purple-300';
        default: return 'bg-white/5 border-white/10 text-soft';
      }
    },
    getCard: (name: string) => {
      switch (name.toLowerCase()) {
        case 'ancala': return 'border-l-lime-core hover:bg-lime-core/8 text-lime-glow';
        case 'buana': return 'border-l-emerald-400 hover:bg-emerald-400/8 text-emerald-200';
        case 'candra': return 'border-l-yellow-400 hover:bg-yellow-400/8 text-yellow-200';
        case 'kencana': return 'border-l-orange-400 hover:bg-orange-400/8 text-orange-200';
        case 'mega': return 'border-l-sky-400 hover:bg-sky-400/8 text-sky-200';
        case 'pawana': return 'border-l-purple-400 hover:bg-purple-400/8 text-purple-200';
        default: return 'border-l-white/30 hover:bg-white/8 text-bright';
      }
    },
    getTextColor: (name: string) => {
      switch (name.toLowerCase()) {
        case 'ancala': return 'text-lime-glow';
        case 'buana': return 'text-emerald-300';
        case 'candra': return 'text-yellow-300';
        case 'kencana': return 'text-orange-300';
        case 'mega': return 'text-sky-300';
        case 'pawana': return 'text-purple-300';
        default: return 'text-soft';
      }
    },
    getDotColor: (name: string) => {
      switch (name.toLowerCase()) {
        case 'ancala': return 'bg-lime-core';
        case 'buana': return 'bg-emerald-500';
        case 'candra': return 'bg-yellow-500';
        case 'kencana': return 'bg-orange-500';
        case 'mega': return 'bg-sky-500';
        case 'pawana': return 'bg-purple-500';
        default: return 'bg-white/30';
      }
    }
  };

  // 1. Core aggregates
  const stats = useMemo(() => {
    let totalStudentsCount = 0;
    let totalImprovedCount = 0;
    let assessedCount = 0;
    let bmCount = 0;
    let biCount = 0;

    const allStudents: Student[] = [];

    activities.forEach(act => {
      if (act.subject === 'BM') bmCount++;
      if (act.subject === 'BI') biCount++;

      act.students.forEach(stud => {
        totalStudentsCount++;
        // Peningkatan dikira daripada TP Selepas yang benar-benar dinilai,
        // bukan daripada TP Sasaran (sasaran hanyalah hasrat, bukan bukti).
        if (isAssessed(stud) && (tpGain(stud) ?? 0) > 0) {
          totalImprovedCount++;
        }
        if (isAssessed(stud)) assessedCount++;
        allStudents.push(stud);
      });
    });

    const totalStudentsUnique = new Set(allStudents.map(s => s.name.toLowerCase().trim())).size;
    // Kadar peningkatan berasaskan murid yang SUDAH dinilai sahaja — jika tidak,
    // rekod yang belum dinilai akan menenggelamkan peratusan secara palsu.
    const improvementRate = assessedCount > 0
      ? Math.round((totalImprovedCount / assessedCount) * 100)
      : 0;

    return {
      totalActivities: activities.length,
      bmCount,
      biCount,
      totalStudentsEngaged: totalStudentsCount,
      uniqueStudentsCount: totalStudentsUnique,
      improvementRate,
      improvedStudents: totalImprovedCount,
      assessedCount,
      pendingAssessment: totalStudentsCount - assessedCount
    };
  }, [activities]);

  // 2. Data for Subject Breakdown (BM vs BI)
  const subjectChartData = useMemo(() => {
    return [
      { name: 'Bahasa Melayu (BM)', value: stats.bmCount, color: WARNA_SUBJEK.BM },
      { name: 'English (BI)', value: stats.biCount, color: WARNA_SUBJEK.BI }
    ].filter(item => item.value > 0);
  }, [stats]);

  /**
   * 3. Anjakan TP — Sebelum berbanding Selepas.
   *
   * Hanya murid yang sudah dinilai (tpAfter diisi) dimasukkan ke dalam carta ini.
   * Sebelum ini carta membandingkan TP Sebelum dengan TP *Sasaran*, jadi ia
   * sentiasa menunjukkan "peningkatan" walaupun tiada penilaian dibuat —
   * memberikan gambaran impak yang tidak benar dalam laporan rasmi.
   */
  const tpShiftChartData = useMemo(() => {
    const beforeDistribution = [0, 0, 0, 0, 0, 0]; // Index 0-5 mapping to TP1-TP6
    const afterDistribution = [0, 0, 0, 0, 0, 0];

    activities.forEach(act => {
      act.students.forEach(stud => {
        if (!isAssessed(stud)) return;
        if (stud.currentTp >= 1 && stud.currentTp <= 6) {
          beforeDistribution[stud.currentTp - 1]++;
        }
        const selepas = stud.tpAfter as number;
        if (selepas >= 1 && selepas <= 6) {
          afterDistribution[selepas - 1]++;
        }
      });
    });

    return Array.from({ length: 6 }, (_, i) => ({
      name: `TP ${i + 1}`,
      'Sebelum': beforeDistribution[i],
      'Selepas (Dicapai)': afterDistribution[i]
    }));
  }, [activities]);

  // 4. Data for Class Distribution
  const classChartData = useMemo(() => {
    const classMap: { [key: string]: number } = {};
    activities.forEach(act => {
      classMap[act.className] = (classMap[act.className] || 0) + 1;
    });

    return Object.entries(classMap).map(([name, count]) => ({
      className: name,
      'Jumlah Aktiviti': count })).sort((a, b) => b['Jumlah Aktiviti'] - a['Jumlah Aktiviti']);
  }, [activities]);

  // 5. Leaderboard / Active teacher & group contribution
  const activeTeachers = useMemo(() => {
    const teacherMap: { [key: string]: { count: number; sub: string } } = {};
    activities.forEach(act => {
      const teacher = act.subjectTeacher || 'Samsiah Sundu';
      if (!teacherMap[teacher]) {
        teacherMap[teacher] = { count: 0, sub: act.subject };
      }
      teacherMap[teacher].count++;
    });

    return Object.entries(teacherMap)
      .map(([name, val]) => ({ name, count: val.count, subject: val.sub }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [activities]);

  const activeGroups = useMemo(() => {
    const groupMap: { [key: string]: number } = {};
    activities.forEach(act => {
      const grp = act.groupName || 'Ancala';
      groupMap[grp] = (groupMap[grp] || 0) + 1;
    });

    return Object.entries(groupMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [activities]);

  return (
    <div className="space-y-8">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-dark/50 via-abyss to-void p-6 md:p-8 shadow-xl">
        {/* Cahaya latar — memberi kedalaman tanpa mengaburkan teks */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-lime-core/18 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -mb-20 h-72 w-72 rounded-full bg-lime-deep/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-core/15 px-3.5 py-1 text-xs font-semibold text-lime-glow backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-lime-core" />
              Sistem Pengurusan &amp; Laporan Aktiviti Sokongan PBD
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight text-bright">
              Aktiviti Sokongan PBD Tahap 1
            </h1>
            <p className="text-sm md:text-base font-normal text-soft">
              Digitalisasi rekod bimbingan BM &amp; BI murid untuk peningkatan Tahap
              Penguasaan (TP) secara bersasar dan holistik.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            {/*
              Butang "Integrasi Excel & GD" dibuang di sini — tab itu sudah
              digugurkan, jadi ia menghala ke paparan yang tidak wujud lagi.
            */}
            <button onClick={() => onNavigate('form')} className="btn-primary !px-5 !py-3 !text-sm">
              Rekod Aktiviti Baru
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1 */}
        <div className="glass glass-hover p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <div className="rounded-xl bg-lime-core/12 p-2.5 md:p-3 text-lime-core shrink-0">
            <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-medium text-faint uppercase tracking-wider truncate">Aktiviti Direkod</p>
            <h3 className="text-lg md:text-2xl font-bold text-bright mt-0.5 md:mt-1">{stats.totalActivities}</h3>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted mt-0.5 md:mt-1">
              <span className="text-lime-core font-semibold">{stats.bmCount} BM</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-pink-600 font-semibold">{stats.biCount} BI</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass glass-hover p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <div className="rounded-xl bg-fuchsia-400/12 p-2.5 md:p-3 text-pink-600 shrink-0">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-medium text-faint uppercase tracking-wider truncate">Murid Terlibat</p>
            <h3 className="text-lg md:text-2xl font-bold text-bright mt-0.5 md:mt-1">{stats.totalStudentsEngaged}</h3>
            <p className="text-[10px] text-muted mt-0.5 md:mt-1 font-medium truncate">
              ({stats.uniqueStudentsCount} individu)
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass glass-hover p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <div className="rounded-xl bg-emerald-400/12 p-2.5 md:p-3 text-emerald-400 shrink-0">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-medium text-faint uppercase tracking-wider truncate">Peningkatan TP Disahkan</p>
            <h3 className="text-lg md:text-2xl font-bold text-bright mt-0.5 md:mt-1">
              {stats.assessedCount > 0 ? `${stats.improvementRate}%` : '—'}
            </h3>
            {stats.assessedCount > 0 ? (
              <p className="text-[10px] text-emerald-400 mt-0.5 md:mt-1 font-semibold flex items-center gap-0.5 truncate">
                <Award className="h-3 w-3 shrink-0" />
                {stats.improvedStudents} daripada {stats.assessedCount} dinilai
              </p>
            ) : (
              <p className="text-[10px] text-amber-400 mt-0.5 md:mt-1 font-semibold flex items-center gap-0.5 truncate">
                <AlertCircle className="h-3 w-3 shrink-0" />
                Belum ada TP Selepas diisi
              </p>
            )}
            {stats.pendingAssessment > 0 && stats.assessedCount > 0 && (
              <p className="text-[9px] text-faint mt-0.5 truncate">
                {stats.pendingAssessment} murid menunggu penilaian
              </p>
            )}
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass glass-hover p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <div className="rounded-xl bg-amber-400/12 p-2.5 md:p-3 text-amber-400 shrink-0">
            <Flame className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-[10px] md:text-xs font-medium text-faint uppercase tracking-wider truncate">Pencapaian Aktif</p>
            <h3 className="text-lg md:text-2xl font-bold text-bright mt-0.5 md:mt-1 truncate">
              {activities.length > 0 ? activities[0].className : '-'}
            </h3>
            <p className="text-[10px] text-muted mt-0.5 md:mt-1 truncate">
              {activities.length > 0 ? activities[0].date : 'Tiada rekod'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Shift in TP levels */}
        <div className="xl:col-span-2 glass p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-bright">Impak Pembelajaran: Peralihan Tahap Penguasaan (TP)</h3>
            <p className="text-xs text-muted mt-1">
              Membandingkan bilangan murid mengikut TP sebelum dan TP selepas yang
              benar-benar dicapai. Murid yang belum dinilai tidak dikira.
            </p>
          </div>

          <div className="h-72 w-full mt-2">
            {/*
              Syarat berasaskan assessedCount, bukan totalStudentsEngaged.
              Carta ini hanya memplot murid yang mempunyai TP Selepas; menggunakan
              jumlah murid keseluruhan menyebabkan paksi kosong dilukis apabila
              rekod wujud tetapi belum dinilai — kelihatan seperti carta rosak.
            */}
            {stats.assessedCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tpShiftChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                  <XAxis dataKey="name" tick={TICK} tickLine={false} axisLine={false} />
                  <YAxis tick={TICK} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    cursor={TOOLTIP_CURSOR}
                    labelClassName="font-semibold text-bright"
                  />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={LEGEND_STYLE} />
                  <Bar dataKey="Sebelum" fill={WARNA_TP.sebelum} radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Selepas (Dicapai)" fill={WARNA_TP.selepas} radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <Users className="h-8 w-8 stroke-1 text-faint" />
                {stats.totalStudentsEngaged === 0 ? (
                  <p className="max-w-xs text-sm text-muted">
                    Belum ada rekod aktiviti. Carta ini akan terisi setelah sesi
                    pertama direkodkan.
                  </p>
                ) : (
                  <p className="max-w-xs text-sm text-muted">
                    {stats.totalStudentsEngaged} murid direkodkan, tetapi{' '}
                    <span className="text-amber-300">TP Selepas belum diisi</span>.
                    Sunting rekod dan isi TP Selepas untuk melihat impak sebenar.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Subject Breakdown */}
        <div className="glass p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-bright">Peratusan Aktiviti BM & BI</h3>
            <p className="text-xs text-muted mt-1">Nisbah pembahagian subjek bagi aktiviti yang telah dijalankan.</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative mt-4">
            {subjectChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {subjectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    formatter={(value) => [`${value} Sesi`, 'Kekerapan']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-faint gap-2">
                <BookOpen className="h-8 w-8 stroke-1" />
                <p className="text-sm">Tiada data aktiviti.</p>
              </div>
            )}
            
            {/* Center label inside Donut */}
            {subjectChartData.length > 0 && (
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-bright">{stats.totalActivities}</span>
                <span className="text-[10px] text-faint uppercase tracking-wider">Aktiviti</span>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4">
            {subjectChartData.map((item, index) => {
              const pct = stats.totalActivities > 0 
                ? Math.round((item.value / stats.totalActivities) * 100) 
                : 0;
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-soft font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-bright">{item.value} sesi ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secondary Dashboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Classes Bar Chart */}
        <div className="lg:col-span-2 glass p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-bright">Kekerapan Aktiviti Mengikut Kelas</h3>
            <p className="text-xs text-muted mt-1">Menilai penglibatan kelas Tahap 1 dalam bimbingan khas.</p>
          </div>

          <div className="h-56 w-full">
            {classChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classChartData} layout="vertical" margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_STROKE} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={TICK} />
                  <YAxis type="category" dataKey="className" tickLine={false} axisLine={false} tick={TICK} />
                  <Tooltip 
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    cursor={TOOLTIP_CURSOR}
                  />
                  <Bar dataKey="Jumlah Aktiviti" radius={[0, 4, 4, 0]} barSize={15}>
                    {classChartData.map((_, i) => (
                      <Cell key={i} fill={warnaSiri(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-faint gap-2">
                <Clock className="h-8 w-8 stroke-1" />
                <p className="text-sm">Tiada kelas direkodkan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Leaders and duty contribution */}
        <div className="glass p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-bright">Guru Terlibat & Kumpulan Bertugas</h3>
            <p className="text-xs text-muted mt-1">Sumbangan aktif pendidik bagi melestarikan kecemerlangan murid.</p>
          </div>

          <div className="space-y-4 mt-4">
            <div>
              <h4 className="text-xs font-semibold text-faint uppercase tracking-wider mb-2">Guru Subjek Aktif</h4>
              {activeTeachers.length > 0 ? (
                <div className="space-y-2">
                  {activeTeachers.map((teach, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/8 last:border-0">
                      <span className="font-semibold text-soft">Cikgu {teach.name}</span>
                      <span className="rounded-full bg-lime-core/12 px-2 py-0.5 text-[10px] font-bold text-lime-core">
                        {teach.count} Aktiviti
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-faint">Tiada data guru.</p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-faint uppercase tracking-wider mb-2">Pecahan Aktiviti Kumpulan</h4>
              {activeGroups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeGroups.map((grp, idx) => (
                    <div key={idx} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime-core"></span>
                      <span className="font-semibold text-soft">{grp.name}</span>
                      <span className="text-faint">({grp.count})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-faint">Tiada kumpulan.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: JADUAL GURU BERTUGAS MINGGUAN SIDANG PETANG SESI 2026 */}
      <div id="jadual-guru-bertugas" className="rounded-3xl bg-white/5 p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-white/8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-bright inline-flex items-center gap-2">
              <ClipboardList className="h-5.5 w-5.5 text-lime-core" />
              Jadual Guru Bertugas Mingguan (Sidang Petang 2026)
            </h3>
            <p className="text-xs text-muted">
              Rujukan rasmi tugasan mingguan, kebersihan, disiplin, kehadiran kelas, RMT/Kantin, dan Guru Penyayang.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('weeks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                viewMode === 'weeks'
                  ? 'bg-lime-core text-[#0a0f08] border-lime-core shadow-sm'
                  : 'bg-white/5 text-soft border-white/10 hover:bg-white/5'
              }`}
            >
              Susun Mengikut Minggu
            </button>
            <button
              onClick={() => setViewMode('groups')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                viewMode === 'groups'
                  ? 'bg-lime-core text-[#0a0f08] border-lime-core shadow-sm'
                  : 'bg-white/5 text-soft border-white/10 hover:bg-white/5'
              }`}
            >
              Info Mengikut Kumpulan
            </button>
          </div>
        </div>

        {viewMode === 'weeks' ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-faint" />
                <input
                  type="text"
                  placeholder="Cari minggu, kumpulan, atau nama guru bertugas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-lime-core transition bg-white/5"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="h-4 w-4 text-faint shrink-0" />
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full md:w-44 px-3 py-2 text-xs rounded-xl bg-white/5 focus:outline-none focus:border-lime-core transition"
                >
                  <option value="all">Semua Bulan</option>
                  <option value="JANUARI">Januari</option>
                  <option value="FEBRUARI">Februari</option>
                  <option value="MAC">Mac</option>
                  <option value="APRIL">April</option>
                  <option value="MEI">Mei</option>
                  <option value="JUN">Jun</option>
                  <option value="JULAI">Julai</option>
                  <option value="OGOS">Ogos</option>
                  <option value="SEPTEMBER">September</option>
                  <option value="OKTOBER">Oktober</option>
                  <option value="NOVEMBER">November</option>
                  <option value="DIS">Disember</option>
                </select>
              </div>
            </div>

            {/* Split layout: Weeks List sidebar & Selected Week Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Mobile/Tablet dropdown selector (hidden on large screens) */}
              <div className="lg:hidden w-full bg-indigo-50/25 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="mobile-week-selector" className="text-[11px] font-bold text-lime-glow uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-lime-core shrink-0" />
                    Pilih Minggu Bertugas ({filteredWeeks.length} minggu):
                  </label>
                  {(searchQuery || filterMonth !== 'all') && (
                    <button
                      onClick={() => { setSearchQuery(''); setFilterMonth('all'); }}
                      className="text-[10px] text-lime-core hover:underline capitalize font-bold"
                    >
                      Reset carian
                    </button>
                  )}
                </div>
                <select
                  id="mobile-week-selector"
                  value={selectedWeekNum}
                  onChange={(e) => setSelectedWeekNum(Number(e.target.value))}
                  className="w-full bg-white/5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-bright focus:outline-none focus:border-lime-core shadow-sm"
                >
                  {filteredWeeks.length > 0 ? (
                    filteredWeeks.map((wk) => (
                      <option key={wk.weekNum} value={wk.weekNum}>
                        Minggu {wk.weekNum} ({wk.dates}) - Kumpulan {wk.groupName}
                      </option>
                    ))
                  ) : (
                    <option value="">Tiada minggu bertugas ditemui</option>
                  )}
                </select>
              </div>

              {/* Sidebar - Week list (desktop only) */}
              <div className="hidden lg:block lg:col-span-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-faint uppercase tracking-wider px-1">
                  <span>Senarai Minggu ({filteredWeeks.length} ditemui)</span>
                  {searchQuery || filterMonth !== 'all' ? (
                    <button
                      onClick={() => { setSearchQuery(''); setFilterMonth('all'); }}
                      className="text-lime-core hover:underline capitalize font-semibold"
                    >
                      Reset carian
                    </button>
                  ) : null}
                </div>

                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
                  {filteredWeeks.length > 0 ? (
                    filteredWeeks.map((wk) => {
                      const isSelected = selectedWeekNum === wk.weekNum;
                      const badgeColor = groupStyleHelpers.getBadge(wk.groupName);
                      const dotColor = groupStyleHelpers.getDotColor(wk.groupName);
                      return (
                        <button
                          key={wk.weekNum}
                          onClick={() => setSelectedWeekNum(wk.weekNum)}
                          className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                            isSelected
                              ? 'border-lime-core bg-indigo-50/20 shadow-sm ring-1 ring-indigo-600/30'
                              : 'border-white/8 bg-white/5 hover:bg-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-extrabold text-bright block">
                              Minggu {wk.weekNum}
                            </span>
                            <span className="text-[11px] text-muted block">
                              {wk.dates}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
                              {wk.groupName}
                            </span>
                            <ArrowRight className={`h-3.5 w-3.5 transition ${isSelected ? 'text-lime-core translate-x-0.5' : 'text-faint'}`} />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 rounded-xl border border-dashed border-white/10 bg-white/5">
                      <AlertCircle className="h-6 w-6 text-faint mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-soft">Tiada rekod minggu ditemui</p>
                      <p className="text-[10px] text-faint mt-0.5">Cuba tumpukan carian anda atau tukar bulan penapis.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detail side */}
              <div className="lg:col-span-7">
                {selectedWeekDetail ? (
                  <div className="glass p-5 md:p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-4">
                      <div>
                        <span className="inline-block text-[10px] font-extrabold bg-lime-core/12 text-lime-glow rounded px-2 py-0.5 uppercase mb-1">
                          Sesi Persekolahan 2026
                        </span>
                        <h4 className="text-base font-black text-bright flex items-center gap-2">
                          Minggu Bertugas {selectedWeekDetail.weekNum}
                        </h4>
                        <p className="text-xs text-muted font-semibold mt-0.5">
                          Tempoh: {selectedWeekDetail.dates}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border font-black text-xs uppercase ${groupStyleHelpers.getBadge(selectedWeekDetail.group!.name)}`}>
                          <span className={`h-2 w-2 rounded-full ${groupStyleHelpers.getDotColor(selectedWeekDetail.group!.name)}`}></span>
                          Kumpulan {selectedWeekDetail.group!.name}
                        </span>
                      </div>
                    </div>

                    {/* Holidays/Special events */}
                    {selectedWeekDetail.holidays && selectedWeekDetail.holidays.length > 0 && (
                      <div className="rounded-xl bg-rose-50/30 p-3.5 flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">Makluman Cuti / Peristiwa Khas Minggu Ini:</p>
                          <ul className="list-disc pl-4 mt-1 text-[11px] text-rose-700 space-y-0.5">
                            {selectedWeekDetail.holidays.map((hol, hIdx) => (
                              <li key={hIdx}>{hol}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Duty Members */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-bright uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-lime-core" />
                        Ahli Kumpulan & Tugasan Khusus
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedWeekDetail.group!.members.map((member, mIdx) => (
                          <div key={mIdx} className="rounded-xl bg-white/5 p-3 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-faint uppercase tracking-wider block">
                                {member.role}
                              </span>
                              <span className="text-xs font-bold text-bright block">
                                Cikgu {member.name}
                              </span>
                            </div>
                            <span className="h-7 w-7 rounded-full glass-inset bg-lime-core/10 text-lime-glow flex items-center justify-center text-xs font-bold">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Peranan Ketua Kumpulan */}
                    {selectedWeekDetail.group!.perananKetua && (
                      <div className="space-y-2 border-t border-white/8 pt-4">
                        <h5 className="text-xs font-bold text-bright uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-lime-core" />
                          Peranan Ketua Kumpulan (Ketua Bertugas)
                        </h5>
                        <ul className="list-decimal pl-4 text-[11px] text-soft space-y-1.5 leading-relaxed">
                          {selectedWeekDetail.group!.perananKetua.map((peranan, pIdx) => (
                            <li key={pIdx}>{peranan}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tanggungjawab Umum Ahli */}
                    <div className="space-y-2 border-t border-white/8 pt-4 bg-white/5 rounded-xl p-3">
                      <h5 className="text-[11px] font-bold text-bright uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-emerald-400" />
                        Tanggungjawab Umum Ahli Kumpulan
                      </h5>
                      <ul className="list-disc pl-4 text-[10.5px] text-muted space-y-1 leading-relaxed">
                        {tanggungjawabUmum.map((tanggung, tIdx) => (
                          <li key={tIdx}>{tanggung}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center">
                    <Calendar className="h-8 w-8 text-faint mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-soft">Sila pilih minggu di sebelah kiri</p>
                    <p className="text-[10px] text-faint mt-1">Pilih minggu bertugas untuk melihat senarai ahli, peranan ketua, dan cuti am.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* View mode: groups */
          <div className="space-y-6">
            <p className="text-xs text-muted leading-relaxed max-w-3xl">
              Berikut adalah rumusan giliran fasa, ahli kumpulan, serta cuti peristiwa yang diperuntukkan bagi setiap daripada 6 kumpulan Guru Bertugas bagi Sesi 2026.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dutyGroups.map((group, gIdx) => {
                const badgeColor = groupStyleHelpers.getBadge(group.name);
                const cardColor = groupStyleHelpers.getCard(group.name);
                return (
                  <div key={gIdx} className={`rounded-2xl border border-l-4 p-5 space-y-4 transition hover:shadow-md ${cardColor}`}>
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100/50 pb-2">
                      <h4 className="text-sm font-black uppercase text-bright">
                        Kumpulan {group.name}
                      </h4>
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {group.members.length} Ahli
                      </span>
                    </div>

                    {/* Member list */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-faint uppercase tracking-wider block">Ahli & Peranan:</span>
                      <div className="space-y-1.5">
                        {group.members.map((m, mIdx) => (
                          <div key={mIdx} className="text-xs flex items-center justify-between text-soft">
                            <span className="font-bold">Cikgu {m.name}</span>
                            <span className="text-[10px] bg-white/70 text-muted rounded px-1.5 py-0.5">{m.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Weeks */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-faint uppercase tracking-wider block">Minggu Bertugas Sesi 2026:</span>
                      <div className="flex flex-wrap gap-1">
                        {group.weeks.map((wk, wIdx) => (
                          <button
                            key={wIdx}
                            onClick={() => {
                              setSelectedWeekNum(wk.number);
                              setViewMode('weeks');
                            }}
                            title={wk.dates}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-soft hover:border-lime-core hover:text-lime-core transition"
                          >
                            M{wk.number}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Holidays summary */}
                    {group.holidays && group.holidays.length > 0 && (
                      <div className="text-[10px] text-rose-700 space-y-0.5 bg-rose-50/40 p-2 rounded-lg">
                        <span className="font-bold uppercase block text-[9px] text-rose-800">Cuti / Peristiwa Khas:</span>
                        <ul className="list-disc pl-3">
                          {group.holidays.map((h, hIdx) => (
                            <li key={hIdx}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

