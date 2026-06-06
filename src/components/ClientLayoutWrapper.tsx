'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import NatureBackground from '@/components/NatureBackground';
import AchievementPopup from '@/components/AchievementPopup';
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isClient } = useApp();
  
  const isFocusMode = pathname === '/focus';

  // Prevent hydration flash of un-themed pages
  if (!isClient) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f0f7ff] text-[#0d2238] font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={36} />
          <p className="text-sm font-semibold tracking-wide uppercase opacity-75">SASI Consistency Tracker</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      
      {/* Dynamic Animated Nature Background behind everything */}
      <NatureBackground />

      {/* Floating sidebar on large screen, bottom bar on mobile */}
      {!isFocusMode && <Navigation />}

      {/* Main Page Area Container */}
      <main 
        className={`flex-1 flex flex-col min-h-screen overflow-y-auto px-4 py-6 md:p-8 transition-all duration-500
          ${isFocusMode 
            ? 'justify-center items-center pb-6 md:pb-8' 
            : 'pb-28 md:pb-8 max-w-7xl mx-auto w-full'
          }`}
      >
        {/* Render standard header only if not in Focus Mode */}
        {!isFocusMode && <Header />}

        {/* The active page content with smooth page transitions */}
        <div className="flex-1 w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="w-full flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global Achievement Banner Popup */}
      <AchievementPopup />

    </div>
  );
}
