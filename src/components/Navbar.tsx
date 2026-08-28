import React, { useState } from 'react';
import {
  Languages,
  RotateCcw,
  BookOpen,
  Eye,
  ChevronDown,
  Building2,
  LogOut,
  UserCircle
} from 'lucide-react';
import { LanguageCode, TextSizeMode } from '../types';
import { translations } from '../data/translations';

interface NavbarProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  textSize: TextSizeMode;
  onTextSizeChange: (size: TextSizeMode) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenScenarios: () => void;
  onReset: () => void;
  currentUserName?: string;
  onSignOut?: () => void;
}

const languageOptions: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  textSize,
  onTextSizeChange,
  isHighContrast,
  onToggleHighContrast,
  onOpenScenarios,
  onReset,
  currentUserName,
  onSignOut,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = translations[currentLang] || translations.en;

  return (
    <header id="app-header" className="w-full bg-[#1F2430] text-white sticky top-0 z-40 shadow-xs border-b border-slate-700">
      {/* 1. Skip to Main Content Link for Screen Readers (Accessibility Requirement) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#4A2BC2] focus:text-white focus:font-bold focus:rounded-md"
      >
        {t.skipToContent}
      </a>

      {/* 2. UX4G Standard Top Accessibility Bar */}
      <div className="bg-[#141824] px-4 py-1 text-xs text-slate-300 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-end gap-2">
          {/* Identity & Independent Prototype Notice */}
          {/* <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-200">UX4G Citizen TaxPrep</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 hidden md:inline">{t.independentPrototype}</span>
          </div> */}

          {/* Accessibility Controls & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Text Sizing Controls */}
            <div className="flex items-center gap-1 bg-slate-900 rounded px-1.5 py-0.5 border border-slate-700" role="group" aria-label="Text Size Controls">
              <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">{t.accessibilityText}:</span>
              <button
                id="btn-text-normal"
                type="button"
                onClick={() => onTextSizeChange('normal')}
                className={`px-1.5 py-0.5 text-xs font-semibold rounded transition-colors ${textSize === 'normal' ? 'bg-[#4A2BC2] text-white' : 'text-slate-300 hover:text-white'
                  }`}
                title="Standard Text"
                aria-label="Standard Text Size"
              >
                A
              </button>
              <button
                id="btn-text-large"
                type="button"
                onClick={() => onTextSizeChange('large')}
                className={`px-1.5 py-0.5 text-sm font-semibold rounded transition-colors ${textSize === 'large' ? 'bg-[#4A2BC2] text-white' : 'text-slate-300 hover:text-white'
                  }`}
                title="Large Text"
                aria-label="Large Text Size"
              >
                A+
              </button>
              <button
                id="btn-text-xlarge"
                type="button"
                onClick={() => onTextSizeChange('xlarge')}
                className={`px-1.5 py-0.5 text-base font-bold rounded transition-colors ${textSize === 'xlarge' ? 'bg-[#4A2BC2] text-white' : 'text-slate-300 hover:text-white'
                  }`}
                title="Extra Large Text"
                aria-label="Extra Large Text Size"
              >
                A++
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              id="btn-high-contrast"
              type="button"
              onClick={onToggleHighContrast}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium transition-colors ${isHighContrast
                ? 'bg-amber-400 text-black border-amber-300 font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                }`}
              title="Toggle High Contrast"
              aria-label="Toggle High Contrast"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.contrastToggle}</span>
            </button>

            {/* Multilingual Selector */}
            <div className="relative">
              <button
                id="btn-lang-dropdown"
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700"
                aria-expanded={langMenuOpen}
                aria-label="Select Language"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-400" />
                <span>{languageOptions.find((l) => l.code === currentLang)?.native}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {langMenuOpen && (
                <div
                  id="lang-dropdown-menu"
                  className="absolute right-0 mt-1 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-100"
                >
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    Language / भाषा
                  </div>
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.code}
                      id={`lang-opt-${opt.code}`}
                      type="button"
                      onClick={() => {
                        onLanguageChange(opt.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${currentLang === opt.code
                        ? 'bg-purple-50 text-[#4A2BC2] font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                        }`}
                    >
                      <span>{opt.native}</span>
                      <span className="text-[11px] text-slate-400">({opt.label})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Brand Navbar (Clean & Minimal UX4G Contract) */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4A2BC2] text-white flex items-center justify-center shadow-xs border border-purple-400/30 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white">{t.appTitle}</span>
              <span className="bg-purple-900/60 text-purple-200 border border-purple-400/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded hidden sm:inline">
                ITR-2
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentUserName && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md text-slate-200 border border-slate-700 bg-slate-900">
              <UserCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentUserName}</span>
            </div>
          )}

          {/* Sample Taxpayer Scenarios */}
          <button
            id="btn-sample-scenarios"
            type="button"
            onClick={onOpenScenarios}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-750 text-white border border-slate-600 transition-colors"
            title="Load realistic taxpayer sample profiles"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.loadScenario}</span>
          </button>

          {/* Reset Return */}
          <button
            id="btn-reset-data"
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
            title={t.confirmReset}
            aria-label="Start fresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.startFresh}</span>
          </button>

          {onSignOut && (
            <button
              id="btn-sign-out"
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
