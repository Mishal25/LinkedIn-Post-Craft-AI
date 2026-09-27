import React, { useState } from 'react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string, temperature: number, model: string) => void;
  temperature: number;
  selectedModel: string;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  temperature: initialTemp,
  selectedModel: initialModel
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [temp, setTemp] = useState(initialTemp);
  const [model, setModel] = useState(initialModel);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">settings_suggest</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">AI Engine Settings</h3>
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
          Configure Google Gemini model parameters for instant LinkedIn post authoring, algorithmic hook analysis, and personalized style tuning.
        </p>

        {/* Model selection */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm text-on-surface font-semibold">Active Model</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModel('Gemini 1.5 Flash')}
              className={`p-2.5 rounded-xl border text-left font-label-sm text-label-sm transition-all ${
                model === 'Gemini 1.5 Flash'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-surface-container bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Gemini 1.5 Flash</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-primary font-bold">Fast</span>
              </div>
              <span className="text-[11px] text-on-surface-variant block mt-0.5 font-normal">Sub-second generation</span>
            </button>

            <button
              type="button"
              onClick={() => setModel('Gemini 3.8 Flash')}
              className={`p-2.5 rounded-xl border text-left font-label-sm text-label-sm transition-all ${
                model === 'Gemini 3.8 Flash'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-surface-container bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Gemini 3.8 Flash</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-bold">Pro</span>
              </div>
              <span className="text-[11px] text-on-surface-variant block mt-0.5 font-normal">Advanced nuances</span>
            </button>
          </div>
        </div>

        {/* API Key field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="apiKeyField">
              Gemini API Key
            </label>
            <button 
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-[11px] text-primary hover:underline font-label-sm"
            >
              {showKey ? 'Hide Key' : 'Reveal Key'}
            </button>
          </div>
          <div className="relative">
            <input 
              id="apiKeyField"
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy... (Leave empty to use built-in mock engine)"
              className="w-full bg-surface-container-low text-on-surface p-2.5 pr-10 rounded-xl outline-none font-mono-metric text-mono-metric placeholder:text-outline focus:bg-surface-container border border-surface-container transition-all"
            />
            {keyInput && (
              <button 
                type="button"
                onClick={() => setKeyInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                title="Clear key"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>
          <span className="text-on-surface-variant text-[11px] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-tertiary">lock</span>
            Stored locally in browser localStorage only. Never transmitted elsewhere.
          </span>
        </div>

        {/* Creativity slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold">
              Creativity / Temperature
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
            <span>0.2 (Precise & Concise)</span>
            <span>0.7 (Balanced)</span>
            <span>1.0 (Bold & Expressive)</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => {
              onSaveApiKey(keyInput, temp, model);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary shadow-sm font-semibold transition-all active:scale-95"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
