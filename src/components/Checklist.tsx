'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CHECKLIST_ITEMS } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Target, Info, Calendar, Edit3, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Checklist({ selectedDate }: { selectedDate: string }) {
  const { logs, toggleTask, setMission, toggleMission } = useApp();
  const [editingMission, setEditingMission] = useState(false);
  const [missionInput, setMissionInput] = useState('');

  const todayLog = logs[selectedDate] || {
    date: selectedDate,
    tasksCompleted: [],
    missionTitle: '',
    missionCompleted: false,
    score: 0,
    consistencyScore: 0
  };

  useEffect(() => {
    setMissionInput(todayLog.missionTitle || '');
  }, [todayLog.missionTitle, selectedDate]);

  const handleSaveMission = () => {
    setMission(selectedDate, missionInput);
    setEditingMission(false);
  };

  const handleMissionCheck = () => {
    // If turning on, trigger confetti!
    if (!todayLog.missionCompleted) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899']
      });
    }
    toggleMission(selectedDate);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
      
      {/* LEFT 2 COLUMNS: CHECKLIST (11 tasks) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-theme-card-border/60 pb-3">
            <div>
              <h3 className="font-bold text-lg text-theme-text-main">Daily Checklist</h3>
              <p className="text-xs text-theme-text-muted">Maintain UPSC discipline. Focus on completion.</p>
            </div>
            <span className="text-[10px] font-bold text-theme-primary bg-theme-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              +1 Point Each
            </span>
          </div>

          {/* Checklist Items list */}
          <div className="space-y-2.5">
            {CHECKLIST_ITEMS.map((item) => {
              const isCompleted = todayLog.tasksCompleted.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.005 }}
                  onClick={() => toggleTask(selectedDate, item.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer
                    ${isCompleted 
                      ? 'bg-theme-primary/5 border-theme-primary/25 opacity-90' 
                      : 'bg-white/50 border-theme-card-border/70 hover:border-theme-primary/20 hover:bg-white/80'
                    }`}
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    {/* Checkbox circle */}
                    <div 
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-300 shrink-0
                        ${isCompleted 
                          ? 'bg-theme-primary border-theme-primary text-white shadow-md shadow-theme-glow' 
                          : 'border-theme-card-border bg-white'
                        }`}
                    >
                      {isCompleted && <Check size={14} className="stroke-[3]" />}
                    </div>

                    <span 
                      className={`text-sm font-semibold truncate transition-all duration-300
                        ${isCompleted 
                          ? 'line-through text-theme-text-muted opacity-60' 
                          : 'text-theme-text-main'
                        }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-theme-text-muted bg-theme-card-border/30 px-2 py-0.5 rounded-md shrink-0">
                    {item.category}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: TODAY'S MISSION (3 points) */}
      <div className="space-y-4">
        
        {/* Mission Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`glass rounded-3xl p-6 border transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[350px]
            ${todayLog.missionCompleted 
              ? 'border-yellow-400 bg-yellow-50/15 shadow-[0_0_20px_rgba(234,179,8,0.05)]' 
              : 'border-theme-primary/20 shadow-sm'
            }`}
        >
          {/* Confetti sparkle overlay on complete */}
          {todayLog.missionCompleted && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 blur-xl pointer-events-none" />
          )}

          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-theme-card-border/60 pb-3">
              <span className="flex items-center space-x-2 text-sm font-bold text-theme-text-main">
                <Target size={18} className="text-theme-primary" />
                <span>Today's Mission</span>
              </span>
              <span className="text-[10px] font-extrabold text-yellow-600 bg-yellow-100 px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                👑 3 Points
              </span>
            </div>

            {/* Mission input / content */}
            <div className="space-y-4 my-6">
              {editingMission ? (
                <div className="space-y-3">
                  <textarea
                    value={missionInput}
                    onChange={(e) => setMissionInput(e.target.value)}
                    placeholder="E.g., Complete Laxmikanth Polity Ch 5, revise notes..."
                    rows={3}
                    maxLength={100}
                    className="w-full p-3.5 rounded-2xl border border-theme-card-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/40 resize-none font-semibold text-theme-text-main"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveMission}
                      className="flex-1 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow-md shadow-theme-glow hover:opacity-90 transition-all"
                    >
                      Save Mission
                    </button>
                    <button
                      onClick={() => setEditingMission(false)}
                      className="py-2 px-4 rounded-xl border border-theme-card-border text-theme-text-muted text-xs font-bold hover:bg-theme-primary/5 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-2xl bg-white/70 border border-theme-card-border/80 min-h-[90px] flex items-center justify-center text-center">
                    {todayLog.missionTitle ? (
                      <p className="text-base font-bold text-theme-text-main italic leading-snug">
                        "{todayLog.missionTitle}"
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-theme-text-muted italic">
                        No mission set. What is your core goal for today?
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setMissionInput(todayLog.missionTitle || '');
                      setEditingMission(true);
                    }}
                    className="flex items-center space-x-1.5 text-xs font-bold text-theme-primary hover:opacity-85 transition-all mx-auto"
                  >
                    <Edit3 size={12} />
                    <span>{todayLog.missionTitle ? 'Edit Mission Text' : 'Set Today\'s Mission'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Button */}
          <div className="w-full">
            <button
              onClick={handleMissionCheck}
              disabled={!todayLog.missionTitle}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide shadow-md transition-all duration-300 flex items-center justify-center space-x-2.5 focus:outline-none
                ${!todayLog.missionTitle
                  ? 'bg-slate-200 border border-slate-300 text-slate-400 cursor-not-allowed shadow-none'
                  : todayLog.missionCompleted
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-yellow-100 border-yellow-300 scale-[1.02] mission-glowing'
                    : 'bg-gradient-to-r from-theme-primary to-theme-accent text-white shadow-theme-glow hover:translate-y-[-1px]'
                }`}
            >
              {todayLog.missionCompleted ? (
                <>
                  <Sparkles size={16} className="fill-current animate-spin" />
                  <span>Mission Accomplished! 🔥</span>
                </>
              ) : (
                <>
                  <Target size={16} />
                  <span>Mark Mission Complete</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-theme-text-muted mt-2.5">
              {!todayLog.missionTitle 
                ? '⚠️ You must set a mission description to check it off.'
                : 'Mission completion triggers dynamic confetti & scoring multiplier!'
              }
            </p>
          </div>

        </motion.div>

        {/* Motivational Tip Card */}
        <div className="glass rounded-3xl p-5 border border-theme-card-border/80 shadow-sm flex items-start space-x-3.5 select-none">
          <div className="p-2 bg-theme-primary/10 rounded-xl text-theme-primary shrink-0 mt-0.5">
            <Info size={16} className="stroke-[2.25]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-theme-text-main mb-0.5">Discipline over Hours</h4>
            <p className="text-[11px] text-theme-text-muted leading-relaxed">
              "Task complete aachaa illayaa?" Focus 100% on ticking items and locking down the primary mission. Small daily gains compound into clearing UPSC.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
