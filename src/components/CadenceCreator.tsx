/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, RefreshCw, Trash2, Save, ChevronLeft, Volume2, Star, Drum, Award, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { CadenceNode } from '../types';
import { ApiClient } from '../utils/ApiClient';
import { AudioEngine } from '../utils/AudioEngine';

interface CadenceCreatorProps {
  onBack: () => void;
  username: string;
}

export default function CadenceCreator({ onBack, username }: CadenceCreatorProps) {
  const [cadences, setCadences] = useState<CadenceNode[]>([]);
  const [selectedCadenceId, setSelectedCadenceId] = useState<string>('');
  const [name, setName] = useState<string>('Minha Aliança Rítmica');
  const [bpm, setBpm] = useState<number>(95);
  const [activeChannel, setActiveChannel] = useState<number>(0); // 0: Bongo 1 (Agudo), 1: Bongo 2 (Grave)
  
  // 16-step grid for 2 percussive channels
  const [grid, setGrid] = useState<boolean[][]>([
    [true, false, false, true, false, false, true, false, true, false, false, true, false, false, false, false], // Bongo 1 Row
    [false, true, true, false, true, true, false, true, false, true, true, false, true, false, true, true],  // Bongo 2 Row
  ]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    grade: string;
    description: string;
    density: number;
    syncopation: string;
    pointsReward: number;
  } | null>(null);

  const [saveStatus, setSaveStatus] = useState<string>('');
  const audioEngine = AudioEngine.getInstance();
  const evaluationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing compositions from ApiClient
  useEffect(() => {
    async function load() {
      const data = await ApiClient.getCadences();
      setCadences(data);
    }
    load();
  }, []);

  // Sync state cleanly when changing templates
  const handleSelectCadence = (id: string) => {
    setSelectedCadenceId(id);
    if (!id) {
      setName('Minha Aliança Rítmica');
      setBpm(95);
      setGrid([Array(16).fill(false), Array(16).fill(false)]);
      return;
    }
    const found = cadences.find(c => c.id === id);
    if (found) {
      setName(found.name);
      setBpm(found.bpm);
      setGrid(JSON.parse(JSON.stringify(found.grid))); // Deep copy
    }
  };

  // Turn off metronome / loop play on unmount or return
  useEffect(() => {
    return () => {
      audioEngine.stop();
      if (evaluationTimeoutRef.current) clearTimeout(evaluationTimeoutRef.current);
    };
  }, []);

  const handleTogglePad = (row: number, col: number) => {
    const nextGrid = [...grid];
    nextGrid[row][col] = !nextGrid[row][col];
    setGrid(nextGrid);
    
    // Play test hit sound immediately to preview
    audioEngine.init().then(() => {
      audioEngine.playHit(row === 0 ? 'Bongo 1' : 'Bongo 2');
    });

    // Handle instant restart for seamless live adjustments
    if (isPlaying) {
      audioEngine.startCadenceLoop(bpm, nextGrid, 'Bongo 1', (step) => {
        setCurrentStep(step);
      });
    }
  };

  const handleStartLoop = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      setEvaluationResult(null);
      audioEngine.init().then(() => {
        audioEngine.startCadenceLoop(bpm, grid, 'Bongo 1', (step) => {
          setCurrentStep(step);
        });
        setIsPlaying(true);
      });
    }
  };

  // Fun, rich evaluation loop that performs a drum roll and displays a musical ticket!
  const handleStartEvaluate = () => {
    if (evaluating) return;
    setEvaluating(true);
    setEvaluationResult(null);

    // Play a delightful live rolling bongo build-up
    audioEngine.init().then(() => {
      const times = [0, 120, 240, 360, 480, 600, 720, 840, 960];
      times.forEach((ms, index) => {
        setTimeout(() => {
          audioEngine.playHit(index % 2 === 0 ? 'Bongo 1' : 'Bongo 2');
        }, ms);
      });
    });

    evaluationTimeoutRef.current = setTimeout(() => {
      setEvaluating(false);

      // Perform rhythmic calculation metrics
      const activePadsCh1 = grid[0].filter(Boolean).length;
      const activePadsCh2 = grid[1].filter(Boolean).length;
      const totalActive = activePadsCh1 + activePadsCh2;
      const densityVal = Math.round((totalActive / 32) * 100);

      // Analyze syncopated index (hits on off-beats)
      const offBeats = [1, 3, 5, 7, 9, 11, 13, 15];
      let syncopationHits = 0;
      offBeats.forEach(idx => {
        if (grid[0][idx]) syncopationHits++;
        if (grid[1][idx]) syncopationHits++;
      });

      let grade = 'Iniciante do Pulso';
      let description = 'Sua cadência tem um ritmo linear básico, perfeito para treinar estabilidade.';
      let syncText = 'Baixa';
      let pointsReward = 15;

      if (totalActive === 0) {
        grade = 'Silêncio Sagrado';
        description = 'Nenhum som inserido no compasso. Adicione batidas rítmicas para iniciar a festa!';
        syncText = 'Inexistente';
        pointsReward = 0;
      } else if (syncopationHits >= 6 && densityVal <= 65) {
        grade = 'Groove de Síncope Alinhado';
        description = 'Incrível! Padrões complexos de contratempos que desafiam qualquer baterista.';
        syncText = 'Extremamente Alta';
        pointsReward = 45;
      } else if (densityVal > 70) {
        grade = 'Furacão Percussivo';
        description = 'Grande densidade de toques! Cria uma energia impressionante e contagiante.';
        syncText = 'Moderada';
        pointsReward = 30;
      } else if (totalActive >= 10) {
        grade = 'Polirritmia Fluida';
        description = 'Balanço fantástico entre Bongo Agudo e Grave, digno de mestre do repique!';
        syncText = 'Alta';
        pointsReward = 40;
      } else if (totalActive >= 4) {
        grade = 'Pulso Estável Coerente';
        description = 'Boa distribuição das células rítmicas. Proporciona um loop confortável para estudo.';
        syncText = 'Equilibrada';
        pointsReward = 25;
      }

      setEvaluationResult({
        grade,
        description,
        density: densityVal,
        syncopation: syncText,
        pointsReward
      });

      // Synchronize earned reward points to local user profile dynamically
      const activeUserJson = localStorage.getItem('ritplay_current_user');
      if (activeUserJson && pointsReward > 0) {
        const user = JSON.parse(activeUserJson);
        user.points += pointsReward;
        
        // Ascend patent automatically if score reaches limits
        if (user.points >= 900) user.patent = 'Lenda do Groove';
        else if (user.points >= 750) user.patent = 'Mestre do Pulso';
        else if (user.points >= 550) user.patent = 'Sargento Rítmico';
        else if (user.points >= 300) user.patent = 'Cadete do Groove';

        ApiClient.saveUserState(user);
      }
    }, 2000);
  };

  const handleClear = () => {
    const cleanGrid = [
      Array(16).fill(false),
      Array(16).fill(false)
    ];
    setGrid(cleanGrid);
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentStep(-1);
    }
    setEvaluationResult(null);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaveStatus('Salvando...');

    const cadenceId = selectedCadenceId || 'cad-' + Math.random().toString(36).substring(2, 9);
    const newCad: CadenceNode = {
      id: cadenceId,
      name,
      bpm,
      grid,
      metronomeType: 'Classic',
      hitSoundType: activeChannel === 0 ? 'Bongo 1' : 'Bongo 2',
      author: username || 'Mestre do Groove'
    };

    const success = await ApiClient.saveCadence(newCad);
    if (success) {
      setSaveStatus('Sucesso!');
      setSelectedCadenceId(cadenceId);
      // Reload cadences list
      const data = await ApiClient.getCadences();
      setCadences(data);
    } else {
      setSaveStatus('Erro...');
    }

    setTimeout(() => setSaveStatus(''), 2500);
  };

  const adjustBpm = (val: number) => {
    const nextBpm = Math.min(200, Math.max(40, bpm + val));
    setBpm(nextBpm);
    if (isPlaying) {
      audioEngine.startCadenceLoop(nextBpm, grid, 'Bongo 1', (step) => {
        setCurrentStep(step);
      });
    }
  };

  const handleBackNavigation = () => {
    audioEngine.stop();
    onBack();
  };

  return (
    <div id="cadence-creator-container" className="px-4 py-5 max-w-md mx-auto space-y-5 pb-20 select-none">
      
      {/* Premium top Navigation bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackNavigation}
          id="back-button"
          className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white bg-gray-800/40 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar ao Menu</span>
        </button>
        <span className="text-xs uppercase font-mono text-[#06b6d4] bg-[#06b6d4]/10 px-2.5 py-1 rounded-full border border-cyan-500/10 tracking-widest font-bold">
          ESTÚDIO DE COMPOSIÇÃO
        </span>
      </div>

      {/* Model templates loader selector board */}
      <div className="bg-[#111827] border border-gray-800/80 p-3.5 rounded-xl space-y-2">
        <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono block">Escolher Modelo / Template</label>
        <select
          value={selectedCadenceId}
          onChange={(e) => handleSelectCadence(e.target.value)}
          className="w-full bg-[#0d121f] text-gray-200 border border-gray-800 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
        >
          <option value="">-- Criar Do Zero (Em Branco) --</option>
          {cadences.map((c) => (
            <option key={c.id} value={c.id}>
              🎵 {c.name} {c.author ? `(por ${c.author})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Main professional musical device console board */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl space-y-4 shadow-xl">
        <div className="flex space-x-3 items-end">
          {/* Custom Name input */}
          <div className="flex-1 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider block">ID do Ritmo</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o título..."
              className="w-full bg-[#0d121f] text-white border border-gray-800 rounded-lg py-2 px-3 text-xs font-semibold focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            />
          </div>
          
          {/* Premium BPM dial panel */}
          <div className="w-2/5 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block text-center">BPM (Tempo)</span>
            <div className="flex items-center bg-[#0d121f] border border-gray-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => adjustBpm(-5)}
                className="w-9 py-1.5 text-xs text-gray-400 bg-gray-800/20 hover:bg-gray-800 rounded-md transition font-bold"
              >
                -5
              </button>
              <span className="flex-1 text-center text-xs text-cyan-400 font-mono font-bold">{bpm}</span>
              <button
                type="button"
                onClick={() => adjustBpm(5)}
                className="w-9 py-1.5 text-xs text-gray-400 bg-gray-800/20 hover:bg-gray-800 rounded-md transition font-bold"
              >
                +5
              </button>
            </div>
          </div>
        </div>

        {/* Channels toggle selectors (Instrument track layout, no generic sequenced row line) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-widest block">Canal Instrumento</span>
          <div className="flex bg-[#0d121f] rounded-xl p-1 border border-gray-800">
            <button
              type="button"
              onClick={() => setActiveChannel(0)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeChannel === 0
                  ? 'bg-gradient-to-tr from-[#06b6d4]/10 to-[#06b6d4]/30 text-[#06b6d4] border border-[#06b6d4]/40 shadow-inner'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Bongo Agudo (1)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveChannel(1)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeChannel === 1
                  ? 'bg-gradient-to-tr from-pink-500/10 to-pink-500/30 text-pink-400 border border-pink-500/40 shadow-inner'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Bongo Grave (2)</span>
            </button>
          </div>
        </div>

        {/* Gorgeous professional 4x4 MPC/Drum Pad Board representing steps 1-16 (no visual holes) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
            <span>RITPLAY MPC PADS</span>
            <span>Compasso dividido em beats</span>
          </div>

          <div id="pad-grid" className="grid grid-cols-4 gap-3 bg-[#0d121f] p-4 rounded-2xl border border-gray-800/80 shadow-inner relative">
            {/* Ambient dynamic playhead row scanner bar */}
            {isPlaying && currentStep !== -1 && (
              <div className="absolute inset-x-0 h-0.5 bg-yellow-400/20 blur-[1px] pointer-events-none" />
            )}

            {Array.from({ length: 16 }).map((_, stepIdx) => {
              const isActive = grid[activeChannel][stepIdx];
              const isCursor = currentStep === stepIdx;
              
              // alternate beat groups color for immediate visual metrics division (e.g. 1-4, 5-8, etc)
              const grp = Math.floor(stepIdx / 4) % 2 === 0;
              
              return (
                <button
                  key={stepIdx}
                  type="button"
                  onClick={() => handleTogglePad(activeChannel, stepIdx)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-between p-3.5 border transition-all active:scale-[0.93] duration-100 ${
                    isActive
                      ? activeChannel === 0
                        ? 'bg-gradient-to-br from-cyan-500 to-cyan-700 border-cyan-400 text-white shadow-xl shadow-cyan-500/20'
                        : 'bg-gradient-to-br from-pink-500 to-pink-700 border-pink-400 text-white shadow-xl shadow-pink-500/20'
                      : grp
                        ? 'bg-[#111827] border-gray-800 text-gray-400 hover:border-gray-700'
                        : 'bg-[#182030] border-gray-800/80 text-gray-400 hover:border-gray-700'
                  } ${isCursor ? 'ring-2 ring-yellow-400 scale-[1.03] z-10' : ''}`}
                >
                  <span className="text-[10px] font-mono font-bold self-start leading-none opacity-60">
                    {stepIdx + 1}
                  </span>
                  
                  <Drum className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  
                  {/* Small round glowing bulb */}
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isCursor ? 'bg-yellow-400 shadow-md shadow-yellow-400/40' : isActive ? 'bg-white' : 'bg-transparent'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive live Evaluation Results ticket */}
      <AnimatePresence>
        {evaluationResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-gradient-to-r from-[#0d121f] to-[#111827] border border-cyan-500/30 p-4 rounded-xl space-y-3 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-[#06b6d4] text-black text-[9px] font-bold px-2 py-0.5 rounded-bl uppercase font-mono tracking-wider">
              Laudo Rítmico
            </div>

            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <h4 className="text-white font-black text-sm font-sans">{evaluationResult.grade}</h4>
            </div>

            <p className="text-gray-300 text-xs leading-relaxed">{evaluationResult.description}</p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800/65 text-center">
              <div className="bg-[#111827]/60 p-2 rounded-lg border border-gray-800/80">
                <span className="text-[9px] text-gray-500 uppercase font-mono block">Densidade</span>
                <span className="text-white font-bold text-xs font-mono">{evaluationResult.density}%</span>
              </div>
              <div className="bg-[#111827]/60 p-2 rounded-lg border border-gray-800/80">
                <span className="text-[9px] text-gray-500 uppercase font-mono block">Síncope</span>
                <span className="text-cyan-400 font-bold text-xs font-mono">{evaluationResult.syncopation}</span>
              </div>
              <div className="bg-pink-950/20 p-2 rounded-lg border border-pink-500/20">
                <span className="text-[9px] text-pink-400 uppercase font-mono block">Pontos</span>
                <span className="text-pink-400 font-bold text-xs font-mono">+{evaluationResult.pointsReward} XP</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sequential execution panel bottom actions dashboard (fills space elegantly on mobile) */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex flex-col space-y-3 shadow-xl">
        <div className="grid grid-cols-2 gap-3">
          {/* Play/Stop loop action trigger */}
          <button
            onClick={handleStartLoop}
            className={`flex items-center justify-center space-x-2 py-3.5 rounded-xl font-bold text-xs transition active:scale-95 shadow-md ${
              isPlaying
                ? 'bg-[#ef4444] hover:bg-red-700 text-white shadow-red-500/10'
                : 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:brightness-110 shadow-pink-500/5'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>Parar Loop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Iniciar Loop</span>
              </>
            )}
          </button>

          {/* Evaluate Action call */}
          <button
            onClick={handleStartEvaluate}
            id="evaluate-button"
            disabled={evaluating}
            className={`flex items-center justify-center space-x-1.5 py-3.5 rounded-xl font-bold text-xs transition border active:scale-95 ${
              evaluating
                ? 'bg-yellow-600/20 border-yellow-500 text-yellow-300 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Analisando...' : 'Avaliar Rhythm'}</span>
          </button>
        </div>

        {/* Secondary actions delete sequencer / save template to server */}
        <div className="grid grid-cols-2 gap-3 pt-0.5">
          <button
            onClick={handleClear}
            id="clear-button"
            className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-semibold bg-[#0d121f] text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Compassos</span>
          </button>

          <button
            onClick={handleSave}
            id="save-button"
            disabled={saveStatus.length > 0}
            className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-semibold bg-[#111827] text-cyan-400 border border-cyan-400/20 hover:border-cyan-400/40 hover:bg-cyan-950/10 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveStatus || 'Salvar Cadência'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
