import React from 'react';
import { format, getYear, getMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { type DayAssignment } from '../App';
import { formatHours } from '../utils/turni';
import { Banknote, CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';

interface PaidServicesPageProps {
    assignments: Record<string, DayAssignment>;
    year: number;
    month: number | 'all';
    onTogglePaid: (dateKey: string, isPaid: boolean) => void;
}

const PaidServicesPage: React.FC<PaidServicesPageProps> = ({ assignments, year, month, onTogglePaid }) => {
    const filteredEntries = Object.entries(assignments)
        .filter(([dateStr, data]) => {
            if (!data.isPaidService) return false;
            const date = new Date(dateStr);
            const yMatch = getYear(date) === year;
            const mMatch = month === 'all' || getMonth(date) === month;
            return yMatch && mMatch;
        })
        .sort((a, b) => a[0].localeCompare(b[0]));

    const calculateHours = (start: string, end: string) => {
        if (!start || !end) return 0;
        try {
            const [h1, m1] = start.split(':').map(Number);
            const [h2, m2] = end.split(':').map(Number);
            let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
            if (diff < 0) diff += 24;
            return diff;
        } catch {
            return 0;
        }
    };

    const totalHours = filteredEntries.reduce((acc, [, data]) => acc + calculateHours(data.startTime, data.endTime), 0);
    const paidHours = filteredEntries
        .filter(([, data]) => data.isPaidServicePaid)
        .reduce((acc, [, data]) => acc + calculateHours(data.startTime, data.endTime), 0);
    const hoursToPay = totalHours - paidHours;

    return (
        <div className="space-y-8 pb-10">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 flex items-center gap-5 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all hover:scale-[1.02]">
                    <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                        <Banknote size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Totale Ore</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{formatHours(totalHours)}</p>
                    </div>
                </div>
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 flex items-center gap-5 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all hover:scale-[1.02]">
                    <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Da Pagare</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{formatHours(hoursToPay)}</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white/20 dark:border-slate-800/50 overflow-hidden">
                <div className="p-8 border-b border-white/20 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20 text-slate-900 dark:text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20">
                            <Banknote size={20} />
                        </div>
                        <h2 className="text-xl font-black tracking-tight">Dettaglio Servizi a Pagamento</h2>
                    </div>
                    <div className="bg-vvf/10 text-vvf px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-vvf/20">
                        {filteredEntries.length} Servizi
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredEntries.map(([dateStr, data]) => {
                        const hours = calculateHours(data.startTime, data.endTime);
                        return (
                            <div key={dateStr} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-10 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col min-w-[100px] bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                                        <span className="text-lg font-black text-slate-900 dark:text-white capitalize leading-tight">
                                            {format(new Date(dateStr), 'dd MMM', { locale: it })}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-70">
                                            {format(new Date(dateStr), 'yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="mb-1">
                                            <span className="text-sm font-black text-vvf uppercase tracking-widest block mb-1">
                                                {data.paidServiceType || 'SERVIZIO PAG'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                                                    {formatHours(hours)}
                                                </span>
                                                <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    {data.startTime} — {data.endTime}
                                                </span>
                                            </div>
                                        </div>
                                        {data.notes && (
                                            <span className="text-sm text-slate-500 dark:text-slate-400 italic">
                                                "{data.notes}"
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => onTogglePaid(dateStr, !data.isPaidServicePaid)}
                                    className={clsx(
                                        "flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 active:scale-95",
                                        data.isPaidServicePaid
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/10"
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-600 transition-all"
                                    )}
                                >
                                    {data.isPaidServicePaid ? <CheckCircle2 size={18} className="animate-bounce-in" /> : <Circle size={18} />}
                                    <span>{data.isPaidServicePaid ? 'Pagato' : 'Segna Pagato'}</span>
                                </button>
                            </div>
                        )
                    })}
                    {filteredEntries.length === 0 && (
                        <div className="p-24 text-center text-slate-400 font-bold uppercase tracking-widest opacity-50">
                            Nessun servizio trovato
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaidServicesPage;
