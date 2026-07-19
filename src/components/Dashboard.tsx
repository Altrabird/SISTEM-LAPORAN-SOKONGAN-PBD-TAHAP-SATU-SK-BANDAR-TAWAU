import { useMemo } from 'react';
import { ActivityLog, Student } from '../types';
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
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  activities: ActivityLog[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ activities, onNavigate }: DashboardProps) {
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
    </div>
  );
}
