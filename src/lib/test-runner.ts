// High-Level Transaction Flow Test Runner for SASI Consistency Tracker (GOAT Edition)
// Validates core math, streak calculations, badge unlocks, and monthly lock states.

import {
  DailyLog,
  CHECKLIST_ITEMS,
  calculateLogScore,
  calculateStreak,
  evaluateAchievements,
  evaluateMonthLockStatuses,
  formatDate,
  analyzeWeekLogs
} from './storage';

function runTestSuite() {
  console.log('================================================================');
  console.log('     SASI Consistency Tracker — Transaction Flow Test Suite     ');
  console.log('================================================================\n');

  let passedTestsCount = 0;
  let failedTestsCount = 0;

  function assert(testName: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTestsCount++;
    } else {
      console.log(`[FAIL] ${testName}`);
      if (details) console.log(`       Details: ${details}`);
      failedTestsCount++;
    }
  }

  // TEST 1: Baseline Checklist Scoring Formula
  console.log('--- TEST GROUP 1: Core Daily Scoring ---');
  const emptyLog: Partial<DailyLog> = {
    tasksCompleted: [],
    missionCompleted: false
  };
  assert('Score is 0 for empty checklist', calculateLogScore(emptyLog) === 0);

  const threeTaskLog: Partial<DailyLog> = {
    tasksCompleted: ['wake_up', 'exercise', 'revision'],
    missionCompleted: false
  };
  assert('Score is 3 for 3 completed standard checklist items', calculateLogScore(threeTaskLog) === 3);

  const missionLog: Partial<DailyLog> = {
    tasksCompleted: [],
    missionCompleted: true
  };
  assert('Score is 3 when only Today\'s Mission is complete', calculateLogScore(missionLog) === 3);

  const mixedLog: Partial<DailyLog> = {
    tasksCompleted: ['wake_up', 'no_scroll', 'pyqs'], // 3 points
    missionCompleted: true // 3 points
  };
  assert('Score is 6 for 3 standard items + Completed Mission', calculateLogScore(mixedLog) === 6);


  // TEST 2: Achievement Unlocks (Discipline Beast & Early Bird)
  console.log('\n--- TEST GROUP 2: Badge Unlock Triggers ---');
  
  // Discipline Beast: Score 14 (all 11 checklist items + mission complete)
  const allTasks = CHECKLIST_ITEMS.map(i => i.id);
  const maxScoreLog: DailyLog = {
    date: '2026-06-07',
    tasksCompleted: allTasks,
    missionTitle: 'Polity Revision',
    missionCompleted: true,
    score: 14,
    consistencyScore: 100
  };
  const mockLogsMap1 = { '2026-06-07': maxScoreLog };
  const badges1 = evaluateAchievements(mockLogsMap1, { currentStreak: 1, longestStreak: 1 });
  assert(
    'Discipline Beast unlocks when score reaches 14',
    badges1.includes('discipline_beast')
  );

  // Early Bird: wake_up checked 5 times
  const earlyBirdLogs: Record<string, DailyLog> = {};
  for (let i = 0; i < 5; i++) {
    const dStr = `2026-06-${(i + 7).toString().padStart(2, '0')}`;
    earlyBirdLogs[dStr] = {
      date: dStr,
      tasksCompleted: ['wake_up'],
      missionTitle: '',
      missionCompleted: false,
      score: 1,
      consistencyScore: 7
    };
  }
  const badges2 = evaluateAchievements(earlyBirdLogs, { currentStreak: 5, longestStreak: 5 });
  assert(
    'Early Bird unlocks when wake_up is checked 5 times',
    badges2.includes('early_bird'),
    `Badges unlocked: [${badges2.join(', ')}]`
  );


  // TEST 3: Streak Calculation Logic
  console.log('\n--- TEST GROUP 3: Streak Calculation Engine ---');
  
  // Continuous streak
  const streakLogs: Record<string, DailyLog> = {};
  for (let i = 0; i < 5; i++) {
    // Generate dates: 2026-06-07 to 2026-06-11
    const dStr = `2026-06-${(i + 7).toString().padStart(2, '0')}`;
    streakLogs[dStr] = {
      date: dStr,
      tasksCompleted: ['revision'],
      missionTitle: '',
      missionCompleted: false,
      score: 1,
      consistencyScore: 7
    };
  }
  const streakResult1 = calculateStreak(streakLogs);
  assert(
    'Continuous logs update streaks correctly',
    streakResult1.longestStreak === 5
  );

  // Streak break
  // Log June 7, 8, 9, skip 10, log 11
  const brokenStreakLogs: Record<string, DailyLog> = {
    '2026-06-07': { date: '2026-06-07', tasksCompleted: ['exercise'], missionTitle: '', missionCompleted: false, score: 1, consistencyScore: 7 },
    '2026-06-08': { date: '2026-06-08', tasksCompleted: ['exercise'], missionTitle: '', missionCompleted: false, score: 1, consistencyScore: 7 },
    '2026-06-09': { date: '2026-06-09', tasksCompleted: ['exercise'], missionTitle: '', missionCompleted: false, score: 1, consistencyScore: 7 },
    // Skip 10
    '2026-06-11': { date: '2026-06-11', tasksCompleted: ['exercise'], missionTitle: '', missionCompleted: false, score: 1, consistencyScore: 7 }
  };
  const streakResult2 = calculateStreak(brokenStreakLogs);
  assert(
    'Gap days reset current streak and preserve longest streak',
    streakResult2.longestStreak === 3,
    `Longest streak: ${streakResult2.longestStreak}`
  );


  // TEST 4: Monthly Lock Engine (June -> July Transition)
  console.log('\n--- TEST GROUP 4: Month Lock Engine ---');
  
  // Case A: June has 19 completed days (>=8 pts) but need 20. July should be locked.
  const lockLogsA: Record<string, DailyLog> = {};
  for (let i = 0; i < 19; i++) {
    const dStr = `2026-06-${(i + 7).toString().padStart(2, '0')}`;
    lockLogsA[dStr] = {
      date: dStr,
      tasksCompleted: allTasks, // max score
      missionTitle: 'Polity',
      missionCompleted: true,
      score: 14,
      consistencyScore: 100
    };
  }
  const lockStatusesA = evaluateMonthLockStatuses(lockLogsA);
  const julyStatusA = lockStatusesA.find(m => m.key === '2026-07');
  assert(
    'July is locked if June has fewer than 20 completed days (19 days logged)',
    julyStatusA !== undefined && !julyStatusA.isUnlocked,
    `July unlocked: ${julyStatusA?.isUnlocked}`
  );

  // Case B: June has 20 completed days with 100% consistency. July should unlock.
  const lockLogsB = { ...lockLogsA };
  lockLogsB['2026-06-26'] = {
    date: '2026-06-26',
    tasksCompleted: allTasks,
    missionTitle: 'Polity',
    missionCompleted: true,
    score: 14,
    consistencyScore: 100
  };
  const lockStatusesB = evaluateMonthLockStatuses(lockLogsB);
  const julyStatusB = lockStatusesB.find(m => m.key === '2026-07');
  assert(
    'July unlocks successfully if June has exactly 20 completed days and >= 80% consistency',
    julyStatusB !== undefined && julyStatusB.isUnlocked,
    `July unlocked: ${julyStatusB?.isUnlocked}`
  );

  // Case C: June has 20 completed days, but average consistency is low (e.g. 50%). July should remain locked.
  const lockLogsC: Record<string, DailyLog> = {};
  for (let i = 0; i < 20; i++) {
    const dStr = `2026-06-${(i + 7).toString().padStart(2, '0')}`;
    lockLogsC[dStr] = {
      date: dStr,
      // Completed day is defined as score >= 8 (consistency >= 57%).
      // Let's set score to exactly 8 (consistency = 57%) for all 20 days.
      // 57% average consistency is < 80% needed. So July should remain locked!
      score: 8,
      tasksCompleted: ['wake_up', 'sleep', 'exercise', 'dont_tap', 'no_scroll'], // 5 pts + 3 pt mission
      missionTitle: 'Polity',
      missionCompleted: true, // total score = 8 (57% consistency)
      consistencyScore: 57
    };
  }
  const lockStatusesC = evaluateMonthLockStatuses(lockLogsC);
  const julyStatusC = lockStatusesC.find(m => m.key === '2026-07');
  assert(
    'July is locked if June has 20 completed days but less than 80% average consistency (57%)',
    julyStatusC !== undefined && !julyStatusC.isUnlocked,
    `July unlocked: ${julyStatusC?.isUnlocked}`
  );

  // TEST GROUP 5: Weekly Report Card Engine
  console.log('\n--- TEST GROUP 5: Weekly Report Card Analysis Engine ---');
  
  const mockWeeklyLogs: Record<string, DailyLog> = {};
  // Mock a highly consistent week (Sun June 7 to Sat June 13)
  for (let i = 0; i < 7; i++) {
    const dStr = `2026-06-${(i + 7).toString().padStart(2, '0')}`;
    mockWeeklyLogs[dStr] = {
      date: dStr,
      score: 14, // 11 checklist items (11) + Completed Mission (3) = 14 (100% consistency)
      tasksCompleted: ['wake_up', 'sleep', 'exercise', 'dont_tap', 'no_scroll', 'no_zero_day', 'bare_acts', 'current_affairs', 'pyqs', 'revision', 'notes_made'],
      missionTitle: 'Mains Ans Practice',
      missionCompleted: true,
      consistencyScore: 100
    };
  }

  const perfectWeekReport = analyzeWeekLogs('2026-06-07', '2026-06-13', mockWeeklyLogs);
  
  assert(
    'Perfect week has 100% average consistency',
    perfectWeekReport.avgConsistency === 100,
    `Consistency: ${perfectWeekReport.avgConsistency}%`
  );
  assert(
    'Perfect week gets Grade A',
    perfectWeekReport.grade === 'A',
    `Grade: ${perfectWeekReport.grade}`
  );
  assert(
    'Perfect week has Outstanding consistency statement',
    perfectWeekReport.statement.includes('🏆 Outstanding weekly consistency'),
    `Statement: ${perfectWeekReport.statement}`
  );
  assert(
    'Perfect week detects strong wake_up routine',
    perfectWeekReport.whatsGood.some(g => g.toLowerCase().includes('wake_up') || g.toLowerCase().includes('strong routine')),
    `WhatsGood: ${JSON.stringify(perfectWeekReport.whatsGood)}`
  );
  assert(
    'Perfect week has no needs focus items (Perfect scorecard!)',
    perfectWeekReport.whatsWrong.length === 0,
    `WhatsWrong: ${JSON.stringify(perfectWeekReport.whatsWrong)}`
  );

  // Mock a low consistency week (Week 2: June 14 to June 20)
  const lowWeeklyLogs: Record<string, DailyLog> = {};
  for (let i = 0; i < 7; i++) {
    const dStr = `2026-06-${(i + 14).toString().padStart(2, '0')}`;
    // Only logged 2 items, no mission (score 2 = 14% consistency)
    lowWeeklyLogs[dStr] = {
      date: dStr,
      score: 2,
      tasksCompleted: ['exercise'], // only did exercise, rest missed
      missionTitle: 'Read NCERT',
      missionCompleted: false,
      consistencyScore: 14
    };
  }

  const lowWeekReport = analyzeWeekLogs('2026-06-14', '2026-06-20', lowWeeklyLogs);
  assert(
    'Low week gets Grade C',
    lowWeekReport.grade === 'C',
    `Grade: ${lowWeekReport.grade}`
  );
  assert(
    'Low week warning statement matches',
    lowWeekReport.statement.includes('⚠️ Distraction warning'),
    `Statement: ${lowWeekReport.statement}`
  );
  assert(
    'Low week notes missed missions in whatsWrong list',
    lowWeekReport.whatsWrong.some(w => w.toLowerCase().includes('missed missions') || w.toLowerCase().includes('needs focus')),
    `WhatsWrong: ${JSON.stringify(lowWeekReport.whatsWrong)}`
  );


  console.log('\n================================================================');
  console.log(`TEST RUNNER SUMMARY: Passed: ${passedTestsCount} | Failed: ${failedTestsCount}`);
  console.log('================================================================');

  if (failedTestsCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
