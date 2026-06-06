'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AchievementPopup() {
  const { newlyUnlockedBadge, dismissBadgePopup, theme } = useApp();

  useEffect(() => {
    if (newlyUnlockedBadge) {
      // Trigger confetti explosion!
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3b82f6', '#10b981', '#a855f7', '#f97316']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#10b981', '#a855f7', '#f97316']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [newlyUnlockedBadge]);

  if (!newlyUnlockedBadge) return null;

  // Resolve Lucide Icon dynamically
  const IconComponent = (Icons as any)[newlyUnlockedBadge.iconName] || Icons.Award;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-sm">
        
        {/* Modal Overlay backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={dismissBadgePopup}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative max-w-sm w-full glass rounded-3xl p-8 text-center border-2 border-theme-primary/30 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
        >
          {/* Animated decorative gradient ring in card */}
          <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-theme-primary/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-theme-accent/15 blur-xl pointer-events-none" />

          {/* Badge Icon container */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-theme-primary to-theme-accent text-white shadow-xl shadow-theme-glow mb-6"
          >
            <IconComponent size={44} className="stroke-[1.75]" />
          </motion.div>

          <h3 className="text-xs font-bold uppercase tracking-widest text-theme-primary mb-1">
            Achievement Unlocked
          </h3>
          <h2 className="text-2xl font-bold tracking-tight text-theme-text-main mb-3">
            {newlyUnlockedBadge.title}
          </h2>
          <p className="text-sm text-theme-text-muted leading-relaxed mb-6 px-2">
            {newlyUnlockedBadge.description}
          </p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={dismissBadgePopup}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-theme-primary to-theme-accent text-white font-semibold shadow-lg shadow-theme-glow hover:opacity-95 transition-all focus:outline-none"
          >
            Claim Badge 🏆
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
