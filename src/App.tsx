import { useState, useEffect } from 'react';
import { ActivityLog, AppSettings } from './types';
import {
  INITIAL_ACTIVITIES,
  AVAILABLE_CLASSES,
  COMMON_ACTIVITIES_BM,
  COMMON_ACTIVITIES_BI,
  TANGGUNGJAWAB_UMUM,
  OFFICIAL_DUTY_GROUPS
} from './data';
import { migrateInlineImages, deletePhotos, clearPhotos } from './lib/photoStore';
import { deleteFromSheets, getWebAppUrl, getAdminToken } from './lib/sheetsSync';
import Dashboard from './components/Dashboard';
import ActivityForm from './components/ActivityForm';
import ActivityList from './components/ActivityList';
import PictorialReport from './components/PictorialReport';
import GoogleSheetsIntegration from './components/GoogleSheetsIntegration';
import GeminiAssistant from './components/GeminiAssistant';
import AdminSettings from './components/AdminSettings';
import {
  LayoutDashboard,
  ListFilter,
  PlusCircle,
  BrainCircuit,
  Database,
  Menu,
  X,
  FileText,
  Cloud,
  CheckCircle,
  HelpCircle,
  Settings
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
      dutyGroups: OFFICIAL_DUTY_GROUPS
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
      dutyGroups: OFFICIAL_DUTY_GROUPS
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
      dutyGroups: OFFICIAL_DUTY_GROUPS
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

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      
      {/* 1. Mobile top-bar navigation header (Hidden on A4 printing) */}
      <header className="flex items-center justify-between bg-white border-b border-gray-100 px-5 py-4 md:hidden print:hidden shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-blue-600 p-2 text-white">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight leading-none">LaporPBD</h1>
            <span className="text-[9px] text-gray-400 font-medium">Aktiviti Sokongan PBD</span>
          </div>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg border border-gray-100 text-gray-600 hover:bg-gray-50"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="flex flex-1 relative">
        
        {/* 2. Desktop Sidebar Menu Panel (Hidden on A4 printing) */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 p-6 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 print:hidden shrink-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-8">
            {/* Logo area */}
            <div className="hidden md:flex items-center gap-3 border-b border-gray-50 pb-5">
              <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-100">
                <Database className="h-5.5 w-5.5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 tracking-tight leading-none">LaporPBD</h1>
                <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase block mt-1">BM & BI {settings.schoolShortCode}</span>
              </div>
            </div>

            {/* Menu options list */}
            <nav className="space-y-1.5">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-50/50'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                Paparan Utama (Dashboard)
              </button>

              <button
                onClick={() => handleTabChange('list')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'list' || activeTab === 'report'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <ListFilter className="h-4.5 w-4.5" />
                Senarai Aktiviti Sokongan
              </button>

              <button
                onClick={() => handleTabChange('form')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'form'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <PlusCircle className="h-4.5 w-4.5" />
                Rekod Aktiviti Baru
              </button>

              <button
                onClick={() => handleTabChange('ai')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <BrainCircuit className="h-4.5 w-4.5" />
                Penasihat AI Gemini
              </button>

              <button
                onClick={() => handleTabChange('integration')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'integration'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Database className="h-4.5 w-4.5" />
                Integrasi Excel & GD
              </button>

              <button
                onClick={() => handleTabChange('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border border-transparent ${
                  activeTab === 'admin'
                    ? 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950'
                }`}
              >
                <Settings className="h-4.5 w-4.5" />
                Tetapan & Menu Admin
              </button>
            </nav>
          </div>

          {/* School badge summary / footer */}
          <div className="mt-auto border-t border-gray-50 pt-5 space-y-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-100 p-3">
              <Cloud className="h-4.5 w-4.5 text-blue-500 animate-pulse" />
              <div className="text-[10px] leading-relaxed">
                <span className="font-bold text-gray-700 block">Status Integrasi GD</span>
                <span className="text-gray-400">Siap untuk segerak</span>
              </div>
            </div>
            
            <p className="text-[9px] text-gray-400 text-center font-mono">
              {settings.footerText}
            </p>
          </div>
        </aside>

        {/* Backdrop for mobile navigation drawer */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm md:hidden"
          ></div>
        )}

        {/* 3. Main Content Container Area */}
        <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden md:overflow-y-auto md:max-h-screen print:p-0 print:overflow-visible">
          
          {/* Main conditional views router */}
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
            />
          )}

          {activeTab === 'ai' && (
            <GeminiAssistant />
          )}

          {activeTab === 'integration' && (
            <GoogleSheetsIntegration activities={activities} />
          )}

          {activeTab === 'admin' && (
            <AdminSettings
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetAllData={handleResetAllData}
              onResetSettingsOnly={handleResetSettingsOnly}
            />
          )}

        </main>
      </div>
    </div>
  );
}
