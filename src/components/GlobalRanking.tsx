/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Award, Zap, ShieldAlert, Sparkles, User, RefreshCw } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { AvatarImage } from './AvatarSelector';

interface GlobalRankingProps {
  currentUsername: string;
}

export default function GlobalRanking({ currentUsername }: GlobalRankingProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'precisao' | 'combos'>('geral');
  const [board, setBoard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const data = await ApiClient.getLeaderboard();
    setBoard(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUsername]);

  // Handle distinct sort criteria depending on active tabs
  const getSortedBoard = () => {
    const list = [...board];
    if (activeTab === 'geral') {
      return list.sort((a, b) => b.points - a.points);
    } else if (activeTab === 'precisao') {
      return list.sort((a, b) => b.averageAccuracy - a.averageAccuracy);
    } else {
      return list.sort((a, b) => b.maxCombo - a.maxCombo);
    }
  };

  const sortedList = getSortedBoard();

  return (
    <div id="global-ranking-container" className="px-4 py-5 max-w-md mx-auto space-y-5 pb-20 select-none">
      
      {/* Top Banner and Sync status */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg font-sans flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Ranking Global</span>
        </h2>
        <button
          onClick={loadData}
          id="sync-ranking-button"
          className="flex items-center space-x-1 py-1 px-2.5 rounded bg-gray-800/40 text-[10px] text-gray-400 hover:text-white transition"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sincronizado</span>
        </button>
      </div>

      {/* Styled Tabs (3 distinct classification formulas) */}
      <div className="flex bg-[#0d121f] rounded-xl p-1 border border-gray-800/80">
        <button
          onClick={() => setActiveTab('geral')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'geral'
              ? 'bg-gradient-to-tr from-pink-500/20 to-cyan-500/20 text-[#06b6d4] border border-cyan-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Geral
        </button>
        <button
          onClick={() => setActiveTab('precisao')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'precisao'
              ? 'bg-gradient-to-tr from-pink-500/20 to-cyan-500/20 text-[#06b6d4] border border-cyan-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Precisão
        </button>
        <button
          onClick={() => setActiveTab('combos')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'combos'
              ? 'bg-gradient-to-tr from-pink-500/20 to-cyan-500/20 text-[#06b6d4] border border-cyan-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Combos
        </button>
      </div>

      {/* Ranks list representation */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 font-mono">Carregando tabelas...</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {sortedList.map((entry, index) => {
            const isSelf = entry.username.toLowerCase() === currentUsername.toLowerCase();
            const placement = index + 1;

            // Placement medal representation
            const getRankIcon = (pos: number) => {
              if (pos === 1) return <div className="w-5 h-5 bg-yellow-500/10 border border-yellow-500 text-yellow-400 font-bold text-xs rounded-full flex items-center justify-center">1</div>;
              if (pos === 2) return <div className="w-5 h-5 bg-slate-200/10 border border-slate-300 text-slate-300 font-bold text-xs rounded-full flex items-center justify-center">2</div>;
              if (pos === 3) return <div className="w-5 h-5 bg-amber-700/10 border border-amber-600 text-amber-500 font-bold text-xs rounded-full flex items-center justify-center">3</div>;
              return <span className="text-xs text-gray-500 font-mono pl-1">{pos}</span>;
            };

            return (
              <div
                key={entry.username}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isSelf
                    ? 'bg-gradient-to-r from-pink-950/20 to-cyan-950/20 border-cyan-500/40 relative overflow-hidden'
                    : 'bg-[#111827] border-gray-800'
                }`}
              >
                {isSelf && (
                  <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[7px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-bl">
                    Você
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="w-6 text-center flex justify-center">
                    {getRankIcon(placement)}
                  </div>
                  <div className="relative">
                    <AvatarImage id={entry.avatarId} sizeClass="w-10 h-10" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-white text-xs font-bold font-sans truncate max-w-[110px]">{entry.name}</span>
                      <span className="text-[9px] bg-gray-900 border border-gray-800 text-gray-400 px-1 rounded-sm font-mono">
                        {entry.instrument}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono block">@{entry.username} ({entry.patent})</span>
                  </div>
                </div>

                {/* Specific priority values depending on selected hierarchy tab */}
                <div className="text-right">
                  {activeTab === 'geral' && (
                    <>
                      <div className="text-sm font-bold text-white font-mono">{entry.points} pts</div>
                      <span className="text-[9px] text-gray-500 block">Ac: {entry.averageAccuracy}%</span>
                    </>
                  )}

                  {activeTab === 'precisao' && (
                    <>
                      <div className="text-sm font-bold text-[#06b6d4] font-mono flex items-center justify-end">
                        <Award className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                        {entry.averageAccuracy}%
                      </div>
                      <span className="text-[9px] text-gray-500 block">{entry.points} pts totais</span>
                    </>
                  )}

                  {activeTab === 'combos' && (
                    <>
                      <div className="text-sm font-bold text-pink-400 font-mono flex items-center justify-end">
                        <Zap className="w-3.5 h-3.5 mr-1 text-pink-400 fill-pink-400" />
                        {entry.maxCombo}x
                      </div>
                      <span className="text-[9px] text-gray-500 block">Ac: {entry.averageAccuracy}%</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global stats review ticket */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Recorde Global Atual</span>
          <span className="text-white font-bold font-mono mt-0.5 block">Lucas Groove - 980 pts</span>
        </div>
        <div className="text-right">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Precisão Máxima Recorde</span>
          <span className="text-cyan-400 font-bold font-mono mt-0.5 block">95.5% média</span>
        </div>
      </div>

    </div>
  );
}
