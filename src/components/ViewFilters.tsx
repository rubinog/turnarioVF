import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ViewFiltersProps {
    year: number;
    month: number | 'all';
    onYearChange: (year: number) => void;
    onMonthChange: (month: number | 'all') => void;
}

const ViewFilters: React.FC<ViewFiltersProps> = ({ year, month, onYearChange, onMonthChange }) => {
    const months = [
        { value: 'all', label: 'Tutto l\'anno' },
        ...Array.from({ length: 12 }, (_, i) => ({
            value: i,
            label: format(new Date(2025, i, 1), 'MMMM', { locale: it })
        }))
    ];

    return (
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between mb-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all">
            {/* Year Selector */}
            <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-950/50 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                <button
                    onClick={() => onYearChange(year - 1)}
                    className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-vvf transition-all active:scale-90"
                >
                    <ChevronLeft size={22} />
                </button>
                <div className="px-6 text-xl font-black text-slate-900 dark:text-white min-w-[100px] text-center tracking-tighter">
                    {year}
                </div>
                <button
                    onClick={() => onYearChange(year + 1)}
                    className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-vvf transition-all active:scale-90"
                >
                    <ChevronRight size={22} />
                </button>
            </div>

            {/* Month Dropdown */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-72 group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-vvf group-focus-within:text-vvf transition-colors pointer-events-none">
                        <Calendar size={20} />
                    </div>
                    <select
                        value={month}
                        onChange={(e) => onMonthChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                        className="w-full bg-slate-100/50 dark:bg-slate-950/50 text-slate-900 dark:text-white font-black text-sm py-4 pl-14 pr-12 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 appearance-none focus:ring-4 focus:ring-vvf/10 focus:border-vvf/50 outline-none cursor-pointer transition-all capitalize shadow-inner"
                    >
                        {months.map(m => (
                            <option key={m.label} value={m.value} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 capitalize font-medium">
                                {m.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-vvf transition-colors">
                        <ChevronRight size={18} className="rotate-90" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewFilters;
