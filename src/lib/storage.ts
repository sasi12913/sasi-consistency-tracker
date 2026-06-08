// Unified Storage Service for SASI Consistency Tracker (GOAT Edition)

export interface DailyLog {
  date: string; // YYYY-MM-DD
  tasksCompleted: string[]; // List of task IDs completed
  missionTitle: string; // Today's primary 3-point task
  missionCompleted: boolean;
  score: number; // calculated: 3 * missionCompleted + 1 * tasksCompleted.length (excluding mission)
  consistencyScore: number; // percentage (score / 14 * 100)
  notes?: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
  progressText?: string;
}

export interface UserPreferences {
  theme: 'sky' | 'forest' | 'lavender' | 'peach' | 'mint' | 'sunrise';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  targetWakeUpTime: string;
  targetSleepTime: string;
}

// Default UPSC Checklist Tasks (excluding the special Mission)
export const CHECKLIST_ITEMS = [
  { id: 'wake_up', label: 'Wake up before 8 AM', category: 'Self-discipline', points: 1 },
  { id: 'sleep', label: 'Sleep before 11:30 PM', category: 'Self-discipline', points: 1 },
  { id: 'exercise', label: 'Exercise (Min 20 mins)', category: 'Health', points: 1 },
  { id: 'dont_tap', label: 'Don\'t Tap (No mindless visual triggers)', category: 'Self-discipline', points: 1 },
  { id: 'no_scroll', label: 'No Scroll (No social media/doom scrolling)', category: 'Self-discipline', points: 1 },
  { id: 'no_zero_day', label: 'No Zero Day (Committed study focus)', category: 'Core Study', points: 1 },
  { id: 'bare_acts', label: 'Bare Acts Reading (Constitution/Law)', category: 'Core Study', points: 1 },
  { id: 'current_affairs', label: 'Current Affairs Analysis (News/IAS Prep)', category: 'Core Study', points: 1 },
  { id: 'pyqs', label: 'PYQs Practice (Previous Year Questions)', category: 'Core Study', points: 1 },
  { id: 'revision', label: 'Revision (Daily active recall)', category: 'Revision', points: 1 },
  { id: 'notes_made', label: 'Notes Made / Flowcharts created', category: 'Core Study', points: 1 }
];

// Today's Mission has ID 'todays_mission' and weight 3

export const JOURNEY_START_DATE = '2026-06-07';
export const JOURNEY_END_DATE = '2026-12-31';

export const ALL_MONTHS = [
  { key: '2026-06', label: 'June 2026', daysInMonth: 30, startDay: 7 },
  { key: '2026-07', label: 'July 2026', daysInMonth: 31, startDay: 1 },
  { key: '2026-08', label: 'August 2026', daysInMonth: 31, startDay: 1 },
  { key: '2026-09', label: 'September 2026', daysInMonth: 30, startDay: 1 },
  { key: '2026-10', label: 'October 2026', daysInMonth: 31, startDay: 1 },
  { key: '2026-11', label: 'November 2026', daysInMonth: 30, startDay: 1 },
  { key: '2026-12', label: 'December 2026', daysInMonth: 31, startDay: 1 }
];

// Badge Metadata definitions
export const BADGES_METADATA: AchievementBadge[] = [
  { id: 'early_bird', title: 'Early Bird', description: 'Wake up before 8 AM completed 5 times', iconName: 'Sun' },
  { id: 'mission_master', title: 'Mission Master', description: 'Complete Today\'s Mission 10 times', iconName: 'Target' },
  { id: 'no_scroll_warrior', title: 'No Scroll Warrior', description: 'Maintain "No Scroll" for 7 consecutive days', iconName: 'ShieldAlert' },
  { id: 'exercise_warrior', title: 'Exercise Warrior', description: 'Complete Exercise checklist item 10 times', iconName: 'Flame' },
  { id: 'consistency_king', title: 'Consistency King', description: 'Maintain over 90% Monthly Consistency Score', iconName: 'Crown' },
  { id: 'discipline_beast', title: 'Discipline Beast', description: 'Complete all 12 tasks in a single day', iconName: 'Trophy' },
  { id: 'perfect_week', title: 'Perfect Week', description: 'Achieve daily score of >= 10 points for 7 consecutive days', iconName: 'Star' },
  { id: 'perfect_month', title: 'Perfect Month', description: 'All days in a month logged with >= 80% consistency', iconName: 'Compass' },
  { id: 'streak_30', title: '30 Day Streak', description: 'Reach a streak of 30 consecutive days', iconName: 'Zap' },
  { id: 'streak_60', title: '60 Day Streak', description: 'Reach a streak of 60 consecutive days', iconName: 'Activity' },
  { id: 'streak_100', title: '100 Day Streak', description: 'Reach a streak of 100 consecutive days', iconName: 'Award' }
];

// LocalStorage Keys
const KEYS = {
  LOGS: 'sasi_tracker_logs',
  STREAK: 'sasi_tracker_streak',
  ACHIEVEMENTS: 'sasi_tracker_achievements',
  PREFERENCES: 'sasi_tracker_preferences',
  DEMO_SEEDED: 'sasi_tracker_demo_seeded_2'
};

// Initial Preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'sky',
  notificationsEnabled: true,
  soundEnabled: true,
  soundVolume: 0.5,
  targetWakeUpTime: '08:00',
  targetSleepTime: '23:30'
};

// Parses a YYYY-MM-DD string into a local Date object at midnight
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
}

// Utility to calculate distance of dates in days
export function getDateDifference(d1: string, d2: string): number {
  const date1 = parseLocalDate(d1);
  const date2 = parseLocalDate(d2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Formats Date object to YYYY-MM-DD
export function formatDate(date: Date): string {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

// Calculate score for a log
export function calculateLogScore(log: Partial<DailyLog>): number {
  let score = 0;
  if (log.missionCompleted) {
    score += 3;
  }
  if (log.tasksCompleted) {
    // Exclude 'todays_mission' from standard list if present, but here it is separate
    score += log.tasksCompleted.length;
  }
  return score;
}

// Initial seed data generator (June 7 to June 25, 2026, representing mock history for testing lock unlocks!)
export function generateMockLogs(): Record<string, DailyLog> {
  const mockLogs: Record<string, DailyLog> = {};
  const startDate = parseLocalDate(JOURNEY_START_DATE);
  
  // We will seed mock history up to June 26, 2026 (approx 20 days) to allow users to see a "semi-filled" month
  // and see what is required to unlock July.
  // Today's current local date in metadata is June 6, 2026.
  // So to allow testing without waiting for June 26, we seed it in "Practice Mode" or "Completed Demo"
  for (let i = 0; i < 20; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    const dateStr = formatDate(current);
    
    // High compliance days (mostly 85%+ consistency)
    const isHighPerf = Math.random() > 0.15;
    const missionCompleted = Math.random() > 0.1;
    const missionTitles = [
      'Complete Lakshmikanth Polity Ch 1-3',
      'Solve 50 Geography PYQs',
      'Revise Modern History Notes',
      'Read Spectrum Ch 12 on Revolt of 1857',
      'Practice Mains Economy Answer Writing',
      'Revise Environment & Ecology basics',
      'Analyze Union Budget highlights'
    ];
    
    const tasksCompleted = [...CHECKLIST_ITEMS]
      .filter(() => isHighPerf ? Math.random() > 0.1 : Math.random() > 0.4)
      .map(item => item.id);
      
    const score = (missionCompleted ? 3 : 0) + tasksCompleted.length;
    const consistencyScore = Math.round((score / 14) * 100);
    
    mockLogs[dateStr] = {
      date: dateStr,
      tasksCompleted,
      missionTitle: missionTitles[i % missionTitles.length],
      missionCompleted,
      score,
      consistencyScore,
      notes: `Day ${i + 1} of UPSC prep. ${isHighPerf ? 'Highly focused session.' : 'Felt slightly distracted in evening, revised basics.'}`
    };
  }
  
  return mockLogs;
}

// Checks and awards achievements based on logs
export function evaluateAchievements(
  logs: Record<string, DailyLog>,
  streak: Streak
): string[] {
  const unlocked: string[] = [];
  const logValues = Object.values(logs);
  
  // 1. Discipline Beast (Complete all 12 tasks in a single day - 11 tasks + mission = 14 score)
  const hasDisciplineBeast = logValues.some(log => log.score === 14);
  if (hasDisciplineBeast) unlocked.push('discipline_beast');

  // 2. Early Bird (Wake up before 8 AM completed 5 times)
  const earlyBirdCount = logValues.filter(log => log.tasksCompleted.includes('wake_up')).length;
  if (earlyBirdCount >= 5) unlocked.push('early_bird');

  // 3. Mission Master (Complete Today's Mission 10 times)
  const missionMasterCount = logValues.filter(log => log.missionCompleted).length;
  if (missionMasterCount >= 10) unlocked.push('mission_master');

  // 4. Exercise Warrior (Exercise item 10 times)
  const exerciseCount = logValues.filter(log => log.tasksCompleted.includes('exercise')).length;
  if (exerciseCount >= 10) unlocked.push('exercise_warrior');

  // 5. Streaks Badges
  if (streak.longestStreak >= 30) unlocked.push('streak_30');
  if (streak.longestStreak >= 60) unlocked.push('streak_60');
  if (streak.longestStreak >= 100) unlocked.push('streak_100');

  // 6. No Scroll Warrior (7 consecutive days with no_scroll)
  // We can sort logs by date and check consecutive runs
  const sortedDates = Object.keys(logs).sort();
  let maxConsecutiveNoScroll = 0;
  let currentNoScrollRun = 0;
  
  for (let i = 0; i < sortedDates.length; i++) {
    const log = logs[sortedDates[i]];
    if (log.tasksCompleted.includes('no_scroll')) {
      currentNoScrollRun++;
      if (currentNoScrollRun > maxConsecutiveNoScroll) {
        maxConsecutiveNoScroll = currentNoScrollRun;
      }
    } else {
      currentNoScrollRun = 0;
    }
  }
  if (maxConsecutiveNoScroll >= 7) unlocked.push('no_scroll_warrior');

  // 7. Perfect Week (7 consecutive days with daily score >= 10)
  let maxConsecutivePerfectDays = 0;
  let currentPerfectRun = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    const log = logs[sortedDates[i]];
    if (log.score >= 10) {
      currentPerfectRun++;
      if (currentPerfectRun > maxConsecutivePerfectDays) {
        maxConsecutivePerfectDays = currentPerfectRun;
      }
    } else {
      currentPerfectRun = 0;
    }
  }
  if (maxConsecutivePerfectDays >= 7) unlocked.push('perfect_week');

  // 8. Consistency King & Perfect Month (can be evaluated when a month is completed,
  // we can check if any month has avg consistency >= 90% or all logged days with >= 80%)
  const monthlyGroups: Record<string, DailyLog[]> = {};
  logValues.forEach(log => {
    const monthKey = log.date.substring(0, 7); // YYYY-MM
    if (!monthlyGroups[monthKey]) monthlyGroups[monthKey] = [];
    monthlyGroups[monthKey].push(log);
  });

  let hasConsistencyKing = false;
  let hasPerfectMonth = false;
  
  Object.keys(monthlyGroups).forEach(monthKey => {
    const monthLogs = monthlyGroups[monthKey];
    if (monthLogs.length >= 20) { // evaluated only if at least 20 days are logged
      const sumConsistency = monthLogs.reduce((acc, curr) => acc + curr.consistencyScore, 0);
      const avgConsistency = sumConsistency / monthLogs.length;
      if (avgConsistency >= 90) hasConsistencyKing = true;
      
      const allDaysAbove80 = monthLogs.every(log => log.consistencyScore >= 80);
      if (allDaysAbove80 && monthLogs.length >= 25) hasPerfectMonth = true;
    }
  });

  if (hasConsistencyKing) unlocked.push('consistency_king');
  if (hasPerfectMonth) unlocked.push('perfect_month');

  return unlocked;
}

// Calculate Streaks
export function calculateStreak(logs: Record<string, DailyLog>): Streak {
  const sortedDates = Object.keys(logs).filter(d => logs[d].score > 0).sort();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  
  // Get today's date in local YYYY-MM-DD
  const todayStr = formatDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // If there are logs, walk backwards to find current streak
  let latestLoggedDate = sortedDates[sortedDates.length - 1];
  
  // The streak is active if there is a log today, or if yesterday was logged and today is still in progress
  const hasLogToday = logs[todayStr] && logs[todayStr].score > 0;
  const hasLogYesterday = logs[yesterdayStr] && logs[yesterdayStr].score > 0;

  if (hasLogToday || hasLogYesterday) {
    let checkDate = hasLogToday ? new Date() : yesterday;
    let keepWalking = true;
    
    while (keepWalking) {
      const checkStr = formatDate(checkDate);
      if (logs[checkStr] && logs[checkStr].score > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        keepWalking = false;
      }
    }
  }

  // Calculate longest streak historically
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = parseLocalDate(sortedDates[i]);
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diff = getDateDifference(formatDate(prevDate), sortedDates[i]);
      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currentDate;
  }

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: latestLoggedDate
  };
}

export interface WeekPeriod {
  weekNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCompleted: boolean;
}

export function getWeeksRange(toDateStr?: string): WeekPeriod[] {
  const start = parseLocalDate(JOURNEY_START_DATE);
  const endLimit = parseLocalDate(JOURNEY_END_DATE);
  const targetDate = toDateStr ? parseLocalDate(toDateStr) : new Date();
  
  const weeks: WeekPeriod[] = [];
  let currentStart = new Date(start);
  let weekNum = 1;
  
  while (currentStart <= endLimit) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + 6);
    
    // Cap at JOURNEY_END_DATE
    const endDateObj = currentEnd > endLimit ? endLimit : currentEnd;
    
    const startStr = formatDate(currentStart);
    const endStr = formatDate(endDateObj);
    
    // A week is completed if targetDate is strictly after the week's end date
    const todayStr = formatDate(targetDate);
    const isCompleted = todayStr > endStr;
    
    weeks.push({
      weekNumber: weekNum,
      startDate: startStr,
      endDate: endStr,
      isCompleted
    });
    
    currentStart.setDate(currentStart.getDate() + 7);
    weekNum++;
  }
  
  return weeks;
}

// Month Lock Evaluation
export interface MonthStatus {
  key: string; // YYYY-MM
  label: string;
  isUnlocked: boolean;
  totalDays: number;
  completedDays: number;
  consistency: number; // monthly consistency %
  reqsRemaining: {
    daysLeft: number;
    consistencyNeeded: boolean;
  };
}

export function evaluateMonthLockStatuses(logs: Record<string, DailyLog>): MonthStatus[] {
  const statuses: MonthStatus[] = [];
  
  // Sort months
  for (let i = 0; i < ALL_MONTHS.length; i++) {
    const month = ALL_MONTHS[i];
    const monthKey = month.key;
    
    // Filter logs in this specific month
    const monthLogs = Object.values(logs).filter(log => log.date.substring(0, 7) === monthKey);
    const completedDays = monthLogs.filter(log => log.score >= 8).length; // A completed day is score >= 8
    
    // Average consistency score of logged days
    const totalLogsCount = monthLogs.length;
    const avgConsistency = totalLogsCount > 0 
      ? Math.round(monthLogs.reduce((acc, curr) => acc + curr.consistencyScore, 0) / totalLogsCount) 
      : 0;

    let isUnlocked = false;

    // June 2026 is unlocked by default
    if (monthKey === '2026-06') {
      isUnlocked = true;
    } else {
      // Unlocked if previous month meets the criteria: >= 80% consistency and >= 20 completed days
      const prevMonth = ALL_MONTHS[i - 1];
      const prevMonthLogs = Object.values(logs).filter(log => log.date.substring(0, 7) === prevMonth.key);
      const prevCompletedDays = prevMonthLogs.filter(log => log.score >= 8).length;
      const prevAvgConsistency = prevMonthLogs.length > 0 
        ? Math.round(prevMonthLogs.reduce((acc, curr) => acc + curr.consistencyScore, 0) / prevMonthLogs.length) 
        : 0;
      
      isUnlocked = prevCompletedDays >= 20 && prevAvgConsistency >= 80;
    }

    // Requirements remaining for unlocking *next* month
    const daysRemaining = Math.max(0, 20 - completedDays);
    const consistencyNeeded = avgConsistency < 80;

    statuses.push({
      key: monthKey,
      label: month.label,
      isUnlocked,
      totalDays: month.daysInMonth,
      completedDays,
      consistency: avgConsistency,
      reqsRemaining: {
        daysLeft: daysRemaining,
        consistencyNeeded
      }
    });
  }

  return statuses;
}

// Main Data Fetch API
export function loadTrackerState(seedIfEmpty: boolean = false) {
  if (typeof window === 'undefined') {
    return {
      logs: {},
      streak: { currentStreak: 0, longestStreak: 0 },
      achievements: [],
      preferences: DEFAULT_PREFERENCES,
      months: evaluateMonthLockStatuses({})
    };
  }

  // Load Preferences
  let preferences = DEFAULT_PREFERENCES;
  try {
    const savedPrefs = localStorage.getItem(KEYS.PREFERENCES);
    if (savedPrefs) preferences = JSON.parse(savedPrefs);
  } catch (e) {
    console.error('Failed to load preferences', e);
  }

  // Load Logs
  let logs: Record<string, DailyLog> = {};
  const savedLogs = localStorage.getItem(KEYS.LOGS);
  
  if (savedLogs) {
    try {
      logs = JSON.parse(savedLogs);
    } catch (e) {
      console.error('Failed to load logs', e);
    }
  } else if (seedIfEmpty) {
    // Seed initial mock logs so charts aren't blank
    logs = generateMockLogs();
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
    localStorage.setItem(KEYS.DEMO_SEEDED, 'true');
  }

  // Calculate Streak
  const streak = calculateStreak(logs);
  localStorage.setItem(KEYS.STREAK, JSON.stringify(streak));

  // Load Achievements
  let achievements: string[] = evaluateAchievements(logs, streak);
  localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));

  // Months unlock status
  const months = evaluateMonthLockStatuses(logs);

  return {
    logs,
    streak,
    achievements,
    preferences,
    months
  };
}

// State Save Helper
export function saveTrackerState(
  logs: Record<string, DailyLog>,
  preferences: UserPreferences
) {
  if (typeof window === 'undefined') return;

  // Save Preferences
  localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(preferences));

  // Save Logs
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));

  // Re-calculate Streak, Achievements, Month Locks
  const streak = calculateStreak(logs);
  localStorage.setItem(KEYS.STREAK, JSON.stringify(streak));

  const achievements = evaluateAchievements(logs, streak);
  localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));

  const months = evaluateMonthLockStatuses(logs);

  return {
    streak,
    achievements,
    months
  };
}

// Seed Force Helper
export function forceSeedDemoData() {
  if (typeof window === 'undefined') return;
  const logs = generateMockLogs();
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  localStorage.setItem(KEYS.DEMO_SEEDED, 'true');
  return loadTrackerState(false);
}

// Reset Helper
export function clearAllTrackerData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.LOGS);
  localStorage.removeItem(KEYS.STREAK);
  localStorage.removeItem(KEYS.ACHIEVEMENTS);
  localStorage.removeItem(KEYS.DEMO_SEEDED);
  // Keep preferences
  return loadTrackerState(false);
}

export interface WeekReportData {
  startOfWeek: string;
  endOfWeek: string;
  avgConsistency: number;
  totalScore: number;
  missionsSet: number;
  missionsCompleted: number;
  whatsGood: string[];
  whatsWrong: string[];
  statement: string;
  hasLogs: boolean;
  grade: string;
}

export function analyzeWeekLogs(
  startDateStr: string,
  endDateStr: string,
  logs: Record<string, DailyLog>
): WeekReportData {
  const weekLogs: DailyLog[] = [];
  const [year, month, day] = startDateStr.split('-').map(Number);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(year, month - 1, day + i);
    const dateKey = formatDate(d);
    if (logs[dateKey]) {
      weekLogs.push(logs[dateKey]);
    }
  }

  if (weekLogs.length === 0) {
    return {
      startOfWeek: startDateStr,
      endOfWeek: endDateStr,
      avgConsistency: 0,
      totalScore: 0,
      missionsSet: 0,
      missionsCompleted: 0,
      whatsGood: [],
      whatsWrong: [],
      statement: '',
      hasLogs: false,
      grade: 'C'
    };
  }

  const totalScore = weekLogs.reduce((acc, l) => acc + l.score, 0);
  const avgConsistency = Math.round(
    weekLogs.reduce((acc, l) => acc + l.consistencyScore, 0) / weekLogs.length
  );

  let missionsSet = 0;
  let missionsCompleted = 0;
  const taskCounts: Record<string, number> = {};

  weekLogs.forEach(log => {
    if (log.missionTitle) {
      missionsSet++;
      if (log.missionCompleted) {
        missionsCompleted++;
      }
    }
    log.tasksCompleted.forEach(taskId => {
      taskCounts[taskId] = (taskCounts[taskId] || 0) + 1;
    });
  });

  const whatsGood: string[] = [];
  const whatsWrong: string[] = [];

  const thresholdGood = Math.max(1, Math.ceil(weekLogs.length * 0.6));
  const thresholdWrong = Math.floor(weekLogs.length * 0.3);

  // Analyze primary missions
  if (missionsSet > 0) {
    const ratio = missionsCompleted / missionsSet;
    if (ratio >= 0.8) {
      whatsGood.push(`Mission Master: Completed ${missionsCompleted}/${missionsSet} primary missions!`);
    } else if (ratio <= 0.4) {
      whatsWrong.push(`Missed Missions: Completed only ${missionsCompleted}/${missionsSet} primary missions.`);
    }
  }

  CHECKLIST_ITEMS.forEach(item => {
    const count = taskCounts[item.id] || 0;
    if (count >= thresholdGood) {
      whatsGood.push(`Strong Routine: "${item.label.split(' (')[0]}" (completed ${count} times).`);
    } else if (count <= thresholdWrong) {
      whatsWrong.push(`Needs Focus: "${item.label.split(' (')[0]}" (completed only ${count} times).`);
    }
  });

  let statement = '';
  if (avgConsistency >= 90) {
    statement = "🏆 Outstanding weekly consistency! You are demonstrating the absolute discipline required to clear UPSC.";
  } else if (avgConsistency >= 80) {
    statement = "🔥 Solid week of work! You met the 80% lock criteria target. Maintain this momentum next week.";
  } else if (avgConsistency >= 50) {
    statement = "📚 Moderate progress. You had some slips in your routine. Remember: 'Task complete aachaa illayaa?' Reset and reload.";
  } else {
    statement = "⚠️ Distraction warning. Your weekly consistency is low. UPSC requires showing up even on tough days. Start fresh tomorrow.";
  }

  const grade = avgConsistency >= 80 ? 'A' : avgConsistency >= 50 ? 'B' : 'C';

  return {
    startOfWeek: startDateStr,
    endOfWeek: endDateStr,
    avgConsistency,
    totalScore,
    missionsSet,
    missionsCompleted,
    whatsGood: whatsGood.slice(0, 3),
    whatsWrong: whatsWrong.slice(0, 3),
    statement,
    hasLogs: true,
    grade
  };
}
