/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Instrument } from './types';
import AuthScreen from './components/AuthScreen';
import HubMenu from './components/HubMenu';
import CadenceCreator from './components/CadenceCreator';
import GlobalRanking from './components/GlobalRanking';
import UserProfile from './components/UserProfile';
import GhostMetronome from './components/GhostMetronome';
import BottomNav from './components/BottomNav';
import AvatarSelector from './components/AvatarSelector';
import { ApiClient } from './utils/ApiClient';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Music, Zap, Sparkles, ChevronRight, Drum } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'inicio' | 'exercicios' | 'cadencias' | 'ranking' | 'perfil'>('inicio');
  const [activeExercise, setActiveExercise] = useState<'menu' | 'ghost-metronome'>('menu');
  const [showAvatarSelector, setShowAvatarSelector] = useState<boolean>(false);

  // Restore session on mount
  useEffect(() => {
    const storedUserJson = localStorage.getItem('ritplay_current_user');
    if (storedUserJson) {
      try {
        setUser(JSON.parse(storedUserJson));
      } catch (e) {
        // Safe clear
        localStorage.removeItem('ritplay_current_user');
      }
    }
  }, []);

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setActiveTab('inicio');
    setActiveExercise('menu');
  };

  const handleLogout = () => {
    localStorage.removeItem('ritplay_current_user');
    localStorage.removeItem('ritplay_token');
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleSelectAvatar = (avatarId: number) => {
    if (!user) return;
    const updated: User = {
      ...user,
      avatarId
    };
    ApiClient.saveUserState(updated);
    setUser(updated);
  };

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div id="ritplay-app-wrapper" className="min-h-screen bg-[#090d16] text-[#f3f4f6] pb-24 relative select-none">
      
      {/* Top Brand Navbar bar */}
      <header className="bg-[#111827]/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-800">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-cyan-500 p-0.5 flex items-center justify-center">
              <span className="text-white text-sm font-black select-none font-sans">RP</span>
            </div>
            <span className="text-white font-black text-sm tracking-widest font-sans select-none">RITPLAY</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] bg-cyan-950/20 text-[#06b6d4] font-bold border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">
              web
            </span>
          </div>
        </div>
      </header>

      {/* Main active layout */}
      <main className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <HubMenu
                user={user}
                setActiveTab={setActiveTab}
                onOpenAvatarSelector={() => setShowAvatarSelector(true)}
              />
            </motion.div>
          )}

          {activeTab === 'exercicios' && (
            <motion.div
              key="exercicios"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeExercise === 'ghost-metronome' ? (
                <GhostMetronome
                  onBack={() => setActiveExercise('menu')}
                  user={user}
                  onUpdateUser={handleUpdateUser}
                />
              ) : (
                /* Exercises Selection Menu */
                <div id="exercises-selection-menu" className="px-4 py-6 space-y-5">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] uppercase font-mono text-pink-400 font-semibold tracking-wider">Módulos Escolares</span>
                    <h2 className="text-white font-bold text-lg">Praticas Rítmicas</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Exercise 1 Card: Metrônomo Fantasma (Ready!) */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveExercise('ghost-metronome')}
                      className="bg-[#111827] border border-gray-800 rounded-2xl p-4 cursor-pointer flex justify-between items-center group shadow hover:border-pink-500/30 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-pink-950/20 text-pink-500 border border-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-all">
                          <Dumbbell className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base">1. Metrônomo Fantasma</h4>
                          <p className="text-xs text-gray-500 mt-1 mr-2 leading-snug">Desenvolva pulsação mental no espaço vago silencioso.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-pink-400 shrink-0 transition-colors" />
                    </motion.div>

                    {/* Exercicio 2 placeholder card */}
                    <div className="bg-[#111827] border border-gray-850 rounded-2xl p-4 flex justify-between items-center opacity-40">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-900 text-gray-400 rounded-xl">
                          <Music className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-gray-400 font-bold text-base">2. Cadências Sincopadas</h4>
                          <p className="text-xs text-gray-600 mt-1">Treinamento de subdivisão percussiva e contratempo.</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-gray-900 text-gray-600 border border-gray-800 px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0">Breve</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'cadencias' && (
            <motion.div
              key="cadencias"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CadenceCreator
                onBack={() => setActiveTab('inicio')}
                username={user.username}
              />
            </motion.div>
          )}

          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <GlobalRanking currentUsername={user.username} />
            </motion.div>
          )}

          {activeTab === 'perfil' && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UserProfile
                user={user}
                onLogout={handleLogout}
                onOpenAvatarSelector={() => setShowAvatarSelector(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Tab Bar Navigation (Hidden in sub-exercise screen to keep view spacious) */}
      {activeExercise === 'menu' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Global Avatars Grid Selector Modal */}
      <AnimatePresence>
        {showAvatarSelector && (
          <AvatarSelector
            currentAvatarId={user.avatarId}
            onSelect={handleSelectAvatar}
            onClose={() => setShowAvatarSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
