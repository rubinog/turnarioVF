import { useState, useEffect } from 'react'

declare const __APP_VERSION__: string;
import Calendar from './components/Calendar'
import SettingsModal from './components/SettingsModal'
import DayDetailModal from './components/DayDetailModal'
import ViewFilters from './components/ViewFilters'
import ReportPage from './components/ReportPage'
import OvertimePage from './components/OvertimePage'
import PaidServicesPage from './components/PaidServicesPage'
import { Settings, Calendar as CalendarIcon, FileBarChart, Clock, Banknote } from 'lucide-react'
import clsx from 'clsx'
import { getYear, getMonth } from 'date-fns'
import * as GoogleDriveService from './services/GoogleDriveService'

const DEFAULT_DAY_COLOR = '#a90708'; // VVF Red
const DEFAULT_NIGHT_COLOR = '#3b82f6'; // blue-500
const DEFAULT_SKIP_DAY_COLOR = '#d8b4fe'; // light purple
const DEFAULT_SKIP_NIGHT_COLOR = '#7e22ce'; // dark purple

export interface DayAssignment {
  activity: string | null;
  isOvertime: boolean;
  isPaidService: boolean;
  paidServiceType: string | null;
  startTime: string;
  endTime: string;
  notes: string;
  isOvertimePaid?: boolean;
  isPaidServicePaid?: boolean;
}

type View = 'calendar' | 'report' | 'overtime' | 'paid-services';

function App() {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filter State
  const [filterYear, setFilterYear] = useState<number>(getYear(new Date()));
  const [filterMonth, setFilterMonth] = useState<number | 'all'>(getMonth(new Date()));

  // Settings State
  const [userSquad, setUserSquad] = useState<string | null>(() => localStorage.getItem('userSquad'));
  const [dayColor, setDayColor] = useState<string>(() => localStorage.getItem('dayColor') || DEFAULT_DAY_COLOR);
  const [nightColor, setNightColor] = useState<string>(() => localStorage.getItem('nightColor') || DEFAULT_NIGHT_COLOR);
  const [skipDayColor, setSkipDayColor] = useState<string>(() => localStorage.getItem('skipDayColor') || DEFAULT_SKIP_DAY_COLOR);
  const [skipNightColor, setSkipNightColor] = useState<string>(() => localStorage.getItem('skipNightColor') || DEFAULT_SKIP_NIGHT_COLOR);

  // Activities State
  const [activities, setActivities] = useState<string[]>(() => {
    const saved = localStorage.getItem('customActivities');
    return saved ? JSON.parse(saved) : [];
  });

  // Paid Service Types
  const [paidServiceTypes, setPaidServiceTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('paidServiceTypes');
    return saved ? JSON.parse(saved) : [];
  });

  // Assignments State
  const [assignments, setAssignments] = useState<Record<string, DayAssignment>>(() => {
    const saved = localStorage.getItem('calendarAssignmentsV2');
    return saved ? JSON.parse(saved) : {};
  });

  // Modal State for Assignment
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Cloud Backup State
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initialize Google scripts on mount
    const init = () => {
      if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
        GoogleDriveService.initGoogleScripts(() => {
          // Check if already has token (doesn't work across refresh with GIS without storage but let's see)
        });
      } else {
        setTimeout(init, 500);
      }
    };
    init();
  }, []);

  const handleSaveActivities = (newActivities: string[]) => {
    setActivities(newActivities);
    localStorage.setItem('customActivities', JSON.stringify(newActivities));
  };

  const handleRenameActivity = (oldName: string, newName: string) => {
    // Aggiorna l'elenco attività
    const newActivities = activities.map(a => a === oldName ? newName : a);
    setActivities(newActivities);
    localStorage.setItem('customActivities', JSON.stringify(newActivities));

    // Aggiorna tutti gli assignments che usano questa attività
    const newAssignments = { ...assignments };
    let changed = false;
    Object.keys(newAssignments).forEach(date => {
      if (newAssignments[date].activity === oldName) {
        newAssignments[date] = { ...newAssignments[date], activity: newName };
        changed = true;
      }
    });

    if (changed) {
      setAssignments(newAssignments);
      localStorage.setItem('calendarAssignmentsV2', JSON.stringify(newAssignments));
    }
  };

  const handleSavePaidServiceTypes = (newTypes: string[]) => {
    setPaidServiceTypes(newTypes);
    localStorage.setItem('paidServiceTypes', JSON.stringify(newTypes));
  };

  const handleRenamePaidServiceType = (oldName: string, newName: string) => {
    // Aggiorna l'elenco tipologie
    const newTypes = paidServiceTypes.map(t => t === oldName ? newName : t);
    setPaidServiceTypes(newTypes);
    localStorage.setItem('paidServiceTypes', JSON.stringify(newTypes));

    // Aggiorna tutti gli assignments che usano questa tipologia
    const newAssignments = { ...assignments };
    let changed = false;
    Object.keys(newAssignments).forEach(date => {
      if (newAssignments[date].paidServiceType === oldName) {
        newAssignments[date] = { ...newAssignments[date], paidServiceType: newName };
        changed = true;
      }
    });

    if (changed) {
      setAssignments(newAssignments);
      localStorage.setItem('calendarAssignmentsV2', JSON.stringify(newAssignments));
    }
  };

  const handleSaveSettings = (squad: string | null, dColor: string, nColor: string, sDayColor: string, sNightColor: string) => {
    setUserSquad(squad);
    setDayColor(dColor);
    setNightColor(nColor);
    setSkipDayColor(sDayColor);
    setSkipNightColor(sNightColor);

    if (squad) {
      localStorage.setItem('userSquad', squad);
      localStorage.setItem('dayColor', dColor);
      localStorage.setItem('nightColor', nColor);
      localStorage.setItem('skipDayColor', sDayColor);
      localStorage.setItem('skipNightColor', sNightColor);
    } else {
      localStorage.setItem('userSquad', '');
      localStorage.removeItem('userSquad');
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDetailModalOpen(true);
  };

  const handleSaveAssignment = (assignment: DayAssignment | null) => {
    if (!selectedDate) return;

    const dateKey = selectedDate.toISOString().split('T')[0];
    const newAssignments = { ...assignments };

    if (assignment) {
      newAssignments[dateKey] = assignment;
    } else {
      delete newAssignments[dateKey];
    }

    setAssignments(newAssignments);
    localStorage.setItem('calendarAssignmentsV2', JSON.stringify(newAssignments));
  }

  const handleTogglePayment = (dateKey: string, field: 'isOvertimePaid' | 'isPaidServicePaid', value: boolean) => {
    const newAssignments = { ...assignments };
    if (newAssignments[dateKey]) {
      newAssignments[dateKey] = { ...newAssignments[dateKey], [field]: value };
      setAssignments(newAssignments);
      localStorage.setItem('calendarAssignmentsV2', JSON.stringify(newAssignments));
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      userSquad: localStorage.getItem('userSquad'),
      dayColor: localStorage.getItem('dayColor'),
      nightColor: localStorage.getItem('nightColor'),
      skipDayColor: localStorage.getItem('skipDayColor'),
      skipNightColor: localStorage.getItem('skipNightColor'),
      customActivities: localStorage.getItem('customActivities'),
      paidServiceTypes: localStorage.getItem('paidServiceTypes'),
      calendarAssignmentsV2: localStorage.getItem('calendarAssignmentsV2'),
      exportDate: new Date().toISOString(),
      version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Formato data: YYYYMMDD_HHMM
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${year}${month}${day}_${hours}${minutes}`;

    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${timestamp}.turnariovf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (data: any) => {
    if (!data) return;

    const keys = [
      'userSquad',
      'dayColor',
      'nightColor',
      'skipDayColor',
      'skipNightColor',
      'customActivities',
      'paidServiceTypes',
      'calendarAssignmentsV2'
    ];

    keys.forEach(key => {
      if (data[key] !== undefined) {
        if (data[key] === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, data[key]);
        }
      }
    });

    // Ricarica la pagina per applicare tutti i cambiamenti
    window.location.reload();
  };

  const handleCloudLogin = async () => {
    try {
      await GoogleDriveService.login();
      setIsGoogleAuth(true);
    } catch (err) {
      console.error('Google Login Error:', err);
      alert('Errore durante l\'accesso a Google');
    }
  };

  const handleCloudLogout = () => {
    GoogleDriveService.logout();
    setIsGoogleAuth(false);
  };

  const handleCloudUpload = async () => {
    setIsSyncing(true);
    try {
      const backupData = {
        userSquad: localStorage.getItem('userSquad'),
        dayColor: localStorage.getItem('dayColor'),
        nightColor: localStorage.getItem('nightColor'),
        skipDayColor: localStorage.getItem('skipDayColor'),
        skipNightColor: localStorage.getItem('skipNightColor'),
        customActivities: localStorage.getItem('customActivities'),
        paidServiceTypes: localStorage.getItem('paidServiceTypes'),
        calendarAssignmentsV2: localStorage.getItem('calendarAssignmentsV2'),
        exportDate: new Date().toISOString(),
        version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
      };
      await GoogleDriveService.uploadBackup(JSON.stringify(backupData, null, 2));
      alert('Backup su Cloud completato con successo!');
    } catch (err) {
      console.error('Cloud Upload Error:', err);
      alert('Errore durante il caricamento su Cloud');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudDownload = async () => {
    setIsSyncing(true);
    try {
      const file = await GoogleDriveService.findBackupFile();
      if (!file) {
        alert('Nessun backup trovato su Google Drive');
        return;
      }
      const confirmed = confirm('Questo sovrascriverà tutti i dati locali con quelli presenti su Cloud. Continuare?');
      if (!confirmed) return;

      const content = await GoogleDriveService.downloadBackup(file.id);
      handleImportBackup(JSON.parse(content));
    } catch (err) {
      console.error('Cloud Download Error:', err);
      alert('Errore durante lo scaricamento da Cloud');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] font-sans relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-vvf/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-red-500/10 dark:bg-red-600/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] animate-pulse [animation-delay:4s]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-10 sm:mb-14 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              Turnario <span className="text-vvf">VV.F.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
              Gestione Turni, Straordinari e Servizi a Pagamento
            </p>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="group flex items-center gap-3 px-6 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-slate-700 dark:text-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all border border-white/50 dark:border-slate-700/50 active:scale-95"
          >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-bold">{userSquad ? `Turno: ${userSquad}` : "Impostazioni"}</span>
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav className="fixed bottom-6 left-4 right-4 sm:relative sm:bottom-0 sm:left-0 sm:right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 p-2 rounded-[2.5rem] shadow-2xl sm:shadow-xl flex sm:mb-12 max-w-lg mx-auto sm:max-w-none transition-all">
          {[
            { id: 'calendar', icon: CalendarIcon, label: 'Calendario' },
            { id: 'report', icon: FileBarChart, label: 'Report' },
            { id: 'overtime', icon: Clock, label: 'Straordinari' },
            { id: 'paid-services', icon: Banknote, label: 'PAG' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as View)}
              className={clsx(
                "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 py-3 sm:py-4 px-4 rounded-[2rem] transition-all text-[10px] sm:text-sm font-black uppercase tracking-widest",
                currentView === tab.id
                  ? "bg-vvf text-white shadow-lg shadow-vvf/40 scale-[1.03] z-10"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-vvf dark:hover:text-white"
              )}
            >
              <tab.icon size={20} className={clsx(currentView === tab.id ? "scale-110" : "opacity-70")} />
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="animate-fade-in relative">
          {currentView !== 'calendar' && (
            <ViewFilters
              year={filterYear}
              month={filterMonth}
              onYearChange={setFilterYear}
              onMonthChange={setFilterMonth}
            />
          )}

          <div className="min-h-[600px]">
            {currentView === 'calendar' && (
              <Calendar
                userSquad={userSquad}
                dayColor={dayColor}
                nightColor={nightColor}
                skipDayColor={skipDayColor}
                skipNightColor={skipNightColor}
                assignments={assignments}
                onDayClick={handleDayClick}
              />
            )}

            {currentView === 'report' && (
              <ReportPage assignments={assignments} year={filterYear} month={filterMonth} />
            )}

            {currentView === 'overtime' && (
              <OvertimePage
                assignments={assignments}
                year={filterYear}
                month={filterMonth}
                onTogglePaid={(dateKey, val) => handleTogglePayment(dateKey, 'isOvertimePaid', val)}
              />
            )}

            {currentView === 'paid-services' && (
              <PaidServicesPage
                assignments={assignments}
                year={filterYear}
                month={filterMonth}
                onTogglePaid={(dateKey, val) => handleTogglePayment(dateKey, 'isPaidServicePaid', val)}
              />
            )}
          </div>
        </main>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentSquad={userSquad}
          dayColor={dayColor}
          nightColor={nightColor}
          skipDayColor={skipDayColor}
          skipNightColor={skipNightColor}

          activities={activities}
          paidServiceTypes={paidServiceTypes}
          assignments={assignments}
          onSave={handleSaveSettings}
          onSaveActivities={handleSaveActivities}
          onRenameActivity={handleRenameActivity}
          onSavePaidServiceTypes={handleSavePaidServiceTypes}
          onRenamePaidServiceType={handleRenamePaidServiceType}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}

          isGoogleAuth={isGoogleAuth}
          isSyncing={isSyncing}
          onCloudLogin={handleCloudLogin}
          onCloudLogout={handleCloudLogout}
          onCloudUpload={handleCloudUpload}
          onCloudDownload={handleCloudDownload}
        />

        <DayDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          date={selectedDate}
          activities={activities}
          paidServiceTypes={paidServiceTypes}
          currentAssignment={selectedDate ? assignments[selectedDate.toISOString().split('T')[0]] : null}
          onSave={handleSaveAssignment}
        />

        <footer className="mt-20 text-center text-[10px] text-slate-400 dark:text-slate-600 mb-28 sm:mb-8 font-medium">
          <p>Turnario Vigili del Fuoco • 2026</p>
          <p className="mt-1 opacity-50">Sviluppato con ♥ per i Vigili del Fuoco</p>
          <p className="mt-1 opacity-50">Versione {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}</p>
        </footer>
      </div>
    </div >
  )
}

export default App
