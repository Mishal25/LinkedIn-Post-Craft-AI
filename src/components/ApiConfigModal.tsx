import React, { useState, useEffect } from 'react';
import { checkGeminiStatus, GeminiStatus } from '../services/geminiService';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  temperature: number;
  onSavePreferences: (temp: number) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  temperature: initialTemp,
  onSavePreferences
}) => {
  const [temp, setTemp] = useState(initialTemp);
  const [status, setStatus] = useState<GeminiStatus | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setChecking(true);
      checkGeminiStatus()
        .then(res => setStatus(res))
        .finally(() => setChecking(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">Gemini AI Studio Engine</h3>
          </div>
          <button 
            type="button"
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          LinkedIn Post Craft AI is powered by Google’s latest <strong className="text-on-surface">Gemini 3.8 Flash</strong> multimodal architecture for real-time post generation, viral hook synthesis, and visual infographic parsing.
        </p>

        {/* Engine status indicator */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
            </div>
            <div>
              <div className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                <span>Gemini 3.8 Flash</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-primary/10 text-primary font-bold">Latest</span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-mono-metric">
                {checking ? 'Pinging server engine...' : status?.hasKey ? 'Enterprise AI Key Connected' : 'Ready (Full-Stack Backend Active)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/30 border border-tertiary/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-tertiary">Active</span>
          </div>
        </div>

        {/* Features matrix */}
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="p-2.5 rounded-xl bg-surface-container-low/60 border border-surface-container/60 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span className="text-on-surface font-medium">Multimodal Vision</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low/60 border border-surface-container/60 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">insights</span>
            <span className="text-on-surface font-medium">Viral Hook Engine</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low/60 border border-surface-container/60 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">auto_fix_high</span>
            <span className="text-on-surface font-medium">Instant Polish AI</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low/60 border border-surface-container/60 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">shield</span>
            <span className="text-on-surface font-medium">Server Proxy Security</span>
          </div>
        </div>

        {/* Temperature slider */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold">
              Creativity / Sampling Temperature
            </label>
            <span className="font-mono-metric text-mono-metric text-primary font-bold">{temp.toFixed(1)}</span>
          </div>
          <input 
            type="range"
            min="0.2"
            max="1.0"
            step="0.1"
            value={temp}
            onChange={(e) => setTemp(parseFloat(e.target.value))}
            className="w-full accent-[#0a66c2] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-on-surface-variant font-mono-metric">
            <span>0.2 (Rigorous & Data-Driven)</span>
            <span>0.7 (Balanced)</span>
            <span>1.0 (Bold & Unconventional)</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors"
          >
            Close
          </button>
          <button 
            type="button"
            onClick={() => {
              onSavePreferences(temp);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary shadow-sm font-semibold transition-all active:scale-95"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
