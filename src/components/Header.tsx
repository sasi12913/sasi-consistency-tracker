'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { JOURNEY_START_DATE, JOURNEY_END_DATE, parseLocalDate } from '@/lib/storage';
import { Compass, Calendar, Flame } from 'lucide-react';

export default function Header() {
  const { streak } = useApp();
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [stats, setStats] = useState({
    totalDays: 208,
    elapsedDays: 0,
    remainingDays: 208,
    percentage: 0
  });

  useEffect(() => {
    // Format current date nicely
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDateStr(today.toLocaleDateString('en-US', options));

    // Calculate journey stats
    const start = parseLocalDate(JOURNEY_START_DATE);
    const end = parseLocalDate(JOURNEY_END_DATE);
    
    // Normalize to midnight
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const totalDays = 208;

    if (todayMidnight < start) {
      setStats({
        totalDays,
        elapsedDays: 0,
        remainingDays: totalDays,
        percentage: 0
      });
    } else if (todayMidnight > end) {
      setStats({
        totalDays,
        elapsedDays: totalDays,
        remainingDays: 0,
        percentage: 100
      });
    } else {
      const timeDiff = end.getTime() - todayMidnight.getTime();
      const remainingDays = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1; // include today
      const elapsedDays = totalDays - remainingDays;
      const percentage = Math.round((elapsedDays / totalDays) * 100);
      
      setStats({
        totalDays,
        elapsedDays,
        remainingDays,
        percentage
      });
    }
  }, []);

  return (
    <header className="w-full space-y-4 mb-6 select-none">
      
      {/* Top Welcome Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-theme-text-main flex items-center gap-2">
            Consistency Tracker 🦅
          </h2>
          <p className="text-sm font-medium text-theme-text-muted flex items-center gap-1.5 mt-0.5">
            <Calendar size={14} className="text-theme-primary" />
            <span>{currentDateStr || 'Loading date...'}</span>
          </p>
        </div>

        {/* Short Mobile Streak Display */}
        <div className="md:hidden flex items-center space-x-2 bg-orange-50/80 border border-orange-100/50 px-3.5 py-2 rounded-2xl self-start">
          <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={18} />
          <div>
            <div className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Active Streak</div>
            <div className="text-sm font-bold text-orange-950 leading-none">{streak.currentStreak} Days</div>
          </div>
        </div>
      </div>

      {/* UPSC Journey Progress Meter Card */}
      <div className="glass rounded-3xl p-5 border border-theme-card-border shadow-sm relative overflow-hidden">
        
        {/* Background visual watermarks */}
        <div className="absolute -top-12 -right-12 text-theme-primary/5 pointer-events-none">
          <Compass size={180} className="rotate-[15deg]" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Progress Metrics */}
          <div className="space-y-1">
            <div className="text-xs uppercase font-extrabold tracking-widest text-theme-primary">
              UPSC Journey Meter
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black tracking-tight text-theme-text-main">
                {stats.percentage}%
              </span>
              <span className="text-sm font-semibold text-theme-text-muted">
                Completed
              </span>
            </div>
            <p className="text-xs font-medium text-theme-text-muted">
              Started <span className="font-bold text-theme-text-main">June 7, 2026</span> • Ends <span className="font-bold text-theme-text-main">Dec 31, 2026</span>
            </p>
          </div>

          {/* Meter Bar and Info */}
          <div className="flex-1 w-full space-y-2.5">
            {/* The sliding progress bar */}
            <div className="relative w-full h-4 bg-theme-primary/10 rounded-full border border-theme-primary/10 shadow-inner overflow-hidden">
              <div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-theme-primary to-theme-accent rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--theme-primary-rgb),0.3)]"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            
            {/* Split Info grid */}
            <div className="grid grid-cols-3 text-center md:text-left text-xs font-bold text-theme-text-muted">
              <div>
                <div className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider">Total Days</div>
                <div className="text-sm font-black text-theme-text-main mt-0.5">{stats.totalDays}</div>
              </div>
              <div className="border-x border-theme-card-border/70 px-4">
                <div className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider">Elapsed</div>
                <div className="text-sm font-black text-theme-text-main mt-0.5">{stats.elapsedDays}</div>
              </div>
              <div className="pl-4">
                <div className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider">Remaining</div>
                <div className="text-sm font-black text-theme-primary mt-0.5">{stats.remainingDays} Days</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
