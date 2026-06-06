'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatDate, DailyLog } from '@/lib/storage';
import { motion } from 'framer-motion';
import { Flame, Trophy, TrendingUp, Calendar, CheckSquare, Award, Sparkles } from 'lucide-react';

export default function DashboardStats({ selectedDate }: { selectedDate: string }) {
  const { logs, streak } = useApp();

  const getLogsArray = (): DailyLog[] => Object.values(logs);

  // 1. Daily Score for the selected date
  const todayLog = logs[selectedDate];
  const dailyScore = todayLog ? todayLog.score : 0;
  const dailyConsistency = todayLog ? todayLog.consistencyScore : 0;

  // 2. Weekly Score (Sum of scores for the last 7 calendar days up to selectedDate)
  const calculateWeeklyScore = (): number => {
    const date = new Date(selectedDate);
    let scoreSum = 0;
    for (let i = 0; i < 7; i++) {
      const current = new Date(date);
      current.setDate(date.getDate() - i);
      const dateStr = formatDate(current);
      if (logs[dateStr]) {
        scoreSum += logs[dateStr].score;
      }
    }
    return scoreSum;
  };

  // 3. Monthly Score (Sum of scores for the calendar month of the selectedDate)
  const calculateMonthlyScore = (): { score: number; count: number; consistency: number } => {
    const monthPrefix = selectedDate.substring(0, 7); // YYYY-MM
    const monthLogs = getLogsArray().filter(log => log.date.substring(0, 7) === monthPrefix);
    
    const scoreSum = monthLogs.reduce((acc, curr) => acc + curr.score, 0);
    const loggedDays = monthLogs.length;
    const avgConsistency = loggedDays > 0
      ? Math.round(monthLogs.reduce((acc, curr) => acc + curr.consistencyScore, 0) / loggedDays)
      : 0;

    return {
      score: scoreSum,
      count: loggedDays,
      consistency: avgConsistency
    };
  };

  // 4. Overall Score (Sum of all logs)
  const calculateOverallScore = (): number => {
    return getLogsArray().reduce((acc, curr) => acc + curr.score, 0);
  };

  const weeklyScore = calculateWeeklyScore();
  const monthly = calculateMonthlyScore();
  const overallScore = calculateOverallScore();

  // Cards layout configurations
  const statsConfig = [
    {
      title: 'Current Streak',
      value: `${streak.currentStreak} Days`,
      subText: `Longest: ${streak.longestStreak} days`,
      icon: Flame,
      color: 'text-orange-500 bg-orange-50/50 border-orange-100',
      delay: 0
    },
    {
      title: 'Consistency Score',
      value: `${monthly.consistency}%`,
      subText: `Completed Days: ${monthly.count}`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50/50 border-emerald-100',
      delay: 0.05
    },
    {
      title: 'Daily Score',
      value: `${dailyScore} / 14`,
      subText: `${dailyConsistency}% daily target`,
      icon: CheckSquare,
      color: 'text-blue-500 bg-blue-50/50 border-blue-100',
      delay: 0.1
    },
    {
      title: 'Weekly Score',
      value: `${weeklyScore} Pts`,
      subText: 'Sum of last 7 days',
      icon: Calendar,
      color: 'text-purple-500 bg-purple-50/50 border-purple-100',
      delay: 0.15
    },
    {
      title: 'Monthly Score',
      value: `${monthly.score} Pts`,
      subText: `Total logged in ${selectedDate.substring(5, 7) === '06' ? 'June' : 'July'}`,
      icon: Award,
      color: 'text-pink-500 bg-pink-50/50 border-pink-100',
      delay: 0.2
    },
    {
      title: 'Overall Score',
      value: `${overallScore} Pts`,
      subText: 'Journey total score',
      icon: Trophy,
      color: 'text-amber-500 bg-amber-50/50 border-amber-100',
      delay: 0.25
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: stat.delay }}
            className="glass-interactive p-4.5 rounded-2xl flex flex-col justify-between select-none"
          >
            {/* Header: Icon & Title */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-theme-text-muted uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={`p-1.5 rounded-xl border ${stat.color} flex items-center justify-center shrink-0`}>
                <Icon size={14} className="stroke-[2.25]" />
              </div>
            </div>

            {/* Footer: Value & Subtext */}
            <div>
              <div className="text-xl font-black tracking-tight text-theme-text-main">
                {stat.value}
              </div>
              <div className="text-[10px] font-semibold text-theme-text-muted mt-1 truncate">
                {stat.subText}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
