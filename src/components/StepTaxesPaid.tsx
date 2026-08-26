import React from 'react';
import { 
  Receipt, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2
} from 'lucide-react';
import { FullTaxPreparationData, TaxChallan, LanguageCode, TaxCalculationSummary } from '../types';
import { formatINR, parseNumericInput } from '../utils/formatters';
import { translations } from '../data/translations';
import { CurrencyInput } from './CurrencyInput';

interface StepTaxesPaidProps {
  data: FullTaxPreparationData;
  activeSummary: TaxCalculationSummary;
  onChangeData: (updated: Partial<FullTaxPreparationData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentLang: LanguageCode;
}

export const StepTaxesPaid: React.FC<StepTaxesPaidProps> = ({
  data,
  activeSummary,
  onChangeData,
  onNext,
  onPrev,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;
  const taxPayments = data.taxPayments || {
    tdsOnSalary: 0,
    tdsOnOtherIncome: 0,
    tcsCredit: 0,
    advanceTaxPaid: 0,
    selfAssessmentTaxPaid: 0,
    taxChallans: [],
  };
  const taxChallansList = taxPayments.taxChallans || [];

  const updateTaxPayments = (fields: Partial<typeof taxPayments>) => {
    onChangeData({ taxPayments: { ...taxPayments, ...fields } });
  };

  const totalTaxesPaid = 
    (taxPayments.tdsOnSalary || 0) +
    (taxPayments.tdsOnOtherIncome || 0) +
    (taxPayments.tcsCredit || 0) +
    (taxPayments.advanceTaxPaid || 0) +
    (taxPayments.selfAssessmentTaxPaid || 0);

  const netBalance = activeSummary.totalTaxLiability - totalTaxesPaid;
  const isRefund = netBalance < 0;
  const isPayable = netBalance > 0;
  const isZero = netBalance === 0;

  // Add Challan
  const addChallan = () => {
    const newChallan: TaxChallan = {
      id: `ch-${Date.now()}`,
      bsrCode: '0002145',
      challanDate: new Date().toISOString().split('T')[0],
      challanNumber: '01234',
      amount: 10000,
      type: 'Advance Tax',
    };
    const list = [...(taxPayments.taxChallans || []), newChallan];
    updateTaxPayments({ taxChallans: list });
  };

  const removeChallan = (id: string) => {
    const list = (taxPayments.taxChallans || []).filter((c) => c.id !== id);
    updateTaxPayments({ taxChallans: list });
  };

  const updateChallanItem = (id: string, updated: Partial<TaxChallan>) => {
    const list = (taxPayments.taxChallans || []).map((c) => (c.id === id ? { ...c, ...updated } : c));
    updateTaxPayments({ taxChallans: list });
  };

  return (
    <div id="step-taxes-paid-container" className="space-y-5">
      {/* 1. Hero Live Balance Summary */}
      <div className={`ux4g-card p-5 border text-white shadow-md transition-all ${
        isRefund 
          ? 'bg-[#00381E] border-emerald-600'
          : isPayable
          ? 'bg-[#1F2430] border-slate-700'
          : 'bg-slate-900 border-slate-700'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="ux4g-badge ux4g-badge-primary">
              {t.settlementPositionTag}
            </span>
            <div className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 mt-1.5">
              {isRefund && <span className="text-emerald-300">{t.refundDueTitle} {formatINR(Math.abs(netBalance))}</span>}
              {isPayable && <span className="text-amber-300">{t.taxPayableTitle} {formatINR(netBalance)}</span>}
              {isZero && <span className="text-slate-200">{t.nilTaxTitle}</span>}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {isRefund && t.refundDesc}
              {isPayable && t.taxPayableDesc}
              {isZero && t.nilTaxDesc}
            </p>
          </div>

          {/* Metrics */}
          <div className="bg-white/10 rounded-xl p-3 border border-white/15 shrink-0 flex flex-col gap-1 text-xs min-w-[200px]">
            <div className="flex justify-between text-slate-200">
              <span>{t.totalTaxLiabilityLabel}</span>
              <strong className="text-white">{formatINR(activeSummary.totalTaxLiability)}</strong>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>{t.totalTaxesPaidLabel}</span>
              <strong className="text-emerald-300">- {formatINR(totalTaxesPaid)}</strong>
            </div>
            <div className="h-px bg-white/20 my-0.5"></div>
            <div className="flex justify-between font-bold text-xs sm:text-sm">
              <span>{t.netBalanceLabel}</span>
              <span className={isRefund ? 'text-emerald-300' : isPayable ? 'text-amber-300' : 'text-white'}>
                {isRefund ? `${formatINR(Math.abs(netBalance))}` : formatINR(netBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Taxes Paid Inputs Form */}
      <div className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-200 pb-2.5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#4A2BC2]" />
            <span>{t.totalTaxesPaidLabel}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* TDS on Salary */}
          <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <label htmlFor="input-tds-salary" className="ux4g-form-label">
              {t.tdsSalaryLabel}
            </label>
            <CurrencyInput id="input-tds-salary" value={taxPayments.tdsOnSalary} onChange={(val) => updateTaxPayments({ tdsOnSalary: val })} />
          </div>

          {/* TDS on Other Income */}
          <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <label htmlFor="input-tds-other" className="ux4g-form-label">
              {t.tdsOtherLabel}
            </label>
            <CurrencyInput id="input-tds-other" value={taxPayments.tdsOnOtherIncome} onChange={(val) => updateTaxPayments({ tdsOnOtherIncome: val })} />
          </div>

          {/* TCS Credit */}
          <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <label htmlFor="input-tcs" className="ux4g-form-label">
              {t.tcsLabel}
            </label>
            <CurrencyInput id="input-tcs" value={taxPayments.tcsCredit} onChange={(val) => updateTaxPayments({ tcsCredit: val })} />
          </div>

          {/* Advance Tax Paid */}
          <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <label htmlFor="input-advance-tax" className="ux4g-form-label">
              {t.advanceTaxLabel}
            </label>
            <CurrencyInput id="input-advance-tax" value={taxPayments.advanceTaxPaid} onChange={(val) => updateTaxPayments({ advanceTaxPaid: val })} />
          </div>

          {/* Self-Assessment Tax Paid */}
          <div className="space-y-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <label htmlFor="input-self-assessment-tax" className="ux4g-form-label">
              {t.selfAssessmentLabel}
            </label>
            <CurrencyInput id="input-self-assessment-tax" value={taxPayments.selfAssessmentTaxPaid} onChange={(val) => updateTaxPayments({ selfAssessmentTaxPaid: val })} />
          </div>
        </div>
      </div>

      {/* 3. Challan Details */}
      <div className="ux4g-card p-4 bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900">
            {t.challanLedgerTitle}
          </h4>
          <button
            id="btn-add-challan"
            type="button"
            onClick={addChallan}
            className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addChallanBtn}</span>
          </button>
        </div>

        {taxChallansList.length > 0 && (
          <div className="space-y-2">
            {taxChallansList.map((ch) => (
              <div key={ch.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 items-center text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block">{t.bsrCodeLabel}</label>
                  <input
                    type="text"
                    value={ch.bsrCode}
                    onChange={(e) => updateChallanItem(ch.id, { bsrCode: e.target.value })}
                    className="ux4g-input text-xs py-1"
                    placeholder="7 digits"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">{t.challanDateLabel}</label>
                  <input
                    type="date"
                    value={ch.challanDate}
                    onChange={(e) => updateChallanItem(ch.id, { challanDate: e.target.value })}
                    className="ux4g-input text-xs py-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">{t.challanNoLabel}</label>
                  <input
                    type="text"
                    value={ch.challanNumber}
                    onChange={(e) => updateChallanItem(ch.id, { challanNumber: e.target.value })}
                    className="ux4g-input text-xs py-1"
                    placeholder="5 digits"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">{t.amountLabel}</label>
                  <input
                    type="number"
                    value={ch.amount}
                    onChange={(e) => updateChallanItem(ch.id, { amount: Number(e.target.value) || 0 })}
                    className="ux4g-input text-xs py-1 font-semibold"
                  />
                </div>
                <div className="flex justify-end pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => removeChallan(ch.id)}
                    className="text-rose-600 hover:text-rose-800 p-1 font-semibold flex items-center gap-1 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.deleteAction}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <button
          id="btn-taxes-prev"
          type="button"
          onClick={onPrev}
          className="ux4g-btn ux4g-btn-md ux4g-btn-outline-neutral w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.prevStep}</span>
        </button>

        <button
          id="btn-taxes-next"
          type="button"
          onClick={onNext}
          className="ux4g-btn ux4g-btn-md ux4g-btn-primary w-full sm:w-auto"
        >
          <span>{t.nextStep}: {t.step6Short}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
