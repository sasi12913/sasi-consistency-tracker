'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatDate, DailyLog, CHECKLIST_ITEMS } from '@/lib/storage';
import Heatmap from '@/components/Heatmap';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, Star, Compass, ShieldAlert, Award } from 'lucide-react';

export default function AnalyticsPage() {
  const { logs, theme } = useApp();
  const [selectedDate, setSelectedDate] = useState('');
  const [logsList, setLogsList] = useState<DailyLog[]>([]);

  useEffect(() => {
    const todayStr = formatDate(new Date());
    setSelectedDate(todayStr);
    setLogsList(Object.values(logs).sort((a, b) => a.date.localeCompare(b.date)));
  }, [logs]);

  // Resolve theme colors dynamically for Recharts fills
  const getThemeColors = () => {
    switch (theme) {
      case 'forest':
        return { primary: '#10b981', secondary: '#34d399', fill: 'rgba(16, 185, 129, 0.15)' };
      case 'lavender':
        return { primary: '#a855f7', secondary: '#c084fc', fill: 'rgba(168, 85, 247, 0.15)' };
      case 'peach':
        return { primary: '#f97316', secondary: '#fb923c', fill: 'rgba(249, 115, 22, 0.15)' };
      case 'mint':
        return { primary: '#14b8a6', secondary: '#2dd4bf', fill: 'rgba(20, 184, 166, 0.15)' };
      case 'sunrise':
        return { primary: '#f59e0b', secondary: '#fbbf24', fill: 'rgba(245, 158, 11, 0.15)' };
      case 'sky':
      default:
        return { primary: '#3b82f6', secondary: '#60a5fa', fill: 'rgba(59, 130, 246, 0.15)' };
    }
  };

  const colors = getThemeColors();

  // 1. Data for Consistency Trend (Area Chart - last 15 active logged days)
  const getConsistencyTrendData = () => {
    // Take the last 15 logs
    const sliceLogs = logsList.slice(-15);
    return sliceLogs.map(log => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: log.score,
      consistency: log.consistencyScore
    }));
  };

  // 2. Data for Mission Graph (Bar Chart - grouped by month)
  const getMissionData = () => {
    const monthsGroup: Record<string, { monthName: string; set: number; completed: number }> = {};
    
    logsList.forEach(log => {
      const mKey = log.date.substring(0, 7); // YYYY-MM
      const mName = new Date(log.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthsGroup[mKey]) {
        monthsGroup[mKey] = { monthName: mName, set: 0, completed: 0 };
      }
      
      if (log.missionTitle) {
        monthsGroup[mKey].set++;
        if (log.missionCompleted) {
          monthsGroup[mKey].completed++;
        }
      }
    });

    const data = Object.values(monthsGroup);
    return data.length > 0 ? data : [{ monthName: 'No Data', set: 0, completed: 0 }];
  };

  // 3. Data for Radar Performance (Category Breakdown)
  const getRadarData = () => {
    if (logsList.length === 0) {
      return [
        { subject: 'Self-discipline', A: 0, fullMark: 100 },
        { subject: 'Core Study', A: 0, fullMark: 100 },
        { subject: 'Revision', A: 0, fullMark: 100 },
        { subject: 'Health', A: 0, fullMark: 100 }
      ];
    }

    const categories = {
      'Self-discipline': { completed: 0, total: 0 },
      'Core Study': { completed: 0, total: 0 },
      'Revision': { completed: 0, total: 0 },
      'Health': { completed: 0, total: 0 }
    };

    logsList.forEach(log => {
      // Core study count (No Zero Day, Bare Acts, Current Affairs, PYQs, Notes Made) -> 5 items
      // Self discipline count (Wake up, Sleep, Don't Tap, No Scroll) -> 4 items
      // Revision -> 1 item
      // Health -> 1 item
      
      CHECKLIST_ITEMS.forEach(item => {
        const cat = item.category as keyof typeof categories;
        if (categories[cat]) {
          categories[cat].total++;
          if (log.tasksCompleted.includes(item.id)) {
            categories[cat].completed++;
          }
        }
      });
    });

    return Object.keys(categories).map(catKey => {
      const cat = categories[catKey as keyof typeof categories];
      const rate = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
      return {
        subject: catKey,
        A: rate,
        fullMark: 100
      };
    });
  };

  const consistencyData = getConsistencyTrendData();
  const missionData = getMissionData();
  const radarData = getRadarData();

  return (
    <div className="space-y-6">
      
      {/* Page Heading */}
      <div className="select-none">
        <h3 className="text-xl font-black text-theme-text-main">Analytics Dashboard 📊</h3>
        <p className="text-xs text-theme-text-muted mt-0.5">Explore your UPSC discipline metrics, streaks, and heatmap performance.</p>
      </div>

      {/* Interactive Heatmap Matrix */}
      <div className="space-y-2">
        <h4 className="text-sm font-extrabold text-theme-primary uppercase tracking-wider select-none">
          UPSC Journey Contribution Map (June - Dec 2026)
        </h4>
        <Heatmap 
          selectedDate={selectedDate} 
          onSelectDate={(date) => setSelectedDate(date)} 
        />
      </div>

      {/* Grid of Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        
        {/* CHART 1: Consistency Score Trend (Area Chart) */}
        <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 border-b border-theme-card-border/60 pb-3 mb-4">
            <TrendingUp size={16} className="text-theme-primary" />
            <span className="font-bold text-sm text-theme-text-main">Consistency Score Trend (Daily Score)</span>
          </div>

          <div className="w-full h-64 text-xs font-semibold text-theme-text-muted">
            {consistencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={consistencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--theme-text-muted)" opacity={0.6} tickLine={false} />
                  <YAxis domain={[0, 14]} tickCount={8} stroke="var(--theme-text-muted)" opacity={0.6} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.85)', 
                      borderRadius: '12px', 
                      border: '1px solid var(--theme-card-border)' 
                    }} 
                  />
                  <Area type="monotone" dataKey="score" stroke={colors.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorConsistency)" name="Daily Score" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full italic">No logged data to plot.</div>
            )}
          </div>
          <p className="text-[10px] text-theme-text-muted mt-3 text-center">
            Plots the scores of your last 15 logged study days (Max 14 pts).
          </p>
        </div>

        {/* CHART 2: Today's Mission Ratio (Bar Chart) */}
        <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 border-b border-theme-card-border/60 pb-3 mb-4">
            <BarChart3 size={16} className="text-theme-primary" />
            <span className="font-bold text-sm text-theme-text-main">Today's Mission Completion Ratio</span>
          </div>

          <div className="w-full h-64 text-xs font-semibold text-theme-text-muted">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="monthName" stroke="var(--theme-text-muted)" opacity={0.6} tickLine={false} />
                <YAxis stroke="var(--theme-text-muted)" opacity={0.6} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(255, 255, 255, 0.85)', 
                    borderRadius: '12px', 
                    border: '1px solid var(--theme-card-border)' 
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="set" fill="rgba(var(--theme-primary-rgb), 0.2)" radius={[4, 4, 0, 0]} name="Missions Set" />
                <Bar dataKey="completed" fill={colors.primary} radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-theme-text-muted mt-3 text-center">
            Ratios of primary missions defined vs successfully cleared.
          </p>
        </div>

        {/* CHART 3: Performance Radar Breakdown */}
        <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 border-b border-theme-card-border/60 pb-3 mb-4">
            <Compass size={16} className="text-theme-primary" />
            <span className="font-bold text-sm text-theme-text-main">UPSC Preparation Radar</span>
          </div>

          <div className="w-full h-64 text-xs font-semibold text-theme-text-muted flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="var(--theme-card-border)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--theme-text-main)" fontSize={11} fontWeight="bold" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--theme-text-muted)" opacity={0.4} />
                <Radar name="Category Performance" dataKey="A" stroke={colors.primary} fill={colors.primary} fillOpacity={0.25} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-theme-text-muted mt-3 text-center">
            Maps historical completion percentage across prep disciplines.
          </p>
        </div>

        {/* ANALYTICS HIGHLIGHTS SUMMARY CARD */}
        <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-2 border-b border-theme-card-border/60 pb-3 mb-4">
            <Award size={16} className="text-theme-primary" />
            <span className="font-bold text-sm text-theme-text-main">Historical Insights</span>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            <div className="p-3.5 rounded-2xl bg-white/60 border border-theme-card-border flex items-center justify-between">
              <span className="text-xs font-bold text-theme-text-main">Average Consistency</span>
              <span className="text-sm font-black text-theme-primary">
                {logsList.length > 0
                  ? `${Math.round(logsList.reduce((acc, curr) => acc + curr.consistencyScore, 0) / logsList.length)}%`
                  : 'N/A'
                }
              </span>
            </div>
            
            <div className="p-3.5 rounded-2xl bg-white/60 border border-theme-card-border flex items-center justify-between">
              <span className="text-xs font-bold text-theme-text-main">Mission Completion Rate</span>
              <span className="text-sm font-black text-yellow-600">
                {logsList.length > 0
                  ? `${Math.round((logsList.filter(l => l.missionCompleted).length / Math.max(1, logsList.filter(l => l.missionTitle).length)) * 100)}%`
                  : 'N/A'
                }
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/60 border border-theme-card-border flex items-center justify-between">
              <span className="text-xs font-bold text-theme-text-main">Most Consistent Task</span>
              <span className="text-sm font-black text-emerald-600">
                {logsList.length > 0
                  ? (() => {
                      const counts: Record<string, number> = {};
                      logsList.forEach(log => {
                        log.tasksCompleted.forEach(id => {
                          counts[id] = (counts[id] || 0) + 1;
                        });
                      });
                      const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
                      if (sorted.length > 0) {
                        const item = CHECKLIST_ITEMS.find(i => i.id === sorted[0]);
                        return item ? item.label.split(' ')[0] : 'None';
                      }
                      return 'None';
                    })()
                  : 'N/A'
                }
              </span>
            </div>
          </div>
          <p className="text-[10px] text-theme-text-muted mt-3 text-center">
            Insights dynamically computed across all saved daily checklists.
          </p>
        </div>

      </div>

    </div>
  );
}
