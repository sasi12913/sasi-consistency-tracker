'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function NatureBackground() {
  const { theme } = useApp();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'sunset' | 'night'>('day');
  
  // Update day/night transition based on current hour
  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 9) {
        setTimeOfDay('morning');
      } else if (hour >= 9 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('sunset');
      } else {
        setTimeOfDay('night');
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Sky Gradients based on theme + day/night time
  const getSkyGradient = () => {
    if (timeOfDay === 'night') {
      // Midnight starry deep gradients
      return 'from-slate-900 via-indigo-950 to-purple-950 text-white/90';
    }
    
    switch (theme) {
      case 'forest':
        if (timeOfDay === 'morning') return 'from-amber-100 via-emerald-100 to-emerald-250';
        if (timeOfDay === 'sunset') return 'from-orange-100 via-rose-100 to-emerald-200';
        return 'from-emerald-50 via-teal-100 to-emerald-200';
      case 'lavender':
        if (timeOfDay === 'morning') return 'from-pink-100 via-purple-100 to-violet-250';
        if (timeOfDay === 'sunset') return 'from-orange-100 via-pink-200 to-violet-200';
        return 'from-violet-50 via-fuchsia-100 to-violet-200';
      case 'peach':
        if (timeOfDay === 'morning') return 'from-amber-100 via-rose-100 to-orange-250';
        if (timeOfDay === 'sunset') return 'from-red-100 via-orange-200 to-amber-200';
        return 'from-orange-50 via-rose-100 to-orange-200';
      case 'mint':
        if (timeOfDay === 'morning') return 'from-teal-50 via-cyan-100 to-emerald-200';
        if (timeOfDay === 'sunset') return 'from-orange-50 via-teal-100 to-cyan-200';
        return 'from-cyan-50 via-teal-50 to-teal-150';
      case 'sunrise':
        if (timeOfDay === 'morning') return 'from-yellow-100 via-orange-100 to-red-200';
        if (timeOfDay === 'sunset') return 'from-orange-200 via-red-200 to-indigo-900';
        return 'from-amber-50 via-yellow-100 to-orange-200';
      case 'sky':
      default:
        if (timeOfDay === 'morning') return 'from-amber-100 via-sky-100 to-blue-200';
        if (timeOfDay === 'sunset') return 'from-orange-100 via-rose-150 to-blue-300';
        return 'from-blue-50 via-sky-100 to-blue-250';
    }
  };

  // Landscape hill colors
  const getHillColors = () => {
    const isNight = timeOfDay === 'night';
    switch (theme) {
      case 'forest':
        return {
          back: isNight ? 'fill-emerald-950/40' : 'fill-emerald-800/20',
          mid: isNight ? 'fill-emerald-900/60' : 'fill-emerald-700/35',
          front: isNight ? 'fill-emerald-850' : 'fill-emerald-600/60'
        };
      case 'lavender':
        return {
          back: isNight ? 'fill-indigo-950/40' : 'fill-violet-800/15',
          mid: isNight ? 'fill-violet-900/60' : 'fill-violet-750/30',
          front: isNight ? 'fill-violet-850' : 'fill-violet-600/50'
        };
      case 'peach':
        return {
          back: isNight ? 'fill-rose-950/40' : 'fill-orange-800/15',
          mid: isNight ? 'fill-rose-900/60' : 'fill-orange-700/30',
          front: isNight ? 'fill-rose-850' : 'fill-orange-500/50'
        };
      case 'mint':
        return {
          back: isNight ? 'fill-teal-950/40' : 'fill-teal-800/15',
          mid: isNight ? 'fill-teal-900/60' : 'fill-teal-700/30',
          front: isNight ? 'fill-teal-850' : 'fill-teal-600/50'
        };
      case 'sunrise':
        return {
          back: isNight ? 'fill-stone-950/40' : 'fill-orange-900/15',
          mid: isNight ? 'fill-orange-950/60' : 'fill-orange-850/30',
          front: isNight ? 'fill-stone-900' : 'fill-orange-700/55'
        };
      case 'sky':
      default:
        return {
          back: isNight ? 'fill-blue-950/40' : 'fill-blue-800/15',
          mid: isNight ? 'fill-blue-900/60' : 'fill-blue-700/30',
          front: isNight ? 'fill-blue-850' : 'fill-blue-500/50'
        };
    }
  };

  const hills = getHillColors();

  return (
    <div className={`fixed inset-0 -z-50 overflow-hidden bg-gradient-to-b ${getSkyGradient()} transition-all duration-[2000ms] ease-in-out`}>
      
      {/* Stars for Night time */}
      {timeOfDay === 'night' && (
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-[10%] left-[12%] w-1 h-1 bg-white rounded-full animate-ping duration-[3000ms]" />
          <div className="absolute top-[15%] left-[45%] w-1.5 h-1.5 bg-white rounded-full opacity-70" />
          <div className="absolute top-[8%] left-[70%] w-0.5 h-0.5 bg-white rounded-full" />
          <div className="absolute top-[25%] left-[85%] w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute top-[40%] left-[20%] w-1 h-1 bg-white rounded-full opacity-40" />
          <div className="absolute top-[30%] left-[55%] w-1.5 h-1.5 bg-white rounded-full animate-ping duration-[4000ms]" />
          <div className="absolute top-[35%] left-[78%] w-1 h-1 bg-white rounded-full" />
          <div className="absolute top-[50%] left-[90%] w-0.5 h-0.5 bg-white rounded-full opacity-80" />
        </div>
      )}

      {/* Sun/Moon */}
      <div 
        className={`absolute rounded-full blur-[1px] transition-all duration-[4000ms] ease-in-out
          ${timeOfDay === 'night' 
            ? 'top-[12%] left-[75%] w-16 h-16 bg-slate-100 shadow-[0_0_20px_5px_rgba(255,255,255,0.2)]' 
            : timeOfDay === 'morning' || timeOfDay === 'sunset'
              ? 'top-[22%] left-[15%] w-24 h-24 bg-gradient-to-b from-orange-400 to-red-500 shadow-[0_0_40px_10px_rgba(239,68,68,0.3)]'
              : 'top-[15%] left-[20%] w-20 h-20 bg-yellow-200 shadow-[0_0_30px_8px_rgba(253,224,71,0.4)]'
          }`} 
      />

      {/* Slow Moving Clouds */}
      <div className="absolute inset-0 select-none opacity-40 pointer-events-none">
        {/* Cloud 1 */}
        <svg className="absolute top-[8%] left-[-15%] w-44 h-16 cloud-slow fill-white/80" viewBox="0 0 100 40">
          <path d="M10 30 Q 15 15, 30 20 Q 45 10, 60 20 Q 75 15, 85 25 Q 95 30, 90 35 Q 85 40, 10 40 Z" />
        </svg>
        {/* Cloud 2 */}
        <svg className="absolute top-[18%] left-[-25%] w-56 h-20 cloud-medium fill-white/60" viewBox="0 0 100 40">
          <path d="M15 35 Q 20 20, 35 25 Q 50 15, 65 25 Q 80 20, 90 30 Q 98 35, 90 38 Q 85 40, 15 40 Z" />
        </svg>
        {/* Cloud 3 */}
        <svg className="absolute top-[5%] left-[40%] w-36 h-12 cloud-slow fill-white/50 opacity-60" viewBox="0 0 100 40">
          <path d="M10 30 Q 15 15, 30 20 Q 45 10, 60 20 Q 75 15, 85 25 Z" />
        </svg>
      </div>

      {/* Flying Birds */}
      {timeOfDay !== 'night' && (
        <div className="absolute top-[15%] left-0 w-full h-[30%] pointer-events-none select-none overflow-hidden opacity-50">
          <svg className="absolute w-8 h-4 bird-flight fill-none stroke-current text-theme-text-muted stroke-[1.5]" viewBox="0 0 20 10" style={{ animationDelay: '0s' }}>
            <path d="M 0,5 Q 5,0 10,5 Q 15,0 20,5" />
          </svg>
          <svg className="absolute w-6 h-3 bird-flight fill-none stroke-current text-theme-text-muted stroke-[1.5]" viewBox="0 0 20 10" style={{ animationDelay: '4s', transform: 'scale(0.8)' }}>
            <path d="M 0,5 Q 5,0 10,5 Q 15,0 20,5" />
          </svg>
          <svg className="absolute w-7 h-3.5 bird-flight fill-none stroke-current text-theme-text-muted stroke-[1.5]" viewBox="0 0 20 10" style={{ animationDelay: '11s', transform: 'scale(0.7)' }}>
            <path d="M 0,5 Q 5,0 10,5 Q 15,0 20,5" />
          </svg>
        </div>
      )}

      {/* Floating Light Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => {
          const delay = i * 1.5;
          const left = 5 + i * 9;
          const size = 3 + (i % 3);
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.4)] particle"
              style={{
                left: `${left}%`,
                bottom: '10%',
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${10 + (i % 5)}s`
              }}
            />
          );
        })}
      </div>

      {/* Nature Parallax Hills at the Bottom */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none select-none">
        
        {/* Back Hills */}
        <svg className={`w-full h-32 md:h-44 -mb-1 ${hills.back} opacity-70 transition-all duration-1000`} viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,120 Q360,50 720,130 T1440,100 L1440,200 L0,200 Z" />
        </svg>

        {/* Mid Hills with Wind/Pine silhouettes */}
        <svg className={`w-full h-24 md:h-36 -mb-1 ${hills.mid} opacity-80 transition-all duration-1000`} viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,150 Q280,100 560,160 T1120,120 Q1280,110 1440,140 L1440,200 L0,200 Z" />
        </svg>

        {/* Front Hill (Solid ground) with little trees */}
        <div className="relative w-full h-16 md:h-24">
          <svg className={`absolute inset-0 w-full h-full ${hills.front} transition-all duration-1000`} viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,50 Q400,20 800,60 T1440,40 L1440,100 L0,100 Z" />
          </svg>
          
          {/* SVG Pine Tree Silhouettes placed nicely */}
          <svg className={`absolute bottom-6 left-[10%] w-6 h-10 ${hills.front} opacity-90`} viewBox="0 0 20 30">
            <polygon points="10,0 2,15 8,15 1,25 19,25 12,15 18,15" />
            <rect x="9" y="25" width="2" height="5" />
          </svg>
          <svg className={`absolute bottom-4 left-[12%] w-4 h-7 ${hills.front} opacity-80`} viewBox="0 0 20 30">
            <polygon points="10,0 2,15 8,15 1,25 19,25 12,15 18,15" />
            <rect x="9" y="25" width="2" height="5" />
          </svg>

          <svg className={`absolute bottom-3 right-[15%] w-5 h-8 ${hills.front} opacity-80`} viewBox="0 0 20 30">
            <polygon points="10,0 2,15 8,15 1,25 19,25 12,15 18,15" />
            <rect x="9" y="25" width="2" height="5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
