import { useState, useEffect } from 'react';
import { ActivityLog } from './types';
import { INITIAL_ACTIVITIES } from './data';
import Dashboard from './components/Dashboard';
import ActivityForm from './components/ActivityForm';
import ActivityList from './components/ActivityList';
import PictorialReport from './components/PictorialReport';
import GoogleSheetsIntegration from './components/GoogleSheetsIntegration';
import GeminiAssistant from './components/GeminiAssistant';
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
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityLog | null>(null);
  
  // Mobile navigation drawer toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load activities from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lapor_pbd_activities');
    if (saved) {
      try {
        setActivities(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved activities, falling back to defaults', e);
        setActivities(INITIAL_ACTIVITIES);
      }
    } else {
      setActivities(INITIAL_ACTIVITIES);
      localStorage.setItem('lapor_pbd_activities', JSON.stringify(INITIAL_ACTIVITIES));
    }
  }, []);

  // Save changes to state and local storage
  const handleSaveActivity = (newActivity: ActivityLog) => {
    let updated: ActivityLog[];
    
    // Check if we are updating an existing activity
    const exists = activities.some(act => act.id === newActivity.id);
    if (exists) {
      updated = activities.map(act => act.id === newActivity.id ? newActivity : act);
    } else {
      updated = [newActivity, ...activities];
    }

    setActivities(updated);
    localStorage.setItem('lapor_pbd_activities', JSON.stringify(updated));
    
    // Reset state and redirect
    setEditingActivity(null);
    setSelectedActivity(null);
    setActiveTab('list');
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete activity
  const handleDeleteActivity = (id: string) => {
    const updated = activities.filter(act => act.id !== id);
    setActivities(updated);
    localStorage.setItem('lapor_pbd_activities', JSON.stringify(updated));
    
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
                <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase block mt-1">BM & BI SKBT</span>
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
              LaporPBD v1.2.0 • SKBT 2026
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
        <main className="flex-1 min-w-0 p-5 md:p-8 overflow-y-auto max-h-[100vh] print:p-0 print:overflow-visible">
          
          {/* Main conditional views router */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              activities={activities} 
              onNavigate={handleTabChange} 
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
            />
          )}

          {activeTab === 'report' && selectedActivity && (
            <PictorialReport
              activity={selectedActivity}
              onBack={() => handleTabChange('list')}
            />
          )}

          {activeTab === 'ai' && (
            <GeminiAssistant />
          )}

          {activeTab === 'integration' && (
            <GoogleSheetsIntegration />
          )}

        </main>
      </div>
    </div>
  );
}
