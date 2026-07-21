import React, { useState } from 'react';
import { AppSettings, DutyGroup, DutyMember, DutyWeek, Officer, ActivityLog } from '../types';
import { DEFAULT_PELAPOR, DEFAULT_PENYEMAK } from '../data';
import OfficerList from './OfficerList';
import CloudSettings from './CloudSettings';
import {
  Settings,
  School,
  Users,
  BookOpen,
  Briefcase,
  Calendar,
  Trash2,
  Plus,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Clock,
  UserCheck,
  Cloud
} from 'lucide-react';

interface AdminSettingsProps {
  settings: AppSettings;
  activities: ActivityLog[];
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetAllData: () => void;
  onResetSettingsOnly: () => void;
}

export default function AdminSettings({
  settings,
  activities,
  onUpdateSettings,
  onResetAllData,
  onResetSettingsOnly
}: AdminSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'officers' | 'classes' | 'activities' | 'responsibilities' | 'groups' | 'cloud' | 'system'>('general');
  
  // Local state copy for form editing to prevent immediate parent state writes on keypress
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Specific helper states
  const [newClass, setNewClass] = useState('');
  const [newBmActivity, setNewBmActivity] = useState('');
  const [newBiActivity, setNewBiActivity] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  
  // Duty Group editing helper states
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number>(0);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Ketua/Perhimpunan');
  const [holidayInputs, setHolidayInputs] = useState<Record<string, string>>({});

  const triggerSave = (updated: AppSettings) => {
    setLocalSettings(updated);
    onUpdateSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // 1. General Info Handlers
  const handleGeneralChange = (key: keyof AppSettings, value: string) => {
    const updated = { ...localSettings, [key]: value };
    triggerSave(updated);
  };

  // 2. Class Handlers
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.trim()) return;
    if (localSettings.availableClasses.includes(newClass.trim())) {
      alert('Kelas ini sudah wujud.');
      return;
    }
    const updated = {
      ...localSettings,
      availableClasses: [...localSettings.availableClasses, newClass.trim()]
    };
    triggerSave(updated);
    setNewClass('');
  };

  const handleRemoveClass = (clsName: string) => {
    if (confirm(`Adakah anda pasti mahu memadam kelas "${clsName}"?`)) {
      const updated = {
        ...localSettings,
        availableClasses: localSettings.availableClasses.filter(c => c !== clsName)
      };
      triggerSave(updated);
    }
  };

  // 3. Activity Handlers
  const handleAddBmActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBmActivity.trim()) return;
    const updated = {
      ...localSettings,
      commonActivitiesBm: [...localSettings.commonActivitiesBm, newBmActivity.trim()]
    };
    triggerSave(updated);
    setNewBmActivity('');
  };

  const handleRemoveBmActivity = (index: number) => {
    const updated = {
      ...localSettings,
      commonActivitiesBm: localSettings.commonActivitiesBm.filter((_, i) => i !== index)
    };
    triggerSave(updated);
  };

  const handleAddBiActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBiActivity.trim()) return;
    const updated = {
      ...localSettings,
      commonActivitiesBi: [...localSettings.commonActivitiesBi, newBiActivity.trim()]
    };
    triggerSave(updated);
    setNewBiActivity('');
  };

  const handleRemoveBiActivity = (index: number) => {
    const updated = {
      ...localSettings,
      commonActivitiesBi: localSettings.commonActivitiesBi.filter((_, i) => i !== index)
    };
    triggerSave(updated);
  };

  // 4. Responsibility Handlers
  const handleAddResponsibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponsibility.trim()) return;
    const updated = {
      ...localSettings,
      tanggungjawabUmum: [...localSettings.tanggungjawabUmum, newResponsibility.trim()]
    };
    triggerSave(updated);
    setNewResponsibility('');
  };

  const handleRemoveResponsibility = (index: number) => {
    const updated = {
      ...localSettings,
      tanggungjawabUmum: localSettings.tanggungjawabUmum.filter((_, i) => i !== index)
    };
    triggerSave(updated);
  };

  // 5. Duty Group Handlers
  const handleUpdateGroupName = (index: number, newName: string) => {
    const updatedGroups = [...localSettings.dutyGroups];
    updatedGroups[index] = { ...updatedGroups[index], name: newName };
    const updated = { ...localSettings, dutyGroups: updatedGroups };
    triggerSave(updated);
  };

  const handleAddMember = (groupIdx: number) => {
    if (!newMemberName.trim()) return;
    const updatedGroups = [...localSettings.dutyGroups];
    const targetGroup = updatedGroups[groupIdx];
    
    const newMember: DutyMember = {
      name: newMemberName.trim(),
      role: newMemberRole
    };
    
    targetGroup.members = [...targetGroup.members, newMember];
    const updated = { ...localSettings, dutyGroups: updatedGroups };
    triggerSave(updated);
    
    setNewMemberName('');
  };

  const handleRemoveMember = (groupIdx: number, memberIdx: number) => {
    const updatedGroups = [...localSettings.dutyGroups];
    const targetGroup = updatedGroups[groupIdx];
    targetGroup.members = targetGroup.members.filter((_, i) => i !== memberIdx);
    const updated = { ...localSettings, dutyGroups: updatedGroups };
    triggerSave(updated);
  };

  const handleUpdateMember = (groupIdx: number, memberIdx: number, key: keyof DutyMember, val: string) => {
    const updatedGroups = [...localSettings.dutyGroups];
    const targetGroup = updatedGroups[groupIdx];
    const targetMember = { ...targetGroup.members[memberIdx], [key]: val };
    targetGroup.members[memberIdx] = targetMember;
    const updated = { ...localSettings, dutyGroups: updatedGroups };
    triggerSave(updated);
  };

  // Week Schedule & Holidays update
  const handleUpdateWeekDates = (groupIdx: number, weekIdx: number, datesVal: string) => {
    const updatedGroups = [...localSettings.dutyGroups];
    const targetGroup = updatedGroups[groupIdx];
    targetGroup.weeks[weekIdx] = { ...targetGroup.weeks[weekIdx], dates: datesVal };
    const updated = { ...localSettings, dutyGroups: updatedGroups };
    triggerSave(updated);
  };

  const handleAddWeekHoliday = (groupIdx: number, weekIdx: number, holidayStr: string) => {
    if (!holidayStr.trim()) return;
    const updatedGroups = [...localSettings.dutyGroups];
    const targetGroup = updatedGroups[groupIdx];
    const targetWeek = targetGroup.weeks[weekIdx];
    const currentHols = targetWeek.holidays || [];
    targetWeek.holidays = [...currentHols, holidayStr.trim()];
    
    const updated = { ...localSettings, dutyGroups: updatedGroups };
    triggerSave(updated);
  };

  const handleRemoveWeekHoliday = (groupIdx: number, weekIdx: number, holidayIdx: number) => {
    const updatedGroups = [...localSettings.dutyGroups];
    const targetGroup = updatedGroups[groupIdx];
    const targetWeek = targetGroup.weeks[weekIdx];
    if (targetWeek.holidays) {
      targetWeek.holidays = targetWeek.holidays.filter((_, i) => i !== holidayIdx);
      const updated = { ...localSettings, dutyGroups: updatedGroups };
      triggerSave(updated);
    }
  };

  // Sync state if settings prop changes from outside (e.g. on reset)
  const handleSyncProps = () => {
    setLocalSettings(settings);
  };

  const triggerResetAll = () => {
    if (confirm('AMARAN: Anda akan menetapkan semula semua data aktiviti sokongan dan tetapan aplikasi ke nilai asal sistem. Adakah anda bersetuju?')) {
      onResetAllData();
      setTimeout(handleSyncProps, 200);
    }
  };

  const triggerResetSettingsOnly = () => {
    if (confirm('Adakah anda pasti mahu menetapkan semula tetapan sahaja ke nilai asal sekolah? (Rekod aktiviti tidak akan dipadamkan)')) {
      onResetSettingsOnly();
      setTimeout(handleSyncProps, 200);
    }
  };

  return (
    <div id="admin-settings-container" className="space-y-6">
      
      {/* Upper header segment */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 glass-inset bg-lime-core/10 px-3 py-1 rounded-full text-[10px] font-bold text-lime-glow uppercase tracking-wider">
            <Settings className="h-3 w-3 animate-spin" /> Menu Admin Pentadbir
          </div>
          <h2 className="text-xl md:text-2xl font-black text-bright tracking-tight">
            Konfigurasi & Tetapan Sistem
          </h2>
          <p className="text-xs text-muted leading-relaxed max-w-2xl">
            Ubah nama sekolah, kod singkatan, senarai pilihan kelas, aktiviti lazim, tanggungjawab guru bertugas, peranan ahli kumpulan, serta jadual cuti peristiwa mingguan.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 glass-inset bg-emerald-400/10 px-4 py-2.5 rounded-2xl text-emerald-300 text-xs font-bold animate-bounce shadow-sm shrink-0">
            <Check className="h-4 w-4 text-emerald-400" />
            Tetapan Berjaya Disimpan!
          </div>
        )}
      </div>

      {/* Main configuration grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation panel */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 scrollbar-none">
          {[
            { id: 'general', name: 'Maklumat Am', icon: School },
            { id: 'officers', name: 'Pelapor & Penyemak', icon: UserCheck },
            { id: 'classes', name: 'Senarai Kelas', icon: Clock },
            { id: 'activities', name: 'Aktiviti Lazim', icon: BookOpen },
            { id: 'responsibilities', name: 'Tanggungjawab', icon: Briefcase },
            { id: 'groups', name: 'Kumpulan & Jadual', icon: Users },
            { id: 'cloud', name: 'Google Sheets & Drive', icon: Cloud },
            { id: 'system', name: 'Sistem & Set Semula', icon: RotateCcw }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-4 py-3 text-xs font-bold rounded-xl transition duration-200 whitespace-nowrap lg:whitespace-normal shrink-0 ${
                  isActive
                    ? 'bg-lime-core text-[#0a0f08] shadow-sm shadow-lime-core/20'
                    : 'bg-white/5 text-soft hover:bg-white/5 hover:text-bright'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#0a0f08]' : 'text-faint'}`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content detail segment */}
        <div className="lg:col-span-9 glass p-6 min-h-[480px]">
          
          {/* 1. GENERAL SETTINGS */}
          {activeSubTab === 'general' && (
            <div className="space-y-6">
              <div className="border-b border-white/8 pb-3">
                <h3 className="text-sm font-black text-bright uppercase tracking-wider">Maklumat Am Sekolah & Aplikasi</h3>
                <p className="text-[11px] text-muted mt-0.5">Ubah tajuk kepala sekolah, rujukan singkat, dan teks hak cipta / versi di bahagian kaki.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-soft block">Nama Penuh Sekolah (Akan terpapar pada semua sijil/laporan cetakan):</label>
                  <input
                    type="text"
                    value={localSettings.schoolName}
                    onChange={(e) => handleGeneralChange('schoolName', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-lime-core transition-colors bg-white/5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-soft block">Singkatan / Kod Pengenalan Sekolah:</label>
                  <input
                    type="text"
                    value={localSettings.schoolShortCode}
                    onChange={(e) => handleGeneralChange('schoolShortCode', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-lime-core transition-colors bg-white/5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-soft block">Teks Penerangan Footer & Tahun:</label>
                  <input
                    type="text"
                    value={localSettings.footerText}
                    onChange={(e) => handleGeneralChange('footerText', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-lime-core transition-colors bg-white/5"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-lime-core/10 p-4 flex items-start gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-lime-core shrink-0 mt-0.5" />
                <div className="text-[11px] text-lime-glow leading-relaxed">
                  <p className="font-bold">Nota Pengemaskinian Autotamat:</p>
                  <p className="mt-0.5 text-indigo-700/90">Sebarang perubahan yang anda lakukan pada input di atas disimpan secara automatik dalam simpanan peranti tempatan (Local Storage) dan sedia dipaparkan.</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. CLASSES SETTINGS */}
          {/* PELAPOR & PENYEMAK */}
          {activeSubTab === 'officers' && (
            <div className="space-y-8">
              <div className="border-b border-white/8 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-bright">
                  Pelapor &amp; Penyemak Laporan
                </h3>
                <p className="mt-0.5 text-[11px] text-muted">
                  Nama dan jawatan yang tercetak pada blok tandatangan laporan bergambar.
                  Pegawai bertanda <span className="text-lime-core">Lalai</span> digunakan
                  secara automatik.
                </p>
              </div>

              <OfficerList
                title="Pelapor"
                hint="Guru yang menyediakan laporan — biasanya ketua kumpulan bertugas."
                idPrefix="plp"
                officers={localSettings.pelaporList ?? DEFAULT_PELAPOR}
                onChange={(senarai: Officer[]) =>
                  triggerSave({ ...localSettings, pelaporList: senarai })
                }
              />

              <div className="border-t border-white/8 pt-6">
                <OfficerList
                  title="Penyemak"
                  hint="Pentadbir yang menyemak dan mengesahkan laporan."
                  idPrefix="psk"
                  officers={localSettings.penyemakList ?? DEFAULT_PENYEMAK}
                  onChange={(senarai: Officer[]) =>
                    triggerSave({ ...localSettings, penyemakList: senarai })
                  }
                />
              </div>
            </div>
          )}

          {activeSubTab === 'classes' && (
            <div className="space-y-6">
              <div className="border-b border-white/8 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-bright uppercase tracking-wider">Pilihan Senarai Kelas</h3>
                  <p className="text-[11px] text-muted mt-0.5">Ubah suai senarai kelas yang boleh dipilih semasa membuat laporan aktiviti baru.</p>
                </div>
                <span className="text-[10px] font-bold bg-lime-core/12 text-lime-glow rounded-full px-2 py-0.5">
                  {localSettings.availableClasses.length} Kelas
                </span>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddClass} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: 1 Inovatif"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:border-lime-core bg-white/5"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-lime-core text-[#0a0f08] rounded-xl text-xs font-bold hover:bg-lime-deep transition flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Kelas
                </button>
              </form>

              {/* Grid representation */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {localSettings.availableClasses.map((cls) => (
                  <div
                    key={cls}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 group hover:border-lime-core/30 transition"
                  >
                    <span className="text-xs font-bold text-bright">{cls}</span>
                    <button
                      onClick={() => handleRemoveClass(cls)}
                      type="button"
                      className="p-1 rounded-md text-rose-400 hover:bg-rose-500/12 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Padam Kelas"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. COMMON ACTIVITIES SETTINGS */}
          {activeSubTab === 'activities' && (
            <div className="space-y-6">
              <div className="border-b border-white/8 pb-3">
                <h3 className="text-sm font-black text-bright uppercase tracking-wider">Aktiviti Sokongan Lazim (Autocad/Cadangan)</h3>
                <p className="text-[11px] text-muted mt-0.5">Ubah suai senarai aktiviti standard yang disyorkan semasa mengisi laporan Bahasa Melayu (BM) atau Bahasa Inggeris (BI).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bahasa Melayu (BM) */}
                <div className="space-y-4 rounded-2xl p-4 bg-white/5">
                  <div className="flex items-center justify-between border-b border-white/8 pb-2">
                    <span className="text-xs font-black text-rose-300 uppercase tracking-wide">Bahasa Melayu (BM)</span>
                    <span className="text-[10px] font-bold bg-rose-500/12 text-rose-300 rounded-md px-1.5 py-0.5">{localSettings.commonActivitiesBm.length} Syor</span>
                  </div>

                  <form onSubmit={handleAddBmActivity} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Tambah aktiviti BM..."
                      value={newBmActivity}
                      onChange={(e) => setNewBmActivity(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-red-500 bg-white/5"
                    />
                    <button type="submit" className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </form>

                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                    {localSettings.commonActivitiesBm.map((act, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs text-soft hover:border-rose-400/30 transition">
                        <span className="font-semibold truncate pr-2">{act}</span>
                        <button
                          onClick={() => handleRemoveBmActivity(index)}
                          type="button"
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 p-2 -m-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bahasa Inggeris (BI) */}
                <div className="space-y-4 rounded-2xl p-4 bg-white/5">
                  <div className="flex items-center justify-between border-b border-white/8 pb-2">
                    <span className="text-xs font-black text-lime-glow uppercase tracking-wide">Bahasa Inggeris (BI)</span>
                    <span className="text-[10px] font-bold bg-lime-core/12 text-lime-glow rounded-md px-1.5 py-0.5">{localSettings.commonActivitiesBi.length} Syor</span>
                  </div>

                  <form onSubmit={handleAddBiActivity} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Tambah aktiviti BI..."
                      value={newBiActivity}
                      onChange={(e) => setNewBiActivity(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-lime-core bg-white/5"
                    />
                    <button type="submit" className="p-1.5 bg-lime-core hover:bg-lime-glow text-[#0a0f08] rounded-lg transition">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </form>

                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                    {localSettings.commonActivitiesBi.map((act, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs text-soft hover:border-lime-core/30 transition">
                        <span className="font-semibold truncate pr-2">{act}</span>
                        <button
                          onClick={() => handleRemoveBiActivity(index)}
                          type="button"
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 p-2 -m-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 4. RESPONSIBILITIES SETTINGS */}
          {activeSubTab === 'responsibilities' && (
            <div className="space-y-6">
              <div className="border-b border-white/8 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-bright uppercase tracking-wider">Tanggungjawab Umum Ahli Kumpulan Bertugas</h3>
                  <p className="text-[11px] text-muted mt-0.5">Senarai panduan ini akan dipaparkan di bahagian bawah Laporan Guru Bertugas Mingguan.</p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-400/12 text-emerald-300 rounded-full px-2 py-0.5">
                  {localSettings.tanggungjawabUmum.length} Panduan
                </span>
              </div>

              {/* Add responsibility */}
              <form onSubmit={handleAddResponsibility} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Memastikan persekitaran dewan makan kantin bersih sebelum rehat berakhir."
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:border-lime-core bg-white/5"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-lime-core text-[#0a0f08] rounded-xl text-xs font-bold hover:bg-lime-deep transition flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah
                </button>
              </form>

              {/* Responsibilities list representation */}
              <div className="space-y-2">
                {localSettings.tanggungjawabUmum.map((tanggung, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 rounded-xl bg-white/5 hover:border-lime-core/30 transition text-xs leading-relaxed text-soft"
                  >
                    <div className="flex gap-2.5">
                      <span className="h-5 w-5 glass-inset bg-lime-core/10 rounded-full text-[10px] font-extrabold text-lime-glow flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <p>{tanggung}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveResponsibility(index)}
                      type="button"
                      className="text-rose-400 hover:text-rose-300 p-1 rounded-md hover:bg-rose-500/12 shrink-0 ml-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. DUTY GROUPS & SCHEDULE SETTINGS */}
          {activeSubTab === 'groups' && (
            <div className="space-y-6">
              <div className="border-b border-white/8 pb-3">
                <h3 className="text-sm font-black text-bright uppercase tracking-wider">Kumpulan Guru Bertugas & Jadual Mingguan</h3>
                <p className="text-[11px] text-muted mt-0.5">Sediakan giliran minggu bertugas, peranan guru bertugas khusus, serta jadual cuti peristiwa mingguan.</p>
              </div>

              {/* Selection list of duty groups */}
              <div className="flex flex-wrap gap-2">
                {localSettings.dutyGroups.map((group, index) => {
                  const isSelected = selectedGroupIdx === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedGroupIdx(index);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                        isSelected
                          ? 'bg-lime-core text-[#0a0f08] border-lime-core shadow-sm'
                          : 'bg-white/5 text-soft border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {group.name} ({group.members.length} Ahli)
                    </button>
                  );
                })}
              </div>

              {/* Display detailed editor for selected group */}
              {localSettings.dutyGroups[selectedGroupIdx] && (() => {
                const group = localSettings.dutyGroups[selectedGroupIdx];
                return (
                  <div className="space-y-6 bg-white/5 rounded-2xl p-4 md:p-5">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-lime-core uppercase tracking-wider">Konfigurasi Giliran</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-muted">Nama:</span>
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => handleUpdateGroupName(selectedGroupIdx, e.target.value)}
                            className="field !py-1 !px-2.5 font-bold"
                          />
                        </div>
                      </div>
                      <span className="text-[10.5px] text-faint font-mono">Urutan Index Kumpulan: #{selectedGroupIdx + 1}</span>
                    </div>

                    {/* Member & Role assignment editor */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-bright uppercase tracking-wide flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-lime-core" />
                        Pakar Ahli & Peranan Bertugas
                      </h4>

                      <div className="space-y-2">
                        {group.members.map((member, mIdx) => (
                          <div key={mIdx} className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-white/5 p-2.5 rounded-xl shadow-sm">
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-[11px] font-bold text-faint min-w-[20px]">#{mIdx + 1}</span>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => handleUpdateMember(selectedGroupIdx, mIdx, 'name', e.target.value)}
                                className="flex-1 bg-white/5 px-2.5 py-1 rounded text-xs font-bold text-bright border border-transparent hover:border-white/10 focus:border-lime-core"
                                placeholder="Nama Guru"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={member.role}
                                onChange={(e) => handleUpdateMember(selectedGroupIdx, mIdx, 'role', e.target.value)}
                                className="bg-white/5 px-2.5 py-1 rounded text-xs font-semibold text-soft border border-transparent hover:border-white/10 focus:border-lime-core w-36"
                                placeholder="Peranan"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(selectedGroupIdx, mIdx)}
                                className="p-1 rounded text-rose-400 hover:bg-rose-500/12 hover:text-rose-300"
                                title="Padam Ahli"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Member form inline */}
                      <div className="flex flex-wrap sm:flex-nowrap gap-2 bg-lime-core/8 p-2.5 rounded-xl">
                        <input
                          type="text"
                          placeholder="Nama guru baru..."
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="flex-1 min-w-[140px] px-2.5 py-1 text-xs rounded focus:outline-none focus:border-lime-core bg-white/5"
                        />
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          className="px-2.5 py-1 text-xs rounded focus:outline-none focus:border-lime-core bg-white/5"
                        >
                          <option value="Ketua/Perhimpunan">Ketua/Perhimpunan</option>
                          <option value="Kebersihan/Disiplin">Kebersihan/Disiplin</option>
                          <option value="Kehadiran Kelas">Kehadiran Kelas</option>
                          <option value="RMT/Kantin">RMT/Kantin</option>
                          <option value="Guru Penyayang">Guru Penyayang</option>
                          <option value="Guru Gantian">Guru Gantian</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAddMember(selectedGroupIdx)}
                          className="px-3.5 py-1 bg-lime-core text-[#0a0f08] text-xs font-bold rounded hover:bg-lime-deep transition flex items-center gap-1 shrink-0"
                        >
                          <Plus className="h-3 w-3" /> Tambah Guru
                        </button>
                      </div>
                    </div>

                    {/* Weeks Schedule dates & Holiday list */}
                    <div className="space-y-3 pt-3 border-t border-white/8">
                      <h4 className="text-xs font-black text-bright uppercase tracking-wide flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-lime-core" />
                        Senarai Minggu Bertugas & Cuti Peristiwa (2026)
                      </h4>

                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {group.weeks.map((wk, wIdx) => {
                          const inputKey = `${selectedGroupIdx}-${wIdx}`;
                          const holidayText = holidayInputs[inputKey] || '';
                          const setHolidayText = (val: string) => {
                            setHolidayInputs(prev => ({ ...prev, [inputKey]: val }));
                          };
                          return (
                            <div key={wIdx} className="bg-white/5 p-3 rounded-xl space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/8 pb-1.5">
                                <span className="text-xs font-black text-lime-glow">Minggu {wk.number}</span>
                                <input
                                  type="text"
                                  value={wk.dates}
                                  onChange={(e) => handleUpdateWeekDates(selectedGroupIdx, wIdx, e.target.value)}
                                  className="field !py-0.5 !px-2 !text-[11px] font-bold w-full sm:w-48 text-right"
                                />
                              </div>

                              {/* Holiday management */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-faint uppercase tracking-wider block">Cuti / Peristiwa Khas:</span>
                                
                                {wk.holidays && wk.holidays.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {wk.holidays.map((hol, holIdx) => (
                                      <span key={holIdx} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
                                        {hol}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveWeekHoliday(selectedGroupIdx, wIdx, holIdx)}
                                          className="text-rose-500 hover:text-rose-800"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-faint italic block">Tiada cuti tersenarai. Minggu pengajian penuh.</span>
                                )}

                                {/* Add holiday line */}
                                <div className="flex gap-1.5 pt-1">
                                  <input
                                    type="text"
                                    placeholder="Tambah cuti (Contoh: CUTI PERISTIWA)"
                                    value={holidayText}
                                    onChange={(e) => setHolidayText(e.target.value)}
                                    className="flex-1 px-2 py-1 text-[10.5px] rounded bg-white/5"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (holidayText.trim()) {
                                        handleAddWeekHoliday(selectedGroupIdx, wIdx, holidayText);
                                        setHolidayText('');
                                      }
                                    }}
                                    className="px-2 py-1 bg-white/8 text-soft font-bold text-[10px] rounded hover:bg-white/12 shrink-0"
                                  >
                                    Tambah Cuti
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          )}

          {/* 6. SYSTEM RESET & CLEAR DATA */}
          {/* GOOGLE SHEETS & DRIVE */}
          {activeSubTab === 'cloud' && <CloudSettings activities={activities} />}

          {activeSubTab === 'system' && (
            <div className="space-y-6">
              <div className="border-b border-white/8 pb-3">
                <h3 className="text-sm font-black text-bright uppercase tracking-wider">Tetapan Sistem & Penyelenggaraan</h3>
                <p className="text-[11px] text-muted mt-0.5">Uruskan pembersihan cache, sandaran data, dan atur semula tetapan konfigurasi kepada tetapan kilang.</p>
              </div>

              <div className="space-y-4">
                
                {/* Reset settings only */}
                <div className="rounded-2xl p-5 space-y-3 bg-white/5 hover:border-lime-core/25 transition">
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="h-5 w-5 text-lime-core" />
                    <div>
                      <h4 className="text-xs font-black text-bright uppercase">Set Semula Tetapan Sahaja (Reset Settings Only)</h4>
                      <p className="text-[10.5px] text-muted mt-0.5">Kembalikan tajuk sekolah, senarai kelas, aktiviti lazim, dan giliran jadual bertugas kepada nilai asal.</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={triggerResetSettingsOnly}
                      className="px-4 py-2 bg-lime-core/12 hover:bg-lime-core/20 text-lime-glow rounded-xl text-xs font-black transition"
                    >
                      Kembalikan Tetapan Sekolah Lalai
                    </button>
                  </div>
                </div>

                {/* Reset All Data (factory reset) */}
                <div className="rounded-2xl p-5 space-y-3 bg-rose-500/10 hover:border-rose-400/30 transition">
                  <div className="flex items-center gap-2.5">
                    <X className="h-5 w-5 text-rose-400 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-red-900 uppercase">Set Semula Kilang & Padam Semua Laporan (Factory Reset All Data)</h4>
                      <p className="text-[10.5px] text-muted mt-0.5">Memadam semua rekod laporan aktiviti sokongan murid yang disimpan dalam pelayar ini secara kekal bersama tetapan konfigurasinya.</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={triggerResetAll}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition shadow-sm"
                    >
                      Padam Semua Laporan & Konfigurasi
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
