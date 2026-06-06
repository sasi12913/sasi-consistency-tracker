'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  DailyLog,
  Streak,
  AchievementBadge,
  UserPreferences,
  MonthStatus,
  DEFAULT_PREFERENCES,
  BADGES_METADATA,
  loadTrackerState,
  saveTrackerState,
  calculateLogScore,
  forceSeedDemoData,
  clearAllTrackerData,
  formatDate
} from '@/lib/storage';
import { getAmbienceEngine } from '@/lib/sound';

interface AppContextType {
  theme: UserPreferences['theme'];
  logs: Record<string, DailyLog>;
  streak: Streak;
  unlockedAchievements: string[];
  months: MonthStatus[];
  preferences: UserPreferences;
  newlyUnlockedBadge: AchievementBadge | null;
  setTheme: (theme: UserPreferences['theme']) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  toggleTask: (date: string, taskId: string) => void;
  setMission: (date: string, title: string) => void;
  toggleMission: (date: string) => void;
  saveLogNotes: (date: string, notes: string) => void;
  dismissBadgePopup: () => void;
  seedDemoData: () => void;
  clearData: () => void;
  isClient: boolean;
  isNight: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [theme, setThemeState] = useState<UserPreferences['theme']>('sky');
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [streak, setStreak] = useState<Streak>({ currentStreak: 0, longestStreak: 0 });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [months, setMonths] = useState<MonthStatus[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<AchievementBadge | null>(null);
  const [isNight, setIsNight] = useState(false);

  // Initialize state from Storage on client load
  useEffect(() => {
    setIsClient(true);
    const state = loadTrackerState(true);
    
    setLogs(state.logs);
    setStreak(state.streak);
    setUnlockedAchievements(state.achievements);
    setPreferences(state.preferences);
    setThemeState(state.preferences.theme);
    setMonths(state.months);
    
    // Apply initial theme class to HTML element safely
    const html = document.documentElement;
    html.classList.add(`theme-${state.preferences.theme}`);
    html.classList.add('h-full', 'antialiased');
  }, []);

  // Update Day/Night class on load and periodically (Night from 8 PM to 5 AM)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTimeAndApplyClass = () => {
      const hour = new Date().getHours();
      const html = document.documentElement;
      
      const isNightMode = hour >= 20 || hour < 5;
      setIsNight(isNightMode);
      
      if (isNightMode) {
        html.classList.add('mode-night');
        html.classList.remove('mode-day');
      } else {
        html.classList.add('mode-day');
        html.classList.remove('mode-night');
      }
    };

    checkTimeAndApplyClass();
    const interval = setInterval(checkTimeAndApplyClass, 60000);
    return () => clearInterval(interval);
  }, []);

  // Set Theme Helper (syncs to preferences)
  const setTheme = (newTheme: UserPreferences['theme']) => {
    setThemeState(newTheme);
    const updatedPrefs = { ...preferences, theme: newTheme };
    setPreferences(updatedPrefs);
    
    // Update theme class on HTML element safely
    const html = document.documentElement;
    html.className = html.className.replace(/theme-\w+/g, '').trim();
    html.classList.add(`theme-${newTheme}`);
    
    saveTrackerState(logs, updatedPrefs);
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    if (newPrefs.theme) {
      setTheme(newPrefs.theme);
    } else {
      saveTrackerState(logs, updated);
    }
  };

  // State update runner that recalculates streaks and badges
  const runStateUpdates = (updatedLogs: Record<string, DailyLog>, currentPrefs: UserPreferences) => {
    const prevBadges = [...unlockedAchievements];
    const results = saveTrackerState(updatedLogs, currentPrefs);
    
    if (results) {
      setLogs(updatedLogs);
      setStreak(results.streak);
      setUnlockedAchievements(results.achievements);
      setMonths(results.months);

      // Check if a new badge was just unlocked to trigger popup
      const newBadges = results.achievements.filter(b => !prevBadges.includes(b));
      if (newBadges.length > 0) {
        const badgeMeta = BADGES_METADATA.find(b => b.id === newBadges[0]);
        if (badgeMeta) {
          setNewlyUnlockedBadge(badgeMeta);
        }
      }
    }
  };

  const toggleTask = (date: string, taskId: string) => {
    const currentLog = logs[date] || {
      date,
      tasksCompleted: [],
      missionTitle: '',
      missionCompleted: false,
      score: 0,
      consistencyScore: 0
    };

    let updatedTasks = [...currentLog.tasksCompleted];
    if (updatedTasks.includes(taskId)) {
      updatedTasks = updatedTasks.filter(id => id !== taskId);
    } else {
      updatedTasks.push(taskId);
      // Play a quick chime on checklist complete
      if (preferences.soundEnabled) {
        getAmbienceEngine().playSuccessChime();
      }
    }

    const nextLog: DailyLog = {
      ...currentLog,
      tasksCompleted: updatedTasks
    };

    nextLog.score = calculateLogScore(nextLog);
    nextLog.consistencyScore = Math.round((nextLog.score / 14) * 100);

    const updatedLogs = {
      ...logs,
      [date]: nextLog
    };

    runStateUpdates(updatedLogs, preferences);
  };

  const setMission = (date: string, title: string) => {
    const currentLog = logs[date] || {
      date,
      tasksCompleted: [],
      missionTitle: '',
      missionCompleted: false,
      score: 0,
      consistencyScore: 0
    };

    const nextLog: DailyLog = {
      ...currentLog,
      missionTitle: title
    };

    const updatedLogs = {
      ...logs,
      [date]: nextLog
    };

    setLogs(updatedLogs);
    saveTrackerState(updatedLogs, preferences);
  };

  const toggleMission = (date: string) => {
    const currentLog = logs[date] || {
      date,
      tasksCompleted: [],
      missionTitle: '',
      missionCompleted: false,
      score: 0,
      consistencyScore: 0
    };

    const isChecking = !currentLog.missionCompleted;
    if (isChecking && preferences.soundEnabled) {
      getAmbienceEngine().playCelebrationArpeggio();
    }

    const nextLog: DailyLog = {
      ...currentLog,
      missionCompleted: !currentLog.missionCompleted
    };

    nextLog.score = calculateLogScore(nextLog);
    nextLog.consistencyScore = Math.round((nextLog.score / 14) * 100);

    const updatedLogs = {
      ...logs,
      [date]: nextLog
    };

    runStateUpdates(updatedLogs, preferences);
  };

  const saveLogNotes = (date: string, notes: string) => {
    const currentLog = logs[date] || {
      date,
      tasksCompleted: [],
      missionTitle: '',
      missionCompleted: false,
      score: 0,
      consistencyScore: 0
    };

    const nextLog: DailyLog = {
      ...currentLog,
      notes
    };

    const updatedLogs = {
      ...logs,
      [date]: nextLog
    };

    setLogs(updatedLogs);
    saveTrackerState(updatedLogs, preferences);
  };

  const dismissBadgePopup = () => {
    setNewlyUnlockedBadge(null);
  };

  const seedDemoData = () => {
    const state = forceSeedDemoData();
    if (state) {
      setLogs(state.logs);
      setStreak(state.streak);
      setUnlockedAchievements(state.achievements);
      setMonths(state.months);
    }
  };

  const clearData = () => {
    const state = clearAllTrackerData();
    if (state) {
      setLogs(state.logs);
      setStreak(state.streak);
      setUnlockedAchievements(state.achievements);
      setMonths(state.months);
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        logs,
        streak,
        unlockedAchievements,
        months,
        preferences,
        newlyUnlockedBadge,
        setTheme,
        updatePreferences,
        toggleTask,
        setMission,
        toggleMission,
        saveLogNotes,
        dismissBadgePopup,
        seedDemoData,
        clearData,
        isClient,
        isNight
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
