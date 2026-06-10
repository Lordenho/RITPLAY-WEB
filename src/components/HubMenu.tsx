/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Grid, Trophy, User, Sparkles, Flame, Play, Music, Award } from 'lucide-react';
import { User as UserType } from '../types';
import { renderAvatarSvg } from './AvatarSelector';

interface HubMenuProps {
  user: UserType;
  setActiveTab: (tab: 'inicio' | 'exercicios' | 'cadencias' | 'ranking' | 'perfil') => void;
  onOpenAvatarSelector: () => void;
}

export default function HubMenu({ user, setActiveTab, onOpenAvatarSelector }: HubMenuProps) {
  // Patente icon helper (Section 15: pure text, clean icon, outline, no hard square container)
  const getPatentBadge = (patent: string) => {
    switch (patent) {
      case 'Lenda do Groove':
        return <CrownIcon className="w-5 h-5 text-yellow-400" />;
      case 'Mestre do Pulso':
        return <Award className="w-5 h-5 text-cyan-400" />;
      case 'Sargento Rítmico':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Cadete do Groove':
        return <Music className="w-5 h-5 text-pink-400" />;
      default:
        return <Flame className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <div id="hub-menu-container" className="px-4 py-6 max-w-md mx-auto space-y-6 pb-20 select-none">
      
      {/* Top Header Profile Panel */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="relative cursor-pointer group" onClick={onOpenAvatarSelector}>
            {renderAvatarSvg(user.avatarId, 'w-14 h-14')}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] text-white font-semibold font-mono">EDITAR</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-full p-0.5 border border-gray-900">
              <div className="w-4.5 h-4.5 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-pink-400">#</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <h2 className="text-white font-bold text-base leading-tight truncate max-w-[150px]">{user.name}</h2>
              <span className="bg-[#0d121f] border border-gray-800 text-gray-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-medium">
                {user.instrument}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mt-1.5">
              {getPatentBadge(user.patent)}
              <span className="text-xs font-semibold text-gray-300">{user.patent}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Pontos Totais</span>
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent font-mono">
            {user.points} pt
          </div>
        </div>
      </div>

      {/* Bento Grid layout */}
      <h3 className="text-white font-bold text-sm uppercase tracking-wider font-mono">Categorias do Treino</h3>

      <div className="grid grid-cols-2 gap-4">
        
        {/* EXERCÍCIOS CARD */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('exercicios')}
          className="col-span-2 bg-[#111827] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between cursor-pointer group shadow-lg min-h-[140px]"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-pink-950/20 text-pink-500 border border-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-all">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="bg-[#090d16] text-[9px] font-bold font-mono text-pink-400 px-2.5 py-0.5 rounded-full border border-pink-500/20 uppercase tracking-widest animate-pulse">
              Ativo
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-white font-bold text-lg">Exercícios</h4>
            <p className="text-gray-400 text-xs mt-1 leading-snug">Metrônomo Fantasma, precisão de toque, combo e latência real em ms.</p>
          </div>
        </motion.div>

        {/* HITPLAY CADÊNCIAS */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('cadencias')}
          className="bg-[#111827] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between cursor-pointer group shadow opacity-100"
        >
          <div className="p-2.5 bg-cyan-950/20 text-cyan-400 border border-cyan-500/10 rounded-xl w-10 h-10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all">
            <Grid className="w-5 h-5" />
          </div>
          <div className="mt-5">
            <h4 className="text-white font-bold text-sm">Criar Ritmos</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Componha, edite BPM e teste grades de pads percussivos.</p>
          </div>
        </motion.div>

        {/* RANKING GLOBAL */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('ranking')}
          className="bg-[#111827] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between cursor-pointer group shadow"
        >
          <div className="p-2.5 bg-yellow-950/20 text-yellow-400 border border-yellow-500/10 rounded-xl w-10 h-10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-all">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="mt-5">
            <h4 className="text-white font-bold text-sm">Ranking</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Dispute pontos, combo recorde e acurácia rítmica geral.</p>
          </div>
        </motion.div>

        {/* PERFIL */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('perfil')}
          className="col-span-2 bg-[#111827] border border-gray-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer group shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-950/20 text-purple-400 border border-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-all">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Meu Perfil</h4>
              <p className="text-xs text-gray-500 leading-none mt-0.5">Veja conquistas, conquiste patentes e tempo de treino.</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 font-mono">Acessar →</span>
        </motion.div>

      </div>

      {/* Decorative Quick Tips panel */}
      <div className="bg-gradient-to-r from-pink-950/20 to-cyan-950/20 border border-gray-800 p-4 rounded-xl flex items-start space-x-3">
        <Sparkles className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-white font-semibold text-xs">Dica do Mestre:</h5>
          <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
            No <span className="font-semibold text-pink-400">Metrônomo Fantasma</span>, escute atentamente os 4 primeiros toques e prepare o pulso mental antes de tocar na zona silenciosa!
          </p>
        </div>
      </div>

    </div>
  );
}

// Minimal Crown SVG for patent aesthetics
function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" />
      <path d="M5 20h14" />
    </svg>
  );
}
