import React, { useState, useEffect } from 'react';
import { type Section } from '../utils/turni';
import clsx from 'clsx';
import { X, Plus, Palette, Users, ListPlus, Banknote, Settings, Download, UploadCloud, Pencil, Check, Cloud, CloudDownload, CloudUpload, LogOut, Globe } from 'lucide-react';
import type { DayAssignment } from '../App';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSquad: string | null;
    dayColor: string;
    nightColor: string;
    skipDayColor: string;
    skipNightColor: string;
    activities: string[];
    paidServiceTypes: string[];
    assignments: Record<string, DayAssignment>;
    onSave: (squad: string | null, dayColor: string, nightColor: string, skipDayColor: string, skipNightColor: string) => void;
    onSaveActivities: (activities: string[]) => void;
    onRenameActivity: (oldName: string, newName: string) => void;
    onSavePaidServiceTypes: (types: string[]) => void;
    onRenamePaidServiceType: (oldName: string, newName: string) => void;
    onExportBackup: () => void;
    onImportBackup: (data: any) => void;

    isGoogleAuth: boolean;
    isSyncing: boolean;
    onCloudLogin: () => void;
    onCloudLogout: () => void;
    onCloudUpload: () => void;
    onCloudDownload: () => void;
}

const SECTIONS: Section[] = ['A', 'B', 'C', 'D'];
const SKIPS = [1, 2, 3, 4, 5, 6, 7, 8];

const DEFAULT_DAY_COLOR = '#ef4444'; // red-500
const DEFAULT_NIGHT_COLOR = '#3b82f6'; // blue-500
const DEFAULT_SKIP_DAY_COLOR = '#d8b4fe'; // light purple
const DEFAULT_SKIP_NIGHT_COLOR = '#7e22ce'; // dark purple

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    currentSquad,
    dayColor,
    nightColor,
    skipDayColor,
    skipNightColor,
    activities,
    paidServiceTypes,
    assignments,
    onSave,
    onSaveActivities,
    onRenameActivity,
    onSavePaidServiceTypes,
    onRenamePaidServiceType,
    onExportBackup,
    onImportBackup,
    isGoogleAuth,
    isSyncing,
    onCloudLogin,
    onCloudLogout,
    onCloudUpload,
    onCloudDownload
}) => {
    const [selectedSquad, setSelectedSquad] = useState<string | null>(currentSquad);
    const [selectedDayColor, setSelectedDayColor] = useState(dayColor);
    const [selectedNightColor, setSelectedNightColor] = useState(nightColor);
    const [selectedSkipDayColor, setSelectedSkipDayColor] = useState(skipDayColor || DEFAULT_SKIP_DAY_COLOR);
    const [selectedSkipNightColor, setSelectedSkipNightColor] = useState(skipNightColor || DEFAULT_SKIP_NIGHT_COLOR);

    const [newActivity, setNewActivity] = useState('');
    const [newPaidType, setNewPaidType] = useState('');

    // Editing State
    const [editingActivity, setEditingActivity] = useState<{ index: number, value: string } | null>(null);
    const [editingPaidType, setEditingPaidType] = useState<{ index: number, value: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedSquad(currentSquad);
            setSelectedDayColor(dayColor);
            setSelectedNightColor(nightColor);
            setSelectedSkipDayColor(skipDayColor || DEFAULT_SKIP_DAY_COLOR);
            setSelectedSkipNightColor(skipNightColor || DEFAULT_SKIP_NIGHT_COLOR);
            setEditingActivity(null);
            setEditingPaidType(null);
        }
    }, [currentSquad, dayColor, nightColor, skipDayColor, skipNightColor, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(selectedSquad, selectedDayColor, selectedNightColor, selectedSkipDayColor, selectedSkipNightColor);
        onClose();
    };

    const handleClear = () => {
        if (confirm('Sei sicuro di voler resettare tutti i dati? Questa azione è irreversibile.')) {
            setSelectedSquad(null);
            onSave(null, DEFAULT_DAY_COLOR, DEFAULT_NIGHT_COLOR, DEFAULT_SKIP_DAY_COLOR, DEFAULT_SKIP_NIGHT_COLOR);
            onClose();
        }
    }

    const handleAddActivity = () => {
        if (newActivity.trim()) {
            onSaveActivities([...activities, newActivity.trim()]);
            setNewActivity('');
        }
    };

    const handeAddPaidType = () => {
        if (newPaidType.trim()) {
            onSavePaidServiceTypes([...paidServiceTypes, newPaidType.trim()]);
            setNewPaidType('');
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                onImportBackup(data);
                alert('Backup importato con successo!');
                onClose();
            } catch (err) {
                alert('Errore durante l\'importazione del file. Assicurati che sia un file .turnariovf valido.');
            }
        };
        reader.readAsText(file);
    };

    const isActivityInUse = (name: string) => {
        return Object.values(assignments).some(a => a.activity === name);
    };

    const isPaidTypeInUse = (name: string) => {
        return Object.values(assignments).some(a => a.paidServiceType === name);
    };

    const handleStartEditActivity = (index: number, value: string) => {
        setEditingActivity({ index, value });
    };

    const handleConfirmEditActivity = () => {
        if (editingActivity && editingActivity.value.trim() && editingActivity.value !== activities[editingActivity.index]) {
            onRenameActivity(activities[editingActivity.index], editingActivity.value.trim());
        }
        setEditingActivity(null);
    }

    const handleStartEditPaidType = (index: number, value: string) => {
        setEditingPaidType({ index, value });
    }

    const handleConfirmEditPaidType = () => {
        if (editingPaidType && editingPaidType.value.trim() && editingPaidType.value !== paidServiceTypes[editingPaidType.index]) {
            onRenamePaidServiceType(paidServiceTypes[editingPaidType.index], editingPaidType.value.trim());
        }
        setEditingPaidType(null);
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col border border-white/20 dark:border-slate-800/50">
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-vvf text-white rounded-2xl shadow-lg shadow-vvf/20">
                            <Settings size={22} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Impostazioni</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10 custom-scrollbar">

                    {/* Squad Selection */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <Users size={18} className="text-vvf" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">1. Seleziona Salto/Squadra</h3>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {SECTIONS.map(section => (
                                <div key={section} className="flex flex-col gap-2">
                                    <div className="text-center text-[10px] font-black text-slate-300 mb-1">{section}</div>
                                    {SKIPS.map(skip => {
                                        const squad = `${section}${skip}`;
                                        const isSelected = selectedSquad === squad;
                                        return (
                                            <button
                                                key={squad}
                                                onClick={() => setSelectedSquad(squad)}
                                                className={clsx(
                                                    "py-3 px-1 text-xs font-black rounded-xl transition-all border-2",
                                                    isSelected
                                                        ? "bg-vvf text-white border-vvf shadow-xl shadow-vvf/20 scale-105 z-10"
                                                        : "bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800 hover:border-vvf/50 hover:bg-white dark:hover:bg-slate-800 shadow-inner"
                                                )}
                                            >
                                                {squad}
                                            </button>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Color Customization */}
                    <section className={clsx("transition-all duration-500", !selectedSquad ? "opacity-30 grayscale pointer-events-none" : "opacity-100")}>
                        <div className="flex items-center gap-3 mb-6">
                            <Palette size={18} className="text-emerald-500" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">2. Personalizza Colori</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Turni Effettivi</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Giorno</label>
                                        <input type="color" value={selectedDayColor} onChange={(e) => setSelectedDayColor(e.target.value)} className="w-12 h-10 rounded-xl cursor-pointer bg-transparent" />
                                    </div>
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Notte</label>
                                        <input type="color" value={selectedNightColor} onChange={(e) => setSelectedNightColor(e.target.value)} className="w-12 h-10 rounded-xl cursor-pointer bg-transparent" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Salti (Riposo)</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Giorno</label>
                                        <input type="color" value={selectedSkipDayColor} onChange={(e) => setSelectedSkipDayColor(e.target.value)} className="w-12 h-10 rounded-xl cursor-pointer bg-transparent" />
                                    </div>
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Notte</label>
                                        <input type="color" value={selectedSkipNightColor} onChange={(e) => setSelectedSkipNightColor(e.target.value)} className="w-12 h-10 rounded-xl cursor-pointer bg-transparent" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Activity Management */}
                    <section className="border-t border-slate-100 dark:border-slate-800/50 pt-10">
                        <div className="flex items-center gap-3 mb-6">
                            <ListPlus size={18} className="text-vvf" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">3. Gestione Attività</h3>
                        </div>
                        <div className="flex gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Nuova attività (es. Ferie)..."
                                className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white text-sm font-bold focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                                value={newActivity}
                                onChange={(e) => setNewActivity(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                            />
                            <button
                                onClick={handleAddActivity}
                                className="px-6 bg-vvf text-white rounded-2xl hover:bg-vvfHover transition-all shadow-lg shadow-vvf/20 active:scale-95"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {activities.map((activity, index) => {
                                const inUse = isActivityInUse(activity);
                                const isEditing = editingActivity?.index === index;

                                return (
                                    <div key={index} className="flex items-center gap-2 pl-4 pr-2 py-2 bg-vvf/5 text-vvf rounded-2xl text-[11px] font-black uppercase tracking-widest border border-vvf/10 shadow-sm animate-fade-in group">
                                        {isEditing ? (
                                            <input
                                                autoFocus
                                                className="bg-transparent border-b border-vvf focus:outline-none w-24 text-vvf"
                                                value={editingActivity.value}
                                                onChange={(e) => setEditingActivity({ ...editingActivity, value: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmEditActivity()}
                                                onBlur={handleConfirmEditActivity}
                                            />
                                        ) : (
                                            <span>{activity}</span>
                                        )}

                                        <div className="flex items-center gap-1 ml-1">
                                            {isEditing ? (
                                                <button onClick={handleConfirmEditActivity} className="p-1 hover:bg-vvf hover:text-white rounded-lg transition-all">
                                                    <Check size={14} />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleStartEditActivity(index, activity)} className="p-1 hover:bg-vvf hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                    <Pencil size={14} />
                                                </button>
                                            )}

                                            {!inUse && !isEditing && (
                                                <button
                                                    onClick={() => onSaveActivities(activities.filter((_, i) => i !== index))}
                                                    className="p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                    title="Elimina attività"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                            {inUse && !isEditing && (
                                                <div className="p-1.5 text-slate-300 cursor-help" title="In uso nel calendario - impossibile eliminare">
                                                    <X size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Paid Service Tipologies */}
                    <section className="border-t border-slate-100 dark:border-slate-800/50 pt-10">
                        <div className="flex items-center gap-3 mb-6">
                            <Banknote size={18} className="text-amber-500" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">4. Tipologie Servizi PAG</h3>
                        </div>
                        <div className="flex gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Nuova tipologia (es. Vigilanza)..."
                                className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white text-sm font-bold focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                                value={newPaidType}
                                onChange={(e) => setNewPaidType(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handeAddPaidType()}
                            />
                            <button
                                onClick={handeAddPaidType}
                                className="px-6 bg-amber-600 text-white rounded-2xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {paidServiceTypes.map((type, index) => {
                                const inUse = isPaidTypeInUse(type);
                                const isEditing = editingPaidType?.index === index;

                                return (
                                    <div key={index} className="flex items-center gap-2 pl-4 pr-2 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-500/20 shadow-sm animate-fade-in group">
                                        {isEditing ? (
                                            <input
                                                autoFocus
                                                className="bg-transparent border-b border-amber-500 focus:outline-none w-24 text-amber-700 dark:text-amber-400"
                                                value={editingPaidType.value}
                                                onChange={(e) => setEditingPaidType({ ...editingPaidType, value: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmEditPaidType()}
                                                onBlur={handleConfirmEditPaidType}
                                            />
                                        ) : (
                                            <span>{type}</span>
                                        )}

                                        <div className="flex items-center gap-1 ml-1">
                                            {isEditing ? (
                                                <button onClick={handleConfirmEditPaidType} className="p-1 hover:bg-amber-600 hover:text-white rounded-lg transition-all">
                                                    <Check size={14} />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleStartEditPaidType(index, type)} className="p-1 hover:bg-amber-600 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                    <Pencil size={14} />
                                                </button>
                                            )}

                                            {!inUse && !isEditing && (
                                                <button
                                                    onClick={() => onSavePaidServiceTypes(paidServiceTypes.filter((_, i) => i !== index))}
                                                    className="p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                    title="Elimina tipologia"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                            {inUse && !isEditing && (
                                                <div className="p-1.5 text-slate-300 cursor-help" title="In uso nel calendario - impossibile eliminare">
                                                    <X size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Backup & Restore */}
                    <section className="border-t border-slate-100 dark:border-slate-800/50 pt-10">
                        <div className="flex items-center gap-3 mb-6">
                            <Download size={18} className="text-blue-500" />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">5. Backup e Ripristino</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={onExportBackup}
                                className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-xs font-black uppercase tracking-widest"
                            >
                                <Download size={20} />
                                Esporta Backup
                            </button>
                            <label className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-xs font-black uppercase tracking-widest cursor-pointer">
                                <UploadCloud size={20} />
                                Importa Backup
                                <input
                                    type="file"
                                    accept=".turnariovf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        <p className="mt-4 text-center text-[10px] text-slate-400 font-medium">
                            Usa questi strumenti per trasferire i tuoi dati su un altro browser o dispositivo.
                        </p>
                    </section>

                    {/* Google Drive Cloud Backup */}
                    <section className="border-t border-slate-100 dark:border-slate-800/50 pt-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Globe size={18} className="text-blue-400" />
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">6. Cloud Backup (Google Drive)</h3>
                            </div>
                            {isGoogleAuth && (
                                <button
                                    onClick={onCloudLogout}
                                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                >
                                    <LogOut size={14} />
                                    Logout
                                </button>
                            )}
                        </div>

                        {!isGoogleAuth ? (
                            <button
                                onClick={onCloudLogin}
                                className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-white dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-200 rounded-3xl transition-all active:scale-[0.98] group"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-sm font-black uppercase tracking-widest group-hover:text-blue-500">Accedi con Google</span>
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={onCloudUpload}
                                        disabled={isSyncing}
                                        className={clsx(
                                            "flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-xs font-black uppercase tracking-widest",
                                            isSyncing && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <CloudUpload size={20} className={isSyncing ? "animate-pulse" : ""} />
                                        {isSyncing ? 'Sincronizzazione...' : 'Sincronizza su Cloud'}
                                    </button>
                                    <button
                                        onClick={onCloudDownload}
                                        disabled={isSyncing}
                                        className={clsx(
                                            "flex items-center justify-center gap-3 px-6 py-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 text-xs font-black uppercase tracking-widest",
                                            isSyncing && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <CloudDownload size={20} className={isSyncing ? "animate-pulse" : ""} />
                                        {isSyncing ? 'Scaricamento...' : 'Ripristina da Cloud'}
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-tight bg-emerald-500/5 py-2 rounded-xl border border-emerald-500/10">
                                    <Cloud size={14} />
                                    Connesso a Google Drive
                                </div>
                            </div>
                        )}
                        <p className="mt-4 text-center text-[10px] text-slate-400 font-medium">
                            I tuoi dati verranno salvati in modo sicuro e privato sul tuo Google Drive.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end gap-4 border-t border-slate-100 dark:border-slate-800/50 backdrop-blur-md">
                    <button
                        onClick={handleClear}
                        className="px-8 py-3.5 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all active:scale-95"
                    >
                        Reset Totale
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-10 py-3.5 text-xs font-black text-white bg-vvf hover:bg-vvfHover rounded-2xl shadow-xl shadow-vvf/30 transition-all active:scale-95 hover:shadow-vvf/40 uppercase tracking-[0.2em]"
                    >
                        Salva Cambiamenti
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
