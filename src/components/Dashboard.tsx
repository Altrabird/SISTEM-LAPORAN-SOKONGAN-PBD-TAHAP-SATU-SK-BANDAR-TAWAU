import { useState, useMemo } from 'react';
import { ActivityLog, Student } from '../types';
import { OFFICIAL_DUTY_GROUPS, TANGGUNGJAWAB_UMUM } from '../data';
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
  HelpCircle,
  Search,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  activities: ActivityLog[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ activities, onNavigate }: DashboardProps) {
  // State for Duty Schedule Interactive Panel
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(25); // Default to Week 25 (20 - 24 Julai, Pawana) as it falls close to July 19th 2026!
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'weeks' | 'groups'>('weeks');

  // Helper lists & selectors
  const allWeeks = useMemo(() => {
    const list: { weekNum: number; dates: string; groupName: string; holidays?: string[] }[] = [];
    OFFICIAL_DUTY_GROUPS.forEach(group => {
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
  }, []);

  const filteredWeeks = useMemo(() => {
    return allWeeks.filter(wk => {
      const matchesSearch = searchQuery === '' ||
        `minggu ${wk.weekNum}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wk.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wk.dates.toLowerCase().includes(searchQuery.toLowerCase()) ||
        OFFICIAL_DUTY_GROUPS.find(g => g.name === wk.groupName)?.members.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMonth = filterMonth === 'all' ||
        wk.dates.toLowerCase().includes(filterMonth.toLowerCase());

      return matchesSearch && matchesMonth;
    });
  }, [allWeeks, searchQuery, filterMonth]);

  const selectedWeekDetail = useMemo(() => {
    const wk = allWeeks.find(w => w.weekNum === selectedWeekNum);
    if (!wk) return null;
    const group = OFFICIAL_DUTY_GROUPS.find(g => g.name === wk.groupName);
    return {
      weekNum: wk.weekNum,
      dates: wk.dates,
      group,
      holidays: wk.holidays
    };
  }, [allWeeks, selectedWeekNum]);

  const groupStyleHelpers = {
    getBadge: (name: string) => {
      switch (name.toLowerCase()) {
        case 'ancala': return 'bg-blue-50 border-blue-200 text-blue-700';
        case 'buana': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
        case 'candra': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
        case 'kencana': return 'bg-orange-50 border-orange-200 text-orange-700';
        case 'mega': return 'bg-sky-50 border-sky-200 text-sky-700';
        case 'pawana': return 'bg-purple-50 border-purple-200 text-purple-700';
        default: return 'bg-gray-50 border-gray-200 text-gray-700';
      }
    },
    getCard: (name: string) => {
      switch (name.toLowerCase()) {
        case 'ancala': return 'border-l-blue-500 bg-blue-50/5 hover:bg-blue-50/10 text-blue-900';
        case 'buana': return 'border-l-emerald-500 bg-emerald-50/5 hover:bg-emerald-50/10 text-emerald-900';
        case 'candra': return 'border-l-yellow-500 bg-yellow-50/5 hover:bg-yellow-50/10 text-yellow-900';
        case 'kencana': return 'border-l-orange-500 bg-orange-50/5 hover:bg-orange-50/10 text-orange-900';
        case 'mega': return 'border-l-sky-500 bg-sky-50/5 hover:bg-sky-50/10 text-sky-900';
        case 'pawana': return 'border-l-purple-500 bg-purple-50/5 hover:bg-purple-50/10 text-purple-900';
        default: return 'border-l-gray-500 bg-gray-50/5 hover:bg-gray-50/10 text-gray-900';
      }
    },
    getTextColor: (name: string) => {
      switch (name.toLowerCase()) {
        case 'ancala': return 'text-blue-700';
        case 'buana': return 'text-emerald-700';
        case 'candra': return 'text-yellow-700';
        case 'kencana': return 'text-orange-700';
        case 'mega': return 'text-sky-700';
        case 'pawana': return 'text-purple-700';
        default: return 'text-gray-700';
      }
    },
    getDotColor: (name: string) => {
      switch (name.toLowerCase()) {
        case 'ancala': return 'bg-blue-500';
        case 'buana': return 'bg-emerald-500';
        case 'candra': return 'bg-yellow-500';
        case 'kencana': return 'bg-orange-500';
        case 'mega': return 'bg-sky-500';
        case 'pawana': return 'bg-purple-500';
        default: return 'bg-gray-500';
      }
    }
  };

  // 1. Core aggregates
  const stats = useMemo(() => {
    let totalStudentsCount = 0;
    let totalImprovedCount = 0;
    let bmCount = 0;
    let biCount = 0;

    const allStudents: Student[] = [];

    activities.forEach(act => {
      if (act.subject === 'BM') bmCount++;
      if (act.subject === 'BI') biCount++;

      act.students.forEach(stud => {
        totalStudentsCount++;
        if (stud.targetTp > stud.currentTp) {
          totalImprovedCount++;
        }
        allStudents.push(stud);
      });
    });

    const totalStudentsUnique = new Set(allStudents.map(s => s.name.toLowerCase().trim())).size;
    const improvementRate = totalStudentsCount > 0 
      ? Math.round((totalImprovedCount / totalStudentsCount) * 100) 
      : 0;

    return {
      totalActivities: activities.length,
      bmCount,
      biCount,
      totalStudentsEngaged: totalStudentsCount,
      uniqueStudentsCount: totalStudentsUnique,
      improvementRate,
      improvedStudents: totalImprovedCount
    };
  }, [activities]);

  // 2. Data for Subject Breakdown (BM vs BI)
  const subjectChartData = useMemo(() => {
    return [
      { name: 'Bahasa Melayu (BM)', value: stats.bmCount, color: '#3b82f6' }, // Blue
      { name: 'English (BI)', value: stats.biCount, color: '#ec4899' }       // Pink
    ].filter(item => item.value > 0);
  }, [stats]);

  // 3. Data for TP Shift (Before vs After)
  const tpShiftChartData = useMemo(() => {
    const beforeDistribution = [0, 0, 0, 0, 0, 0]; // Index 0-5 mapping to TP1-TP6
    const afterDistribution = [0, 0, 0, 0, 0, 0];

    activities.forEach(act => {
      act.students.forEach(stud => {
        if (stud.currentTp >= 1 && stud.currentTp <= 6) {
          beforeDistribution[stud.currentTp - 1]++;
        }
        if (stud.targetTp >= 1 && stud.targetTp <= 6) {
          afterDistribution[stud.targetTp - 1]++;
        }
      });
    });

    return Array.from({ length: 6 }, (_, i) => ({
      name: `TP ${i + 1}`,
      'Sebelum': beforeDistribution[i],
      'Selepas (Sasaran)': afterDistribution[i]
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
      'Jumlah Aktiviti': count
    })).sort((a, b) => b['Jumlah Aktiviti'] - a['Jumlah Aktiviti']);
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-indigo-950 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/30 px-3.5 py-1 text-xs font-medium text-blue-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              Sistem Pengurusan & Laporan Aktiviti Sokongan PBD
            </div>
            <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
              Aktiviti Sokongan PBD Tahap 1
            </h1>
            <p className="text-indigo-200 text-sm md:text-base font-normal">
              Digitalisasi rekod bimbingan BM & BI murid untuk peningkatan Tahap Penguasaan (TP) secara bersasar dan holistik.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => onNavigate('form')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-indigo-900 transition-all hover:bg-indigo-50 hover:scale-105 active:scale-95 shadow-md shadow-indigo-950/20"
            >
              Rekod Aktiviti Baru
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('integration')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600/40 border border-indigo-400/30 px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-indigo-600/60"
            >
              Integrasi Excel & GD
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Aktiviti Direkod</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.totalActivities}</h3>
            <div className="flex gap-2 text-[10px] text-gray-500 mt-1">
              <span className="text-blue-600 font-semibold">{stats.bmCount} BM</span>
              <span>•</span>
              <span className="text-pink-600 font-semibold">{stats.biCount} BI</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
          <div className="rounded-xl bg-pink-50 p-3 text-pink-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Murid Terlibat</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.totalStudentsEngaged}</h3>
            <p className="text-[10px] text-gray-500 mt-1 font-medium">
              ({stats.uniqueStudentsCount} individu unik)
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Peningkatan TP</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-950 mt-1">{stats.improvementRate}%</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-0.5">
              <Award className="h-3 w-3" />
              {stats.improvedStudents} murid naik TP
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pencapaian Aktif</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
              {activities.length > 0 ? activities[0].className : '-'}
            </h3>
            <p className="text-[10px] text-gray-500 mt-1 truncate">
              Kemas kini terakhir: {activities.length > 0 ? activities[0].date : 'Tiada rekod'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Shift in TP levels */}
        <div className="xl:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">Impak Pembelajaran: Peralihan Tahap Penguasaan (TP)</h3>
            <p className="text-xs text-gray-500 mt-1">
              Membandingkan bilangan murid mengikut Tahap Penguasaan sebelum (Semasa) dan selepas (Sasaran) program sokongan dijalankan.
            </p>
          </div>
          
          <div className="h-72 w-full mt-2">
            {stats.totalStudentsEngaged > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tpShiftChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelClassName="font-semibold text-gray-800"
                  />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Sebelum" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Selepas (Sasaran)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Users className="h-8 w-8 stroke-1" />
                <p className="text-sm">Tiada data murid untuk dipaparkan. Rekod aktiviti baharu.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Subject Breakdown */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Peratusan Aktiviti BM & BI</h3>
            <p className="text-xs text-gray-500 mt-1">Nisbah pembahagian subjek bagi aktiviti yang telah dijalankan.</p>
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
                  <Tooltip formatter={(value) => [`${value} Sesi`, 'Kekerapan']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <BookOpen className="h-8 w-8 stroke-1" />
                <p className="text-sm">Tiada data aktiviti.</p>
              </div>
            )}
            
            {/* Center label inside Donut */}
            {subjectChartData.length > 0 && (
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{stats.totalActivities}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Aktiviti</span>
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
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value} sesi ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secondary Dashboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Classes Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">Kekerapan Aktiviti Mengikut Kelas</h3>
            <p className="text-xs text-gray-500 mt-1">Menilai penglibatan kelas Tahap 1 dalam bimbingan khas.</p>
          </div>

          <div className="h-56 w-full">
            {classChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classChartData} layout="vertical" margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis type="category" dataKey="className" tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="Jumlah Aktiviti" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Clock className="h-8 w-8 stroke-1" />
                <p className="text-sm">Tiada kelas direkodkan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Leaders and duty contribution */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Guru Terlibat & Kumpulan Bertugas</h3>
            <p className="text-xs text-gray-500 mt-1">Sumbangan aktif pendidik bagi melestarikan kecemerlangan murid.</p>
          </div>

          <div className="space-y-4 mt-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Guru Subjek Aktif</h4>
              {activeTeachers.length > 0 ? (
                <div className="space-y-2">
                  {activeTeachers.map((teach, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                      <span className="font-semibold text-gray-700">Cikgu {teach.name}</span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                        {teach.count} Aktiviti
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Tiada data guru.</p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pecahan Aktiviti Kumpulan</h4>
              {activeGroups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeGroups.map((grp, idx) => (
                    <div key={idx} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                      <span className="font-semibold text-gray-700">{grp.name}</span>
                      <span className="text-gray-400">({grp.count})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Tiada kumpulan.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: JADUAL GURU BERTUGAS MINGGUAN SIDANG PETANG SESI 2026 */}
      <div id="jadual-guru-bertugas" className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-50 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
              <ClipboardList className="h-5.5 w-5.5 text-indigo-600" />
              Jadual Guru Bertugas Mingguan (Sidang Petang 2026)
            </h3>
            <p className="text-xs text-gray-500">
              Rujukan rasmi tugasan mingguan, kebersihan, disiplin, kehadiran kelas, RMT/Kantin, dan Guru Penyayang.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('weeks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                viewMode === 'weeks'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Susun Mengikut Minggu
            </button>
            <button
              onClick={() => setViewMode('groups')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                viewMode === 'groups'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari minggu, kumpulan, atau nama guru bertugas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition bg-gray-50/50"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full md:w-44 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-indigo-500 transition"
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
              
              {/* Sidebar - Week list */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  <span>Senarai Minggu ({filteredWeeks.length} ditemui)</span>
                  {searchQuery || filterMonth !== 'all' ? (
                    <button
                      onClick={() => { setSearchQuery(''); setFilterMonth('all'); }}
                      className="text-indigo-600 hover:underline capitalize font-semibold"
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
                              ? 'border-indigo-600 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-600/30'
                              : 'border-gray-100 bg-gray-50/20 hover:bg-gray-50 hover:border-gray-200'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-extrabold text-gray-900 block">
                              Minggu {wk.weekNum}
                            </span>
                            <span className="text-[11px] text-gray-500 block">
                              {wk.dates}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
                              {wk.groupName}
                            </span>
                            <ArrowRight className={`h-3.5 w-3.5 transition ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-gray-300'}`} />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                      <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-gray-600">Tiada rekod minggu ditemui</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Cuba tumpukan carian anda atau tukar bulan penapis.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detail side */}
              <div className="lg:col-span-7">
                {selectedWeekDetail ? (
                  <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
                      <div>
                        <span className="inline-block text-[10px] font-extrabold bg-indigo-50 text-indigo-700 rounded px-2 py-0.5 uppercase mb-1">
                          Sesi Persekolahan 2026
                        </span>
                        <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                          Minggu Bertugas {selectedWeekDetail.weekNum}
                        </h4>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">
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
                      <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-3.5 flex items-start gap-2.5">
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
                      <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-indigo-600" />
                        Ahli Kumpulan & Tugasan Khusus
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedWeekDetail.group!.members.map((member, mIdx) => (
                          <div key={mIdx} className="rounded-xl border border-gray-50 bg-gray-50/30 p-3 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                {member.role}
                              </span>
                              <span className="text-xs font-bold text-gray-800 block">
                                Cikgu {member.name}
                              </span>
                            </div>
                            <span className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Peranan Ketua Kumpulan */}
                    {selectedWeekDetail.group!.perananKetua && (
                      <div className="space-y-2 border-t border-gray-50 pt-4">
                        <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          Peranan Ketua Kumpulan (Ketua Bertugas)
                        </h5>
                        <ul className="list-decimal pl-4 text-[11px] text-gray-600 space-y-1.5 leading-relaxed">
                          {selectedWeekDetail.group!.perananKetua.map((peranan, pIdx) => (
                            <li key={pIdx}>{peranan}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tanggungjawab Umum Ahli */}
                    <div className="space-y-2 border-t border-gray-50 pt-4 bg-gray-50/30 rounded-xl p-3">
                      <h5 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-emerald-600" />
                        Tanggungjawab Umum Ahli Kumpulan
                      </h5>
                      <ul className="list-disc pl-4 text-[10.5px] text-gray-500 space-y-1 leading-relaxed">
                        {TANGGUNGJAWAB_UMUM.map((tanggung, tIdx) => (
                          <li key={tIdx}>{tanggung}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 bg-gray-50/30 flex flex-col items-center justify-center">
                    <Calendar className="h-8 w-8 text-gray-300 mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-gray-600">Sila pilih minggu di sebelah kiri</p>
                    <p className="text-[10px] text-gray-400 mt-1">Pilih minggu bertugas untuk melihat senarai ahli, peranan ketua, dan cuti am.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* View mode: groups */
          <div className="space-y-6">
            <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
              Berikut adalah rumusan giliran fasa, ahli kumpulan, serta cuti peristiwa yang diperuntukkan bagi setiap daripada 6 kumpulan Guru Bertugas bagi Sesi 2026.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {OFFICIAL_DUTY_GROUPS.map((group, gIdx) => {
                const badgeColor = groupStyleHelpers.getBadge(group.name);
                const cardColor = groupStyleHelpers.getCard(group.name);
                return (
                  <div key={gIdx} className={`rounded-2xl border border-l-4 p-5 space-y-4 transition hover:shadow-md ${cardColor}`}>
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100/50 pb-2">
                      <h4 className="text-sm font-black uppercase text-gray-900">
                        Kumpulan {group.name}
                      </h4>
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {group.members.length} Ahli
                      </span>
                    </div>

                    {/* Member list */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ahli & Peranan:</span>
                      <div className="space-y-1.5">
                        {group.members.map((m, mIdx) => (
                          <div key={mIdx} className="text-xs flex items-center justify-between text-gray-700">
                            <span className="font-bold">Cikgu {m.name}</span>
                            <span className="text-[10px] bg-white/70 border border-gray-100 text-gray-500 rounded px-1.5 py-0.5">{m.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Weeks */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Minggu Bertugas Sesi 2026:</span>
                      <div className="flex flex-wrap gap-1">
                        {group.weeks.map((wk, wIdx) => (
                          <button
                            key={wIdx}
                            onClick={() => {
                              setSelectedWeekNum(wk.number);
                              setViewMode('weeks');
                            }}
                            title={wk.dates}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-gray-100 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition"
                          >
                            M{wk.number}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Holidays summary */}
                    {group.holidays && group.holidays.length > 0 && (
                      <div className="text-[10px] text-rose-700 space-y-0.5 bg-rose-50/40 p-2 rounded-lg border border-rose-100/30">
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

