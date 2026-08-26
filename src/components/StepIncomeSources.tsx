import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Building, 
  TrendingUp, 
  Briefcase, 
  Landmark, 
  Globe, 
  DollarSign
} from 'lucide-react';
import { 
  FullTaxPreparationData, 
  CapitalGainItem, 
  ForeignAssetItem, 
  LanguageCode 
} from '../types';
import { formatINR, formatINRLakhsCrores, parseNumericInput } from '../utils/formatters';
import { translations } from '../data/translations';
import { CurrencyInput } from './CurrencyInput';

interface StepIncomeSourcesProps {
  data: FullTaxPreparationData;
  onChangeData: (updated: Partial<FullTaxPreparationData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentLang: LanguageCode;
}

export const StepIncomeSources: React.FC<StepIncomeSourcesProps> = ({
  data,
  onChangeData,
  onNext,
  onPrev,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;
  const { 
    situation, 
    salary, 
    houseProperty, 
    capitalGains = [], 
    businessProfession, 
    otherSources, 
    foreignAssets = [] 
  } = data;

  // Active sub-tab state among enabled income sources
  const enabledTabs: Array<{ id: string; label: string; icon: any }> = [];
  if (situation.hasSalaryIncome || situation.hasPensionIncome) {
    enabledTabs.push({ id: 'salary', label: t.tabSalary, icon: Building });
  }
  if (situation.hasCapitalGains) {
    enabledTabs.push({ id: 'cg', label: t.tabCG, icon: TrendingUp });
  }
  if (situation.hasHouseProperty) {
    enabledTabs.push({ id: 'house', label: t.tabHP, icon: Landmark });
  }
  if (situation.hasOtherSources) {
    enabledTabs.push({ id: 'other', label: t.tabOS, icon: DollarSign });
  }
  if (situation.hasForeignAssetsOrIncome) {
    enabledTabs.push({ id: 'foreign', label: t.tabFA, icon: Globe });
  }
  if (situation.hasBusinessIncome) {
    enabledTabs.push({ id: 'business', label: t.tabBP, icon: Briefcase });
  }

  const [activeTab, setActiveTab] = useState<string>(enabledTabs[0]?.id || 'salary');

  // Helpers for updates
  const updateSalary = (fields: Partial<typeof salary>) => {
    onChangeData({ salary: { ...salary, ...fields } });
  };

  const updateHouse = (fields: Partial<typeof houseProperty>) => {
    onChangeData({ houseProperty: { ...houseProperty, ...fields } });
  };

  const updateBusiness = (fields: Partial<typeof businessProfession>) => {
    onChangeData({ businessProfession: { ...businessProfession, ...fields } });
  };

  const updateOther = (fields: Partial<typeof otherSources>) => {
    onChangeData({ otherSources: { ...otherSources, ...fields } });
  };

  // Capital Gains management
  const addCapitalGain = () => {
    const newItem: CapitalGainItem = {
      id: `cg-${Date.now()}`,
      assetType: 'Equity Shares (Listed)',
      gainType: 'STCG',
      saleValue: 100000,
      purchaseCost: 80000,
      transferExpenses: 0,
      netGain: 20000,
    };
    onChangeData({ capitalGains: [...(capitalGains || []), newItem] });
  };

  const updateCapitalGainItem = (id: string, updated: Partial<CapitalGainItem>) => {
    const list = (capitalGains || []).map((item) => {
      if (item.id === id) {
        const merged = { ...item, ...updated };
        merged.netGain = Math.max(0, (merged.saleValue || 0) - (merged.purchaseCost || 0) - (merged.transferExpenses || 0));
        return merged;
      }
      return item;
    });
    onChangeData({ capitalGains: list });
  };

  const removeCapitalGainItem = (id: string) => {
    onChangeData({ capitalGains: (capitalGains || []).filter((i) => i.id !== id) });
  };

  // Foreign Assets management
  const addForeignAsset = () => {
    const newItem: ForeignAssetItem = {
      id: `fa-${Date.now()}`,
      country: 'United States of America',
      assetCategory: 'Shares / RSUs / ESPP',
      institutionName: 'Morgan Stanley / Company Stock Plan',
      estimatedValueINR: 500000,
      peakValueDuringYearINR: 550000,
      incomeDerivedINR: 0,
    };
    onChangeData({ foreignAssets: [...(foreignAssets || []), newItem] });
  };

  const updateForeignAssetItem = (id: string, updated: Partial<ForeignAssetItem>) => {
    const list = (foreignAssets || []).map((item) => (item.id === id ? { ...item, ...updated } : item));
    onChangeData({ foreignAssets: list });
  };

  const removeForeignAssetItem = (id: string) => {
    onChangeData({ foreignAssets: (foreignAssets || []).filter((i) => i.id !== id) });
  };

  return (
    <div id="step-income-container" className="space-y-5">
      {/* 1. Tab Selector for Active Income Streams */}
      <div className="ux4g-card p-2 bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-1.5" role="tablist">
          {enabledTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-income-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`ux4g-btn ux4g-btn-sm ${
                  isActive
                    ? 'ux4g-btn-primary shadow-xs'
                    : 'ux4g-btn-outline-neutral hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SALARY & PENSION FORM */}
      {activeTab === 'salary' && (
        <div id="section-salary" className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#4A2BC2]" />
              <span>{t.salaryHeading}</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {t.salarySub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-gross-salary" className="ux4g-form-label">
                {t.grossSalaryLabel}
              </label>
              <CurrencyInput
                id="input-gross-salary"
                value={salary.grossSalary}
                onChange={(val) => updateSalary({ grossSalary: val })}
              />
              <div className="text-[11px] text-slate-500 mt-1">
                <span>{t.inWords}: {formatINRLakhsCrores(salary.grossSalary)}</span>
              </div>
            </div>

            <div>
              <label htmlFor="input-exempt-allowances" className="ux4g-form-label">
                {t.exemptAllowancesLabel}
              </label>
              <CurrencyInput
                id="input-exempt-allowances"
                value={salary.exemptAllowances}
                onChange={(val) => updateSalary({ exemptAllowances: val })}
              />
            </div>

            <div>
              <label htmlFor="input-prof-tax" className="ux4g-form-label">
                {t.profTaxLabel}
              </label>
              <CurrencyInput
                id="input-prof-tax"
                value={salary.professionalTax}
                onChange={(val) => updateSalary({ professionalTax: val })}
                placeholder="2500"
              />
            </div>

            <div>
              <label htmlFor="input-employer-name" className="ux4g-form-label">
                {t.employerNameLabel}
              </label>
              <input
                id="input-employer-name"
                type="text"
                value={salary.employerName}
                onChange={(e) => updateSalary({ employerName: e.target.value })}
                placeholder="e.g. Infosys Ltd"
                className="ux4g-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. CAPITAL GAINS FORM */}
      {activeTab === 'cg' && (
        <div id="section-capital-gains" className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4A2BC2]" />
                <span>{t.cgHeading}</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {t.cgSub}
              </p>
            </div>

            <button
              id="btn-add-cg-item"
              type="button"
              onClick={addCapitalGain}
              className="ux4g-btn ux4g-btn-sm ux4g-btn-primary shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addTransactionBtn}</span>
            </button>
          </div>

          {capitalGains.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-600">
              {t.noCGRecorded}
            </div>
          ) : (
            <div className="space-y-2.5">
              {capitalGains.map((item, idx) => (
                <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="ux4g-badge ux4g-badge-primary text-[10px]">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCapitalGainItem(item.id)}
                      className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.removeAction}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div>
                      <label className="ux4g-form-label text-[11px]">{t.assetCategoryLabel}</label>
                      <select
                        value={item.assetType}
                        onChange={(e) => updateCapitalGainItem(item.id, { assetType: e.target.value as any })}
                        className="ux4g-select text-xs py-1.5"
                      >
                        <option value="Equity Shares (Listed)">Equity Shares (Listed)</option>
                        <option value="Equity Mutual Funds">Equity Mutual Funds</option>
                        <option value="Real Estate">Real Estate / Flat</option>
                        <option value="Debt Mutual Funds">Debt Mutual Funds</option>
                        <option value="Gold / Others">Gold / Others</option>
                      </select>
                    </div>

                    <div>
                      <label className="ux4g-form-label text-[11px]">{t.holdingTermLabel}</label>
                      <select
                        value={item.gainType}
                        onChange={(e) => updateCapitalGainItem(item.id, { gainType: e.target.value as any })}
                        className="ux4g-select text-xs py-1.5"
                      >
                        <option value="STCG">{t.termSTCG}</option>
                        <option value="LTCG">{t.termLTCG}</option>
                      </select>
                    </div>

                    <div>
                      <label className="ux4g-form-label text-[11px]">{t.saleConsiderationLabel}</label>
                      <input
                        type="text"
                        value={item.saleValue ? item.saleValue.toLocaleString('en-IN') : ''}
                        onChange={(e) => updateCapitalGainItem(item.id, { saleValue: parseNumericInput(e.target.value) })}
                        placeholder="0"
                        className="ux4g-input text-xs py-1.5 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="ux4g-form-label text-[11px]">{t.purchaseCostLabel}</label>
                      <input
                        type="text"
                        value={item.purchaseCost ? item.purchaseCost.toLocaleString('en-IN') : ''}
                        onChange={(e) => updateCapitalGainItem(item.id, { purchaseCost: parseNumericInput(e.target.value) })}
                        placeholder="0"
                        className="ux4g-input text-xs py-1.5 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs">
                    <div className="text-slate-600">
                      {t.netGainLabel}:
                    </div>
                    <div className="font-bold text-slate-900">
                      <span className={item.netGain >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700'}>
                        {formatINR(item.netGain)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. HOUSE PROPERTY FORM */}
      {activeTab === 'house' && (
        <div id="section-house" className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#4A2BC2]" />
              <span>{t.hpHeading}</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {t.hpSub}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-800">{t.hpUsageType}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateHouse({ propertyType: 'Self-Occupied' })}
                  className={`ux4g-btn ux4g-btn-sm ${
                    houseProperty.propertyType === 'Self-Occupied' ? 'ux4g-btn-primary' : 'ux4g-btn-outline-neutral'
                  }`}
                >
                  {t.hpSelfOccupied}
                </button>
                <button
                  type="button"
                  onClick={() => updateHouse({ propertyType: 'Let-Out' })}
                  className={`ux4g-btn ux4g-btn-sm ${
                    houseProperty.propertyType === 'Let-Out' ? 'ux4g-btn-primary' : 'ux4g-btn-outline-neutral'
                  }`}
                >
                  {t.hpLetOut}
                </button>
              </div>
            </div>

            {houseProperty.propertyType === 'Self-Occupied' ? (
              <div className="bg-purple-50/40 border border-purple-200 rounded-xl p-3.5 space-y-2">
                <label htmlFor="input-home-loan-interest" className="ux4g-form-label">
                  {t.homeLoanInterestLabel}
                </label>
                <div className="max-w-md">
                  <CurrencyInput
                    id="input-home-loan-interest"
                    value={houseProperty.homeLoanInterest}
                    onChange={(val) => updateHouse({ homeLoanInterest: val })}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div>
                  <label htmlFor="input-gross-rent" className="ux4g-form-label">
                    {t.grossRentReceivedLabel}
                  </label>
                  <CurrencyInput
                    id="input-gross-rent"
                    value={houseProperty.grossRentReceived}
                    onChange={(val) => updateHouse({ grossRentReceived: val })}
                  />
                </div>

                <div>
                  <label htmlFor="input-muni-tax" className="ux4g-form-label">
                    {t.muniTaxesPaidLabel}
                  </label>
                  <CurrencyInput
                    id="input-muni-tax"
                    value={houseProperty.municipalTaxesPaid}
                    onChange={(val) => updateHouse({ municipalTaxesPaid: val })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. OTHER SOURCES FORM */}
      {activeTab === 'other' && (
        <div id="section-other-sources" className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#4A2BC2]" />
              <span>{t.osHeading}</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {t.osSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label htmlFor="input-savings-interest" className="ux4g-form-label">
                {t.savingsInterestLabel}
              </label>
              <CurrencyInput
                id="input-savings-interest"
                value={otherSources.savingsBankInterest}
                onChange={(val) => updateOther({ savingsBankInterest: val })}
              />
            </div>

            <div>
              <label htmlFor="input-fd-interest" className="ux4g-form-label">
                {t.fdInterestLabel}
              </label>
              <CurrencyInput
                id="input-fd-interest"
                value={otherSources.fdInterest}
                onChange={(val) => updateOther({ fdInterest: val })}
              />
            </div>

            <div>
              <label htmlFor="input-dividend-income" className="ux4g-form-label">
                {t.dividendIncomeLabel}
              </label>
              <CurrencyInput
                id="input-dividend-income"
                value={otherSources.dividendIncome}
                onChange={(val) => updateOther({ dividendIncome: val })}
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. FOREIGN ASSETS FORM */}
      {activeTab === 'foreign' && (
        <div id="section-foreign-assets" className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#4A2BC2]" />
                <span>{t.faHeading}</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {t.faSub}
              </p>
            </div>

            <button
              id="btn-add-foreign-asset"
              type="button"
              onClick={addForeignAsset}
              className="ux4g-btn ux4g-btn-sm ux4g-btn-primary shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addFAHoldingBtn}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {foreignAssets.map((item, idx) => (
              <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="ux4g-badge ux4g-badge-primary text-[10px]">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeForeignAssetItem(item.id)}
                    className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.removeAction}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="ux4g-form-label text-[11px]">{t.faCountryLabel}</label>
                    <input
                      type="text"
                      value={item.country}
                      onChange={(e) => updateForeignAssetItem(item.id, { country: e.target.value })}
                      className="ux4g-input text-xs"
                      placeholder="e.g. United States of America"
                    />
                  </div>

                  <div>
                    <label className="ux4g-form-label text-[11px]">{t.faCategoryLabel}</label>
                    <select
                      value={item.assetCategory}
                      onChange={(e) => updateForeignAssetItem(item.id, { assetCategory: e.target.value as any })}
                      className="ux4g-select text-xs"
                    >
                      <option value="Shares / RSUs / ESPP">Shares / RSUs / ESPP</option>
                      <option value="Bank Account">Foreign Bank Account</option>
                      <option value="Financial Interest / Entity">Financial Interest in Entity</option>
                      <option value="Immovable Property">Immovable Property</option>
                    </select>
                  </div>

                  <div>
                    <label className="ux4g-form-label text-[11px]">{t.faEstimatedValLabel}</label>
                    <input
                      type="text"
                      value={item.estimatedValueINR ? item.estimatedValueINR.toLocaleString('en-IN') : ''}
                      onChange={(e) => updateForeignAssetItem(item.id, { estimatedValueINR: parseNumericInput(e.target.value) })}
                      placeholder="0"
                      className="ux4g-input text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. BUSINESS & PROFESSION FORM */}
      {activeTab === 'business' && (
        <div id="section-business" className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#4A2BC2]" />
              <span>{t.bpHeading}</span>
            </h3>
          </div>

          <div className="bg-purple-50/40 border border-purple-200 rounded-xl p-3.5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="input-44ada-gross" className="ux4g-form-label">
                  {t.grossReceiptsLabel}
                </label>
                <input
                  id="input-44ada-gross"
                  type="text"
                  value={businessProfession.grossReceiptsOrTurnover ? businessProfession.grossReceiptsOrTurnover.toLocaleString('en-IN') : ''}
                  onChange={(e) => {
                    const val = parseNumericInput(e.target.value);
                    updateBusiness({
                      grossReceiptsOrTurnover: val,
                      presumptiveProfitDeclared: Math.max(val * 0.5, businessProfession.presumptiveProfitDeclared || 0),
                    });
                  }}
                  placeholder="0"
                  className="ux4g-input font-semibold bg-white"
                />
              </div>

              <div>
                <label htmlFor="input-44ada-profit" className="ux4g-form-label">
                  {t.presumptiveProfitLabel}
                </label>
                <input
                  id="input-44ada-profit"
                  type="text"
                  value={businessProfession.presumptiveProfitDeclared ? businessProfession.presumptiveProfitDeclared.toLocaleString('en-IN') : ''}
                  onChange={(e) => updateBusiness({ presumptiveProfitDeclared: parseNumericInput(e.target.value) })}
                  placeholder="0"
                  className="ux4g-input font-semibold bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <button
          id="btn-income-prev"
          type="button"
          onClick={onPrev}
          className="ux4g-btn ux4g-btn-md ux4g-btn-outline-neutral w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.prevStep}</span>
        </button>

        <button
          id="btn-income-next"
          type="button"
          onClick={onNext}
          className="ux4g-btn ux4g-btn-md ux4g-btn-primary w-full sm:w-auto"
        >
          <span>{t.nextStep}: {t.step4Short}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
