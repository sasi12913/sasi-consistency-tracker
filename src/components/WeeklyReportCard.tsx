'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  formatDate, 
  DailyLog, 
  CHECKLIST_ITEMS, 
  getWeeksRange, 
  WeekPeriod,
  WeekReportData,
  analyzeWeekLogs
} from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  History, 
  X,
  Lock
} from 'lucide-react';

export default function WeeklyReportCard({ selectedDate }: { selectedDate: string }) {
  const { logs } = useApp();
  const [activeWeekNum, setActiveWeekNum] = useState(1);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Calculate weeks range relative to selectedDate to allow full simulation in demo mode
  const weeks = getWeeksRange(selectedDate);

  // Sync active week with selectedDate when selectedDate changes
  useEffect(() => {
    const currentWeek = weeks.find(w => selectedDate >= w.startDate && selectedDate <= w.endDate);
    if (currentWeek) {
      setActiveWeekNum(currentWeek.weekNumber);
    }
  }, [selectedDate, weeks]);

  const currentWeek = weeks[activeWeekNum - 1] || weeks[0];
  const report = analyzeWeekLogs(currentWeek.startDate, currentWeek.endDate, logs);

  // Determine week status
  const isWeekCompleted = currentWeek.isCompleted;
  const isUpcoming = selectedDate < currentWeek.startDate;

  const prevWeek = () => {
    if (activeWeekNum > 1) {
      setActiveWeekNum(prev => prev - 1);
    }
  };

  const nextWeek = () => {
    if (activeWeekNum < weeks.length) {
      setActiveWeekNum(next => next + 1);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm select-none relative overflow-hidden">
      
      {/* Header section with title and status badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-theme-card-border/60 pb-4 mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-theme-text-main flex items-center gap-1.5">
              <Award size={18} className="text-theme-primary animate-pulse" />
              <span>Weekly Report Card</span>
            </h3>
            {isUpcoming ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gray-100/80 text-gray-500 border border-gray-200 flex items-center gap-1">
                <Lock size={8} /> Upcoming
              </span>
            ) : isWeekCompleted ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Completed Week
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                In Progress
              </span>
            )}
          </div>
          
          {/* Week Selector / Date Picker Controls */}
          <div className="flex items-center gap-2 mt-1.5 select-none">
            <button 
              onClick={prevWeek}
              disabled={activeWeekNum <= 1}
              className="p-1 rounded-lg hover:bg-theme-primary/10 text-theme-text-muted hover:text-theme-text-main disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Previous Week"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="text-xs font-bold text-theme-text-muted">
              Week {activeWeekNum}: {formatDateLabel(currentWeek.startDate)} – {formatDateLabel(currentWeek.endDate)}
            </span>

            <button 
              onClick={nextWeek}
              disabled={activeWeekNum >= weeks.length}
              className="p-1 rounded-lg hover:bg-theme-primary/10 text-theme-text-muted hover:text-theme-text-main disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Next Week"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => setIsArchiveOpen(true)}
              className="ml-2 p-1.5 rounded-xl bg-theme-primary/15 hover:bg-theme-primary/20 text-theme-primary hover:scale-102 transition-all flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5"
              title="View Weekly History Book"
            >
              <History size={11} />
              <span>Archive</span>
            </button>
          </div>
        </div>

        {report.hasLogs && !isUpcoming && (
          <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold text-theme-text-muted">Week Consistency</div>
              <div className="text-base font-black text-theme-primary leading-none mt-0.5">
                {report.avgConsistency}%
              </div>
            </div>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all duration-300
              ${report.avgConsistency >= 80 
                ? 'border-emerald-500/25 text-emerald-600 bg-emerald-50' 
                : report.avgConsistency >= 50 
                  ? 'border-amber-500/25 text-amber-600 bg-amber-50' 
                  : 'border-red-500/25 text-red-600 bg-red-50'}`}
            >
              {report.grade}
            </div>
          </div>
        )}
      </div>

      {/* Report Body */}
      {isUpcoming ? (
        <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-theme-primary/5 rounded-full text-theme-primary border border-theme-primary/10 animate-bounce">
            <Lock size={28} />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-theme-text-main">Upcoming Prep Week</h4>
            <p className="text-xs text-theme-text-muted max-w-sm px-4">
              This week starts on {formatDateLabel(currentWeek.startDate)}. Complete your current daily tasks to unlock this weekly evaluation card!
            </p>
          </div>
        </div>
      ) : !report.hasLogs ? (
        <div className="py-8 text-center text-xs italic text-theme-text-muted">
          No logs recorded in this week range. Track your daily checklist items to generate a report card.
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Consistency coaching statement */}
          <div className="p-4 rounded-2xl bg-theme-primary/5 border border-theme-primary/10 text-xs font-semibold text-theme-text-main leading-relaxed">
            {report.statement}
          </div>

          {/* Analysis Split Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* What went Good */}
            <div className="space-y-2.5">
              <h4 className="text-xs uppercase font-extrabold text-emerald-600 flex items-center gap-1">
                <ShieldCheck size={14} />
                <span>What's Working</span>
              </h4>
              <div className="space-y-1.5">
                {report.whatsGood.length > 0 ? (
                  report.whatsGood.map((good, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs font-semibold text-theme-text-main">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{good}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-theme-text-muted">No highly consistent habits detected yet.</p>
                )}
              </div>
            </div>

            {/* What went Wrong */}
            <div className="space-y-2.5">
              <h4 className="text-xs uppercase font-extrabold text-red-500 flex items-center gap-1">
                <AlertTriangle size={14} />
                <span>What Needs Focus</span>
              </h4>
              <div className="space-y-1.5">
                {report.whatsWrong.length > 0 ? (
                  report.whatsWrong.map((wrong, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs font-semibold text-theme-text-main">
                      <XCircle size={12} className="text-red-500 shrink-0 mt-0.5" />
                      <span>{wrong}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-emerald-600">Perfect scorecard! No major routine slips detected.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Timeline Archive Overlay Modal */}
      <AnimatePresence>
        {isArchiveOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md">
            
            {/* Modal Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsArchiveOpen(false)}
            />

            {/* Modal Glass Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative max-w-2xl w-full max-h-[80vh] glass rounded-3xl p-6 md:p-8 border border-theme-card-border shadow-[0_25px_60px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden text-left"
            >
              {/* Header inside modal */}
              <div className="flex items-center justify-between border-b border-theme-card-border/80 pb-4 mb-4 select-none">
                <div>
                  <h3 className="font-black text-lg text-theme-text-main flex items-center gap-2">
                    <History className="text-theme-primary" size={20} />
                    <span>Weekly Reports Book</span>
                  </h3>
                  <p className="text-xs text-theme-text-muted mt-0.5">
                    Navigate and inspect completed weekly report cards.
                  </p>
                </div>
                <button
                  onClick={() => setIsArchiveOpen(false)}
                  className="p-2 rounded-xl hover:bg-theme-primary/10 text-theme-text-muted hover:text-theme-text-main transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable list of weeks */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
                {weeks.map((w) => {
                  const isWeekUpcoming = selectedDate < w.startDate;
                  const isWeekActive = selectedDate >= w.startDate && selectedDate <= w.endDate;
                  
                  let statusBadge = null;
                  if (isWeekUpcoming) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1">
                        <Lock size={8} /> Upcoming
                      </span>
                    );
                  } else if (isWeekActive) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                        In Progress
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Completed
                      </span>
                    );
                  }

                  const weekReport = !isWeekUpcoming 
                    ? analyzeWeekLogs(w.startDate, w.endDate, logs)
                    : null;

                  const isCurrentViewed = activeWeekNum === w.weekNumber;

                  return (
                    <motion.div
                      key={w.weekNumber}
                      whileHover={!isWeekUpcoming ? { scale: 1.01, x: 2 } : {}}
                      onClick={() => {
                        if (!isWeekUpcoming) {
                          setActiveWeekNum(w.weekNumber);
                          setIsArchiveOpen(false);
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden select-none
                        ${isWeekUpcoming 
                          ? 'bg-gray-50/20 border-gray-200/50 opacity-50 cursor-not-allowed' 
                          : isCurrentViewed
                            ? 'bg-theme-primary/10 border-theme-primary shadow-sm cursor-pointer'
                            : 'bg-white/40 border-theme-card-border/60 hover:border-theme-primary/50 hover:bg-white/60 cursor-pointer'
                        }`}
                    >
                      {/* Active Left highlight pill */}
                      {isCurrentViewed && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-theme-primary" />
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-theme-text-main">
                              Week {w.weekNumber}
                            </span>
                            {statusBadge}
                          </div>
                          <p className="text-[10px] font-bold text-theme-text-muted">
                            {formatDateLabel(w.startDate)} – {formatDateLabel(w.endDate)}, 2026
                          </p>
                        </div>

                        {weekReport && weekReport.hasLogs ? (
                          <div className="flex items-center space-x-3 shrink-0">
                            <div className="text-right">
                              <div className="text-[9px] uppercase font-bold text-theme-text-muted">Consistency</div>
                              <div className="text-xs font-black text-theme-primary">
                                {weekReport.avgConsistency}%
                              </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-black text-xs
                              ${weekReport.avgConsistency >= 80 
                                ? 'border-emerald-500/25 text-emerald-600 bg-emerald-50' 
                                : weekReport.avgConsistency >= 50 
                                  ? 'border-amber-500/25 text-amber-600 bg-amber-50' 
                                  : 'border-red-500/25 text-red-600 bg-red-50'}`}
                            >
                              {weekReport.grade}
                            </div>
                          </div>
                        ) : !isWeekUpcoming ? (
                          <span className="text-[10px] italic text-theme-text-muted">No logs recorded</span>
                        ) : null}
                      </div>

                      {weekReport && weekReport.hasLogs && (
                        <div className="mt-2.5 pt-2 border-t border-theme-card-border/40 space-y-1.5">
                          <p className="text-[11px] font-semibold text-theme-text-main italic line-clamp-1">
                            {weekReport.statement}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-bold text-theme-text-muted">
                            {weekReport.whatsGood.length > 0 && (
                              <div className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 size={10} />
                                <span>{weekReport.whatsGood[0].split(': ')[0] || 'Strong Routine'}</span>
                              </div>
                            )}
                            {weekReport.whatsWrong.length > 0 && (
                              <div className="flex items-center gap-1 text-red-500">
                                <XCircle size={10} />
                                <span>{weekReport.whatsWrong[0].split(': ')[0] || 'Needs Focus'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
