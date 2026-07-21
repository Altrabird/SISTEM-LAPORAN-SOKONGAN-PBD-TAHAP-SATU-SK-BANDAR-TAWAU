import { useState, useEffect } from 'react';
import { ActivityLog, AppSettings } from './types';
import {
  INITIAL_ACTIVITIES,
  AVAILABLE_CLASSES,
  COMMON_ACTIVITIES_BM,
  COMMON_ACTIVITIES_BI,
  TANGGUNGJAWAB_UMUM,
  OFFICIAL_DUTY_GROUPS,
  DEFAULT_PELAPOR,
  DEFAULT_PENYEMAK
} from './data';
import { migrateInlineImages, deletePhotos, clearPhotos } from './lib/photoStore';
import { deleteFromSheets, getWebAppUrl, getAdminToken } from './lib/sheetsSync';
import Dashboard from './components/Dashboard';
import ActivityForm from './components/ActivityForm';
import ActivityList from './components/ActivityList';
import PictorialReport from './components/PictorialReport';
import AdminSettings from './components/AdminSettings';
import {
  LayoutDashboard,
  ListFilter,
  PlusCircle,
  Menu,
  X,
  Settings,
  Leaf,
  Cloud,
  CloudOff
} from 'lucide-react';

/**
 * Simpan senarai aktiviti ke localStorage.
 *
 * Gambar kini disimpan dalam IndexedDB, jadi muatan di sini hanya teks —
 * tetapi kuota masih boleh dilanggar jika rekod menjadi sangat banyak.
 * Kegagalan dilaporkan kepada pengguna, bukan ditelan secara senyap seperti
 * sebelum ini (dahulu penyimpanan gagal tanpa sebarang amaran).
 */
function persistActivities(senarai: ActivityLog[]): boolean {
  try {
    localStorage.setItem('lapor_pbd_activities', JSON.stringify(senarai));
    return true;
  } catch (e) {
    console.error('Gagal menyimpan aktiviti', e);
    alert(
      'Storan pelayar penuh — rekod terbaharu TIDAK dapat disimpan.\n\n' +
        'Sila buka Tetapan & Menu Admin untuk mengeksport sandaran, ' +
        'kemudian buang rekod lama sebelum mencuba semula.'
    );
    return false;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityLog | null>(null);

  // Load and save settings in localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('lapor_pbd_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
    return {
      schoolName: 'SK BANDAR TAWAU',
      schoolShortCode: 'SKBT',
      footerText: 'LaporPBD v1.2.0 • SKBT 2026',
      availableClasses: AVAILABLE_CLASSES,
      commonActivitiesBm: COMMON_ACTIVITIES_BM,
      commonActivitiesBi: COMMON_ACTIVITIES_BI,
      tanggungjawabUmum: TANGGUNGJAWAB_UMUM,
      dutyGroups: OFFICIAL_DUTY_GROUPS,
      pelaporList: DEFAULT_PELAPOR,
      penyemakList: DEFAULT_PENYEMAK
    };
  });

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('lapor_pbd_settings', JSON.stringify(newSettings));
  };

  const handleResetAllData = () => {
    localStorage.removeItem('lapor_pbd_activities');
    localStorage.removeItem('lapor_pbd_settings');
    void clearPhotos(); // buang juga gambar dalam IndexedDB
    setActivities(INITIAL_ACTIVITIES);
    const defaultVal = {
      schoolName: 'SK BANDAR TAWAU',
      schoolShortCode: 'SKBT',
      footerText: 'LaporPBD v1.2.0 • SKBT 2026',
      availableClasses: AVAILABLE_CLASSES,
      commonActivitiesBm: COMMON_ACTIVITIES_BM,
      commonActivitiesBi: COMMON_ACTIVITIES_BI,
      tanggungjawabUmum: TANGGUNGJAWAB_UMUM,
      dutyGroups: OFFICIAL_DUTY_GROUPS,
      pelaporList: DEFAULT_PELAPOR,
      penyemakList: DEFAULT_PENYEMAK
    };
    setSettings(defaultVal);
    persistActivities(INITIAL_ACTIVITIES);
    localStorage.setItem('lapor_pbd_settings', JSON.stringify(defaultVal));
    setActiveTab('dashboard');
  };

  const handleResetSettingsOnly = () => {
    localStorage.removeItem('lapor_pbd_settings');
    const defaultVal = {
      schoolName: 'SK BANDAR TAWAU',
      schoolShortCode: 'SKBT',
      footerText: 'LaporPBD v1.2.0 • SKBT 2026',
      availableClasses: AVAILABLE_CLASSES,
      commonActivitiesBm: COMMON_ACTIVITIES_BM,
      commonActivitiesBi: COMMON_ACTIVITIES_BI,
      tanggungjawabUmum: TANGGUNGJAWAB_UMUM,
      dutyGroups: OFFICIAL_DUTY_GROUPS,
      pelaporList: DEFAULT_PELAPOR,
      penyemakList: DEFAULT_PENYEMAK
    };
    setSettings(defaultVal);
    localStorage.setItem('lapor_pbd_settings', JSON.stringify(defaultVal));
  };
  
  // Mobile navigation drawer toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load activities from localStorage on mount, memindahkan gambar base64
  // lama ke IndexedDB supaya kuota localStorage tidak lagi menjadi halangan.
  useEffect(() => {
    const saved = localStorage.getItem('lapor_pbd_activities');
    if (!saved) {
      setActivities(INITIAL_ACTIVITIES);
      persistActivities(INITIAL_ACTIVITIES);
      return;
    }

    let dimuat: ActivityLog[];
    try {
      dimuat = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved activities, falling back to defaults', e);
      setActivities(INITIAL_ACTIVITIES);
      return;
    }

    setActivities(dimuat);

    migrateInlineImages(dimuat)
      .then((dipindah) => {
        if (!dipindah) return; // tiada gambar tertanam — tiada apa nak buat
        setActivities(dipindah);
        persistActivities(dipindah);
        console.info(
          `[LaporPBD] ${dipindah.length} rekod disemak; gambar base64 dipindahkan ke IndexedDB.`
        );
      })
      .catch((e) => console.error('Migrasi gambar gagal', e));
  }, []);

  // Save changes to state and local storage
  const handleSaveActivity = (newActivity: ActivityLog) => {
    let updated: ActivityLog[];
    
    // Check if we are updating an existing activity
    const existing = activities.find(act => act.id === newActivity.id);
    if (existing) {
      updated = activities.map(act => act.id === newActivity.id ? newActivity : act);

      // Buang gambar yang telah ditanggalkan semasa suntingan supaya
      // IndexedDB tidak dipenuhi fail yatim.
      const kekal = new Set(newActivity.images ?? []);
      const dibuang = (existing.images ?? []).filter(img => !kekal.has(img));
      if (dibuang.length) void deletePhotos(dibuang);
    } else {
      updated = [newActivity, ...activities];
    }

    setActivities(updated);
    persistActivities(updated);
    
    // Reset state and redirect
    setEditingActivity(null);
    setSelectedActivity(null);
    setActiveTab('list');
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete activity
  const handleDeleteActivity = (id: string) => {
    const dipadam = activities.find(act => act.id === id);
    const updated = activities.filter(act => act.id !== id);
    setActivities(updated);
    persistActivities(updated);

    // Lepaskan ruang gambar milik rekod yang dipadam.
    if (dipadam?.images?.length) void deletePhotos(dipadam.images);

    // Padam juga baris dalam Google Sheets. Tanpa ini, rekod yang dibuang
    // daripada aplikasi kekal selama-lamanya dalam laporan awan — laporan
    // rasmi akan terus memaparkan aktiviti yang sudah ditarik balik.
    //
    // Dilangkau secara senyap jika penyegerakan awan atau token pentadbir
    // belum ditetapkan; padam setempat tidak sepatutnya gagal kerana itu.
    if (dipadam && getWebAppUrl() && getAdminToken()) {
      deleteFromSheets({
        id: dipadam.id,
        className: dipadam.className,
        date: dipadam.date
      }).then(hasil => {
        if (!hasil.ok) {
          alert(
            'Rekod dipadam pada peranti ini, tetapi gagal dipadam daripada ' +
              'Google Sheets:\n\n' + hasil.message +
              '\n\nSila padam barisnya secara manual dalam Sheet.'
          );
        }
      });
    }
    
    if (selectedActivity && selectedActivity.id === id) {
      setSelectedActivity(null);
    }
    if (editingActivity && editingActivity.id === id) {
      setEditingActivity(null);
    }
  };

  // Nav helper
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setEditingActivity(null);
    setSelectedActivity(null);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (activity: ActivityLog) => {
    setEditingActivity(activity);
    setActiveTab('form');
  };

  const startViewReport = (activity: ActivityLog) => {
    setSelectedActivity(activity);
    setActiveTab('report');
  };

  /* Item navigasi — dipacu data supaya penanda aktif hanya ditakrif sekali. */
  const navItems = [
    { id: 'dashboard', label: 'Paparan Utama', icon: LayoutDashboard, aktifBila: ['dashboard'] },
    { id: 'list', label: 'Senarai Aktiviti', icon: ListFilter, aktifBila: ['list', 'report'] },
    { id: 'form', label: 'Rekod Aktiviti Baru', icon: PlusCircle, aktifBila: ['form'] },
    { id: 'admin', label: 'Tetapan & Admin', icon: Settings, aktifBila: ['admin'] }
  ];

  const awanAktif = Boolean(getWebAppUrl());

  const senaraiNav = (
    <nav className="space-y-1">
      {navItems.map(({ id, label, icon: Icon, aktifBila }) => {
        const aktif = aktifBila.includes(activeTab);
        return (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            aria-current={aktif ? 'page' : undefined}
            className={`group relative w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold transition-all duration-200 cursor-pointer ${
              aktif
                ? 'bg-lime-core/12 text-lime-glow'
                : 'text-muted hover:bg-white/5 hover:text-bright'
            }`}
          >
            {/* Penanda aktif — bar menegak, bukan latar penuh yang berat */}
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-lime-core transition-all duration-200 ${
                aktif ? 'h-6 opacity-100' : 'h-0 opacity-0'
              }`}
            />
            <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors ${aktif ? 'text-lime-core' : ''}`} />
            <span className="text-left leading-tight">{label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans">

      {/* Bar atas mudah alih */}
      <header className="glass sticky top-0 z-30 flex items-center justify-between rounded-none px-4 py-3 md:hidden print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-b from-lime-core to-lime-deep p-2 text-[#0a0f08] shadow-lg shadow-lime-core/20">
            <Leaf className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold leading-none tracking-tight">LaporPBD</h1>
            <span className="text-[9px] font-medium text-muted">Aktiviti Sokongan PBD</span>
          </div>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? 'Tutup menu' : 'Buka menu'}
          className="btn-ghost !p-2"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="relative flex flex-1">

        {/* Panel sisi */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col justify-between bg-abyss/95 p-5 backdrop-blur-xl transition-transform duration-300 md:static md:translate-x-0 md:bg-transparent md:backdrop-blur-none print:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-7">
            {/* Jenama */}
            <div className="hidden items-center gap-3 px-1 md:flex">
              <div className="rounded-xl bg-gradient-to-b from-lime-core to-lime-deep p-2.5 text-[#0a0f08] shadow-lg shadow-lime-core/25">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-base font-bold leading-none tracking-tight">LaporPBD</h1>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-lime-core/70">
                  BM &amp; BI {settings.schoolShortCode}
                </span>
              </div>
            </div>

            {senaraiNav}
          </div>

          {/* Kaki panel — status awan sebenar, bukan hiasan */}
          <div className="mt-auto space-y-3 pt-5">
            <div className="glass glass-hover flex items-center gap-2.5 p-3">
              {awanAktif ? (
                <Cloud className="h-4.5 w-4.5 shrink-0 text-lime-core" />
              ) : (
                <CloudOff className="h-4.5 w-4.5 shrink-0 text-faint" />
              )}
              <div className="min-w-0 text-[10px] leading-relaxed">
                <span className="block font-bold text-soft">Google Sheets</span>
                <span className={awanAktif ? 'text-lime-core' : 'text-faint'}>
                  {awanAktif ? 'Tersambung' : 'Belum ditetapkan'}
                </span>
              </div>
            </div>

            <p className="text-center font-mono text-[9px] text-faint">{settings.footerText}</p>
          </div>
        </aside>

        {/* Tirai untuk laci mudah alih */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-void/70 backdrop-blur-sm md:hidden"
          />
        )}

        {/* Kandungan utama */}
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:max-h-screen md:overflow-y-auto md:p-8 print:overflow-visible print:p-0">
          <div className="animate-fade-in" key={activeTab}>
            {activeTab === 'dashboard' && (
              <Dashboard
                activities={activities}
                onNavigate={handleTabChange}
                dutyGroups={settings.dutyGroups}
                tanggungjawabUmum={settings.tanggungjawabUmum}
              />
            )}

            {activeTab === 'list' && (
              <ActivityList
                activities={activities}
                onViewReport={startViewReport}
                onEditActivity={startEdit}
                onDeleteActivity={handleDeleteActivity}
                onAddNew={() => handleTabChange('form')}
              />
            )}

            {activeTab === 'form' && (
              <ActivityForm
                onSave={handleSaveActivity}
                initialActivity={editingActivity}
                onCancel={() => handleTabChange('list')}
                availableClasses={settings.availableClasses}
                commonActivitiesBm={settings.commonActivitiesBm}
                commonActivitiesBi={settings.commonActivitiesBi}
              />
            )}

            {activeTab === 'report' && selectedActivity && (
              <PictorialReport
                activity={selectedActivity}
                onBack={() => handleTabChange('list')}
                schoolName={settings.schoolName}
                settings={settings}
              />
            )}

            {activeTab === 'admin' && (
              <AdminSettings
                settings={settings}
                activities={activities}
                onUpdateSettings={handleUpdateSettings}
                onResetAllData={handleResetAllData}
                onResetSettingsOnly={handleResetSettingsOnly}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
