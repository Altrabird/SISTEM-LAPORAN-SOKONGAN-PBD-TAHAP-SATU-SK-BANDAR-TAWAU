import React, { useState } from 'react';
import { AppSettings, DutyGroup, DutyMember, DutyWeek } from '../types';
import {
  Settings,
  School,
  Users,
  BookOpen,
  Briefcase,
  Calendar,
  Trash2,
  Plus,
  Save,
  RotateCcw,
  Check,
  PlusCircle,
  X,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AdminSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetAllData: () => void;
  onResetSettingsOnly: () => void;
}

export default function AdminSettings({
  settings,
  onUpdateSettings,
  onResetAllData,
  onResetSettingsOnly
}: AdminSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'classes' | 'activities' | 'responsibilities' | 'groups' | 'system'>('general');
  
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
            <Settings className="h-3 w-3 animate-spin" /> Menu Admin Pentadbir
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            Konfigurasi & Tetapan Sistem
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
            Ubah nama sekolah, kod singkatan, senarai pilihan kelas, aktiviti lazim, tanggungjawab guru bertugas, peranan ahli kumpulan, serta jadual cuti peristiwa mingguan.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-150 px-4 py-2.5 rounded-2xl text-emerald-800 text-xs font-bold animate-bounce shadow-sm shrink-0">
            <Check className="h-4 w-4 text-emerald-600" />
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
            { id: 'classes', name: 'Senarai Kelas', icon: Clock },
            { id: 'activities', name: 'Aktiviti Lazim', icon: BookOpen },
            { id: 'responsibilities', name: 'Tanggungjawab', icon: Briefcase },
            { id: 'groups', name: 'Kumpulan & Jadual', icon: Users },
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
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                    : 'bg-white text-gray-600 border border-gray-100/50 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content detail segment */}
        <div className="lg:col-span-9 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[480px]">
          
          {/* 1. GENERAL SETTINGS */}
          {activeSubTab === 'general' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Maklumat Am Sekolah & Aplikasi</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Ubah tajuk kepala sekolah, rujukan singkat, dan teks hak cipta / versi di bahagian kaki.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Nama Penuh Sekolah (Akan terpapar pada semua sijil/laporan cetakan):</label>
                  <input
                    type="text"
                    value={localSettings.schoolName}
                    onChange={(e) => handleGeneralChange('schoolName', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors bg-gray-50/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Singkatan / Kod Pengenalan Sekolah:</label>
                  <input
                    type="text"
                    value={localSettings.schoolShortCode}
                    onChange={(e) => handleGeneralChange('schoolShortCode', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors bg-gray-50/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Teks Penerangan Footer & Tahun:</label>
                  <input
                    type="text"
                    value={localSettings.footerText}
                    onChange={(e) => handleGeneralChange('footerText', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors bg-gray-50/30"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-50/40 p-4 border border-indigo-100/50 flex items-start gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-indigo-900 leading-relaxed">
                  <p className="font-bold">Nota Pengemaskinian Autotamat:</p>
                  <p className="mt-0.5 text-indigo-700/90">Sebarang perubahan yang anda lakukan pada input di atas disimpan secara automatik dalam simpanan peranti tempatan (Local Storage) dan sedia dipaparkan.</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. CLASSES SETTINGS */}
          {activeSubTab === 'classes' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Pilihan Senarai Kelas</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Ubah suai senarai kelas yang boleh dipilih semasa membuat laporan aktiviti baru.</p>
                </div>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5">
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
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-gray-50/30"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Kelas
                </button>
              </form>

              {/* Grid representation */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {localSettings.availableClasses.map((cls) => (
                  <div
                    key={cls}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/30 group hover:border-indigo-200 transition"
                  >
                    <span className="text-xs font-bold text-gray-800">{cls}</span>
                    <button
                      onClick={() => handleRemoveClass(cls)}
                      type="button"
                      className="p-1 rounded-md text-red-500 hover:bg-red-50 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
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
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Aktiviti Sokongan Lazim (Autocad/Cadangan)</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Ubah suai senarai aktiviti standard yang disyorkan semasa mengisi laporan Bahasa Melayu (BM) atau Bahasa Inggeris (BI).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bahasa Melayu (BM) */}
                <div className="space-y-4 border border-gray-150 rounded-2xl p-4 bg-gray-50/20">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-black text-red-700 uppercase tracking-wide">Bahasa Melayu (BM)</span>
                    <span className="text-[10px] font-bold bg-red-50 text-red-700 rounded-md px-1.5 py-0.5">{localSettings.commonActivitiesBm.length} Syor</span>
                  </div>

                  <form onSubmit={handleAddBmActivity} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Tambah aktiviti BM..."
                      value={newBmActivity}
                      onChange={(e) => setNewBmActivity(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-red-500 bg-white"
                    />
                    <button type="submit" className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </form>

                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                    {localSettings.commonActivitiesBm.map((act, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-xs text-gray-700 hover:border-red-200 transition">
                        <span className="font-semibold truncate pr-2">{act}</span>
                        <button
                          onClick={() => handleRemoveBmActivity(index)}
                          type="button"
                          className="text-red-500 hover:text-red-700 p-0.5 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bahasa Inggeris (BI) */}
                <div className="space-y-4 border border-gray-150 rounded-2xl p-4 bg-gray-50/20">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-black text-blue-700 uppercase tracking-wide">Bahasa Inggeris (BI)</span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md px-1.5 py-0.5">{localSettings.commonActivitiesBi.length} Syor</span>
                  </div>

                  <form onSubmit={handleAddBiActivity} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Tambah aktiviti BI..."
                      value={newBiActivity}
                      onChange={(e) => setNewBiActivity(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 bg-white"
                    />
                    <button type="submit" className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </form>

                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                    {localSettings.commonActivitiesBi.map((act, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-xs text-gray-700 hover:border-blue-200 transition">
                        <span className="font-semibold truncate pr-2">{act}</span>
                        <button
                          onClick={() => handleRemoveBiActivity(index)}
                          type="button"
                          className="text-red-500 hover:text-red-700 p-0.5 rounded"
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
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Tanggungjawab Umum Ahli Kumpulan Bertugas</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Senarai panduan ini akan dipaparkan di bahagian bawah Laporan Guru Bertugas Mingguan.</p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5">
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
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 bg-gray-50/30"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah
                </button>
              </form>

              {/* Responsibilities list representation */}
              <div className="space-y-2">
                {localSettings.tanggungjawabUmum.map((tanggung, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 rounded-xl border border-gray-150 bg-white hover:border-indigo-200 transition text-xs leading-relaxed text-gray-700"
                  >
                    <div className="flex gap-2.5">
                      <span className="h-5 w-5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-extrabold text-indigo-700 flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <p>{tanggung}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveResponsibility(index)}
                      type="button"
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 shrink-0 ml-3"
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
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Kumpulan Guru Bertugas & Jadual Mingguan</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Sediakan giliran minggu bertugas, peranan guru bertugas khusus, serta jadual cuti peristiwa mingguan.</p>
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
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
                  <div className="space-y-6 border border-gray-100 bg-gray-50/20 rounded-2xl p-4 md:p-5">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Konfigurasi Giliran</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-gray-500">Nama:</span>
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => handleUpdateGroupName(selectedGroupIdx, e.target.value)}
                            className="bg-white border border-gray-200 rounded px-2.5 py-1 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <span className="text-[10.5px] text-gray-400 font-mono">Urutan Index Kumpulan: #{selectedGroupIdx + 1}</span>
                    </div>

                    {/* Member & Role assignment editor */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-indigo-600" />
                        Pakar Ahli & Peranan Bertugas
                      </h4>

                      <div className="space-y-2">
                        {group.members.map((member, mIdx) => (
                          <div key={mIdx} className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-white border border-gray-100 p-2.5 rounded-xl shadow-sm">
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-[11px] font-bold text-gray-400 min-w-[20px]">#{mIdx + 1}</span>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => handleUpdateMember(selectedGroupIdx, mIdx, 'name', e.target.value)}
                                className="flex-1 bg-gray-50/50 px-2.5 py-1 rounded text-xs font-bold text-gray-800 border border-transparent hover:border-gray-200 focus:border-indigo-500"
                                placeholder="Nama Guru"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={member.role}
                                onChange={(e) => handleUpdateMember(selectedGroupIdx, mIdx, 'role', e.target.value)}
                                className="bg-gray-50/50 px-2.5 py-1 rounded text-xs font-semibold text-gray-600 border border-transparent hover:border-gray-200 focus:border-indigo-500 w-36"
                                placeholder="Peranan"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(selectedGroupIdx, mIdx)}
                                className="p-1 rounded text-red-500 hover:bg-red-50 hover:text-red-700"
                                title="Padam Ahli"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Member form inline */}
                      <div className="flex flex-wrap sm:flex-nowrap gap-2 bg-indigo-50/20 p-2.5 border border-indigo-100/30 rounded-xl">
                        <input
                          type="text"
                          placeholder="Nama guru baru..."
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="flex-1 min-w-[140px] px-2.5 py-1 text-xs rounded border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white"
                        />
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          className="px-2.5 py-1 text-xs rounded border border-gray-200 focus:outline-none focus:border-indigo-500 bg-white"
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
                          className="px-3.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition flex items-center gap-1 shrink-0"
                        >
                          <Plus className="h-3 w-3" /> Tambah Guru
                        </button>
                      </div>
                    </div>

                    {/* Weeks Schedule dates & Holiday list */}
                    <div className="space-y-3 pt-3 border-t border-gray-150">
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-indigo-600" />
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
                            <div key={wIdx} className="bg-white border border-gray-100 p-3 rounded-xl space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-1.5">
                                <span className="text-xs font-black text-indigo-950">Minggu {wk.number}</span>
                                <input
                                  type="text"
                                  value={wk.dates}
                                  onChange={(e) => handleUpdateWeekDates(selectedGroupIdx, wIdx, e.target.value)}
                                  className="bg-gray-50 border border-transparent hover:border-gray-100 px-2 py-0.5 rounded text-[11px] font-bold text-gray-600 w-full sm:w-48 text-right focus:border-indigo-500 focus:outline-none"
                                />
                              </div>

                              {/* Holiday management */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cuti / Peristiwa Khas:</span>
                                
                                {wk.holidays && wk.holidays.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {wk.holidays.map((hol, holIdx) => (
                                      <span key={holIdx} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
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
                                  <span className="text-[10px] text-gray-400 italic block">Tiada cuti tersenarai. Minggu pengajian penuh.</span>
                                )}

                                {/* Add holiday line */}
                                <div className="flex gap-1.5 pt-1">
                                  <input
                                    type="text"
                                    placeholder="Tambah cuti (Contoh: CUTI PERISTIWA)"
                                    value={holidayText}
                                    onChange={(e) => setHolidayText(e.target.value)}
                                    className="flex-1 px-2 py-1 text-[10.5px] rounded border border-gray-100 bg-gray-50/50"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (holidayText.trim()) {
                                        handleAddWeekHoliday(selectedGroupIdx, wIdx, holidayText);
                                        setHolidayText('');
                                      }
                                    }}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 font-bold text-[10px] rounded hover:bg-gray-200 shrink-0"
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
          {activeSubTab === 'system' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Tetapan Sistem & Penyelenggaraan</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Uruskan pembersihan cache, sandaran data, dan atur semula tetapan konfigurasi kepada tetapan kilang.</p>
              </div>

              <div className="space-y-4">
                
                {/* Reset settings only */}
                <div className="rounded-2xl border border-gray-150 p-5 space-y-3 bg-white hover:border-indigo-100 transition">
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase">Set Semula Tetapan Sahaja (Reset Settings Only)</h4>
                      <p className="text-[10.5px] text-gray-500 mt-0.5">Kembalikan tajuk sekolah, senarai kelas, aktiviti lazim, dan giliran jadual bertugas kepada nilai asal.</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={triggerResetSettingsOnly}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition border border-indigo-150"
                    >
                      Kembalikan Tetapan Sekolah Lalai
                    </button>
                  </div>
                </div>

                {/* Reset All Data (factory reset) */}
                <div className="rounded-2xl border border-red-150 p-5 space-y-3 bg-red-50/10 hover:border-red-200 transition">
                  <div className="flex items-center gap-2.5">
                    <X className="h-5 w-5 text-red-600 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-red-900 uppercase">Set Semula Kilang & Padam Semua Laporan (Factory Reset All Data)</h4>
                      <p className="text-[10.5px] text-gray-500 mt-0.5">Memadam semua rekod laporan aktiviti sokongan murid yang disimpan dalam pelayar ini secara kekal bersama tetapan konfigurasinya.</p>
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
