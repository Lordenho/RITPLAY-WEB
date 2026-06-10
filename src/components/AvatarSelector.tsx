/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, ShieldAlert, Drum } from 'lucide-react';

interface AvatarSelectorProps {
  currentAvatarId: number;
  onSelect: (avatarId: number) => void;
  onClose: () => void;
}

// Custom names for our 24 percussion/groove-related avatars
const AVATAR_NAMES: string[] = [
  'Mestre do Balar', 'Bumbo de Ouro', 'Pele de Couro', 'Clave de Sol',
  'Repique Alto', 'Acará do Groove', 'Agogô da Lua', 'Pratinho Bala',
  'Eco da Selva', 'Batá Celestial', 'Sanfona Sincopada', 'Alfaia Ancestral',
  'Atabaque da Sé', 'Caxixi Sutil', 'Pandeiro Fluido', 'Zabumba Estelar',
  'Samba da Orla', 'Snare Seco', 'Baqueta Veloz', 'Recru Groove',
  'Chocalho Quente', 'Faca e Prato', 'Maracatu Flash', 'Samba Reggae Star'
];

export function renderAvatarSvg(id: number, sizeClass: string = 'w-12 h-12', className: string = '') {
  // Generate harmonious distinct color sets based on the avatar offset
  const hue = (id * 27) % 360;
  const secondaryHue = (hue + 140) % 360;
  const color1 = `hsl(${hue}, 80%, 45%)`;
  const color2 = `hsl(${secondaryHue}, 75%, 35%)`;

  return (
    <svg className={`${sizeClass} rounded-full border border-gray-800 shadow-md ${className}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`grad-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue}, 90%, 55%)`} />
          <stop offset="100%" stopColor={`hsl(${hue}, 90%, 25%)`} />
        </radialGradient>
      </defs>
      {/* Background base */}
      <circle cx="50" cy="50" r="48" fill={`url(#grad-${id})`} />
      
      {/* Dynamic decorative tribal drum line grids & syncopated patterns */}
      <circle cx="50" cy="50" r="40" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.4" />
      <circle cx="50" cy="50" r="32" stroke={color2} strokeWidth="1.5" strokeDasharray="10 5" strokeOpacity="0.8" />

      {/* Stylized geometric masks or percussion facial traits */}
      {id % 3 === 0 && (
        <>
          {/* Glasses / Goggles for Tech percussion */}
          <rect x="25" y="38" width="20" height="15" rx="3" fill="#111827" stroke="#22d3ee" strokeWidth="2.5" />
          <rect x="55" y="38" width="20" height="15" rx="3" fill="#111827" stroke="#22d3ee" strokeWidth="2.5" />
          <line x1="45" y1="45" x2="55" y2="45" stroke="#22d3ee" strokeWidth="3" />
          {/* Cool electric lightning tattoo */}
          <path d="M50 15 L46 25 L54 25 L50 35" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {id % 3 === 1 && (
        <>
          {/* Native warrior double horizontal stripes */}
          <rect x="20" y="30" width="60" height="4" fill="#facc15" rx="2" />
          <rect x="25" y="38" width="50" height="4" fill="#ec4899" rx="2" />
          {/* Eyes */}
          <circle cx="35" cy="48" r="6" fill="#ffffff" />
          <circle cx="35" cy="48" r="2.5" fill="#111827" />
          <circle cx="65" cy="48" r="6" fill="#ffffff" />
          <circle cx="65" cy="48" r="2.5" fill="#111827" />
        </>
      )}

      {id % 3 === 2 && (
        <>
          {/* Groove Headset */}
          <rect x="15" y="35" width="8" height="25" rx="3" fill="#ec4899" />
          <rect x="77" y="35" width="8" height="25" rx="3" fill="#ec4899" />
          <path d="M20 38 Q50 10 80 38" fill="none" stroke="#ec4899" strokeWidth="4" />
          {/* Mysterious ninja face mask details */}
          <path d="M25 55 C25 80, 75 80, 75 55 Z" fill="#111827" />
          {/* Glowing Eyes */}
          <circle cx="38" cy="44" r="3.5" fill="#22d3ee" />
          <circle cx="62" cy="44" r="3.5" fill="#22d3ee" />
        </>
      )}

      {/* Mouth styles based on variations */}
      {id % 2 === 0 ? (
        <path d="M35 68 Q50 82 65 68" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M40 70 L60 70" stroke="#facc15" strokeWidth="3.5" strokeLinecap="round" />
      )}

      {/* Badge number sticker */}
      <circle cx="18" cy="18" r="8" fill="#111827" opacity="0.4" />
      <text x="18" y="21" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
        {id}
      </text>
    </svg>
  );
}

export function AvatarImage({ id, sizeClass = 'w-12 h-12', className = '' }: { id: number, sizeClass?: string, className?: string }) {
  // Directly render the fully offline local vector SVG representation as the primary asset source,
  // removing any external URL dependency as the main source and keeping it fully robust offline.
  return renderAvatarSvg(id, sizeClass, className);
}

export default function AvatarSelector({ currentAvatarId, onSelect, onClose }: AvatarSelectorProps) {
  const [selected, setSelected] = useState<number>(currentAvatarId);

  const handleApply = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <div id="avatar-selector-backdrop" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Drum className="w-5 h-5 text-pink-500" />
            <h3 className="text-white font-semibold text-base">Selecione seu Avatar</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-800/40 hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview section */}
        <div className="bg-[#090d16] p-4 flex items-center justify-center space-x-4 border-b border-gray-800/60">
          <div className="relative">
            <AvatarImage id={selected} sizeClass="w-20 h-20" />
            <span className="absolute -bottom-1.5 -right-1.5 bg-pink-500 text-white rounded-full p-0.5 px-2 text-[10px] font-bold font-mono">
              #{selected}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#06b6d4]">Preview Selecionado</span>
            <h4 className="text-white font-bold text-lg leading-tight mt-0.5">{AVATAR_NAMES[selected - 1]}</h4>
            <p className="text-gray-400 text-xs mt-0.5">Clique no grid para alterar.</p>
          </div>
        </div>

        {/* Grid Area */}
        <div className="p-4 flex-1 overflow-y-auto bg-[#0d121f]/50">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {Array.from({ length: 24 }, (_, i) => i + 1).map((avatarId) => {
              const isChosen = selected === avatarId;
              return (
                <button
                  key={avatarId}
                  onClick={() => setSelected(avatarId)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center border transition-all ${
                    isChosen
                      ? 'bg-pink-950/20 border-pink-500 shadow-lg shadow-pink-500/5'
                      : 'bg-[#111827] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="relative">
                    <AvatarImage id={avatarId} sizeClass="w-10 h-10" />
                    {isChosen && (
                      <div className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-mono mt-1.5 text-gray-400 truncate max-w-full text-center">
                    {AVATAR_NAMES[avatarId - 1].split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-800 flex space-x-3 bg-[#111827]">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:opacity-90 active:scale-[0.98] transition shadow-lg shadow-pink-500/10"
          >
            Aplicar Avatar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
