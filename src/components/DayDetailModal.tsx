import React, { useState, useEffect } from 'react';
import { X, Clock, FileText, CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { type DayAssignment } from '../App';

interface DayDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    activities: string[];
    paidServiceTypes: string[];
    currentAssignment: DayAssignment | null;
    onSave: (assignment: DayAssignment | null) => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({
    isOpen,
    onClose,
    date,
    activities,
    paidServiceTypes,
    currentAssignment,
    onSave
}) => {
    const [assignment, setAssignment] = useState<DayAssignment>({
        activity: null,
        isOvertime: false,
        isPaidService: false,
        paidServiceType: null,
        startTime: '',
        endTime: '',
        notes: '',
        isOvertimePaid: false,
        isPaidServicePaid: false
    });

    useEffect(() => {
        if (currentAssignment) {
            setAssignment({
                ...currentAssignment,
                isOvertimePaid: currentAssignment.isOvertimePaid ?? false,
                isPaidServicePaid: currentAssignment.isPaidServicePaid ?? false
            });
        } else {
            setAssignment({
                activity: null,
                isOvertime: false,
                isPaidService: false,
                paidServiceType: null,
                startTime: '',
                endTime: '',
                notes: '',
                isOvertimePaid: false,
                isPaidServicePaid: false
            });
        }
    }, [currentAssignment, isOpen]);

    if (!isOpen || !date) return null;

    const handleSave = () => {
        const isEmpty = !assignment.activity && !assignment.isOvertime && !assignment.isPaidService && !assignment.notes;
        onSave(isEmpty ? null : assignment);
        onClose();
    };

    const toggleOvertime = () => setAssignment(prev => ({ ...prev, isOvertime: !prev.isOvertime }));
    const togglePaidService = () => setAssignment(prev => ({ ...prev, isPaidService: !prev.isPaidService }));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col border border-white/20 dark:border-slate-800/50">
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize leading-tight tracking-tight">
                            {format(date, 'EEEE d MMMM', { locale: it })}
                        </h2>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configurazione Giornata</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10 custom-scrollbar">

                    {/* Main Activity */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle2 size={18} className="text-blue-500" />
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Attività Principale</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {activities.map(act => (
                                <button
                                    key={act}
                                    onClick={() => setAssignment(prev => ({ ...prev, activity: prev.activity === act ? null : act }))}
                                    className={clsx(
                                        "px-5 py-3 text-xs font-black rounded-xl border-2 uppercase tracking-widest transition-all active:scale-95",
                                        assignment.activity === act
                                            ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/30"
                                            : "bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500/50 shadow-inner"
                                    )}
                                >
                                    {act}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Flags */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <Clock size={18} className="text-blue-500" />
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Opzioni Extra</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <button
                                    onClick={toggleOvertime}
                                    className={clsx(
                                        "w-full flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all gap-3 relative shadow-sm",
                                        assignment.isOvertime
                                            ? "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 shadow-xl shadow-red-500/10"
                                            : "bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 text-slate-400 grayscale"
                                    )}
                                >
                                    <Clock size={28} className={assignment.isOvertime ? "animate-pulse" : ""} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Straordinario</span>
                                    {assignment.isOvertime && <div className="absolute top-4 right-4 text-red-500"><CheckCircle2 size={16} /></div>}
                                </button>
                                {assignment.isOvertime && (
                                    <button
                                        onClick={() => setAssignment(prev => ({ ...prev, isOvertimePaid: !prev.isOvertimePaid }))}
                                        className={clsx(
                                            "w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 flex items-center justify-center gap-2 transition-all active:scale-95",
                                            assignment.isOvertimePaid
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400"
                                        )}
                                    >
                                        {assignment.isOvertimePaid ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                        Pagato
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={togglePaidService}
                                    className={clsx(
                                        "w-full flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all gap-3 relative shadow-sm",
                                        assignment.isPaidService
                                            ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-xl shadow-amber-500/10"
                                            : "bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 text-slate-400 grayscale"
                                    )}
                                >
                                    <FileText size={28} className={assignment.isPaidService ? "animate-pulse" : ""} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Servizio PAG</span>
                                    {assignment.isPaidService && <div className="absolute top-4 right-4 text-amber-500"><CheckCircle2 size={16} /></div>}
                                </button>
                                {assignment.isPaidService && (
                                    <button
                                        onClick={() => setAssignment(prev => ({ ...prev, isPaidServicePaid: !prev.isPaidServicePaid }))}
                                        className={clsx(
                                            "w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 flex items-center justify-center gap-2 transition-all active:scale-95",
                                            assignment.isPaidServicePaid
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400"
                                        )}
                                    >
                                        {assignment.isPaidServicePaid ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                        Incassato
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Conditional Details (Times & Notes) */}
                    {(assignment.isOvertime || assignment.isPaidService) && (
                        <section className="space-y-10 animate-fade-in bg-slate-50/50 dark:bg-slate-950/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-inner">

                            {assignment.isPaidService && paidServiceTypes.length > 0 && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tipologia Servizio PAG</label>
                                    <div className="flex flex-wrap gap-2">
                                        {paidServiceTypes.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setAssignment(prev => ({ ...prev, paidServiceType: type }))}
                                                className={clsx(
                                                    "px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all",
                                                    assignment.paidServiceType === type
                                                        ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-500/20"
                                                        : "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40 hover:border-amber-400 shadow-sm"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ora Inizio</label>
                                    <input
                                        type="time"
                                        value={assignment.startTime}
                                        onChange={(e) => setAssignment(prev => ({ ...prev, startTime: e.target.value }))}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950/50 text-slate-900 dark:text-white font-black text-lg focus:outline-none focus:border-vvf transition-all shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ora Fine</label>
                                    <input
                                        type="time"
                                        value={assignment.endTime}
                                        onChange={(e) => setAssignment(prev => ({ ...prev, endTime: e.target.value }))}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950/50 text-slate-900 dark:text-white font-black text-lg focus:outline-none focus:border-vvf transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Notes - Always visible */}
                    <section>
                        <div className="flex items-center gap-3 mb-4 px-1">
                            <FileText size={16} className="text-slate-400" />
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Note / Descrizione</label>
                        </div>
                        <textarea
                            rows={3}
                            value={assignment.notes}
                            onChange={(e) => setAssignment(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Aggiungi dettagli sulle attività del giorno..."
                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-vvf transition-all shadow-inner resize-none"
                        />
                    </section>

                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between gap-4 border-t border-slate-100 dark:border-slate-800/50 backdrop-blur-md">
                    <button
                        onClick={() => { onSave(null); onClose(); }}
                        className="px-6 py-3.5 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all active:scale-95"
                    >
                        Svuota Data
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-10 py-3.5 text-[10px] font-black text-white bg-vvf hover:bg-vvfHover rounded-2xl shadow-xl shadow-vvf/30 transition-all active:scale-95 hover:shadow-vvf/40 uppercase tracking-[0.2em]"
                    >
                        Salva Dati
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DayDetailModal;
