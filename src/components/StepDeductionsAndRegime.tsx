import React from 'react';
import { 
  Scale, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Award,
  Info
} from 'lucide-react';
import { FullTaxPreparationData, LanguageCode, TaxComparisonResult } from '../types';
import { formatINR, parseNumericInput } from '../utils/formatters';
import { translations } from '../data/translations';
import { CurrencyInput } from './CurrencyInput';

interface StepDeductionsAndRegimeProps {
  data: FullTaxPreparationData;
  comparison: TaxComparisonResult;
  onChangeData: (updated: Partial<FullTaxPreparationData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentLang: LanguageCode;
}

export const StepDeductionsAndRegime: React.FC<StepDeductionsAndRegimeProps> = ({
  data,
  comparison,
  onChangeData,
  onNext,
  onPrev,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;
  const { deductions, selectedRegime } = data;

  const updateDeductions = (fields: Partial<typeof deductions>) => {
    onChangeData({ deductions: { ...deductions, ...fields } });
  };

  const isSeniorParents = deductions.isParentsSeniorCitizen;

  return (
    <div id="step-deductions-container" className="space-y-5">
      {/* 1. Live Regime Comparison Hero Card */}
      <div id="regime-comparator-card" className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-2.5">
          <div>
            <span className="ux4g-badge ux4g-badge-primary mb-1">
              <Scale className="w-3 h-3" />
              {t.regimeHeading}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {t.regimeSub}
            </h3>
          </div>

          <div className="ux4g-badge ux4g-badge-success py-1 px-2.5 text-xs">
            <Award className="w-3.5 h-3.5" />
            <span>{t.optimalChoiceTag} <strong>{comparison.recommendedRegime === 'NEW' ? t.newRegimeTitle : t.oldRegimeTitle}</strong></span>
          </div>
        </div>

        {/* Side-by-side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* New Regime Card */}
          <div className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
            selectedRegime === 'NEW'
              ? 'border-[#4A2BC2] bg-purple-50/40 shadow-xs ring-1 ring-[#4A2BC2]/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-sm sm:text-base">
                  {t.newRegimeTitle}
                  <span className="ux4g-badge ux4g-badge-primary text-[10px] ml-2">{t.defaultRegimeTag}</span>
                </div>
                {comparison.recommendedRegime === 'NEW' && (
                  <span className="ux4g-badge ux4g-badge-success text-[10px]">
                    {t.savesMoreTax}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>{t.gtiLabel}</span>
                  <span className="font-semibold text-slate-800">{formatINR(comparison.newRegime.grossTotalIncome)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>{t.stdDedLabel}</span>
                  <span className="font-semibold text-emerald-700">₹ 75,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>{t.netTaxableIncomeLabel}</span>
                  <span className="font-semibold text-slate-900">{formatINR(comparison.newRegime.totalTaxableIncome)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>{t.rebate87ALabel}</span>
                  <span className="font-semibold text-emerald-700">- {formatINR(comparison.newRegime.rebate87A)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-xs sm:text-sm font-bold text-slate-900 bg-white px-2 rounded border border-slate-200">
                  <span>{t.totalTaxLiabilityLabel}</span>
                  <span className={comparison.newRegime.totalTaxLiability === 0 ? 'text-emerald-700 font-extrabold' : 'text-[#4A2BC2]'}>
                    {formatINR(comparison.newRegime.totalTaxLiability)}
                  </span>
                </div>
              </div>
            </div>

            <button
              id="btn-select-new-regime"
              type="button"
              onClick={() => onChangeData({ selectedRegime: 'NEW' })}
              className={`mt-3 w-full ux4g-btn ux4g-btn-sm ${
                selectedRegime === 'NEW'
                  ? 'ux4g-btn-primary'
                  : 'ux4g-btn-outline-neutral'
              }`}
            >
              {selectedRegime === 'NEW' && <Check className="w-3.5 h-3.5" />}
              <span>{selectedRegime === 'NEW' ? t.selectedForFiling : t.selectRegimeBtn}</span>
            </button>
          </div>

          {/* Old Regime Card */}
          <div className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
            selectedRegime === 'OLD'
              ? 'border-[#4A2BC2] bg-purple-50/40 shadow-xs ring-1 ring-[#4A2BC2]/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-sm sm:text-base">
                  {t.oldRegimeTitle}
                  <span className="ux4g-badge ux4g-badge-info text-[10px] ml-2">{t.optionalRegimeTag}</span>
                </div>
                {comparison.recommendedRegime === 'OLD' && (
                  <span className="ux4g-badge ux4g-badge-success text-[10px]">
                    {t.savesMoreTax}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>{t.gtiLabel}</span>
                  <span className="font-semibold text-slate-800">{formatINR(comparison.oldRegime.grossTotalIncome)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>{t.stdDedLabel}</span>
                  <span className="font-semibold text-slate-700">₹ 50,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>{t.chapterVIADedLabel}</span>
                  <span className="font-semibold text-slate-800">{formatINR(comparison.oldRegime.totalDeductions)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>{t.netTaxableIncomeLabel}</span>
                  <span className="font-semibold text-slate-900">{formatINR(comparison.oldRegime.totalTaxableIncome)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-xs sm:text-sm font-bold text-slate-900 bg-white px-2 rounded border border-slate-200">
                  <span>{t.totalTaxLiabilityLabel}</span>
                  <span className={comparison.oldRegime.totalTaxLiability === 0 ? 'text-emerald-700 font-extrabold' : 'text-[#4A2BC2]'}>
                    {formatINR(comparison.oldRegime.totalTaxLiability)}
                  </span>
                </div>
              </div>
            </div>

            <button
              id="btn-select-old-regime"
              type="button"
              onClick={() => onChangeData({ selectedRegime: 'OLD' })}
              className={`mt-3 w-full ux4g-btn ux4g-btn-sm ${
                selectedRegime === 'OLD'
                  ? 'ux4g-btn-primary'
                  : 'ux4g-btn-outline-neutral'
              }`}
            >
              {selectedRegime === 'OLD' && <Check className="w-3.5 h-3.5" />}
              <span>{selectedRegime === 'OLD' ? t.selectedForFiling : t.selectRegimeBtn}</span>
            </button>
          </div>
        </div>

        {/* Explanation Note */}
        <div className="ux4g-alert ux4g-alert-info flex items-start gap-2 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{comparison.explanation}</span>
        </div>
      </div>

      {/* 2. Deductions Entry Form (Chapter VI-A) */}
      <div id="section-deductions-form" className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-200 pb-2.5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4A2BC2]" />
            <span>{t.deductionsHeading}</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {t.deductionsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section 80C */}
          <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <label htmlFor="input-80c" className="ux4g-form-label mb-0">
                {t.sec80CLabel}
              </label>
              <span className="ux4g-badge ux4g-badge-info text-[10px]">Max ₹1.5L</span>
            </div>
            <CurrencyInput id="input-80c" value={deductions.section80C} onChange={(val) => updateDeductions({ section80C: val })} />
            <span className="ux4g-form-hint">{t.sec80CHint}</span>
          </div>

          {/* Section 80D - Health Insurance (Self) */}
          <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <label htmlFor="input-80d-self" className="ux4g-form-label mb-0">
                {t.sec80DSelfLabel}
              </label>
              <span className="ux4g-badge ux4g-badge-info text-[10px]">Max ₹25k</span>
            </div>
            <CurrencyInput id="input-80d-self" value={deductions.section80D_Self} onChange={(val) => updateDeductions({ section80D_Self: val })} />
            <span className="ux4g-form-hint">{t.sec80DSelfHint}</span>
          </div>

          {/* Section 80D - Parents */}
          <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <label htmlFor="input-80d-parents" className="ux4g-form-label mb-0">
                {t.sec80DParentsLabel}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="chk-parents-senior"
                  checked={isSeniorParents}
                  onChange={(e) => updateDeductions({ isParentsSeniorCitizen: e.target.checked })}
                  className="rounded text-[#4A2BC2]"
                />
                <label htmlFor="chk-parents-senior" className="text-[11px] text-slate-700 font-medium">
                  {t.seniorCitizenChk}
                </label>
              </div>
            </div>
            <CurrencyInput id="input-80d-parents" value={deductions.section80D_Parents} onChange={(val) => updateDeductions({ section80D_Parents: val })} />
          </div>

          {/* Section 80CCD(1B) */}
          <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <label htmlFor="input-80ccd1b" className="ux4g-form-label mb-0">
                {t.sec80CCD1BLabel}
              </label>
              <span className="ux4g-badge ux4g-badge-info text-[10px]">Max ₹50k</span>
            </div>
            <CurrencyInput id="input-80ccd1b" value={deductions.section80CCD_1B} onChange={(val) => updateDeductions({ section80CCD_1B: val })} />
          </div>

          {/* Section 80CCD(2) */}
          <div className="space-y-1 p-3 rounded-xl border border-purple-200 bg-purple-50/30">
            <div className="flex items-center justify-between">
              <label htmlFor="input-80ccd2" className="ux4g-form-label mb-0 text-[#4A2BC2]">
                {t.sec80CCD2Label}
              </label>
              <span className="ux4g-badge ux4g-badge-primary text-[10px]">
                {t.sec80CCD2ValidBoth}
              </span>
            </div>
            <CurrencyInput id="input-80ccd2" value={deductions.section80CCD_2} onChange={(val) => updateDeductions({ section80CCD_2: val })} />
          </div>

          {/* Section 80E */}
          <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <label htmlFor="input-80e" className="ux4g-form-label mb-0">
              {t.sec80ELabel}
            </label>
            <CurrencyInput id="input-80e" value={deductions.section80E} onChange={(val) => updateDeductions({ section80E: val })} />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <button
          id="btn-deductions-prev"
          type="button"
          onClick={onPrev}
          className="ux4g-btn ux4g-btn-md ux4g-btn-outline-neutral w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.prevStep}</span>
        </button>

        <button
          id="btn-deductions-next"
          type="button"
          onClick={onNext}
          className="ux4g-btn ux4g-btn-md ux4g-btn-primary w-full sm:w-auto"
        >
          <span>{t.nextStep}: {t.step5Short}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
