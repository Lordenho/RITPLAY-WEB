/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RefreshCw, Trash2, Save, Sparkles, ChevronLeft, Volume2, Star } from 'lucide-react';
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
  const [name, setName] = useState<string>('Minha Cadência');
  const [bpm, setBpm] = useState<number>(95);
  const [metronomeType, setMetronomeType] = useState<'Classic'>('Classic');
  const [hitSoundType, setHitSoundType] = useState<'Bongo 1' | 'Bongo 2'>('Bongo 1');
  
  // 16-step grid for 2 percussive channels (Row 0: Bongo 1, Row 1: Bongo 2)
  const [grid, setGrid] = useState<boolean[][]>([
    [true, false, false, true, false, false, true, false, true, false, false, true, false, false, false, false], // Channel A
    [false, true, true, false, true, true, false, true, false, true, true, false, true, false, true, true],  // Channel B
  ]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const audioEngine = AudioEngine.getInstance();
  const playheadRef = useRef<number>(-1);

  // Load existing compositions from ApiClient or offline DB
  useEffect(() => {
    async function load() {
      const data = await ApiClient.getCadences();
      setCadences(data);
    }
    load();
  }, []);

  // Sync state when selecting other cadences
  const handleSelectCadence = (id: string) => {
    setSelectedCadenceId(id);
    const found = cadences.find(c => c.id === id);
    if (found) {
      setName(found.name);
      setBpm(found.bpm);
      setHitSoundType(found.hitSoundType);
      setGrid(JSON.parse(JSON.stringify(found.grid))); // Deep copy
    }
  };

  // Turn off metronome on leave
  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  const handleTogglePad = (row: number, col: number) => {
    const nextGrid = [...grid];
    nextGrid[row][col] = !nextGrid[row][col];
    setGrid(nextGrid);
    
    // Play test hit sound immediately to preview
    if (nextGrid[row][col]) {
      audioEngine.init().then(() => {
        audioEngine.playHit(row === 0 ? 'Bongo 1' : 'Bongo 2');
      });
    }

    // Dynamic scheduling restart if playing to load updated grid states
    if (isPlaying) {
      audioEngine.startCadenceLoop(bpm, nextGrid, hitSoundType, (step) => {
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
      audioEngine.init().then(() => {
        audioEngine.startCadenceLoop(bpm, grid, hitSoundType, (step) => {
          setCurrentStep(step);
        });
        setIsPlaying(true);
      });
    }
  };

  const handleStartEvaluate = () => {
    setEvaluating(true);
    // Restart rhythm play so they listen
    audioEngine.init().then(() => {
      audioEngine.startCadenceLoop(bpm, grid, hitSoundType, (step) => {
        setCurrentStep(step);
      });
      setIsPlaying(true);
    });

    setTimeout(() => {
      setEvaluating(false);
    }, 4000);
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
      metronomeType,
      hitSoundType,
      author: username || 'Mestre'
    };

    const success = await ApiClient.saveCadence(newCad);
    if (success) {
      setSaveStatus('Sucesso!');
      setSelectedCadenceId(cadenceId);
      // Reload cadences
      const data = await ApiClient.getCadences();
      setCadences(data);
    } else {
      setSaveStatus('Erro.');
    }

    setTimeout(() => setSaveStatus(''), 2500);
  };

  const adjustBpm = (val: number) => {
    const nextBpm = Math.min(200, Math.max(40, bpm + val));
    setBpm(nextBpm);
    if (isPlaying) {
      audioEngine.startCadenceLoop(nextBpm, grid, hitSoundType, (step) => {
        setCurrentStep(step);
      });
    }
  };

  return (
    <div id="cadence-creator-container" className="px-4 py-5 max-w-md mx-auto space-y-5 pb-20 select-none">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <span className="text-xs uppercase font-mono text-[#06b6d4] tracking-wider font-semibold">HitPlay Sequencer</span>
      </div>

      {/* Selector of Existing Beats */}
      <div className="bg-[#111827] border border-gray-800 p-3.5 rounded-xl space-y-2">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Escolher de Modelos</label>
        <select
          value={selectedCadenceId}
          onChange={(e) => handleSelectCadence(e.target.value)}
          className="w-full bg-[#0d121f] text-gray-200 border border-gray-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-cyan-500"
        >
          <option value="">-- Cadência em Branco --</option>
          {cadences.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.author ? `(por ${c.author})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Cadence Specs Board */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl space-y-4 shadow-xl">
        <div className="flex space-x-2">
          {/* Name edit */}
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Nome da Cadência</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d121f] text-white border border-gray-800 rounded-lg py-2 px-3 text-xs font-semibold focus:outline-none"
            />
          </div>
          
          {/* BPM Adjuster */}
          <div className="w-2/5 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase font-mono block text-center">BPM</label>
            <div className="flex items-center bg-[#0d121f] border border-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => adjustBpm(-5)}
                className="w-8 py-1.5 text-xs text-gray-400 bg-gray-800/40 rounded hover:bg-gray-800 font-bold"
              >
                -
              </button>
              <span className="flex-1 text-center text-xs text-white font-mono font-bold">{bpm}</span>
              <button
                onClick={() => adjustBpm(5)}
                className="w-8 py-1.5 text-xs text-gray-400 bg-gray-800/40 rounded hover:bg-gray-800 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Metronome Type and Hit Sound selectors */}
        <div className="grid grid-cols-2 gap-3 pb-1 border-b border-gray-800/50">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Relógio Metrônomo</span>
            <select
              value={metronomeType}
              onChange={() => setMetronomeType('Classic')}
              className="mt-1 w-full bg-[#0d121f] text-gray-300 border border-gray-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
            >
              <option value="Classic">Classic Click</option>
            </select>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Estilo Principal</span>
            <select
              value={hitSoundType}
              onChange={(e) => setHitSoundType(e.target.value as any)}
              className="mt-1 w-full bg-[#0d121f] text-gray-300 border border-gray-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
            >
              <option value="Bongo 1">Bongo 1 (Agudo)</option>
              <option value="Bongo 2">Bongo 2 (Grave)</option>
            </select>
          </div>
        </div>

        {/* Playback step composer grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-mono">
            <span>Percussão</span>
            <span>Estágios (1-16)</span>
          </div>

          {[0, 1].map((channelIndex) => (
            <div key={channelIndex} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300 flex items-center">
                  <Volume2 className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                  {channelIndex === 0 ? 'Bongo 1 (Agudo)' : 'Bongo 2 (Grave)'}
                </span>
                <span className="text-[9px] font-mono text-gray-500">Mapeamento linear</span>
              </div>
              
              <div className="grid grid-cols-8 gap-2">
                {Array.from({ length: 16 }).map((_, stepIdx) => {
                  const isActive = grid[channelIndex][stepIdx];
                  const isCursor = currentStep === stepIdx;
                  return (
                    <button
                      key={stepIdx}
                      onClick={() => handleTogglePad(channelIndex, stepIdx)}
                      className={`h-10 rounded-lg flex flex-col items-center justify-center border text-[10px] font-mono transition-all relative ${
                        isActive
                          ? channelIndex === 0
                            ? 'bg-pink-600/40 border-pink-500 text-white font-bold'
                            : 'bg-cyan-600/40 border-cyan-500 text-white font-bold'
                          : 'bg-[#0d121f] border-gray-800 text-gray-500 hover:border-gray-700'
                      } ${isCursor ? 'ring-2 ring-yellow-400 scale-[1.05]' : ''}`}
                    >
                      <span>{stepIdx + 1}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sequential actions box bottom dashboard (no empty gaps, satisfies mobile sizing) */}
      <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex flex-col space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Main big play trigger */}
          <button
            onClick={handleStartLoop}
            className={`flex items-center justify-center space-x-2 py-3 rounded-lg font-bold text-xs shadow-md transition-all ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/10'
                : 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:opacity-90 active:scale-95'
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

          {/* Evaluate Action */}
          <button
            onClick={handleStartEvaluate}
            disabled={evaluating}
            className={`flex items-center justify-center space-x-1.5 py-3 rounded-lg font-bold text-xs transition border ${
              evaluating
                ? 'bg-yellow-600/20 border-yellow-500 text-yellow-300'
                : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Avaliando...' : 'Avaliar Rhythm'}</span>
          </button>
        </div>

        {/* Clear and Save settings */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleClear}
            className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-semibold bg-[#0d121f] text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Sequência</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saveStatus.length > 0}
            className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-semibold bg-gray-850 hover:bg-gray-800 text-[#06b6d4] border border-[#06b6d4]/20 hover:border-[#06b6d4]/40"
          >
            <Save className="w-4 h-4" />
            <span>{saveStatus || 'Salvar Cadência'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
