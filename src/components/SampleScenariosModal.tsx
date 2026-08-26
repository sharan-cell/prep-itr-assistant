import React from 'react';
import { X, BookOpen, ArrowRight, UserCheck, Briefcase, TrendingUp, Building2, HeartHandshake } from 'lucide-react';
import { sampleScenarios, SampleScenario } from '../data/sampleScenarios';
import { LanguageCode } from '../types';
import { translations } from '../data/translations';

interface SampleScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: SampleScenario) => void;
  currentLang: LanguageCode;
}

export const SampleScenariosModal: React.FC<SampleScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  currentLang,
}) => {
  if (!isOpen) return null;
  const t = translations[currentLang] || translations.en;

  const getIcon = (itr: string) => {
    switch (itr) {
      case 'ITR-1': return UserCheck;
      case 'ITR-2': return TrendingUp;
      case 'ITR-3': return Briefcase;
      case 'ITR-4': return HeartHandshake;
      default: return Building2;
    }
  };

  return (
    <div 
      id="modal-scenarios-overlay" 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-scenarios-title"
    >
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-[#1F2430] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#4A2BC2] text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-scenarios-title" className="text-base sm:text-lg font-bold">
                {t.loadScenario}
              </h3>
              <p className="text-xs text-slate-300">
                AY 2025-26 • ITR-1, ITR-2, ITR-3, ITR-4
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[65vh] overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(sampleScenarios || []).map((scenario) => {
              const Icon = getIcon(scenario.expectedITR);

              return (
                <div
                  key={scenario.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#4A2BC2] hover:shadow-xs transition-all flex flex-col justify-between bg-slate-50/50 hover:bg-white"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="ux4g-badge ux4g-badge-primary text-[10px]">
                        {scenario.categoryTag}
                      </span>
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {scenario.name}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectScenario(scenario);
                      onClose();
                    }}
                    className="mt-3 w-full ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral hover:ux4g-btn-primary"
                  >
                    <span>{t.loadScenario}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
