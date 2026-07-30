import { useState, useEffect } from 'react';
import { ActivityLog, AppSettings } from './types';
import {
  muatTetapan,
  simpanTetapan,
  tetapanLalai,
  KUNCI_TETAPAN
} from './lib/settingsStore';
import { migrateInlineImages, deletePhotos, clearPhotos } from './lib/photoStore';
import {
  deleteFromSheets,
  syncActivity,
  fetchAllFromSheets,
  mergeRecords,
  getWebAppUrl,
  getAdminToken
} from './lib/sheetsSync';
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
  CloudOff,
  Loader
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

  /*
   * Tetapan dimuatkan melalui muatTetapan(), yang turut menjalankan migrasi
   * skema. Guru yang pernah membuka versi terdahulu mempunyai senarai kelas
   * rekaan dalam localStorage; tanpa migrasi, kod baharu tidak akan pernah
   * mengubah apa yang mereka lihat.
   */
  const [settings, setSettings] = useState<AppSettings>(() => muatTetapan());

  // Tulis kembali hasil migrasi supaya ia berlaku sekali sahaja, bukan pada
  // setiap kali aplikasi dibuka.
  useEffect(() => {
    simpanTetapan(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    simpanTetapan(newSettings);
  };

  const handleResetAllData = () => {
    localStorage.removeItem('lapor_pbd_activities');
    localStorage.removeItem(KUNCI_TETAPAN);
    void clearPhotos(); // buang juga gambar dalam IndexedDB
    setActivities([]);
    const lalai = tetapanLalai();
    setSettings(lalai);
    persistActivities([]);
    simpanTetapan(lalai);
    setActiveTab('dashboard');
  };

  const handleResetSettingsOnly = () => {
    /*
     * Senarai induk murid TIDAK dibuang di sini.
     *
     * "Set semula tetapan" bermaksud memulihkan senarai pilihan dan jadual
     * kepada nilai sekolah — bukan memadam kerja memasukkan beratus nama
     * murid, yang mengambil masa jauh lebih lama untuk dibina semula
     * berbanding tetapan lain. Padam penuh tersedia melalui set semula kilang.
     */
    const lalai = { ...tetapanLalai(), studentRoster: settings.studentRoster ?? [] };
    setSettings(lalai);
    simpanTetapan(lalai);
  };
  
  // Mobile navigation drawer toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /** Status penyegerakan awan yang sedang berjalan, dipaparkan sebagai toast. */
  const [syncState, setSyncState] = useState<{
    status: 'idle' | 'syncing' | 'ok' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  // Toast kejayaan hilang sendiri; ralat kekal sehingga ditutup pengguna
  // supaya kegagalan penyegerakan tidak terlepas pandang.
  useEffect(() => {
    if (syncState.status !== 'ok') return;
    const t = setTimeout(() => setSyncState({ status: 'idle', message: '' }), 4000);
    return () => clearTimeout(t);
  }, [syncState]);

  // Load activities from localStorage on mount, memindahkan gambar base64
  // lama ke IndexedDB supaya kuota localStorage tidak lagi menjadi halangan.
  useEffect(() => {
    const saved = localStorage.getItem('lapor_pbd_activities');
    if (!saved) {
      setActivities([]);
      persistActivities([]);
      return;
    }

    let dimuat: ActivityLog[];
    try {
      dimuat = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved activities, falling back to defaults', e);
      setActivities([]);
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

  /*
   * Muat turun rekod daripada Google Sheets semasa aplikasi dibuka.
   *
   * Penyegerakan dahulunya sehala: rekod naik ke Sheet, tetapi guru yang
   * membuka sistem pada telefon melihat senarai kosong kerana aplikasi hanya
   * membaca localStorage peranti itu sendiri. Sheet mengandungi sumbangan
   * semua guru, jadi ia perlu dimuatkan pada setiap peranti.
   */
  useEffect(() => {
    if (!getWebAppUrl()) return;

    let dibatalkan = false;
    setSyncState({ status: 'syncing', message: 'Memuatkan rekod daripada Google Sheets…' });

    fetchAllFromSheets()
      .then(hasil => {
        if (dibatalkan) return;

        if (!hasil.ok) {
          setSyncState({ status: 'error', message: `Gagal memuatkan rekod: ${hasil.message}` });
          return;
        }

        setActivities(semasa => {
          const { hasil: gabung, baharu } = mergeRecords(semasa, hasil.records);
          if (baharu > 0) persistActivities(gabung);

          setSyncState(
            baharu > 0
              ? { status: 'ok', message: `${baharu} rekod dimuat turun daripada Google Sheets.` }
              : { status: 'idle', message: '' }
          );
          return gabung;
        });

        // Rekod lama yang disegerakkan sebelum lajur Data_JSON wujud tidak
        // boleh dibina semula. Beritahu pengguna supaya ia boleh dihantar semula.
        if (hasil.skipped > 0) {
          console.warn(
            `[LaporPBD] ${hasil.skipped} baris Sheet dilangkau — disegerakkan sebelum ` +
              'lajur Data_JSON wujud. Hantar semula rekod tersebut dari peranti asalnya.'
          );
        }
      })
      .catch(e => {
        if (!dibatalkan) {
          setSyncState({ status: 'error', message: `Gagal memuatkan rekod: ${e?.message || e}` });
        }
      });

    return () => {
      dibatalkan = true;
    };
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

    /*
     * Segerakkan ke Google Sheets & Drive sebaik sahaja rekod disimpan.
     *
     * Sebelum ini penyegerakan HANYA berlaku apabila pengguna menekan butang
     * "Segerakkan Rekod" dalam tetapan. Guru yang menyimpan laporan menyangka
     * ia sudah masuk ke Sheets, sedangkan ia hanya duduk dalam pelayar —
     * jurang paling merbahaya dalam sistem ini, kerana kegagalannya senyap.
     *
     * Dilangkau tanpa bunyi jika pautan Web App belum ditetapkan; simpanan
     * setempat tidak boleh gagal hanya kerana awan belum dikonfigurasi.
     */
    if (getWebAppUrl()) {
      setSyncState({ status: 'syncing', message: 'Menyegerakkan ke Google Sheets…' });
      syncActivity(newActivity)
        .then(hasil => {
          setSyncState({
            status: hasil.ok ? 'ok' : 'error',
            message: hasil.ok
              ? `Disegerakkan${hasil.photosSaved ? ` · ${hasil.photosSaved} foto ke Drive` : ''}`
              : `Gagal segerak: ${hasil.message}`
          });
        })
        .catch(e =>
          setSyncState({ status: 'error', message: `Gagal segerak: ${e?.message || e}` })
        );
    }

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

    // Bersihkan pemilihan SEBELUM logik awan di bawah, kerana laluan itu
    // mempunyai beberapa titik keluar awal.
    if (selectedActivity && selectedActivity.id === id) setSelectedActivity(null);
    if (editingActivity && editingActivity.id === id) setEditingActivity(null);

    /*
     * Padam juga baris dalam Google Sheets dan folder gambarnya dalam Drive.
     * Tanpa ini, rekod yang dibuang daripada aplikasi kekal selama-lamanya
     * dalam laporan awan.
     */
    if (!dipadam || !getWebAppUrl()) return;

    if (!getAdminToken()) {
      /*
       * Dahulunya keadaan ini dilangkau tanpa sebarang bunyi. Pengguna melihat
       * rekod hilang daripada senarai dan menyangka ia turut dibuang daripada
       * Google Sheets — sedangkan barisnya masih ada di sana. Diam adalah
       * pilihan yang salah apabila jangkaan pengguna dan realiti bercanggah.
       */
      setSyncState({
        status: 'error',
        message:
          'Rekod dipadam pada peranti ini sahaja. Barisnya MASIH ADA dalam ' +
          'Google Sheets kerana token pentadbir belum ditetapkan. ' +
          'Buka Tetapan & Admin → Google Sheets & Drive untuk mengaktifkan padam automatik.'
      });
      return;
    }

    setSyncState({ status: 'syncing', message: 'Memadam daripada Google Sheets & Drive…' });
    deleteFromSheets({
      id: dipadam.id,
      className: dipadam.className,
      date: dipadam.date
    })
      .then(hasil => {
        setSyncState({
          status: hasil.ok ? 'ok' : 'error',
          message: hasil.ok
            ? 'Dipadam daripada Google Sheets & Drive.'
            : `Rekod dipadam pada peranti ini, tetapi GAGAL dipadam daripada Google Sheets: ${hasil.message} — sila padam barisnya secara manual.`
        });
      })
      .catch(e =>
        setSyncState({
          status: 'error',
          message: `Rekod dipadam setempat, tetapi gagal menghubungi Google Sheets: ${e?.message || e}`
        })
      );
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
    { id: 'form', label: 'Rekod Aktiviti Baharu', icon: PlusCircle, aktifBila: ['form'] },
    { id: 'admin', label: 'Tetapan & Admin', icon: Settings, aktifBila: ['admin'] }
  ];


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

          {/*
            Kaki panel — status awan sebenar, dan boleh diklik.
            Sebelum ini ia hanya paparan mati; kini ia membawa terus ke tetapan
            yang perlu diisi, iaitu tindakan yang sememangnya dicari pengguna
            apabila melihat "Belum ditetapkan".
          */}
          <div className="mt-auto space-y-3 pt-5">
            {/*
              Menunjukkan hasil penyegerakan TERAKHIR, bukan "Tersambung" tetap.
              Pautan Web App kini terbina, jadi label sambungan statik akan
              sentiasa hijau dan tidak pernah memberitahu apa-apa yang berguna —
              ia mendakwa keadaan yang tidak pernah disahkan.
            */}
            <button
              onClick={() => handleTabChange('admin')}
              title="Buka tetapan penyelenggaraan"
              className="glass glass-hover flex w-full items-center gap-2.5 p-3 text-left cursor-pointer"
            >
              {syncState.status === 'error' ? (
                <CloudOff className="h-4.5 w-4.5 shrink-0 text-rose-400" />
              ) : (
                <Cloud className="h-4.5 w-4.5 shrink-0 text-lime-core" />
              )}
              <div className="min-w-0 text-[10px] leading-relaxed">
                <span className="block font-bold text-soft">Google Sheets</span>
                <span
                  className={
                    syncState.status === 'error'
                      ? 'text-rose-300'
                      : syncState.status === 'syncing'
                        ? 'text-amber-300'
                        : 'text-lime-core'
                  }
                >
                  {syncState.status === 'error'
                    ? 'Segerak terakhir gagal'
                    : syncState.status === 'syncing'
                      ? 'Menyegerakkan…'
                      : 'Segerak automatik aktif'}
                </span>
              </div>
            </button>

            <p className="text-center font-mono text-[9px] text-faint">{settings.footerText}</p>
          </div>
        </aside>

        {/* Toast status penyegerakan */}
        {syncState.status !== 'idle' && (
          <div
            role="status"
            aria-live="polite"
            className={`glass animate-fade-in fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 p-4 text-xs print:hidden ${
              syncState.status === 'error' ? 'text-rose-300' : 'text-lime-glow'
            }`}
          >
            {syncState.status === 'syncing' ? (
              <Loader className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-lime-core" />
            ) : syncState.status === 'ok' ? (
              <Cloud className="mt-0.5 h-4 w-4 shrink-0 text-lime-core" />
            ) : (
              <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span className="leading-relaxed">{syncState.message}</span>
            {syncState.status === 'error' && (
              <button
                onClick={() => setSyncState({ status: 'idle', message: '' })}
                aria-label="Tutup"
                className="ml-1 shrink-0 rounded p-2 -m-1 text-faint transition-colors hover:text-bright cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

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
                studentRoster={settings.studentRoster}
                catatanMuridPresets={settings.catatanMuridPresets}
                catatanImpakPresets={settings.catatanImpakPresets}
                onOpenAdmin={() => handleTabChange('admin')}
                onAddImpakPreset={(teks) =>
                  handleUpdateSettings({
                    ...settings,
                    catatanImpakPresets: [...(settings.catatanImpakPresets ?? []), teks]
                  })
                }
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
