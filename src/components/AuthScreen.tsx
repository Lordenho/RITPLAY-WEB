/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Music, Sparkles, Check, Drum } from 'lucide-react';
import { Instrument, User as UserType } from '../types';
import { ApiClient } from '../utils/ApiClient';

interface AuthScreenProps {
  onAuthSuccess: (user: UserType) => void;
}

const INSTRUMENTS: { value: Instrument; label: string }[] = [
  { value: 'Bumbo', label: 'Bumbo' },
  { value: 'Atabaque', label: 'Atabaque' },
  { value: 'Caixa', label: 'Caixa' },
  { value: 'Prato', label: 'Prato' },
  { value: 'Surdo', label: 'Surdo' },
  { value: 'Quadriton', label: 'Quadriton' },
];

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [instrument, setInstrument] = useState<Instrument>('Atabaque');
  const [adminCode, setAdminCode] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    if (!isLogin && !name) {
      setError('Por favor, digite seu nome completo.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const response = await ApiClient.login(username, password);
        if (response.success) {
          onAuthSuccess(response.user);
        } else {
          setError(response.error || 'Erro ao realizar login.');
        }
      } else {
        const response = await ApiClient.register(name, username, instrument, selectedAvatar, adminCode);
        if (response.success) {
          onAuthSuccess(response.user);
        } else {
          setError(response.error || 'Erro ao criar conta.');
        }
      }
    } catch (err) {
      setError('Erro de conexão ao servidor RitPlay.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen-container" className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#090d16] select-none">
      {/* Dynamic Glowing Background Circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#06b6d4]/10 rounded-full filter blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#111827]/80 backdrop-blur-md rounded-2xl border border-gray-800 p-6 shadow-2xl relative z-10"
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-pink-500/20 mb-3">
            <div className="w-full h-full bg-[#111827] rounded-lg flex items-center justify-center text-pink-400">
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">RP</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">RitPlay</h1>
          <p className="text-gray-400 text-xs mt-1 font-mono">WORKSPACE RHYTHM TRAINING</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#0d121f] rounded-lg p-1.5 mb-6 border border-gray-800/60">
          <button
            type="button"
            id="auth-tab-login"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              isLogin ? 'bg-[#1e293b] text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            id="auth-tab-[#06b6d4]"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              !isLogin ? 'bg-[#1e293b] text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 p-3 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-lg flex items-center"
          >
            <span className="mr-2 font-bold font-mono">!</span> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 bg-[#0d121f] border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">Nome de Usuário</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <span className="text-xs font-bold">@</span>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9__-]/g, ''))}
                className="block w-full pl-9 pr-3 py-2.5 bg-[#0d121f] border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                placeholder="usuario"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 bg-[#0d121f] border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 block">Instrumento de Percussão</label>
                <div className="grid grid-cols-2 gap-2">
                  {INSTRUMENTS.map((inst) => (
                    <button
                      type="button"
                      key={inst.value}
                      onClick={() => setInstrument(inst.value)}
                      className={`py-2 px-3 text-xs text-left font-medium rounded-lg border transition-all flex items-center justify-between ${
                        instrument === inst.value
                          ? 'bg-pink-950/20 border-pink-500/80 text-pink-300 shadow'
                          : 'bg-[#0d121f] border-gray-800 hover:border-gray-700 text-gray-400'
                      }`}
                    >
                      <span>{inst.label}</span>
                      {instrument === inst.value && <Check className="w-3.5 h-3.5 text-pink-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar selection preview */}
              <div className="space-y-1.5 border-t border-gray-800/80 pt-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-300">Avatar Inicial</label>
                  <span className="text-[10px] text-gray-500 font-mono"># {selectedAvatar} de 24</span>
                </div>
                <div className="flex space-x-2 items-center justify-center bg-[#0d121f] py-2.5 px-4 rounded-lg border border-gray-800">
                  <button
                    type="button"
                    onClick={() => setSelectedAvatar(prev => (prev === 1 ? 24 : prev - 1))}
                    className="p-1 px-2.5 text-xs text-gray-400 bg-gray-800/50 hover:bg-gray-800 rounded"
                  >
                    ◀
                  </button>
                  {/* Decorative stylized percussion-themed block representation */}
                  <div className="w-14 h-14 bg-gradient-to-b from-[#111827] to-[#1e293b] border border-cyan-500/30 rounded-full shadow-inner flex items-center justify-center overflow-hidden">
                    <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="45" fill={`hsl(${(selectedAvatar * 15) % 360}, 65%, 40%)`} />
                      <circle cx="50" cy="50" r="38" fill="#111827" />
                      {/* Stylized geometric facial outline representation */}
                      <path d="M35,42 Q40,35 45,42" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
                      <path d="M55,42 Q60,35 65,42" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
                      <path d="M40,65 Q50,75 60,65" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" />
                      {/* Decorative elements */}
                      <circle cx="50" cy="50" r="5" fill="#f43f5e" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAvatar(prev => (prev === 24 ? 1 : prev + 1))}
                    className="p-1 px-2.5 text-xs text-gray-400 bg-gray-800/50 hover:bg-gray-800 rounded"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Administrative Code option */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-gray-400 flex items-center">
                    Código de Admin <span className="text-[9px] text-[#06b6d4] ml-1">(Opcional)</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="block w-full px-3 py-2 bg-[#0d121f] border border-gray-800 rounded-lg text-xs text-gray-400 placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  placeholder="EX: RITPLAY_ADMIN_2026"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm shadow-lg shadow-pink-500/10 hover:shadow-cyan-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Entrar no RitPlay' : 'Registrar e Começar'}</span>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </>
            )}
          </button>
        </form>

        {isLogin && (
          <div className="mt-4 text-center">
            <span className="text-[11px] text-gray-500 font-mono">
              Usuário teste rápido? Use login <span className="text-pink-400">ritmaster</span> senha qualquer.
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
