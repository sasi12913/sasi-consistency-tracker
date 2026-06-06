'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/storage';
import DashboardStats from '@/components/DashboardStats';
import Checklist from '@/components/Checklist';
import WeeklyReportCard from '@/components/WeeklyReportCard';
import MonthLocks from '@/components/MonthLocks';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Quote, Sparkles, Compass, ShieldAlert, ArrowRight, Save } from 'lucide-react';

const UPSC_MOTIVATIONAL_QUOTES = [
  { text: "Consistency is the bridge between your UPSC dream and the Academy gate.", author: "SASI Guide" },
  { text: "Task complete aachaa illayaa? Focus on the checklist. Hours are just numbers.", author: "Discipline Mantra" },
  { text: "The Constitution wasn't written in a day, and neither is your IAS preparation.", author: "Bare Acts Wisdom" },
  { text: "Quiet, consistent progress beats loud, sporadic effort every single time.", author: "Calm Mind" },
  { text: "Success is the sum of small discipline steps, repeated day in and day out.", author: "Robert Collier" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Focus on the process of becoming, rather than the pressure of succeeding.", author: "Growth Mindset" }
];

export default function DashboardPage() {
  const { logs, saveLogNotes } = useApp();
  const [selectedDate, setSelectedDate] = useState('');
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [notesInput, setNotesInput] = useState('');
  const [notesSavedStatus, setNotesSavedStatus] = useState(false);

  // Initialize selectedDate to today
  useEffect(() => {
    const todayStr = formatDate(new Date());
    setSelectedDate(todayStr);

    // Pick a random quote
    const randomIndex = Math.floor(Math.random() * UPSC_MOTIVATIONAL_QUOTES.length);
    setQuote(UPSC_MOTIVATIONAL_QUOTES[randomIndex]);
  }, []);

  // Update notes input when selected date or logs change
  useEffect(() => {
    if (selectedDate && logs[selectedDate]) {
      setNotesInput(logs[selectedDate].notes || '');
    } else {
      setNotesInput('');
    }
    setNotesSavedStatus(false);
  }, [selectedDate, logs]);

  const handleSaveNotes = () => {
    saveLogNotes(selectedDate, notesInput);
    setNotesSavedStatus(true);
    setTimeout(() => setNotesSavedStatus(false), 2500);
  };

  if (!selectedDate) return null;

  return (
    <div className="space-y-6">
      
      {/* 1. Motivational Quote Widget */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4 border border-theme-card-border/80 shadow-sm flex items-center space-x-4 select-none relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-12 h-12 bg-theme-primary/5 rounded-full blur-lg pointer-events-none" />
        <div className="p-2 bg-theme-primary/10 rounded-xl text-theme-primary shrink-0">
          <Quote size={18} className="fill-current" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-theme-text-main italic truncate md:whitespace-normal leading-relaxed">
            "{quote.text}"
          </p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-theme-text-muted mt-0.5">
            — {quote.author}
          </p>
        </div>
      </motion.div>

      {/* 2. Calendar Date Selector / Quick Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 p-4 rounded-3xl border border-theme-card-border/60 shadow-sm">
        <div className="flex items-center space-x-2">
          <Calendar size={18} className="text-theme-primary" />
          <h3 className="text-sm font-black text-theme-text-main">
            Select Prep Date
          </h3>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Quick buttons */}
          <button
            onClick={() => setSelectedDate(formatDate(new Date()))}
            className="px-3.5 py-1.5 rounded-xl bg-theme-primary/10 text-theme-primary border border-theme-primary/10 text-xs font-extrabold hover:bg-theme-primary/20 transition-all"
          >
            Today
          </button>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            min="2026-06-07"
            max="2026-12-31"
            className="px-3 py-1.5 rounded-xl border border-theme-card-border bg-white text-xs font-bold text-theme-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary/40 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Dashboard Score Metrics Grid */}
      <DashboardStats selectedDate={selectedDate} />

      {/* Weekly Report Card */}
      <WeeklyReportCard selectedDate={selectedDate} />

      {/* 4. Daily Checklist & Today's Mission */}
      <Checklist selectedDate={selectedDate} />

      {/* 5. Daily Reflexive Journal Notes */}
      <div className="glass rounded-3xl p-6 border border-theme-card-border shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-theme-card-border/60 pb-3">
          <div>
            <h3 className="font-bold text-lg text-theme-text-main">Daily Reflexive Note</h3>
            <p className="text-xs text-theme-text-muted">Aspirants must reflect on hurdles or victories briefly.</p>
          </div>
          <button
            onClick={handleSaveNotes}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow-md shadow-theme-glow hover:opacity-90 transition-all"
          >
            <Save size={13} />
            <span>{notesSavedStatus ? 'Notes Saved!' : 'Save Note'}</span>
          </button>
        </div>

        <textarea
          value={notesInput}
          onChange={(e) => setNotesInput(e.target.value)}
          placeholder="E.g., Felt good about polity revision. Struggled with map questions, need to schedule geography tomorrow. Maintained discipline, no scrolls!"
          rows={3}
          className="w-full p-4 rounded-2xl border border-theme-card-border bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/40 resize-none font-semibold text-theme-text-main"
        />
      </div>

      {/* 6. Month Lock Progression */}
      <MonthLocks />

      {/* 7. Bottom Navigation Short Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Shortlink to Analytics */}
        <Link href="/analytics">
          <div className="glass-interactive p-5 rounded-3xl border border-theme-card-border flex items-center justify-between group cursor-pointer select-none">
            <div className="space-y-1">
              <div className="text-xs uppercase font-extrabold text-theme-primary tracking-widest">Analytics Dashboard</div>
              <h4 className="text-base font-bold text-theme-text-main">Inspect Heatmap & Performance Trends</h4>
              <p className="text-[11px] text-theme-text-muted">Check your 208-day consistency graph and radar balance metrics.</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-theme-primary/10 flex items-center justify-center text-theme-primary group-hover:bg-theme-primary group-hover:text-white transition-all duration-300">
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Shortlink to Focus Mode */}
        <Link href="/focus">
          <div className="glass-interactive p-5 rounded-3xl border border-theme-card-border flex items-center justify-between group cursor-pointer select-none">
            <div className="space-y-1">
              <div className="text-xs uppercase font-extrabold text-theme-primary tracking-widest">Focus Mode</div>
              <h4 className="text-base font-bold text-theme-text-main">Enter Distraction-Free Study Space</h4>
              <p className="text-[11px] text-theme-text-muted">Activate synthesizer ambient sounds and study pomodoro timers.</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-theme-primary/10 flex items-center justify-center text-theme-primary group-hover:bg-theme-primary group-hover:text-white transition-all duration-300">
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

      </div>

    </div>
  );
}
