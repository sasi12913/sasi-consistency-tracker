'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { BADGES_METADATA } from '@/lib/storage';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Loader2, Lock, Sparkles } from 'lucide-react';

export default function AchievementsPage() {
  const { unlockedAchievements } = useApp();

  const getBadgeProgress = (badgeId: string) => {
    // We can add simple descriptive progress help text
    switch (badgeId) {
      case 'early_bird': return 'Wake up < 8 AM (5 times)';
      case 'mission_master': return 'Today\'s Mission (10 times)';
      case 'no_scroll_warrior': return 'No Scroll (7 days run)';
      case 'exercise_warrior': return 'Exercise (10 times)';
      case 'consistency_king': return 'Monthly Avg > 90%';
      case 'discipline_beast': return 'Get 14/14 pts in 1 day';
      case 'perfect_week': return 'Score >= 10 (7 days run)';
      case 'perfect_month': return 'Log all days >= 80% score';
      case 'streak_30': return 'Streak >= 30 days';
      case 'streak_60': return 'Streak >= 60 days';
      case 'streak_100': return 'Streak >= 100 days';
      default: return '';
    }
  };

  const unlockedCount = unlockedAchievements.length;

  return (
    <div className="space-y-6">
      
      {/* Heading */}
      <div className="select-none">
        <h3 className="text-xl font-black text-theme-text-main">Achievements Gallery 🏆</h3>
        <p className="text-xs text-theme-text-muted mt-0.5">Push your limits to unlock badges. Every tick compounds into success.</p>
      </div>

      {/* Badges Progress Summary Meter */}
      <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm flex flex-col md:flex-row items-center gap-5 justify-between select-none">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-yellow-200">
            <Sparkles size={26} className="fill-current animate-pulse" />
          </div>
          <div>
            <h4 className="text-lg font-black text-theme-text-main">
              {unlockedCount === 11 ? '👑 Discipline Legend!' : 'Discipline Milestones'}
            </h4>
            <p className="text-xs text-theme-text-muted">
              You have unlocked <strong className="text-theme-text-main font-bold">{unlockedCount} out of 11</strong> achievement badges.
            </p>
          </div>
        </div>

        {/* Global Progress bar */}
        <div className="flex-1 max-w-sm w-full space-y-1">
          <div className="flex justify-between text-xs font-bold text-theme-text-muted">
            <span>Overall Badges Unlocked</span>
            <span>{Math.round((unlockedCount / 11) * 100)}%</span>
          </div>
          <div className="w-full bg-theme-primary/10 h-3 rounded-full overflow-hidden border border-theme-primary/5">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all duration-1000" 
              style={{ width: `${(unlockedCount / 11) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {BADGES_METADATA.map((badge, index) => {
          const isUnlocked = unlockedAchievements.includes(badge.id);
          const Icon = (Icons as any)[badge.iconName] || Icons.Award;
          const conditionText = getBadgeProgress(badge.id);

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={isUnlocked ? { y: -2 } : {}}
              className={`glass rounded-3xl p-5 border flex flex-col items-center justify-between text-center select-none min-h-[220px] transition-all duration-300 relative overflow-hidden
                ${isUnlocked 
                  ? 'border-yellow-400/50 bg-gradient-to-b from-yellow-50/10 to-transparent shadow-[0_12px_30px_rgba(234,179,8,0.06)]' 
                  : 'border-theme-card-border/60 opacity-60 bg-white/20'
                }`}
            >
              {/* Lock icon overlay for locked */}
              {!isUnlocked && (
                <div className="absolute top-3 right-3 text-slate-400" title="Locked Badge">
                  <Lock size={12} className="stroke-[2.5]" />
                </div>
              )}

              {/* Badge Icon container */}
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-md mb-4 shrink-0 transition-all duration-500
                  ${isUnlocked 
                    ? 'bg-gradient-to-tr from-yellow-400 to-amber-500 border-yellow-300 text-white shadow-yellow-100' 
                    : 'bg-slate-200/60 border-slate-300 text-slate-400 shadow-none grayscale'
                  }`}
              >
                <Icon size={28} className="stroke-[1.75]" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 flex-1">
                <h4 className={`text-base font-black tracking-tight transition-all duration-300
                  ${isUnlocked ? 'text-theme-text-main' : 'text-slate-400'}`}
                >
                  {badge.title}
                </h4>
                <p className="text-xs text-theme-text-muted leading-relaxed px-2">
                  {badge.description}
                </p>
              </div>

              {/* Unlock / Progress footer bar */}
              <div className="w-full mt-4 border-t border-theme-card-border/60 pt-3">
                {isUnlocked ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    Unlocked 🏆
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400">
                    Target: {conditionText}
                  </span>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
