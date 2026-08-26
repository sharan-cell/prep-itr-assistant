import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Printer, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  Layers, 
  RotateCcw,
  BookOpen,
  Edit3
} from 'lucide-react';
import { 
  FullTaxPreparationData, 
  ITRFormDecision, 
  TaxCalculationSummary, 
  ReadinessAuditResult, 
  LanguageCode 
} from '../types';
import { formatINR } from '../utils/formatters';
import { translations } from '../data/translations';

interface StepReadinessSummaryProps {
  data: FullTaxPreparationData;
  decision: ITRFormDecision;
  summary: TaxCalculationSummary;
  readiness: ReadinessAuditResult;
  onPrev: () => void;
  onReset: () => void;
  currentLang: LanguageCode;
  onNavigateToStage?: (stage: number) => void;
}

export const StepReadinessSummary: React.FC<StepReadinessSummaryProps> = ({
  data,
  decision,
  summary,
  readiness,
  onPrev,
  onReset,
  currentLang,
  onNavigateToStage,
}) => {
  const t = translations[currentLang] || translations.en;
  const [showFilingGuide, setShowFilingGuide] = useState(false);

  const totalTaxesPaid = 
    (data.taxPayments?.tdsOnSalary || 0) +
    (data.taxPayments?.tdsOnOtherIncome || 0) +
    (data.taxPayments?.tcsCredit || 0) +
    (data.taxPayments?.advanceTaxPaid || 0) +
    (data.taxPayments?.selfAssessmentTaxPaid || 0);

  const netBalance = (summary?.totalTaxLiability || 0) - totalTaxesPaid;
  const isRefund = netBalance < 0;

  // Safe computation breakdown calculation
  const breakdown = useMemo(() => {
    // 1. Salary Net
    let salaryNet = 0;
    const grossSalary = data.salary?.grossSalary || 0;
    if (data.situation?.hasSalaryIncome || data.situation?.hasPensionIncome) {
      const stdDed = data.selectedRegime === 'NEW' ? 75000 : 50000;
      const exempt = data.selectedRegime === 'NEW' ? 0 : (data.salary?.exemptAllowances || 0);
      const profTax = data.selectedRegime === 'NEW' ? 0 : (data.salary?.professionalTax || 0);
      salaryNet = Math.max(0, grossSalary - exempt - profTax - stdDed);
    }

    // 2. House Property
    let hpIncome = 0;
    if (data.situation?.hasHouseProperty) {
      const hp = data.houseProperty;
      if (hp?.propertyType === 'Self-Occupied') {
        hpIncome = data.selectedRegime === 'NEW' ? 0 : -Math.min(hp.homeLoanInterest || 0, 200000);
      } else {
        const nav = Math.max(0, (hp?.grossRentReceived || 0) - (hp?.municipalTaxesPaid || 0));
        hpIncome = nav * 0.7 - (hp?.homeLoanInterest || 0);
      }
    }

    // 3. Capital Gains
    let stcg = 0;
    let ltcg = 0;
    if (data.situation?.hasCapitalGains && data.capitalGains?.length) {
      data.capitalGains.forEach((cg) => {
        const net = Math.max(0, (cg.saleValue || 0) - (cg.purchaseCost || 0) - (cg.transferExpenses || 0));
        if (cg.gainType === 'STCG') stcg += net;
        else ltcg += net;
      });
    }

    // 4. Business Income
    let businessIncome = 0;
    if (data.situation?.hasBusinessIncome) {
      const bp = data.businessProfession;
      if (bp?.type === '44ADA') {
        businessIncome = bp.presumptiveProfitDeclared || ((bp.grossReceiptsOrTurnover || 0) * 0.5);
      } else if (bp?.type === '44AD') {
        businessIncome = bp.presumptiveProfitDeclared || ((bp.grossReceiptsOrTurnover || 0) * 0.06);
      } else {
        businessIncome = Math.max(0, (bp?.totalRevenue || bp?.grossReceiptsOrTurnover || 0) - (bp?.totalExpenses || 0));
      }
    }

    // 5. Other Sources
    let otherSourcesIncome = 0;
    if (data.situation?.hasOtherSources) {
      const os = data.otherSources;
      otherSourcesIncome = (os?.savingsBankInterest || 0) + (os?.fdInterest || 0) + (os?.dividendIncome || 0) + (os?.otherIncome || 0);
    }

    return {
      grossSalary,
      salaryNet,
      hpIncome,
      stcg,
      ltcg,
      capitalGainsTotal: stcg + ltcg,
      businessIncome,
      otherSourcesIncome,
    };
  }, [data]);

  // Export JSON
  const handleExportJSON = () => {
    const exportPayload = {
      app: 'Citizen TaxPrep Universal ITR Assistant',
      generatedAt: new Date().toISOString(),
      taxpayer: data.profile,
      determinedITR: decision.recommendedForm,
      selectedRegime: data.selectedRegime,
      computation: summary,
      preparationData: data,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaxPrep_${(data.profile?.name || 'Citizen').replace(/\s+/g, '_')}_AY2025-26_${decision.recommendedForm}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print preparation sheet
  const handlePrint = () => {
    window.print();
  };

  // Score and schedules normalization
  const score = readiness?.readinessScore ?? 87;
  const applicableSchedulesList = decision?.applicableSchedules || [];

  // Signature "You May Have Missed" items
  const signatureReviewItems = [
    {
      id: 'review-interest',
      title: t.savingsInterestLabel,
      status: (data.otherSources?.savingsBankInterest || 0) > 0 ? 'Ready' : 'Review',
      stage: 3,
      description: (data.otherSources?.savingsBankInterest || 0) > 0 
        ? `₹${(data.otherSources.savingsBankInterest || 0).toLocaleString('en-IN')}`
        : t.qOSDesc,
    },
    {
      id: 'review-cg',
      title: t.tabCG,
      status: data.situation?.hasCapitalGains ? (data.capitalGains && data.capitalGains.length > 0 ? 'Ready' : 'Missing') : 'Ready',
      stage: 3,
      description: data.situation?.hasCapitalGains 
        ? (data.capitalGains && data.capitalGains.length > 0 
            ? `${data.capitalGains.length} transaction(s)` 
            : t.qCGDesc)
        : t.noCGRecorded,
    },
    {
      id: 'review-foreign',
      title: t.tabFA,
      status: data.situation?.hasForeignAssetsOrIncome ? (data.foreignAssets && data.foreignAssets.length > 0 ? 'Ready' : 'Missing') : 'Ready',
      stage: 3,
      description: data.situation?.hasForeignAssetsOrIncome
        ? (data.foreignAssets && data.foreignAssets.length > 0 
            ? `${data.foreignAssets.length} foreign holding(s)`
            : t.qFADesc)
        : t.optional,
    },
    {
      id: 'review-tds',
      title: t.totalTaxesPaidLabel,
      status: ((data.taxPayments?.tdsOnSalary || 0) + (data.taxPayments?.tdsOnOtherIncome || 0)) > 0 ? 'Ready' : 'Review',
      stage: 5,
      description: `₹${((data.taxPayments?.tdsOnSalary || 0) + (data.taxPayments?.tdsOnOtherIncome || 0)).toLocaleString('en-IN')}`,
    },
    {
      id: 'review-deductions',
      title: t.deductionsHeading,
      status: data.selectedRegime === 'OLD' ? ((data.deductions?.section80C || 0) > 0 ? 'Ready' : 'Review') : 'Ready',
      stage: 4,
      description: data.selectedRegime === 'OLD'
        ? `₹${((data.deductions?.section80C || 0) + (data.deductions?.section80D_Self || 0)).toLocaleString('en-IN')}`
        : t.stdDedLabel,
    },
  ];

  const attentionCount = signatureReviewItems.filter((i) => i.status !== 'Ready').length;

  return (
    <div id="step-readiness-container" className="space-y-5">
      {/* 1. Final Filing Readiness Hero Banner */}
      <div id="readiness-banner" className="ux4g-card p-5 md:p-6 bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="ux4g-badge ux4g-badge-primary">
              {t.prepTitleTag}
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
                {t.readyToPct.replace('{score}', String(score))}
              </h2>
              {attentionCount > 0 ? (
                <span className="ux4g-badge ux4g-badge-warning text-xs">
                  {attentionCount} {t.itemsNeedAttention}
                </span>
              ) : (
                <span className="ux4g-badge ux4g-badge-success text-xs">
                  {t.readyToFile}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {t.prepCompletedDesc.replace('{form}', decision.recommendedForm)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('you-may-have-missed-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-primary"
            >
              {t.reviewOutstanding}
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('tax-computation-sheet');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="ux4g-btn ux4g-btn-sm ux4g-btn-primary"
            >
              {t.viewSummary}
            </button>
          </div>
        </div>
      </div>

      {/* 2. SIGNATURE FEATURE: "Things You May Have Missed" Experience */}
      <div id="you-may-have-missed-section" className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4A2BC2]" />
            <h3 className="text-base font-bold text-slate-900">
              {t.youMayHaveMissedTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            {t.youMayHaveMissedSubtitle}
          </p>
        </div>

        <div className="space-y-2">
          {signatureReviewItems.map((item) => {
            const isReady = item.status === 'Ready';
            const isReview = item.status === 'Review';
            const isMissing = item.status === 'Missing';

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isMissing
                    ? 'bg-rose-50/60 border-rose-300'
                    : isReview
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-0.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    {isMissing ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : isReview ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {item.title}
                    </span>
                    <span className={`ux4g-badge text-[10px] ${
                      isMissing ? 'ux4g-badge-error' : isReview ? 'ux4g-badge-warning' : 'ux4g-badge-success'
                    }`}>
                      {item.status === 'Ready' ? t.statusReady : item.status === 'Review' ? t.statusReview : t.statusMissing}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 pl-6">
                    {item.description}
                  </p>
                </div>

                {onNavigateToStage && (
                  <button
                    type="button"
                    onClick={() => onNavigateToStage(item.stage)}
                    className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral shrink-0 self-end sm:self-center"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.editAction}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Formal Statement of Computation */}
      <div id="tax-computation-sheet" className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="border-b-2 border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {t.computationSheetHeading}
            </h3>
            <div className="text-xs text-slate-600 mt-0.5">
              {t.assessmentYearLabel} | {t.applicableFormLabel} <strong className="text-[#4A2BC2]">{decision.recommendedForm}</strong>
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="font-bold text-slate-900">{data.profile?.name || 'Taxpayer'}</div>
            <div className="text-slate-500">{data.selectedRegime === 'NEW' ? t.newRegimeTitle : t.oldRegimeTitle}</div>
          </div>
        </div>

        {/* Computation Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="ux4g-table">
            <thead>
              <tr>
                <th>{t.computationHeadCol}</th>
                <th className="text-right">{t.amountCol}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="font-semibold text-slate-900">1. {t.salaryHeading}</div>
                  <div className="text-xs text-slate-500">
                    Gross: ₹{breakdown.grossSalary.toLocaleString('en-IN')} | {t.stdDedLabel} -₹{data.selectedRegime === 'NEW' ? '75,000' : '50,000'}
                  </div>
                </td>
                <td className="text-right font-semibold">{formatINR(breakdown.salaryNet)}</td>
              </tr>

              <tr>
                <td>
                  <div className="font-semibold text-slate-900">2. {t.hpHeading}</div>
                </td>
                <td className={`text-right font-semibold ${breakdown.hpIncome < 0 ? 'text-rose-700' : ''}`}>
                  {formatINR(breakdown.hpIncome)}
                </td>
              </tr>

              <tr>
                <td>
                  <div className="font-semibold text-slate-900">3. {t.cgHeading}</div>
                  <div className="text-xs text-slate-500">
                    STCG: ₹{breakdown.stcg.toLocaleString('en-IN')} | LTCG: ₹{breakdown.ltcg.toLocaleString('en-IN')}
                  </div>
                </td>
                <td className="text-right font-semibold">{formatINR(breakdown.capitalGainsTotal)}</td>
              </tr>

              <tr>
                <td>
                  <div className="font-semibold text-slate-900">4. {t.bpHeading}</div>
                </td>
                <td className="text-right font-semibold">{formatINR(breakdown.businessIncome)}</td>
              </tr>

              <tr>
                <td>
                  <div className="font-semibold text-slate-900">5. {t.osHeading}</div>
                </td>
                <td className="text-right font-semibold">{formatINR(breakdown.otherSourcesIncome)}</td>
              </tr>

              <tr className="bg-purple-50/50 font-bold">
                <td>{t.gtiLabel}</td>
                <td className="text-right font-bold text-slate-900">{formatINR(summary?.grossTotalIncome || 0)}</td>
              </tr>

              <tr>
                <td>
                  <div>{t.chapterVIADedLabel}</div>
                </td>
                <td className="text-right text-rose-700 font-semibold">- {formatINR(summary?.totalDeductions || 0)}</td>
              </tr>

              <tr className="bg-slate-100 font-extrabold text-xs sm:text-sm">
                <td>{t.netTaxableIncomeLabel}</td>
                <td className="text-right text-slate-900">{formatINR(summary?.totalTaxableIncome || 0)}</td>
              </tr>

              <tr>
                <td>
                  <div>{t.totalTaxLiabilityLabel}</div>
                </td>
                <td className="text-right font-bold text-slate-900">{formatINR(summary?.totalTaxLiability || 0)}</td>
              </tr>

              <tr>
                <td>
                  <div>{t.totalTaxesPaidLabel}</div>
                </td>
                <td className="text-right text-emerald-700 font-semibold">- {formatINR(totalTaxesPaid)}</td>
              </tr>

              <tr className={`font-black text-sm sm:text-base ${isRefund ? 'bg-emerald-50 text-emerald-950' : netBalance > 0 ? 'bg-amber-50 text-amber-950' : 'bg-slate-50'}`}>
                <td>{isRefund ? t.refundDueTitle : netBalance > 0 ? t.taxPayableTitle : t.nilTaxTitle}</td>
                <td className="text-right">{formatINR(Math.abs(netBalance))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Schedule Checklist */}
      <div className="ux4g-card p-4 bg-white border border-slate-200 shadow-xs space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#4A2BC2]" />
          <span>{t.scheduleChecklistHeading.replace('{form}', decision.recommendedForm)}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {applicableSchedulesList.map((sch) => (
            <div key={sch.code} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{sch.code}</span>
                <span className="ux4g-badge ux4g-badge-primary text-[10px]">
                  {sch.citizenCategory}
                </span>
              </div>
              <div className="font-medium text-slate-700">{sch.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Citizen Action Pack & e-Filing Guidance */}
      <div className="ux4g-card p-5 bg-slate-50 border border-slate-300 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {t.actionPackHeading}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {t.actionPackSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-print-sheet"
              type="button"
              onClick={handlePrint}
              className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printSheetBtn}</span>
            </button>

            <button
              id="btn-export-json"
              type="button"
              onClick={handleExportJSON}
              className="ux4g-btn ux4g-btn-sm ux4g-btn-primary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadJsonBtn}</span>
            </button>

            <button
              id="btn-open-filing-guide"
              type="button"
              onClick={() => setShowFilingGuide(!showFilingGuide)}
              className="ux4g-btn ux4g-btn-sm ux4g-btn-secondary"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.howToFileBtn}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Portal Filing Instructions */}
        {showFilingGuide && (
          <div className="bg-white rounded-xl border border-purple-200 p-4 space-y-2.5 animate-in fade-in duration-100">
            <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2 text-[#4A2BC2]">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.filingGuideTitle}</span>
            </div>

            <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside leading-relaxed">
              <li>{t.guideStep1}</li>
              <li>{t.guideStep2}</li>
              <li>{t.guideStep3}</li>
              <li>{t.guideStep4}</li>
              <li>{t.guideStep5}</li>
              <li>{t.guideStep6}</li>
              <li>{t.guideStep7}</li>
              <li>{t.guideStep8}</li>
            </ol>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <button
          id="btn-readiness-prev"
          type="button"
          onClick={onPrev}
          className="ux4g-btn ux4g-btn-md ux4g-btn-outline-neutral w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.prevStep}</span>
        </button>

        <button
          id="btn-start-fresh"
          type="button"
          onClick={onReset}
          className="ux4g-btn ux4g-btn-md ux4g-btn-outline-neutral w-full sm:w-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.startFresh}</span>
        </button>
      </div>
    </div>
  );
};
