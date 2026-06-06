'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Timer,
  Trophy,
  Settings,
  Flame,
  Award
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { streak, unlockedAchievements } = useApp();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/focus', label: 'Focus Mode', icon: Timer },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 left-0 glass border-r border-theme-card-border p-6 justify-between shrink-0 select-none">
        
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-theme-primary to-theme-accent flex items-center justify-center text-white shadow-md shadow-theme-glow">
              <Award size={22} className="stroke-[2.25]" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-theme-text-main">
                SASI TRACKER
              </h1>
              <p className="text-[10px] font-semibold text-theme-text-muted tracking-wider uppercase">
                GOAT Edition
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="block relative">
                  <span
                    className={`flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 relative z-10
                      ${isActive 
                        ? 'text-theme-primary' 
                        : 'text-theme-text-muted hover:text-theme-text-main hover:bg-theme-primary/5'
                      }`}
                  >
                    <Icon size={18} className={`stroke-[2] ${isActive ? 'text-theme-primary' : 'text-theme-text-muted'}`} />
                    <span>{item.label}</span>
                  </span>

                  {/* Active Indicator Slide pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-gradient-to-r from-theme-primary/10 to-theme-accent/5 rounded-2xl border-l-4 border-theme-primary z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Stats Card */}
        <div className="glass rounded-2xl p-4 border border-theme-card-border/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-theme-text-muted">Discipline Streak</span>
            <div className="flex items-center space-x-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full text-xs font-bold border border-orange-100">
              <Flame size={12} className="fill-current" />
              <span>{streak.currentStreak}d</span>
            </div>
          </div>
          <div className="w-full bg-theme-primary/10 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-theme-primary to-theme-accent h-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (streak.currentStreak / 30) * 100)}%` }} 
            />
          </div>
          <p className="text-[10px] text-theme-text-muted mt-2 text-center">
            {streak.currentStreak >= 30 ? '🔥 Maximum consistency!' : `${30 - streak.currentStreak} days to 30d Streak Badge`}
          </p>
        </div>

      </aside>

      {/* BOTTOM TAB BAR FOR MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass border-t border-theme-card-border z-40 flex items-center justify-around px-4 select-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center flex-1 h-full relative">
              <span className={`flex flex-col items-center justify-center transition-all duration-300 relative z-10
                ${isActive ? 'text-theme-primary scale-105' : 'text-theme-text-muted'}`}
              >
                <Icon size={20} className="stroke-[2] mb-1" />
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              </span>

              {isActive && (
                <motion.div
                  layoutId="activePillMobile"
                  className="absolute top-1 w-12 h-1 bg-theme-primary rounded-full z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
