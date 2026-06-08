'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { JOURNEY_START_DATE, formatDate, DailyLog, CHECKLIST_ITEMS, parseLocalDate } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Target, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface HeatmapProps {
  onSelectDate?: (date: string) => void;
  selectedDate: string;
}

export default function Heatmap({ onSelectDate, selectedDate }: HeatmapProps) {
  const { logs, theme } = useApp();
  const [days, setDays] = useState<Date[]>([]);
  const [detailDate, setDetailDate] = useState<string | null>(null);

  useEffect(() => {
    // Generate the 208 days of the journey
    const start = parseLocalDate(JOURNEY_START_DATE);
    const tempDays: Date[] = [];
    for (let i = 0; i < 208; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      tempDays.push(current);
    }
    setDays(tempDays);
  }, []);

  // Map intensity levels based on daily score
  const getIntensityClass = (score: number) => {
    if (score === 0) return 'bg-white/20 border-theme-card-border hover:bg-white/40';
    
    // Theme mappings
    switch (theme) {
      case 'forest':
        if (score <= 4) return 'bg-emerald-200/50 border-emerald-300/30 hover:bg-emerald-200/70 text-emerald-950';
        if (score <= 8) return 'bg-emerald-300 border-emerald-400/30 hover:bg-emerald-400 text-emerald-950';
        if (score <= 12) return 'bg-emerald-500 border-emerald-600/30 hover:bg-emerald-600 text-white';
        return 'bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.4)] border-emerald-500 hover:bg-emerald-700 text-white';
      case 'lavender':
        if (score <= 4) return 'bg-purple-200/50 border-purple-300/30 hover:bg-purple-200/70 text-purple-950';
        if (score <= 8) return 'bg-purple-300 border-purple-400/30 hover:bg-purple-400 text-purple-950';
        if (score <= 12) return 'bg-purple-500 border-purple-600/30 hover:bg-purple-600 text-white';
        return 'bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.4)] border-purple-500 hover:bg-purple-700 text-white';
      case 'peach':
        if (score <= 4) return 'bg-orange-255/40 border-orange-200/30 hover:bg-orange-200/60 text-orange-950';
        if (score <= 8) return 'bg-orange-300 border-orange-400/30 hover:bg-orange-400 text-orange-950';
        if (score <= 12) return 'bg-orange-500 border-orange-600/30 hover:bg-orange-600 text-white';
        return 'bg-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.4)] border-orange-500 hover:bg-orange-700 text-white';
      case 'mint':
        if (score <= 4) return 'bg-teal-200/50 border-teal-300/30 hover:bg-teal-200/70 text-teal-950';
        if (score <= 8) return 'bg-teal-355 border-teal-400/30 hover:bg-teal-400 text-teal-950';
        if (score <= 12) return 'bg-teal-500 border-teal-600/30 hover:bg-teal-600 text-white';
        return 'bg-teal-600 shadow-[0_0_10px_rgba(20,184,166,0.4)] border-teal-500 hover:bg-teal-700 text-white';
      case 'sunrise':
        if (score <= 4) return 'bg-amber-200/50 border-amber-300/30 hover:bg-amber-200/70 text-amber-950';
        if (score <= 8) return 'bg-amber-300 border-amber-400/30 hover:bg-amber-400 text-amber-950';
        if (score <= 12) return 'bg-amber-500 border-amber-600/30 hover:bg-amber-600 text-white';
        return 'bg-amber-650 shadow-[0_0_10px_rgba(245,158,11,0.4)] border-amber-500 hover:bg-amber-700 text-white';
      case 'sky':
      default:
        if (score <= 4) return 'bg-blue-200/50 border-blue-300/30 hover:bg-blue-200/70 text-blue-950';
        if (score <= 8) return 'bg-blue-300 border-blue-400/30 hover:bg-blue-400 text-blue-950';
        if (score <= 12) return 'bg-blue-500 border-blue-600/30 hover:bg-blue-600 text-white';
        return 'bg-blue-650 shadow-[0_0_10px_rgba(59,130,246,0.4)] border-blue-500 hover:bg-blue-700 text-white';
    }
  };

  // Group days into columns representing weeks
  const getWeeks = () => {
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    days.forEach((day, index) => {
      currentWeek.push(day);
      // If Saturday (6) or last day of journey, push and reset
      if (day.getDay() === 6 || index === days.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  };

  const weeks = getWeeks();

  // Helper to extract month names for top headers
  const getMonthHeaders = () => {
    const headers: { label: string; colSpan: number }[] = [];
    let lastMonth = '';
    let colSpan = 0;

    weeks.forEach((week) => {
      // Find the dominant month of this week
      const midDay = week[Math.floor(week.length / 2)];
      const monthName = midDay.toLocaleDateString('en-US', { month: 'short' });

      if (monthName !== lastMonth) {
        if (colSpan > 0) {
          headers.push({ label: lastMonth, colSpan });
        }
        lastMonth = monthName;
        colSpan = 1;
      } else {
        colSpan++;
      }
    });

    // push last
    if (colSpan > 0) {
      headers.push({ label: lastMonth, colSpan });
    }

    return headers;
  };

  const monthHeaders = getMonthHeaders();

  const handleCellClick = (dateStr: string) => {
    setDetailDate(dateStr);
    if (onSelectDate) {
      onSelectDate(dateStr);
    }
  };

  // Details log information for popup overlay
  const selectedLog: DailyLog = logs[detailDate || ''] || {
    date: detailDate || '',
    tasksCompleted: [],
    missionTitle: '',
    missionCompleted: false,
    score: 0,
    consistencyScore: 0
  };

  return (
    <div className="space-y-4 select-none">
      
      {/* HEATMAP CORE GRID CARD */}
      <div className="glass rounded-3xl p-5 border border-theme-card-border shadow-sm overflow-x-auto">
        
        <div className="min-w-[700px] py-2">
          {/* Month Labels */}
          <div className="grid grid-cols-[30px_1fr] gap-2 mb-2">
            <div /> {/* spacing for weekday labels */}
            <div className="flex text-[10px] font-extrabold text-theme-text-muted uppercase tracking-wider">
              {monthHeaders.map((header, i) => (
                <div 
                  key={i} 
                  style={{ width: `${(header.colSpan / weeks.length) * 100}%` }}
                  className="truncate"
                >
                  {header.label}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Layout (Weeks as Columns) */}
          <div className="grid grid-cols-[30px_1fr] gap-2 items-start">
            
            {/* Weekday Labels (Sun, Tue, Thu, Sat) */}
            <div className="grid grid-rows-7 gap-1.5 text-[10px] font-bold text-theme-text-muted h-full py-0.5 justify-center">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Contribution Cells */}
            <div className="flex gap-1.5 justify-between">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-1.5">
                  {/* Fill empty cells at the start/end of weeks if they are missing */}
                  {/* Since June 7, 2026 starts on a Sunday, the first week is full. */}
                  {/* The last week ends on a Thursday, so it has only 5 days. */}
                  {[...Array(7)].map((_, dayIndex) => {
                    // Find if there is a day in this week matching this index
                    const day = week.find(d => d.getDay() === dayIndex);
                    if (!day) {
                      // Render an empty non-interactive space
                      return (
                        <div 
                          key={dayIndex} 
                          className="w-4.5 h-4.5 rounded-[4px] bg-transparent pointer-events-none" 
                        />
                      );
                    }

                    const dateStr = formatDate(day);
                    const log = logs[dateStr];
                    const score = log ? log.score : 0;
                    const isSelected = selectedDate === dateStr;

                    return (
                      <motion.div
                        key={dayIndex}
                        whileHover={{ scale: 1.15 }}
                        onClick={() => handleCellClick(dateStr)}
                        className={`w-4.5 h-4.5 rounded-[4px] border cursor-pointer transition-all duration-300 relative
                          ${getIntensityClass(score)}
                          ${isSelected ? 'ring-2 ring-theme-primary ring-offset-1 ring-offset-white' : ''}
                        `}
                        title={`${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • Score: ${score}/14`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

          </div>

          {/* Legend */}
          <div className="flex items-center justify-end space-x-2 text-[10px] font-bold text-theme-text-muted mt-4">
            <span>Faint</span>
            <div className="w-3.5 h-3.5 rounded-[3px] border bg-white/20 border-theme-card-border" />
            <div className="w-3.5 h-3.5 rounded-[3px] border bg-theme-primary/20 border-theme-card-border" />
            <div className="w-3.5 h-3.5 rounded-[3px] border bg-theme-primary/50 border-theme-card-border" />
            <div className="w-3.5 h-3.5 rounded-[3px] border bg-theme-primary/80 border-theme-card-border" />
            <div className="w-3.5 h-3.5 rounded-[3px] border bg-theme-primary shadow-[0_0_5px_var(--theme-glow)]" />
            <span>Bright</span>
          </div>

        </div>
      </div>

      {/* CELL DETAILS EXPANSION VIEW */}
      <AnimatePresence>
        {detailDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass rounded-3xl p-5 border border-theme-card-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setDetailDate(null)}
              className="absolute top-4 right-4 text-theme-text-muted hover:text-theme-text-main p-1 hover:bg-theme-primary/5 rounded-xl transition-all"
            >
              <X size={16} />
            </button>

            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-theme-primary">
                <Calendar size={14} />
                <span>
                {parseLocalDate(selectedLog.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              </div>
              <h4 className="text-lg font-black text-theme-text-main">
                Daily Summary (Score: {selectedLog.score} / 14)
              </h4>
              
              {/* Mission title */}
              {selectedLog.missionTitle ? (
                <p className="text-xs font-semibold text-theme-text-muted flex items-center gap-1.5 bg-white/60 p-2 rounded-xl border border-theme-card-border/70 max-w-lg">
                  <Target size={14} className="text-theme-primary" />
                  <span>
                    Mission: <strong className="text-theme-text-main">"{selectedLog.missionTitle}"</strong> 
                    {selectedLog.missionCompleted ? ' (Completed +3 Pts)' : ' (Not Completed)'}
                  </span>
                </p>
              ) : (
                <p className="text-xs italic text-theme-text-muted">No primary mission logged for this day.</p>
              )}

              {/* Notes */}
              {selectedLog.notes && (
                <p className="text-xs text-theme-text-muted italic bg-theme-primary/5 p-2 rounded-xl border border-theme-primary/10 max-w-lg">
                  Note: "{selectedLog.notes}"
                </p>
              )}
            </div>

            {/* Checklist stats detail */}
            <div className="flex gap-4 shrink-0 text-center items-center">
              <div className="bg-theme-primary/5 p-3 rounded-2xl border border-theme-primary/10 w-28">
                <div className="text-xl font-black text-theme-primary">
                  {selectedLog.tasksCompleted.length} / 11
                </div>
                <div className="text-[9px] uppercase font-bold text-theme-text-muted tracking-wider mt-0.5">
                  Tasks Done
                </div>
              </div>
              
              <div className="bg-yellow-50/50 p-3 rounded-2xl border border-yellow-200/60 w-28">
                <div className="text-xl font-black text-yellow-600 flex justify-center items-center gap-0.5">
                  {selectedLog.missionCompleted ? '1' : '0'} / 1
                </div>
                <div className="text-[9px] uppercase font-bold text-theme-text-muted tracking-wider mt-0.5">
                  Mission
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
