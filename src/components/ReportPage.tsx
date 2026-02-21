import React from 'react';
import { getYear, getMonth } from 'date-fns';
import { type DayAssignment } from '../App';
import { FileBarChart, PieChart } from 'lucide-react';
import { parseDateKey } from '../utils/dateKey';

interface ReportPageProps {
    assignments: Record<string, DayAssignment>;
    year: number;
    month: number | 'all';
}

const ReportPage: React.FC<ReportPageProps> = ({ assignments, year, month }) => {
    const filteredData = Object.entries(assignments).filter(([dateStr]) => {
        const date = parseDateKey(dateStr);
        const yMatch = getYear(date) === year;
        const mMatch = month === 'all' || getMonth(date) === month;
        return yMatch && mMatch;
    });

    // Aggregation logic for activities only
    const activityCounts: Record<string, number> = {};

    filteredData.forEach(([, data]) => {
        if (data.activity) {
            activityCounts[data.activity] = (activityCounts[data.activity] || 0) + 1;
        }
    });

    const sortedActivities = Object.entries(activityCounts).sort((a, b) => b[1] - a[1]);
    const totalActivityDays = Object.values(activityCounts).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-8">
            {/* Summary Header Card - Activity Only */}
            <div className="flex justify-center sm:justify-start">
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 flex items-center gap-5 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all hover:scale-[1.02] min-w-[200px]">
                    <div className="p-4 bg-vvf/10 text-vvf rounded-2xl">
                        <PieChart size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Totale Attività</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{totalActivityDays}</p>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white/20 dark:border-slate-800/50 overflow-hidden">
                <div className="p-8 border-b border-white/20 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-vvf text-white rounded-xl shadow-lg shadow-vvf/20">
                            <FileBarChart size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Conteggio Attività</h2>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase font-black text-slate-400 tracking-wider">
                                <th className="px-10 py-6">Nome Attività / Tipologia</th>
                                <th className="px-10 py-6 text-center">Giorni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {sortedActivities.map(([name, count]) => (
                                <tr key={name} className="hover:bg-vvf/5 transition-all group cursor-default">
                                    <td className="px-10 py-6">
                                        <span className="font-black text-slate-700 dark:text-slate-200 group-hover:text-vvf transition-colors uppercase text-sm tracking-widest">
                                            {name}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <span className="inline-flex items-center justify-center min-w-[3.5rem] px-5 py-2.5 bg-vvf/5 text-vvf rounded-2xl font-black text-base border border-vvf/10 shadow-sm transition-transform group-hover:scale-110">
                                            {count}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {sortedActivities.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="px-10 py-24 text-center text-slate-400 font-bold uppercase tracking-widest opacity-50">
                                        Nessun dato registrato
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;
