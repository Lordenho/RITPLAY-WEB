/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Play, Square, Info, HelpCircle, Trophy, HelpCircle as HelpIcon, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { User } from '../types';
import { AudioEngine } from '../utils/AudioEngine';
import { ApiClient } from '../utils/ApiClient';

interface GhostMetronomeProps {
  onBack: () => void;
  user: User;
  onUpdateUser: (updated: User) => void;
}

export default function GhostMetronome({ onBack, user, onUpdateUser }: GhostMetronomeProps) {
  // Explanation modal display state
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [bpm, setBpm] = useState<number>(100);
  const [isChallenge, setIsChallenge] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Game metrics
  const [points, setPoints] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [feedback, setFeedback] = useState<'PERFEITO' | 'ADIANTADO' | 'ATRASADO' | 'LONGE' | 'ERROU' | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [totalTapsCount, setTotalTapsCount] = useState<number>(0);
  const [perfectTapsCount, setPerfectTapsCount] = useState<number>(0);

  // Active steps / visual indicators (1-8 beats sequence)
  // Step 0-3: Audible click measures (1-4 expected ticks)
  // Step 4-7: Silent "ghost" measures (5-8 expected silent ticks)
  const [activeBeat, setActiveBeat] = useState<number>(-1);
  const [ghostBeatsCompleted, setGhostBeatsCompleted] = useState<boolean[]>([false, false, false, false]);

  // Countdown timer (3, 2, 1, VAI!)
  const [countdown, setCountdown] = useState<string | null>(null);

  const audioEngine = AudioEngine.getInstance();
  const sessionPointsAccumulated = useRef<number>(0);
  const currentStepRef = useRef<number>(-1);

  // Stop active sounds on unmount
  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  const adjustBpm = (val: number) => {
    if (isPlaying) return; // Prevent adjust during active sessions
    setBpm(prev => Math.min(180, Math.max(60, prev + val)));
  };

  /**
   * Primary action key: Iniciar/Parar sessions
   */
  const handleStartStop = async () => {
    if (isPlaying) {
      handleStopSession();
    } else {
      await audioEngine.init();
      handleStartSession();
    }
  };

  const handleStartSession = () => {
    setIsPlaying(true);
    setPoints(0);
    setCombo(0);
    setMaxCombo(0);
    setFeedback(null);
    setLatencyMs(null);
    setTotalTapsCount(0);
    setPerfectTapsCount(0);
    sessionPointsAccumulated.current = 0;
    setGhostBeatsCompleted([false, false, false, false]);

    if (isChallenge) {
      // Sincronized count-down sequence (beats play classic beep sound in clock)
      let count = 4;
      setCountdown("Preparar...");
      
      // Play 4 preparatory ticks with synthetic countdown
      audioEngine.startMetronome(bpm, (step) => {
        count--;
        if (count === 3) {
          setCountdown("3");
          audioEngine.playHit('Classic');
        } else if (count === 2) {
          setCountdown("2");
          audioEngine.playHit('Classic');
        } else if (count === 1) {
          setCountdown("1");
          audioEngine.playHit('Classic');
        } else if (count === 0) {
          setCountdown("VAI!");
          audioEngine.playHit('Classic');
          
          // Fast-trigger start sequence
          setTimeout(() => {
            setCountdown(null);
            startRhythmLoop();
          }, 450);
        }
      });
    } else {
      setCountdown(null);
      startRhythmLoop();
    }
  };

  const startRhythmLoop = () => {
    // Expected loop ticking 1-8 measures (Quarter notes)
    // Audio engine ticks quarter beats. Inside schedule code, step index is 0, 1, 2, 3
    // We will map 0-7 cycle (8 beats measure)
    let current8Step = 0;
    
    audioEngine.startMetronome(bpm, (step, time) => {
      setActiveBeat(current8Step);
      currentStepRef.current = current8Step;

      // Click sounds only play in active sector (step 0 to 3)
      if (current8Step < 4) {
        audioEngine.playHit('Classic', time);
        // Clean ghost completed items indicators when we start again active measures
        if (current8Step === 0) {
          setGhostBeatsCompleted([false, false, false, false]);
        }
      }

      current8Step = (current8Step + 1) % 8;
    });
  };

  const handleStopSession = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setActiveBeat(-1);
    setCountdown(null);

    // Save final stats to profile database synced (localStorage & Workers API)
    if (sessionPointsAccumulated.current > 0) {
      const accuracyEarned = totalTapsCount > 0 ? Math.round((perfectTapsCount / totalTapsCount) * 100) : 0;
      
      const updatedUser: User = {
        ...user,
        points: user.points + sessionPointsAccumulated.current,
        maxCombo: Math.max(user.maxCombo, maxCombo),
        averageAccuracy: user.averageAccuracy === 0 ? accuracyEarned : Math.round((user.averageAccuracy + accuracyEarned) / 2),
        completedExercisesCount: user.completedExercisesCount + 1,
        trainingTimeMinutes: user.trainingTimeMinutes + 2, // Approximate session minutes
      };

      // Upgrade Patent badge depending on updated total points score (Section 15)
      if (updatedUser.points >= 950) {
        updatedUser.patent = 'Lenda do Groove';
      } else if (updatedUser.points >= 800) {
        updatedUser.patent = 'Mestre do Pulso';
      } else if (updatedUser.points >= 600) {
        updatedUser.patent = 'Sargento Rítmico';
      } else if (updatedUser.points >= 350) {
        updatedUser.patent = 'Cadete do Groove';
      }

      ApiClient.saveUserState(updatedUser);
      onUpdateUser(updatedUser);
    }
  };

  /**
   * Main Tap Action (User clicks huge percussive pad)
   */
  const handleTapPad = () => {
    if (!isPlaying || countdown !== null) return;

    // Check if user is tapping inside the active audible ticks or silent ghost ticks
    const step = currentStepRef.current;
    
    // Evaluate discrepancy timing (latency milis) via high-precision audioContext clock
    const result = audioEngine.evaluateTap();
    
    setTotalTapsCount(prev => prev + 1);

    let earnedPoints = 0;
    let earnedFeedback: 'PERFEITO' | 'ADIANTADO' | 'ATRASADO' | 'LONGE' | 'ERROU' = 'ERROU';

    if (result.category === 'Perfeito') {
      earnedPoints = isChallenge ? 25 : 15;
      setPerfectTapsCount(prev => prev + 1);
      setCombo(prev => {
        const next = prev + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      earnedFeedback = 'PERFEITO';
    } else if (result.category === 'Adiantado' || result.category === 'Atrasado') {
      earnedPoints = isChallenge ? 10 : 8;
      setCombo(prev => {
        const next = prev + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      earnedFeedback = result.category === 'Adiantado' ? 'ADIANTADO' : 'ATRASADO';
    } else if (result.category === 'Longe') {
      earnedPoints = 3;
      setCombo(0); // Break combo sequence
      earnedFeedback = 'LONGE';
    } else {
      earnedPoints = 0;
      setCombo(0);
      earnedFeedback = 'ERROU';
    }

    setPoints(prev => prev + earnedPoints);
    sessionPointsAccumulated.current += earnedPoints;
    setFeedback(earnedFeedback);
    setLatencyMs(result.deltaMs);

    // If tapping falls in ghost step range (step index 4 to 7 mapping beats 5-8), flag them green!
    if (step >= 4 && step <= 7) {
      const idx = step - 4;
      setGhostBeatsCompleted(prev => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
    }
  };

  return (
    <div id="ghost-metronome-section" className="px-4 py-5 max-w-md mx-auto space-y-5 pb-20 select-none">
      
      {/* Intro Modal Overlay Instructions (Removes inner clutter during loop gameplay) */}
      <AnimatePresence>
        {showIntro && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111827] border border-gray-800 p-6 rounded-2xl max-w-sm space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center space-x-2 text-pink-400">
                <Volume2 className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-lg text-white">Metrônomo Fantasma</h3>
              </div>
              
              <div className="text-gray-300 text-xs space-y-2.5 leading-relaxed">
                <p>O desafio consiste em desenvolver seu <span className="font-semibold text-pink-400">pulso interno</span>.</p>
                <div className="p-3 bg-[#0d121f] border border-gray-800 rounded-lg space-y-1.5 font-mono text-[11px] text-gray-400">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                    <span className="text-white font-bold">TEMPOS 1-4:</span>
                    <span>Estágio Sonoro (Escute)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-[#06b6d4] font-bold">TEMPOS 5-8:</span>
                    <span>Silêncio Fantasma (Toque!)</span>
                  </div>
                </div>
                <p>Toque no pad exatamente no momento do clique implícito durante o silêncio. A barra inferior revelará sua latência em milissegundos.</p>
                <p className="text-[10px] text-gray-500">Dica: O Modo Desafio inicia uma contagem audível 3-2-1 antes da primeira batida.</p>
              </div>

              <button
                onClick={() => setShowIntro(false)}
                className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:opacity-90 active:scale-95 transition"
              >
                Entendi, Vamos Começar!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sair</span>
        </button>
        <div className="flex items-center space-x-1">
          <span className="text-xs uppercase font-mono text-pink-400 font-semibold">Exercício 1</span>
          <button
            onClick={() => setShowIntro(true)}
            id="info-trigger-button"
            className="p-1 rounded-full text-gray-500 hover:text-gray-300 bg-gray-800/40"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BPM adjustment, Treino/Desafio selector, parameters and status panel */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        {/* Toggle Mode */}
        <div className="flex flex-col space-y-1.5">
          <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Modo de Avaliação</span>
          <div className="flex bg-[#0d121f] border border-gray-800 p-0.5 rounded-lg select-none">
            <button
              onClick={() => !isPlaying && setIsChallenge(false)}
              disabled={isPlaying}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${
                !isChallenge ? 'bg-[#1e293b] text-white' : 'text-gray-500'
              }`}
            >
              Treino
            </button>
            <button
              onClick={() => !isPlaying && setIsChallenge(true)}
              disabled={isPlaying}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${
                isChallenge ? 'bg-[#1e293b] text-white' : 'text-gray-500'
              }`}
            >
              Desafio
            </button>
          </div>
        </div>

        {/* BPM selection buttons */}
        <div className="text-right space-y-1">
          <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider block">Andamento</span>
          <div className="flex items-center space-x-2 justify-end">
            <button
              onClick={() => adjustBpm(-4)}
              disabled={isPlaying}
              className="w-7 h-7 flex items-center justify-center text-sm font-bold bg-gray-800/60 text-gray-400 hover:text-white rounded-lg disabled:opacity-30"
            >
              -
            </button>
            <span className="text-lg font-mono font-bold text-white whitespace-nowrap">{bpm} BPM</span>
            <button
              onClick={() => adjustBpm(4)}
              disabled={isPlaying}
              className="w-7 h-7 flex items-center justify-center text-sm font-bold bg-gray-800/60 text-gray-400 hover:text-white rounded-lg disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* HUD metrics dashboard */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111827] border border-gray-800 p-3 rounded-xl text-center">
          <span className="text-[9px] uppercase font-mono text-gray-500 block">Pontos</span>
          <span className="text-lg font-bold text-white font-mono block mt-0.5">{points} pt</span>
        </div>
        <div className="bg-[#111827] border border-gray-800 p-3 rounded-xl text-center">
          <span className="text-[9px] uppercase font-mono text-gray-500 block">Combo</span>
          <span className="text-lg font-bold text-pink-400 font-mono block mt-0.5">{combo}x</span>
        </div>
        <div className="bg-[#111827] border border-gray-800 p-3 rounded-xl text-center">
          <span className="text-[9px] uppercase font-mono text-gray-500 block">Acurácia</span>
          <span className="text-lg font-bold text-[#06b6d4] font-mono block mt-0.5">
            {totalTapsCount > 0 ? Math.round((perfectTapsCount / totalTapsCount) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Playback Beat Steps Grid (Beats 1 to 8 sequence) */}
      <div className="bg-[#111827]/80 border border-gray-800 p-4 rounded-2xl shadow-xl space-y-4">
        <div className="flex justify-between items-center text-[10px] uppercase font-mono text-gray-500 tracking-wider">
          <span className="text-pink-400">1-4: Ouvir Cliques</span>
          <span className="text-[#06b6d4]">5-8: Toques Silenciosos</span>
        </div>

        {/* Indicators Row */}
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 8 }).map((_, stepIdx) => {
            const isActive = activeBeat === stepIdx;
            const isAudible = stepIdx < 4;
            const isGhostCompleted = stepIdx >= 4 && ghostBeatsCompleted[stepIdx - 4];

            return (
              <div
                key={stepIdx}
                className={`py-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'ring-2 ring-yellow-400 scale-[1.05]'
                    : ''
                } ${
                  isGhostCompleted
                    ? 'bg-green-600/30 border-green-500 text-green-300'
                    : isAudible
                      ? isActive
                        ? 'bg-pink-600/30 border-pink-500 text-pink-300'
                        : 'bg-[#0d121f] border-gray-800 text-gray-600'
                      : 'bg-gray-900 border-gray-805 text-gray-700'
                }`}
              >
                <span className="text-[10px] font-mono font-bold">{stepIdx + 1}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                  isGhostCompleted
                    ? 'bg-green-400'
                    : isAudible
                      ? 'bg-pink-500'
                      : 'bg-gray-600'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Countdown overlay panel */}
      {countdown && (
        <div className="bg-[#111827] border border-pink-500/30 py-3.5 px-4 rounded-xl text-center shadow-lg shadow-pink-500/5">
          <span className="text-xl font-black text-pink-400 font-sans tracking-widest block uppercase animate-bounce">
            {countdown}
          </span>
        </div>
      )}

      {/* Core Latency evaluation feedback (Replaces 'pronto para comecar' block, wide margin structure, Section 11) */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-2xl flex flex-col items-center space-y-3.5 shadow-xl relative overflow-hidden">
        
        {/* Dynamic latency text ticker */}
        <div className="text-center">
          {feedback ? (
            <div className="space-y-1">
              <span className={`text-lg font-black tracking-widest block ${
                feedback === 'PERFEITO'
                  ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)] animate-ping'
                  : feedback === 'ADIANTADO'
                    ? 'text-yellow-400'
                    : feedback === 'ATRASADO'
                      ? 'text-cyan-400'
                      : 'text-gray-500'
              }`}>
                {feedback}
              </span>
              <span className="text-xs font-mono text-gray-400">
                {latencyMs !== null ? `${latencyMs > 0 ? '+' : ''}${latencyMs} ms` : '0 ms'}
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-gray-500 tracking-wider font-mono">
              {isPlaying ? 'AGUARDANDO TOQUE NO COMPASSO GHOST...' : 'INICIE O EXERCÍCIO ABAIXO'}
            </span>
          )}
        </div>

        {/* LATENCY BAR: full horizontal width (de ponta a ponta, Section 11) */}
        <div className="w-full space-y-1 bg-[#0d121f] p-2.5 rounded-lg border border-gray-800/80">
          <div className="flex justify-between text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest">
            <span className="text-yellow-400">Adiantado (-85ms)</span>
            <span className="text-green-400">Perfeito (±25ms)</span>
            <span className="text-cyan-400">Atrasado (+85ms)</span>
          </div>

          <div className="relative h-4 bg-[#111827] rounded-full border border-gray-800 overflow-hidden mt-1.5 flex items-center justify-center">
            {/* Center Perfect zone indicator */}
            <div className="absolute w-[18%] h-full bg-green-500/10 border-l border-r border-green-500/30" />
            
            {/* Dynamic visual indicator cursor representing real discrepancy latency */}
            {isPlaying && latencyMs !== null && (
              <motion.div
                className={`absolute w-3.5 h-3.5 rounded-full border border-white shadow-md ${
                  feedback === 'PERFEITO'
                    ? 'bg-green-400'
                    : feedback === 'ADIANTADO'
                      ? 'bg-yellow-400'
                      : feedback === 'ATRASADO'
                        ? 'bg-cyan-400'
                        : 'bg-gray-500'
                }`}
                animate={{
                  // Map latency range (-150ms to +150ms) to horizontal percent offset (10% to 90%)
                  left: `${Math.min(90, Math.max(10, 50 + (latencyMs / 3.5)))}%`,
                  x: '-50%'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* CORE PERCUSSIVE PAD & GAMEPLAY BUTTONS (No redundant button close to pad, Section 11) */}
      <div className="space-y-4">
        {/* Core tapping pad */}
        <motion.button
          onMouseDown={handleTapPad}
          onTouchStart={(e) => {
            e.preventDefault(); // Stop mobile lag issues
            handleTapPad();
          }}
          whileTap={{ scale: 0.96 }}
          className={`w-full py-12 rounded-2xl flex flex-col items-center justify-center border-2 transition-all relative ${
            isPlaying && countdown === null
              ? 'bg-gradient-to-tr from-[#111827] to-[#1e293b] border-pink-500/40 hover:border-pink-500 text-pink-400 shadow-xl shadow-pink-500/5 cursor-pointer'
              : 'bg-gray-900 border-gray-805 text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          {/* Decorative design curves suggesting Atabaque/Percussion leather skin */}
          <div className="absolute inset-4 rounded-xl border border-dashed border-gray-800 pointer-events-none" />
          <svg className="w-10 h-10 mb-2 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
            <path d="M12 12 2.1 11.9" />
          </svg>
          <span className="font-bold text-sm tracking-widest uppercase font-mono">TOCAR NO PULSO</span>
          <span className="text-[10px] text-gray-500 font-mono mt-0.5 font-medium">Toque nos compassos 5, 6, 7 e 8</span>
        </motion.button>

        {/* Master action trigger button (Começar / Parar) */}
        <button
          onClick={handleStartStop}
          className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/10'
              : 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:shadow-cyan-500/20 active:scale-[0.98]'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-white" />
              <span>Concluir e Salvar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Começar Exercício</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
