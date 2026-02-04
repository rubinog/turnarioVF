import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    addMonths,
    subMonths,
    isSameMonth,
    isToday,
    parse
} from 'date-fns';
import { it } from 'date-fns/locale';
import { getDayShift, getNightShift, formatShift, type Section } from '../utils/turni';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Clock, Banknote } from 'lucide-react';
import { type DayAssignment } from '../App';

const SECTION_COLORS: Record<Section, string> = {
    A: 'bg-blue-500 text-white',
    B: 'bg-green-500 text-white',
    C: 'bg-red-500 text-white',
    D: 'bg-yellow-400 text-black',
};

interface CalendarProps {
    userSquad: string | null;
    dayColor: string;
    nightColor: string;
    skipDayColor: string;
    skipNightColor: string;
    assignments: Record<string, DayAssignment>;
    onDayClick: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
    userSquad,
    dayColor,
    nightColor,
    skipDayColor,
    skipNightColor,
    assignments,
    onDayClick
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 1 })
    });

    const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    // Hours calculation
    const calculateHours = (start: string, end: string) => {
        if (!start || !end) return 0;
        try {
            const s = parse(start, 'HH:mm', new Date());
            const e = parse(end, 'HH:mm', new Date());
            let diff = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
            if (diff < 0) diff += 24; // Handle wrap around midnight
            return diff;
        } catch {
            return 0;
        }
    };

    // Monthly totals
    let totalOvertimeHours = 0;
    let totalPaidServiceHours = 0;

    Object.entries(assignments).forEach(([dateStr, data]) => {
        const date = new Date(dateStr);
        if (isSameMonth(date, currentDate)) {
            const hours = calculateHours(data.startTime, data.endTime);
            if (data.isOvertime) totalOvertimeHours += hours;
            if (data.isPaidService) totalPaidServiceHours += hours;
        }
    });

    return (
        <div className="flex flex-col h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl text-slate-900 dark:text-slate-100 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white/20 dark:border-slate-800/50 transition-all">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black capitalize text-slate-900 dark:text-white tracking-tight">
                    {format(currentDate, 'MMMM yyyy', { locale: it })}
                </h2>
                <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-950/50 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                    <button onClick={handlePrevMonth} className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-vvf transition-all active:scale-95" aria-label="Mese precedente">
                        <ChevronLeft size={22} />
                    </button>
                    <button onClick={handleToday} className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm hover:shadow-md transition-all text-sm font-black uppercase tracking-widest active:scale-95">
                        Oggi
                    </button>
                    <button onClick={handleNextMonth} className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-vvf transition-all active:scale-95" aria-label="Mese successivo">
                        <ChevronRight size={22} />
                    </button>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map(day => (
                    <div key={day} className="text-center font-black text-slate-400 dark:text-slate-600 uppercase text-[10px] sm:text-xs tracking-widest py-3">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 auto-rows-fr">
                {days.map(day => {
                    const dayShift = getDayShift(day);
                    const nightShift = getNightShift(day);
                    const dayShiftStr = formatShift(dayShift);
                    const nightShiftStr = formatShift(nightShift);
                    const dateKey = day.toISOString().split('T')[0];
                    const assignment = assignments[dateKey];
                    const isCurrentMonth = isSameMonth(day, currentDate);

                    let isUserDay = false;
                    let isUserNight = false;
                    let isUserSkipDay = false;
                    let isUserSkipNight = false;

                    if (userSquad) {
                        const userSection = userSquad.charAt(0);
                        const userSkip = parseInt(userSquad.slice(1), 10);
                        if (dayShift.section === userSection) {
                            if (dayShift.skip === userSkip) isUserSkipDay = true;
                            else isUserDay = true;
                        }
                        if (nightShift.section === userSection) {
                            if (nightShift.skip === userSkip) isUserSkipNight = true;
                            else isUserNight = true;
                        }
                    }

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onDayClick(day)}
                            className={clsx(
                                "min-h-[115px] sm:min-h-[130px] p-2 sm:p-4 rounded-2xl flex flex-col gap-1.5 transition-all relative cursor-pointer border leading-none shadow-sm",
                                !isCurrentMonth ? "bg-slate-50/20 dark:bg-slate-900/10 opacity-30 border-transparent pointer-events-none" : "bg-white dark:bg-slate-800/40 hover:scale-[1.02] hover:shadow-2xl hover:z-20 border-slate-100 dark:border-slate-800 hover:border-vvf/50",
                                isToday(day) && "ring-4 ring-vvf/20 border-vvf/50 z-10"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={clsx("text-base sm:text-lg font-black tracking-tighter", isToday(day) ? "text-vvf" : "text-slate-900 dark:text-slate-200")}>
                                    {format(day, 'd')}
                                </span>
                                <div className="flex gap-1">
                                    {assignment?.isOvertime && (
                                        <div className="w-5 h-5 rounded-lg bg-red-500 text-white text-[9px] flex items-center justify-center font-black shadow-lg shadow-red-500/30" title="Straordinario">S</div>
                                    )}
                                    {assignment?.isPaidService && (
                                        <div className="w-5 h-5 rounded-lg bg-amber-500 text-white text-[9px] flex items-center justify-center font-black shadow-lg shadow-amber-500/30" title="Servizio PAG">P</div>
                                    )}
                                </div>
                            </div>

                            {assignment?.activity && (
                                <div className="text-[8px] sm:text-[10px] leading-[1.1] px-1.5 py-1 rounded-lg bg-vvf text-white font-medium uppercase tracking-tight mb-1 text-center line-clamp-2">
                                    {assignment.activity}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5 mt-auto">
                                <div
                                    className={clsx(
                                        "text-[10px] sm:text-xs py-1.5 rounded-xl flex justify-center items-center font-black shadow-sm tracking-wide",
                                        userSquad && isUserDay && "text-white shadow-lg shadow-vvf/20 scale-105",
                                        userSquad && isUserSkipDay && "text-white shadow-lg scale-105 opacity-60 grayscale-[0.3]",
                                        userSquad && !isUserDay && !isUserSkipDay && "bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-600",
                                        !userSquad && "text-white",
                                        !userSquad && SECTION_COLORS[dayShift.section]
                                    )}
                                    style={
                                        userSquad && isUserDay ? { backgroundColor: dayColor } :
                                            (userSquad && isUserSkipDay ? { backgroundColor: skipDayColor } : {})
                                    }
                                >
                                    {dayShiftStr}
                                </div>
                                <div
                                    className={clsx(
                                        "text-[10px] sm:text-xs py-1.5 rounded-xl flex justify-center items-center font-black shadow-sm tracking-wide",
                                        userSquad && isUserNight && "text-white shadow-lg shadow-vvf/20 scale-105",
                                        userSquad && isUserSkipNight && "text-white shadow-lg scale-105 opacity-60 grayscale-[0.3]",
                                        userSquad && !isUserNight && !isUserSkipNight && "bg-slate-100/50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-600",
                                        !userSquad && "text-white opacity-90",
                                        !userSquad && SECTION_COLORS[nightShift.section]
                                    )}
                                    style={
                                        userSquad && isUserNight ? { backgroundColor: nightColor } :
                                            (userSquad && isUserSkipNight ? { backgroundColor: skipNightColor } : {})
                                    }
                                >
                                    {nightShiftStr}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Monthly Summary Footer */}
            <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-red-500/5 dark:bg-red-500/10 p-5 rounded-[2rem] border border-red-500/10 dark:border-red-500/20 flex items-center gap-5 shadow-inner">
                    <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-500/30">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] text-red-600/60 dark:text-red-400/60 font-black uppercase tracking-widest mb-0.5">Straordinari Mensili</p>
                        <p className="text-3xl font-black text-red-600 dark:text-red-400 leading-none tabular-nums">{totalOvertimeHours.toFixed(1)} <span className="text-sm font-bold opacity-70 italic">h</span></p>
                    </div>
                </div>
                <div className="bg-amber-500/5 dark:bg-amber-500/10 p-5 rounded-[2rem] border border-amber-500/10 dark:border-amber-500/20 flex items-center gap-5 shadow-inner">
                    <div className="p-3 bg-amber-600 rounded-2xl text-white shadow-lg shadow-amber-500/30">
                        <Banknote size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] text-amber-600/60 dark:text-amber-400/60 font-black uppercase tracking-widest mb-0.5">Servizi PAG Mensili</p>
                        <p className="text-3xl font-black text-amber-600 dark:text-amber-400 leading-none tabular-nums">{totalPaidServiceHours.toFixed(1)} <span className="text-sm font-bold opacity-70 italic">h</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
