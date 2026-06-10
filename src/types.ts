/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Instrument = 'Bumbo' | 'Atabaque' | 'Caixa' | 'Prato' | 'Surdo' | 'Quadriton';

export type Patent = 'Recruta do Pulso' | 'Cadete do Groove' | 'Sargento Rítmico' | 'Mestre do Pulso' | 'Lenda do Groove';

export interface User {
  id: string;
  name: string;
  username: string;
  instrument: Instrument;
  avatarId: number; // 1 to 24
  patent: Patent;
  points: number;
  averageAccuracy: number; // 0 to 100 (%)
  maxCombo: number;
  completedExercisesCount: number;
  trainingTimeMinutes: number;
  memberSince: string;
  isAdmin?: boolean;
}

export interface ScoreHistoryEntry {
  date: string;
  points: number;
  accuracy: number;
  combo: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  iconType: 'stars' | 'fire' | 'award' | 'zap' | 'crown' | 'headphones';
}

export interface CadenceNode {
  id: string;
  name: string;
  bpm: number;
  grid: boolean[][]; // [row_index_for_sounds][step_index_16]
  metronomeType: 'Classic';
  hitSoundType: 'Bongo 1' | 'Bongo 2';
  isFavorite?: boolean;
  author?: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  instrument: Instrument;
  avatarId: number;
  patent: Patent;
  points: number;
  averageAccuracy: number;
  maxCombo: number;
}
