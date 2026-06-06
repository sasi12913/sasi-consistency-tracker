'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, Unlock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MonthLocks() {
  const { months } = useApp();

  return (
    <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm select-none">
      
      <div className="flex items-center justify-between mb-5 border-b border-theme-card-border/60 pb-3">
        <div>
          <h3 className="font-bold text-lg text-theme-text-main">Month Lock System</h3>
          <p className="text-xs text-theme-text-muted">Maintain 80%+ consistency & 20+ completed days to unlock next month.</p>
        </div>
        <span className="text-[10px] font-bold text-theme-text-muted bg-theme-card-border/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Journey Phases
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {months.map((month, index) => {
          const isUnlocked = month.isUnlocked;
          
          return (
            <motion.div
              key={month.key}
              whileHover={isUnlocked ? { y: -2 } : {}}
              className={`relative rounded-2xl border p-4.5 flex flex-col justify-between min-h-[160px] overflow-hidden transition-all duration-300 lock-hover
                ${isUnlocked 
                  ? 'bg-white/50 border-theme-card-border/80 shadow-sm' 
                  : 'bg-slate-100/40 border-slate-200 backdrop-blur-[2px]'
                }`}
            >
              {/* Blurred Locked overlay for locked months */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] pointer-events-none z-10" />
              )}

              {/* Month Header Label */}
              <div className="flex items-center justify-between z-20">
                <span className="text-sm font-black text-theme-text-main">
                  {month.label.split(' ')[0]}
                </span>
                
                {isUnlocked ? (
                  <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                    <Unlock size={12} className="stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="p-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0 lock-icon">
                    <Lock size={12} className="stroke-[2.5]" />
                  </div>
                )}
              </div>

              {/* Content area: Unlocked vs Locked stats */}
              <div className="my-4 z-20">
                {isUnlocked ? (
                  <div className="space-y-1">
                    <div className="text-xs text-theme-text-muted">Month Stats</div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-lg font-black text-theme-text-main">
                        {month.consistency}%
                      </span>
                      <span className="text-[10px] font-semibold text-theme-text-muted">
                        Avg Consistency
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      <span>{month.completedDays} Completed Days</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      <AlertCircle size={10} />
                      <span>Unlock Requirements:</span>
                    </div>
                    <div className="space-y-1">
                      {/* Completed days progress in prev month */}
                      <div className="flex justify-between text-[9px] font-bold text-theme-text-muted">
                        <span>Days (&gt;=8 Pts)</span>
                        <span>{20 - month.reqsRemaining.daysLeft}/20</span>
                      </div>

                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, ((20 - month.reqsRemaining.daysLeft) / 20) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer text */}
              <div className="text-[9px] font-bold uppercase tracking-wider text-center mt-2 z-20">
                {isUnlocked ? (
                  <span className="text-emerald-600">Active Phase</span>
                ) : (
                  <span className="text-amber-600">Locked Phase</span>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
