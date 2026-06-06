'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getAmbienceEngine } from '@/lib/sound';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ArrowLeft,
  Flame,
  CloudRain,
  Wind,
  Compass,
  Zap,
  Coffee,
  Sparkles
} from 'lucide-react';

type TimerMode = 'pomodoro' | 'break' | 'deep_work';

export default function FocusPage() {
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // for Deep Work

  // Sound States
  const [soundRain, setSoundRain] = useState(false);
  const [soundWind, setSoundWind] = useState(false);
  const [soundBrook, setSoundBrook] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioEngine = getAmbienceEngine();

  // Handle timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (timerMode === 'deep_work') {
          setElapsedTime((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // Timer ended
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode]);

  // Handle sound volume changes
  useEffect(() => {
    audioEngine.setMasterVolume(volume);
  }, [volume]);

  // Clean up sounds on page leave
  useEffect(() => {
    return () => {
      audioEngine.stopAll();
    };
  }, []);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Play synthesis buzzer (Web Audio synthesizers can make a beep!)
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}

    alert(timerMode === 'pomodoro' ? 'Focus block completed! Take a break.' : 'Break completed! Time to focus.');
    resetTimer();
  };

  const toggleTimer = () => {
    // Resume audio context to satisfy browser policies
    audioEngine.resumeContext();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'pomodoro') {
      setTimeLeft(25 * 60);
    } else if (timerMode === 'break') {
      setTimeLeft(5 * 60);
    } else {
      setElapsedTime(0);
    }
  };

  const changeMode = (mode: TimerMode) => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'pomodoro') {
      setTimeLeft(25 * 60);
    } else if (mode === 'break') {
      setTimeLeft(5 * 60);
    } else {
      setElapsedTime(0);
    }
  };

  // Sound Toggle actions
  const toggleRain = () => {
    audioEngine.resumeContext();
    if (soundRain) {
      audioEngine.stopRain();
    } else {
      audioEngine.startRain();
    }
    setSoundRain(!soundRain);
  };

  const toggleWind = () => {
    audioEngine.resumeContext();
    if (soundWind) {
      audioEngine.stopWind();
    } else {
      audioEngine.startWind();
    }
    setSoundWind(!soundWind);
  };

  const toggleBrook = () => {
    audioEngine.resumeContext();
    if (soundBrook) {
      audioEngine.stopBrook();
    } else {
      audioEngine.startBrook();
    }
    setSoundBrook(!soundBrook);
  };

  // Formatting helpers
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-xl mx-auto space-y-8 select-none text-center relative z-25">
      
      {/* Back to Dashboard Button */}
      <Link href="/" className="absolute top-[-40px] left-4 flex items-center space-x-1.5 text-xs font-bold text-theme-text-muted hover:text-theme-text-main transition-all bg-white/40 p-2.5 rounded-2xl border border-theme-card-border/60">
        <ArrowLeft size={14} />
        <span>Return to Dashboard</span>
      </Link>

      {/* Timer Type Selector */}
      <div className="flex bg-white/45 p-1.5 rounded-2xl border border-theme-card-border/80 shadow-sm space-x-1.5">
        <button
          onClick={() => changeMode('pomodoro')}
          className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold transition-all
            ${timerMode === 'pomodoro' 
              ? 'bg-theme-primary text-white shadow-md shadow-theme-glow' 
              : 'text-theme-text-muted hover:text-theme-text-main'
            }`}
        >
          <Flame size={12} />
          <span>Pomodoro</span>
        </button>
        
        <button
          onClick={() => changeMode('break')}
          className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold transition-all
            ${timerMode === 'break' 
              ? 'bg-theme-primary text-white shadow-md shadow-theme-glow' 
              : 'text-theme-text-muted hover:text-theme-text-main'
            }`}
        >
          <Coffee size={12} />
          <span>Short Break</span>
        </button>

        <button
          onClick={() => changeMode('deep_work')}
          className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold transition-all
            ${timerMode === 'deep_work' 
              ? 'bg-theme-primary text-white shadow-md shadow-theme-glow' 
              : 'text-theme-text-muted hover:text-theme-text-main'
            }`}
        >
          <Zap size={12} />
          <span>Deep Work</span>
        </button>
      </div>

      {/* Elegant Circular Glass Timer Display */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-72 h-72 rounded-full glass border-2 border-theme-card-border flex flex-col items-center justify-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-theme-primary/5 to-transparent pointer-events-none" />

        {/* Status text */}
        <span className="text-[10px] uppercase font-black tracking-widest text-theme-primary mb-1 animate-pulse">
          {timerMode === 'pomodoro' ? 'Focus Session' : timerMode === 'break' ? 'Break Time' : 'Deep Study Block'}
        </span>

        {/* Numbers */}
        <span className="text-5xl font-black tracking-tight text-theme-text-main tabular-nums leading-none">
          {timerMode === 'deep_work' ? formatHours(elapsedTime) : formatTime(timeLeft)}
        </span>

        {/* Subtitle */}
        <span className="text-[10px] font-bold text-theme-text-muted mt-3">
          {isRunning ? 'KEEP READING BARE ACTS 📚' : 'PAUSED'}
        </span>
      </motion.div>

      {/* Timer Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={resetTimer}
          className="p-3.5 rounded-2xl border border-theme-card-border bg-white/50 text-theme-text-muted hover:text-theme-text-main hover:bg-white/80 transition-all shadow-sm"
          title="Reset Timer"
        >
          <RotateCcw size={18} className="stroke-[2.25]" />
        </button>

        <button
          onClick={toggleTimer}
          className="p-5 rounded-3xl bg-gradient-to-tr from-theme-primary to-theme-accent text-white shadow-lg shadow-theme-glow hover:scale-[1.03] active:scale-[0.98] transition-all"
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={24} className="stroke-[2.25]" /> : <Play size={24} className="stroke-[2.25] fill-current" />}
        </button>
      </div>

      {/* Ambient Sound Synthesizer Panel */}
      <div className="w-full glass rounded-3xl p-6 border border-theme-card-border shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-theme-card-border/60 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="text-theme-primary" />
            <h4 className="font-bold text-sm text-theme-text-main">Ambient Sound Mixer</h4>
          </div>
          <span className="text-[9px] font-bold text-theme-text-muted uppercase bg-theme-card-border/40 px-2 py-0.5 rounded-md">
            Synthesized Live
          </span>
        </div>

        {/* Track Mixer Grids */}
        <div className="grid grid-cols-3 gap-3">
          {/* Rain Sound */}
          <button
            onClick={toggleRain}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300
              ${soundRain 
                ? 'bg-theme-primary/10 border-theme-primary/45 text-theme-primary' 
                : 'bg-white/40 border-theme-card-border text-theme-text-muted hover:border-theme-primary/20 hover:text-theme-text-main'
              }`}
          >
            <CloudRain size={22} className="mb-2" />
            <span className="text-xs font-bold">Rain</span>
          </button>

          {/* Wind Sound */}
          <button
            onClick={toggleWind}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300
              ${soundWind 
                ? 'bg-theme-primary/10 border-theme-primary/45 text-theme-primary' 
                : 'bg-white/40 border-theme-card-border text-theme-text-muted hover:border-theme-primary/20 hover:text-theme-text-main'
              }`}
          >
            <Wind size={22} className="mb-2" />
            <span className="text-xs font-bold">Forest Wind</span>
          </button>

          {/* Brook Sound */}
          <button
            onClick={toggleBrook}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300
              ${soundBrook 
                ? 'bg-theme-primary/10 border-theme-primary/45 text-theme-primary' 
                : 'bg-white/40 border-theme-card-border text-theme-text-muted hover:border-theme-primary/20 hover:text-theme-text-main'
              }`}
          >
            <Compass size={22} className="mb-2" />
            <span className="text-xs font-bold">Brook</span>
          </button>
        </div>

        {/* Master Volume Slider */}
        <div className="flex items-center space-x-3.5 bg-white/40 p-3 rounded-2xl border border-theme-card-border/60">
          <Volume2 size={16} className="text-theme-text-muted shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-theme-primary/15 rounded-lg appearance-none cursor-pointer accent-theme-primary focus:outline-none"
          />
          <span className="text-[10px] font-bold text-theme-text-muted w-8 text-right tabular-nums">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

    </div>
  );
}
