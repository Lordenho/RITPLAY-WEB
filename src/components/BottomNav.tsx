/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Dumbbell, Grid, Trophy, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'inicio' | 'exercicios' | 'cadencias' | 'ranking' | 'perfil';
  setActiveTab: (tab: 'inicio' | 'exercicios' | 'cadencias' | 'ranking' | 'perfil') => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const navItems = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'exercicios', label: 'Exercícios', icon: Dumbbell },
    { id: 'cadencias', label: 'HitPlay', icon: Grid },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'perfil', label: 'Perfil', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111827]/90 backdrop-blur-md border-t border-gray-800 z-40 pb-safe-bottom">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 px-1 text-center transition-all focus:outline-none"
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-pink-500/20 to-cyan-500/20 text-pink-400 scale-105'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors ${
                  isActive ? 'text-pink-400 font-semibold' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
