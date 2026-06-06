'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Bell,
  RefreshCw,
  Database,
  Trash2,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    preferences,
    updatePreferences,
    seedDemoData,
    clearData
  } = useApp();

  const [notifSaved, setNotifSaved] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);

  // Theme presets definitions for visual previews
  const themesList = [
    { id: 'sky', label: 'Sky Blue', gradient: 'from-blue-400 to-sky-500', bg: '#f0f7ff', border: 'border-blue-200' },
    { id: 'forest', label: 'Forest Green', gradient: 'from-emerald-500 to-teal-600', bg: '#f0faf4', border: 'border-emerald-250' },
    { id: 'lavender', label: 'Lavender', gradient: 'from-purple-500 to-violet-600', bg: '#f7f2ff', border: 'border-purple-200' },
    { id: 'peach', label: 'Peach Orange', gradient: 'from-orange-400 to-rose-500', bg: '#fff3f0', border: 'border-orange-200' },
    { id: 'mint', label: 'Mint Herbal', gradient: 'from-teal-400 to-emerald-500', bg: '#effdfa', border: 'border-teal-200' },
    { id: 'sunrise', label: 'Golden Sunrise', gradient: 'from-amber-400 to-orange-500', bg: '#fffaf0', border: 'border-amber-200' }
  ] as const;

  // Notification triggers mock trigger
  const handleToggleNotification = (key: string) => {
    updatePreferences({ notificationsEnabled: !preferences.notificationsEnabled });
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
    
    // Request permission if enabling
    if (!preferences.notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const handleSeedClick = () => {
    if (confirm('Warning: Seeding demo data will populate a highly consistent 20-day UPSC prep history (June 7 - June 26, 2026). It will overwrite your current progress. Do you want to proceed?')) {
      seedDemoData();
      alert('Demo data successfully seeded! Go check the Heatmap and Analytics page.');
    }
  };

  const handleClearClick = () => {
    if (confirm('Are you sure you want to delete all daily logs, streaks, and achievements? This action cannot be undone.')) {
      clearData();
      alert('All progress data cleared successfully.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Heading */}
      <div className="select-none">
        <h3 className="text-xl font-black text-theme-text-main">Settings Panel ⚙️</h3>
        <p className="text-xs text-theme-text-muted mt-0.5">Customize your ambient theme, notification alerts, and manage database synchronization.</p>
      </div>

      {/* 1. Theme Gallery */}
      <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm">
        <div className="flex items-center space-x-2.5 border-b border-theme-card-border/60 pb-3 mb-5 select-none">
          <Palette size={16} className="text-theme-primary" />
          <h4 className="font-bold text-sm text-theme-text-main">Ambient Theme Gallery</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {themesList.map((t) => {
            const isSelected = theme === t.id;
            return (
              <motion.div
                key={t.id}
                whileHover={{ y: -2 }}
                onClick={() => setTheme(t.id)}
                className={`cursor-pointer rounded-2xl border p-3.5 flex flex-col justify-between items-center text-center space-y-3 transition-all duration-300 select-none
                  ${isSelected 
                    ? 'border-theme-primary bg-theme-primary/5 ring-2 ring-theme-primary ring-offset-1 shadow-md' 
                    : 'border-theme-card-border bg-white hover:bg-theme-primary/5 hover:border-theme-primary/10'
                  }`}
              >
                {/* Visual circle color preview */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${t.gradient} shadow-inner shrink-0`} />
                
                <div>
                  <div className="text-xs font-bold text-theme-text-main">{t.label}</div>
                  <div className="text-[9px] text-theme-text-muted mt-0.5">Warm tone</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 2. Notification Preferences & Smart Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Notifications toggles */}
        <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm flex flex-col justify-between select-none">
          <div>
            <div className="flex items-center justify-between border-b border-theme-card-border/60 pb-3 mb-4">
              <div className="flex items-center space-x-2.5">
                <Bell size={16} className="text-theme-primary" />
                <h4 className="font-bold text-sm text-theme-text-main">Smart Reminders & Alerts</h4>
              </div>
              <AnimatePresence>
                {notifSaved && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded"
                  >
                    Saved!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between p-1">
                <div>
                  <div className="text-xs font-bold text-theme-text-main">HTML5 Desktop Notifications</div>
                  <div className="text-[10px] text-theme-text-muted">Receive reminders directly on your computer</div>
                </div>
                <button
                  onClick={() => handleToggleNotification('global')}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative focus:outline-none border
                    ${preferences.notificationsEnabled
                      ? 'bg-theme-primary border-theme-primary text-white'
                      : 'bg-slate-200 border-slate-350 text-slate-400'
                    }`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all duration-300
                      ${preferences.notificationsEnabled ? 'left-5.5' : 'left-0.5'}`} 
                  />
                </button>
              </div>

              {/* Reminder descriptions */}
              <div className="p-3.5 bg-theme-primary/5 rounded-2xl border border-theme-primary/10 space-y-2 text-[10px] text-theme-text-muted leading-relaxed">
                <p>💡 **Morning Reminder (8 AM):** "Wake up call, set Today's Mission!"</p>
                <p>💡 **Current Affairs Reminder (2 PM):** "Analyze the Hindu/Indian Express edit page."</p>
                <p>💡 **Revision Alert (6 PM):** "Active recall slot, revise static topics."</p>
                <p>💡 **Night Reflection (11 PM):** "Reflect on accomplishments, check checklists!"</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Demo / Dev Mode seeding actions */}
        <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm flex flex-col justify-between select-none">
          <div>
            <div className="flex items-center space-x-2.5 border-b border-theme-card-border/60 pb-3 mb-4">
              <RefreshCw size={16} className="text-theme-primary" />
              <h4 className="font-bold text-sm text-theme-text-main">Data Management & Demo Mode</h4>
            </div>
            
            <p className="text-xs text-theme-text-muted leading-relaxed mb-4">
              Aspirants can seed high-consistency mock data to instantly unlock locks, populate the heatmap, fill analytics Recharts graphs, and inspect how the progress system behaves.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSeedClick}
              className="flex-1 py-3 px-4 rounded-2xl bg-white border border-theme-card-border text-theme-text-main font-bold text-xs hover:bg-theme-primary/5 hover:border-theme-primary/20 transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <Database size={13} className="text-theme-primary" />
              <span>Seed UPSC Demo Data</span>
            </button>

            <button
              onClick={handleClearClick}
              className="flex-1 py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Trash2 size={13} />
              <span>Clear All Tracker Data</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Production Database Connection Guide (Supabase Sync) */}
      <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 select-none">
        
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center space-x-2 text-theme-primary">
            <Database size={16} />
            <h4 className="font-black text-sm text-theme-text-main uppercase tracking-wider">
              Supabase / PostgreSQL Cloud Sync
            </h4>
          </div>
          <h4 className="text-base font-bold text-theme-text-main">
            Connect Cloud Database for Multi-Device Syncing
          </h4>
          <p className="text-xs text-theme-text-muted leading-relaxed max-w-2xl">
            Currently running in **LocalStorage Mode** (data is saved locally in this browser). For production sync, write your credentials inside a `.env.local` file:
          </p>
          <pre className="text-[10px] bg-slate-800 text-slate-200 p-3.5 rounded-2xl font-mono leading-relaxed select-all">
{`NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key`}
          </pre>
        </div>

        <div className="shrink-0 text-center">
          <div className="w-12 h-12 bg-theme-primary/10 rounded-2xl flex items-center justify-center text-theme-primary mx-auto mb-2.5">
            <Database size={22} />
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
            Ready for Cloud
          </span>
        </div>

      </div>

    </div>
  );
}
