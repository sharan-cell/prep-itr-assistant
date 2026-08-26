import React from 'react';
import { Check, Compass, UploadCloud, Wallet, Scale, Receipt, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../data/translations';

interface StageProgressProps {
  currentStage: number; // 1 to 6
  onSelectStage: (stage: number) => void;
  currentLang: LanguageCode;
  maxCompletedStage: number;
}

export const StageProgress: React.FC<StageProgressProps> = ({
  currentStage,
  onSelectStage,
  currentLang,
  maxCompletedStage,
}) => {
  const t = translations[currentLang] || translations.en;

  const stages = [
    {
      id: 1,
      shortLabel: t.step1Short,
      icon: Compass,
    },
    {
      id: 2,
      shortLabel: t.step2Short,
      icon: UploadCloud,
    },
    {
      id: 3,
      shortLabel: t.step3Short,
      icon: Wallet,
    },
    {
      id: 4,
      shortLabel: t.step4Short,
      icon: Scale,
    },
    {
      id: 5,
      shortLabel: t.step5Short,
      icon: Receipt,
    },
    {
      id: 6,
      shortLabel: t.step6Short,
      icon: CheckCircle2,
    },
  ];

  const progressPercent = Math.round(((currentStage - 1) / 5) * 100);

  return (
    <nav 
      id="stage-progress-nav" 
      aria-label="Tax Preparation Journey Steps" 
      className="w-full bg-white border-b border-slate-200 px-4 py-2.5 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Progress Bar & Stage Status */}
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#4A2BC2]">
              {t.stageOf.replace('{current}', String(currentStage))}:
            </span>
            <span className="text-slate-900 font-semibold">{stages[currentStage - 1]?.shortLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{t.completePercent.replace('{pct}', String(progressPercent))}</span>
            <div className="w-20 sm:w-28 bg-slate-200 h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div 
                className="h-full bg-[#4A2BC2] transition-all duration-300 rounded-full" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stepper Navigation Grid */}
        <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2">
          {stages.map((stage) => {
            const isCurrent = currentStage === stage.id;
            const isCompleted = maxCompletedStage >= stage.id && stage.id < currentStage;
            const isAccessible = stage.id <= maxCompletedStage + 1;

            return (
              <li key={stage.id} className="relative">
                <button
                  id={`btn-stage-${stage.id}`}
                  type="button"
                  onClick={() => isAccessible && onSelectStage(stage.id)}
                  disabled={!isAccessible}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-purple-50 border-[#4A2BC2] text-[#4A2BC2] font-bold shadow-2xs ring-1 ring-[#4A2BC2]/20'
                      : isCompleted
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 hover:bg-emerald-100/60 cursor-pointer font-medium'
                      : isAccessible
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[#4A2BC2] text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : stage.id}
                  </div>

                  <span className="truncate text-xs">
                    {stage.shortLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
