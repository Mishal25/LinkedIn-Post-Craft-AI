import React, { useState } from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  draftsCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenApiConfig: () => void;
  selectedModel: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  draftsCount,
  darkMode,
  onToggleDarkMode,
  onOpenApiConfig,
  selectedModel
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1Usrl_HY5JYryNL-mZSs16NgJvHuTsWTpS9_rxIwkOGljKHuEyiT6fbkL7DYtg61NaqrvCq9KMoRiHvN324IMugseaeQHw0XPNLzeCO3uvOU3zEM7MlTuQlTtq2t7JcpccLmfBXT3yh4JxeQvj0h-TMt4DMcm6d07gmXwiIpt9-8qnYhR4_uu0P27sqTFDFPEWEnX9_IWcOd72kAjGYbDgF2p50nWNz2AzICgxqrO-a5ZEu4SR4dLZ6y04';
  const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEP-V4lPtecRvw7aGbCoySxt-nCqQJPveJQ2Z1909faTe85M422UkC1_Opjbrl9cq-NuHva-a9S1ODqbX0-lNIRjno4aTR0ersgIrajKdfzOTYMSwDYQYapa1HR1fUipm9nke1oN10gIwNPSH3rDB6MDsE9m1ZaDuU6IT_Du26A8FrPKX2yHr49hfMQcjtRbMw2iIg8SzoOfflDFPOLYXuFiXVfKlG3Y90qUmqNqbOWBMYsrZXggl2';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container/60">
      <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand identity */}
        <div 
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
          onClick={() => onTabChange('generator')}
        >
          <img 
            alt="LinkedIn Post Craft AI Logo" 
            className="h-8 w-auto object-contain transition-transform hover:scale-105" 
            src={LOGO_URL}
            onError={(e) => {
              // fallback if external image fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-title-sm text-title-sm text-on-surface tracking-tight font-bold whitespace-nowrap">
            LinkedIn Post Craft AI
          </span>
          <span className="px-2 py-0.5 bg-primary-container text-on-primary font-label-sm text-label-sm rounded-full font-semibold">
            Gemini 3.8
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm rounded-full font-semibold">
            Pro
          </span>
        </div>

        {/* Center navigation tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low p-1 rounded-xl shadow-inner">
          <button
            type="button"
            onClick={() => onTabChange('generator')}
            className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'generator'
                ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Generator
          </button>

          <button
            type="button"
            onClick={() => onTabChange('hook-library')}
            className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'hook-library'
                ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Hook Library
          </button>

          <button
            type="button"
            onClick={() => onTabChange('saved-drafts')}
            className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 ${
              activeTab === 'saved-drafts'
                ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span>Saved Drafts</span>
            {draftsCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono-metric ${
                activeTab === 'saved-drafts' ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-primary font-bold'
              }`}>
                {draftsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('analytics-insights')}
            className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'analytics-insights'
                ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Analytics Insights
          </button>
        </nav>

        {/* Right utility items */}
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button 
            type="button"
            aria-label="Toggle Dark/Light Mode" 
            onClick={onToggleDarkMode}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {darkMode ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          {/* Model indicator / AI settings button */}
          <button 
            type="button"
            onClick={onOpenApiConfig}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px] text-primary">auto_awesome</span>
            <span className="hidden sm:inline font-medium">{selectedModel}</span>
          </button>

          {/* Profile menu button */}
          <div className="relative">
            <button 
              type="button"
              aria-label="User menu" 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1 rounded-full p-0.5 hover:ring-2 hover:ring-primary-container transition-all"
            >
              <img 
                alt="Alex Morgan Profile" 
                className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container" 
                src={AVATAR_URL}
              />
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant hidden sm:inline">
                expand_more
              </span>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-3 z-50 flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-container-low">
                  <img 
                    alt="Alex Morgan" 
                    className="w-10 h-10 rounded-full object-cover" 
                    src={AVATAR_URL}
                  />
                  <div className="min-w-0">
                    <h4 className="font-title-sm text-title-sm text-on-surface font-bold truncate">Alex Morgan</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant truncate">Founder & CEO @ ScaleFlow</p>
                  </div>
                </div>

                <div className="border-t border-surface-container my-1"></div>

                <button 
                  type="button"
                  onClick={() => {
                    onOpenApiConfig();
                    setProfileDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
                  <span>Gemini AI Engine Settings</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    onTabChange('saved-drafts');
                    setProfileDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">inventory_2</span>
                  <span>Content Vault ({draftsCount})</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    onTabChange('analytics-insights');
                    setProfileDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">analytics</span>
                  <span>Creator Performance</span>
                </button>

                <div className="border-t border-surface-container my-1"></div>

                <div className="px-3 py-1 flex items-center justify-between text-[11px] font-mono-metric text-on-surface-variant">
                  <span>Engine: v2.4 Live</span>
                  <span className="text-tertiary font-bold">Connected</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation tab bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-surface-container/60 bg-surface-container-low px-2 py-1.5">
        <button
          type="button"
          onClick={() => onTabChange('generator')}
          className={`flex-1 py-1 text-center font-label-sm text-label-sm rounded-lg transition-colors ${
            activeTab === 'generator' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          Generator
        </button>
        <button
          type="button"
          onClick={() => onTabChange('hook-library')}
          className={`flex-1 py-1 text-center font-label-sm text-label-sm rounded-lg transition-colors ${
            activeTab === 'hook-library' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          Hooks
        </button>
        <button
          type="button"
          onClick={() => onTabChange('saved-drafts')}
          className={`flex-1 py-1 text-center font-label-sm text-label-sm rounded-lg transition-colors ${
            activeTab === 'saved-drafts' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          Drafts ({draftsCount})
        </button>
        <button
          type="button"
          onClick={() => onTabChange('analytics-insights')}
          className={`flex-1 py-1 text-center font-label-sm text-label-sm rounded-lg transition-colors ${
            activeTab === 'analytics-insights' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
