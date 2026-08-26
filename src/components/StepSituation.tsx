import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Layers
} from 'lucide-react';
import { TaxpayerSituation, TaxpayerProfile, ITRFormDecision, LanguageCode } from '../types';
import { translations } from '../data/translations';

interface StepSituationProps {
  situation: TaxpayerSituation;
  profile: TaxpayerProfile;
  decision: ITRFormDecision;
  onChangeSituation: (updated: Partial<TaxpayerSituation>) => void;
  onChangeProfile: (updated: Partial<TaxpayerProfile>) => void;
  onNext: () => void;
  currentLang: LanguageCode;
}

export const StepSituation: React.FC<StepSituationProps> = ({
  situation,
  profile,
  decision,
  onChangeSituation,
  onChangeProfile,
  onNext,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;

  return (
    <div id="step-situation-container" className="space-y-5">
      {/* 1. Citizen Landing Hero & Visual Journey */}
      <div className="ux4g-card p-5 md:p-6 bg-white border border-slate-200 shadow-xs">
        <div className="max-w-3xl space-y-2">
          <span className="ux4g-badge ux4g-badge-primary">
            {t.landingEyebrow}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {t.landingHeadline}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {t.landingDescription}
          </p>
        </div>

        {/* 4-Step Citizen Journey */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-100">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-[#4A2BC2] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              1
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900">{t.journeyStep1}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              2
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900">{t.journeyStep2}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              3
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900">{t.journeyStep3}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              4
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-900">{t.journeyStep4}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal Filing Profile */}
      <div className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {t.personalProfileTitle}
          </h3>
          <p className="text-xs text-slate-500">
            {t.personalProfileDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label htmlFor="input-profile-name" className="ux4g-form-label">
              {t.fullNameLabel}
            </label>
            <input
              id="input-profile-name"
              type="text"
              value={profile.name}
              onChange={(e) => onChangeProfile({ name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="ux4g-input"
            />
            <span className="ux4g-form-hint">{t.fullNameHint}</span>
          </div>

          <div>
            <label htmlFor="select-profile-age" className="ux4g-form-label">
              {t.ageCategoryLabel}
            </label>
            <select
              id="select-profile-age"
              value={profile.ageCategory}
              onChange={(e) => onChangeProfile({ ageCategory: e.target.value as any })}
              className="ux4g-select"
            >
              <option value="Below 60">{t.ageBelow60}</option>
              <option value="Senior Citizen (60-80)">{t.ageSenior60to80}</option>
              <option value="Super Senior Citizen (80+)">{t.ageSuperSenior80}</option>
            </select>
            <span className="ux4g-form-hint">{t.ageCategoryHint}</span>
          </div>

          <div>
            <label htmlFor="select-profile-residency" className="ux4g-form-label">
              {t.residencyLabel}
            </label>
            <select
              id="select-profile-residency"
              value={profile.residentialStatus}
              onChange={(e) => onChangeProfile({ residentialStatus: e.target.value as any })}
              className="ux4g-select"
            >
              <option value="Resident">{t.resResident}</option>
              <option value="Non-Resident (NRI)">{t.resNRI}</option>
              <option value="Resident but Not Ordinarily Resident (RNOR)">{t.resRNOR}</option>
            </select>
            <span className="ux4g-form-hint">{t.residencyHint}</span>
          </div>

          <div>
            <label htmlFor="select-profile-status" className="ux4g-form-label">
              {t.filingStatusLabel}
            </label>
            <select
              id="select-profile-status"
              value={profile.filingStatus}
              onChange={(e) => onChangeProfile({ filingStatus: e.target.value as any })}
              className="ux4g-select"
            >
              <option value="Individual">{t.statusIndividual}</option>
              <option value="HUF">{t.statusHUF}</option>
            </select>
            <span className="ux4g-form-hint">{t.filingStatusHint}</span>
          </div>
        </div>
      </div>

      {/* 3. Conversational Financial Discovery Experience */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {t.discoveryHeading}
          </h3>
          <p className="text-xs text-slate-500">
            {t.discoverySubheading}
          </p>
        </div>

        {/* Q1: Salary / Pension */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          situation.hasSalaryIncome || situation.hasPensionIncome 
            ? 'bg-purple-50/50 border-[#4A2BC2] ring-1 ring-[#4A2BC2]/20' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 max-w-2xl">
              <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                1. {t.qSalaryTitle}
              </div>
              <p className="text-xs text-slate-600">
                {t.qSalaryDesc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="btn-salary-yes"
                onClick={() => onChangeSituation({ hasSalaryIncome: true, hasPensionIncome: false })}
                className={`ux4g-btn ux4g-btn-sm ${
                  situation.hasSalaryIncome || situation.hasPensionIncome
                    ? 'ux4g-btn-primary'
                    : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                id="btn-salary-no"
                onClick={() => onChangeSituation({ hasSalaryIncome: false, hasPensionIncome: false })}
                className={`ux4g-btn ux4g-btn-sm ${
                  !situation.hasSalaryIncome && !situation.hasPensionIncome
                    ? 'ux4g-btn-secondary'
                    : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>
        </div>

        {/* Q2: Capital Gains */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          situation.hasCapitalGains 
            ? 'bg-purple-50/50 border-[#4A2BC2] ring-1 ring-[#4A2BC2]/20' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 max-w-2xl">
              <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                2. {t.qCGTitle}
              </div>
              <p className="text-xs text-slate-600">
                {t.qCGDesc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="btn-cg-yes"
                onClick={() => onChangeSituation({ hasCapitalGains: true })}
                className={`ux4g-btn ux4g-btn-sm ${
                  situation.hasCapitalGains
                    ? 'ux4g-btn-primary'
                    : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                id="btn-cg-no"
                onClick={() => onChangeSituation({ hasCapitalGains: false })}
                className={`ux4g-btn ux4g-btn-sm ${
                  !situation.hasCapitalGains
                    ? 'ux4g-btn-secondary'
                    : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>
        </div>

        {/* Q3: House Property */}
        <div className="p-3.5 rounded-xl border bg-white border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 max-w-2xl">
              <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                3. {t.qHPTitle}
              </div>
              <p className="text-xs text-slate-600">
                {t.qHPDesc}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onChangeSituation({ hasHouseProperty: false, housePropertyCount: 'none' })}
                className={`ux4g-btn ux4g-btn-sm ${
                  !situation.hasHouseProperty ? 'ux4g-btn-secondary' : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.hpNone}
              </button>
              <button
                type="button"
                onClick={() => onChangeSituation({ hasHouseProperty: true, housePropertyCount: 'one' })}
                className={`ux4g-btn ux4g-btn-sm ${
                  situation.hasHouseProperty && situation.housePropertyCount === 'one' ? 'ux4g-btn-primary' : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.hpOne}
              </button>
              <button
                type="button"
                onClick={() => onChangeSituation({ hasHouseProperty: true, housePropertyCount: 'multiple' })}
                className={`ux4g-btn ux4g-btn-sm ${
                  situation.hasHouseProperty && situation.housePropertyCount === 'multiple' ? 'ux4g-btn-primary' : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.hpMultiple}
              </button>
            </div>
          </div>
        </div>

        {/* Q4: Bank Interest, Dividends */}
        <div className="p-3.5 rounded-xl border bg-white border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 max-w-2xl">
              <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                4. {t.qOSTitle}
              </div>
              <p className="text-xs text-slate-600">
                {t.qOSDesc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onChangeSituation({ hasOtherSources: true })}
                className={`ux4g-btn ux4g-btn-sm ${
                  situation.hasOtherSources ? 'ux4g-btn-primary' : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => onChangeSituation({ hasOtherSources: false })}
                className={`ux4g-btn ux4g-btn-sm ${
                  !situation.hasOtherSources ? 'ux4g-btn-secondary' : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>
        </div>

        {/* Q5: Foreign Assets & Foreign Income */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          situation.hasForeignAssetsOrIncome 
            ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 max-w-2xl">
              <div className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span>5. {t.qFATitle}</span>
                <span className="ux4g-badge ux4g-badge-warning text-[10px]">
                  {t.faMandatoryTag}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {t.qFADesc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onChangeSituation({ hasForeignAssetsOrIncome: true })}
                className={`ux4g-btn ux4g-btn-sm ${
                  situation.hasForeignAssetsOrIncome ? 'ux4g-btn-primary' : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => onChangeSituation({ hasForeignAssetsOrIncome: false })}
                className={`ux4g-btn ux4g-btn-sm ${
                  !situation.hasForeignAssetsOrIncome ? 'ux4g-btn-secondary' : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>
        </div>

        {/* Q6: Business / Profession Income */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          situation.hasBusinessIncome 
            ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 max-w-2xl">
              <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                6. {t.qBusinessTitle}
              </div>
              <p className="text-xs text-slate-600">
                {t.qBusinessDesc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="btn-business-yes"
                onClick={() => onChangeSituation({ 
                  hasBusinessIncome: true, 
                  isPresumptiveProfessional: true, 
                  isPresumptiveBusiness: false,
                  hasRegularBooksOfAccounts: false 
                })}
                className={`ux4g-btn ux4g-btn-sm ${
                  situation.hasBusinessIncome
                    ? 'ux4g-btn-primary'
                    : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                id="btn-business-no"
                onClick={() => onChangeSituation({ 
                  hasBusinessIncome: false, 
                  isPresumptiveBusiness: false, 
                  isPresumptiveProfessional: false, 
                  hasRegularBooksOfAccounts: false 
                })}
                className={`ux4g-btn ux4g-btn-sm ${
                  !situation.hasBusinessIncome
                    ? 'ux4g-btn-secondary'
                    : 'ux4g-btn-outline-neutral'
                }`}
              >
                {t.no}
              </button>
            </div>
          </div>

          {/* Progressive Disclosure Sub-options */}
          {situation.hasBusinessIncome && (
            <div className="mt-3 pt-3 border-t border-amber-200 bg-white/80 rounded-lg p-3 space-y-2">
              <div className="text-xs font-bold text-slate-800">
                {t.bizModePrompt}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <label className={`p-2 rounded-lg border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                  situation.isPresumptiveProfessional
                    ? 'bg-purple-50 border-[#4A2BC2] font-semibold text-purple-950'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="business_type"
                      checked={situation.isPresumptiveProfessional}
                      onChange={() => onChangeSituation({
                        isPresumptiveProfessional: true,
                        isPresumptiveBusiness: false,
                        hasRegularBooksOfAccounts: false,
                      })}
                      className="text-[#4A2BC2] focus:ring-[#4A2BC2]"
                    />
                    <span>{t.bizProf44ADA}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 pl-5">
                    {t.bizProf44ADADesc}
                  </span>
                </label>

                <label className={`p-2 rounded-lg border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                  situation.isPresumptiveBusiness
                    ? 'bg-purple-50 border-[#4A2BC2] font-semibold text-purple-950'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="business_type"
                      checked={situation.isPresumptiveBusiness}
                      onChange={() => onChangeSituation({
                        isPresumptiveProfessional: false,
                        isPresumptiveBusiness: true,
                        hasRegularBooksOfAccounts: false,
                      })}
                      className="text-[#4A2BC2] focus:ring-[#4A2BC2]"
                    />
                    <span>{t.bizTrade44AD}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 pl-5">
                    {t.bizTrade44ADDesc}
                  </span>
                </label>

                <label className={`p-2 rounded-lg border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                  situation.hasRegularBooksOfAccounts
                    ? 'bg-purple-50 border-[#4A2BC2] font-semibold text-purple-950'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="business_type"
                      checked={situation.hasRegularBooksOfAccounts}
                      onChange={() => onChangeSituation({
                        isPresumptiveProfessional: false,
                        isPresumptiveBusiness: false,
                        hasRegularBooksOfAccounts: true,
                      })}
                      className="text-[#4A2BC2] focus:ring-[#4A2BC2]"
                    />
                    <span>{t.bizRegularBooks}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 pl-5">
                    {t.bizRegularBooksDesc}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Live Form Determination & Next Action Card */}
      <div id="decision-result-card" className="ux4g-card p-5 md:p-6 bg-[#1F2430] text-white border border-slate-700 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-purple-600 text-white text-xs uppercase font-extrabold px-2.5 py-0.5 rounded">
                {t.formDecisionTag}
              </span>
              <span className="text-2xl font-extrabold text-amber-300">
                {decision.recommendedForm}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              {decision.plainReason}
            </p>

            <ul className="space-y-1 text-xs text-slate-300">
              {(decision.detailedPoints || []).map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {/* Applicable schedules */}
            <div className="pt-1">
              <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-300" />
                <span>{t.activatedSchedules}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(decision.applicableSchedules || []).map((sch) => (
                  <span
                    key={sch.code}
                    className="bg-white/10 text-white text-[11px] font-medium px-2 py-0.5 rounded border border-white/15"
                    title={`${sch.name}: ${sch.description}`}
                  >
                    {sch.code} ({sch.citizenCategory})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="shrink-0 flex flex-col items-stretch sm:items-end justify-center">
            <button
              id="btn-confirm-situation-next"
              type="button"
              onClick={onNext}
              className="ux4g-btn ux4g-btn-md ux4g-btn-primary shadow-md gap-2"
            >
              <span>{t.nextStep}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-slate-400 mt-1.5 text-center sm:text-right">
              {t.step2Short}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
