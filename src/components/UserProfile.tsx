/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';
import { Award, Target, Zap, Clock, Calendar, CheckCircle, LogOut, ChevronRight, Crown, ShieldAlert, Sparkles, Flame, Volume2 } from 'lucide-react';
import { User, ScoreHistoryEntry } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { renderAvatarSvg } from './AvatarSelector';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  onOpenAvatarSelector: () => void;
}

export default function UserProfile({ user, onLogout, onOpenAvatarSelector }: UserProfileProps) {
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);

  useEffect(() => {
    const data = ApiClient.getUserHistory(user.id);
    setHistory(data);
  }, [user]);

  // Dynamic stylized patent icon rendering (Section 15: pure text label, highlight icon, no square box)
  const renderPatentIcon = (patent: string) => {
    switch (patent) {
      case 'Lenda do Groove':
        return (
          <svg className="w-16 h-16 text-yellow-400" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
            <path d="M20 70 L30 30 L50 48 L70 30 L80 70 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="20" cy="70" r="3" fill="currentColor" />
            <circle cx="80" cy="70" r="3" fill="currentColor" />
            <circle cx="50" cy="48" r="4" fill="currentColor" />
          </svg>
        );
      case 'Mestre do Pulso':
        return (
          <svg className="w-16 h-16 text-cyan-400" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
            <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        );
      case 'Sargento Rítmico':
        return (
          <svg className="w-16 h-16 text-purple-400" viewBox="0 0 100 100" fill="none">
            <path d="M50 15 L80 40 L65 80 L35 80 L20 40 Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="3.5" />
            <line x1="35" y1="55" x2="65" y2="55" stroke="currentColor" strokeWidth="3" />
            <line x1="40" y1="65" x2="60" y2="65" stroke="currentColor" strokeWidth="3" />
          </svg>
        );
      case 'Cadete do Groove':
        return (
          <svg className="w-16 h-16 text-pink-400" viewBox="0 0 100 100" fill="none">
            <path d="M30 35 L50 20 L70 35 L70 70 L50 85 L30 70 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="52" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      default:
        // Recruta do Pulso
        return (
          <svg className="w-16 h-16 text-orange-400" viewBox="0 0 100 100" fill="none">
            <path d="M30 25 L50 50 L70 25 M30 45 L50 70 L70 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
          </svg>
        );
    }
  };

  // 4 official rhythmic achievements (Section 16: actual achievements, not ranking headers)
  const achievements = [
    { id: '1', title: 'Primeiro Alinhamento', text: 'Obteve pontuação em Metrônomo Fantasma.', unlocked: user.points > 0, scoreNeeded: 'Qualquer' },
    { id: '2', title: 'Precisão Absoluta', text: 'Alcançou acurácia média de no mínimo 80%.', unlocked: user.averageAccuracy >= 80, scoreNeeded: '80% Ac.' },
    { id: '3', title: 'Combo Infinito', text: 'Chegou a um combo máximo rítmico de 10x ou mais.', unlocked: user.maxCombo >= 10, scoreNeeded: '10x Combo' },
    { id: '4', title: 'Lenda Percussiva', text: 'Conquistou patente Mestre do Pulso ou superior.', unlocked: user.patent === 'Mestre do Pulso' || user.patent === 'Lenda do Groove', scoreNeeded: 'Mestre/Lenda' }
  ];

  return (
    <div id="user-profile-container" className="px-4 py-5 max-w-md mx-auto space-y-6 pb-20 select-none">
      
      {/* Top Banner profile card */}
      <div className="bg-[#111827] border border-gray-800 p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
        <div className="absolute top-3 right-3">
          <span className="bg-pink-950/20 text-[10px] border border-pink-500/20 text-pink-400 py-1 px-2 rounded-full font-mono font-bold">
            ID: {user.id}
          </span>
        </div>

        {/* Change Avatar trigger (renders beautiful SVG) */}
        <div className="relative group cursor-pointer mt-2" onClick={onOpenAvatarSelector}>
          {renderAvatarSvg(user.avatarId, 'w-20 h-20')}
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] text-white font-bold font-mono">EDITAR</span>
          </div>
        </div>

        <div className="text-center mt-3 space-y-1">
          <h3 className="text-white font-bold text-lg flex items-center justify-center space-x-1.5">
            <span>{user.name}</span>
            <span className="text-[#06b6d4]">✓</span>
          </h3>
          <p className="text-gray-400 text-xs font-mono">@{user.username}</p>
          <span className="mt-1 inline-block bg-gradient-to-r from-pink-500/10 to-cyan-500/10 border border-gray-800 rounded px-3 py-1 text-xs text-pink-300 font-semibold uppercase tracking-widest font-mono">
            {user.instrument}
          </span>
        </div>
      </div>

      {/* Patent Display (Highlight patent icon in pure custom canvas, Section 15) */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex items-center space-x-4 shadow">
        <div className="shrink-0">
          {renderPatentIcon(user.patent)}
        </div>
        <div className="flex-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block">Patente RitPlay</span>
          <h4 className="text-white font-bold text-base leading-tight mt-0.5">{user.patent}</h4>
          <p className="text-gray-400 text-xs mt-1">Conquiste pontuação rítmica treinando regularmente para subir patentes.</p>
        </div>
      </div>

      {/* Numerical Stats Dashboard */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#111827] border border-gray-800 p-3.5 rounded-xl flex items-center space-x-3">
          <div className="p-2.5 bg-yellow-950/20 text-yellow-500 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono text-gray-500 block">Pontos</span>
            <span className="text-white font-bold text-sm font-mono block">{user.points} pt</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-3.5 rounded-xl flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950/20 text-[#06b6d4] rounded-lg">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono text-gray-500 block">Acurácia</span>
            <span className="text-white font-bold text-sm font-mono block">{user.averageAccuracy}%</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-3.5 rounded-xl flex items-center space-x-3">
          <div className="p-2.5 bg-pink-950/20 text-pink-500 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono text-gray-500 block">Combo Máx</span>
            <span className="text-white font-bold text-sm font-mono block">{user.maxCombo}x</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-3.5 rounded-xl flex items-center space-x-3">
          <div className="p-2.5 bg-purple-950/20 text-purple-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono text-gray-500 block">Treinos</span>
            <span className="text-white font-bold text-sm font-mono block">{user.completedExercisesCount} sess</span>
          </div>
        </div>
      </div>

      {/* Progress Chart (Using recharts area chart, Section 13) */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl space-y-3 shadow">
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/60">
          <span className="text-xs font-bold text-white font-mono uppercase tracking-wider block">Histórico de Performance</span>
          <span className="text-[10px] text-gray-500 font-mono">Últimos 7 treinos</span>
        </div>
        
        <div className="h-44 w-full text-xs" id="progress-chart-block">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
              <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
              <ChartTooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                labelStyle={{ color: '#4b5563', fontFamily: 'monospace' }}
                itemStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="points" name="Pontos" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorPoints)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements List (Section 16: dynamic unlocks, clean listings, not trophies) */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl space-y-3">
        <span className="text-xs font-bold text-white font-mono uppercase tracking-wider block">Conquistas Recentes ({achievements.filter(a => a.unlocked).length}/4)</span>
        
        <div className="space-y-2.5">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`p-3 rounded-lg border flex items-center justify-between ${
                a.unlocked
                  ? 'bg-[#0d121f] border-green-900/40 text-gray-200'
                  : 'bg-[#111827] border-gray-800 text-gray-500 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className={`w-5 h-5 shrink-0 ${a.unlocked ? 'text-green-500' : 'text-gray-700'}`} />
                <div>
                  <h5 className={`text-xs font-bold ${a.unlocked ? 'text-white' : 'text-gray-500'}`}>{a.title}</h5>
                  <p className="text-[10px] mt-0.5 leading-tight">{a.text}</p>
                </div>
              </div>
              <span className="text-[9px] font-mono whitespace-nowrap bg-gray-900 border border-gray-800 px-1.5 py-0.5 rounded text-gray-400">
                {a.scoreNeeded}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Member meta since / Action logs out */}
      <div className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-xl p-3 text-xs">
        <span className="text-gray-500 font-mono">Membro desde: {user.memberSince || '10/06/2026'}</span>
        <button
          onClick={onLogout}
          className="flex items-center space-x-1 py-1 px-3 bg-red-950/20 text-red-400 border border-red-500/20 rounded hover:bg-red-950/30 transition font-bold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da Sessão</span>
        </button>
      </div>

    </div>
  );
}
