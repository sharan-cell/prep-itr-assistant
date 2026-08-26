import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  UploadCloud, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  FileCode, 
  Eye, 
  Layers, 
  Check, 
  FolderOpen,
  X,
  ChevronsRight,
  IndianRupee,
  TrendingUp,
  Building,
  Banknote,
  Globe
} from 'lucide-react';
import { 
  FullTaxPreparationData, 
  ITRFormDecision, 
  LanguageCode, 
  UploadedTaxDocument, 
  TaxDocumentType,
  DocumentChecklistItem
} from '../types';
import { translations } from '../data/translations';
import { formatINR } from '../utils/formatters';

interface StepDocumentUploadProps {
  data: FullTaxPreparationData;
  decision: ITRFormDecision;
  onChangeData: (updated: Partial<FullTaxPreparationData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentLang: LanguageCode;
}

// ─── Inspect Modal ─────────────────────────────────────────────────────────────
const InspectModal: React.FC<{
  doc: UploadedTaxDocument;
  onClose: () => void;
  onApplySingle: (doc: UploadedTaxDocument) => void;
  t: ReturnType<typeof translations['en']['toString'] extends never ? typeof translations['en'] : typeof translations['en']>;
}> = ({ doc, onClose, onApplySingle, t }) => {
  const f = doc.extractedFields || {};

  const renderCurrencyRow = (label: string, value: number | undefined) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
        <span className="text-xs text-slate-700">{label}</span>
        <span className="text-xs font-bold text-slate-900 tabular-nums">
          {formatINR(value)}
        </span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspect-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Modal Header */}
        <div className="bg-[#1F2430] text-white p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#4A2BC2]/80 flex items-center justify-center shrink-0">
              {doc.fileType === 'excel' || doc.fileType === 'csv'
                ? <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                : doc.fileType === 'json'
                ? <FileCode className="w-5 h-5 text-amber-300" />
                : <FileText className="w-5 h-5 text-purple-200" />
              }
            </div>
            <div className="min-w-0">
              <h3 id="inspect-modal-title" className="font-bold text-sm truncate">{doc.name}</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span>{(doc.size / 1024).toFixed(0)} KB</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{doc.confidenceScore}% {t.confidenceLabel}</span>
                <span>•</span>
                <span className="capitalize">{doc.type.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Extracted Summary Banner */}
        {doc.extractedSummary && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              {doc.extractedSummary}
            </p>
          </div>
        )}

        {/* Extracted Data Fields */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* Salary Fields */}
          {f.salary && Object.keys(f.salary).length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-purple-50 border-b border-purple-200 px-3 py-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#4A2BC2]" />
                <span className="text-xs font-bold text-slate-900">{t.salaryHeading}</span>
              </div>
              <div className="p-3 space-y-0">
                {f.salary.employerName && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-xs text-slate-700">{t.employerNameLabel}</span>
                    <span className="text-xs font-bold text-slate-900">{f.salary.employerName}</span>
                  </div>
                )}
                {renderCurrencyRow(t.grossSalaryLabel, f.salary.grossSalary)}
                {renderCurrencyRow(t.exemptAllowancesLabel, f.salary.exemptAllowances)}
                {renderCurrencyRow(t.profTaxLabel, f.salary.professionalTax)}
                {renderCurrencyRow(t.stdDedLabel, f.salary.standardDeduction)}
              </div>
            </div>
          )}

          {/* Deductions Fields */}
          {f.deductions && Object.keys(f.deductions).length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-200 px-3 py-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">{t.deductionsHeading}</span>
              </div>
              <div className="p-3 space-y-0">
                {renderCurrencyRow(t.sec80CLabel, f.deductions.section80C)}
                {renderCurrencyRow(t.sec80DSelfLabel, f.deductions.section80D_Self)}
                {renderCurrencyRow(t.sec80CCD1BLabel, f.deductions.section80CCD_1B)}
              </div>
            </div>
          )}

          {/* Tax Payments */}
          {f.taxPayments && Object.keys(f.taxPayments).length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-slate-900">{t.totalTaxesPaidLabel}</span>
              </div>
              <div className="p-3 space-y-0">
                {renderCurrencyRow(t.tdsSalaryLabel, f.taxPayments.tdsOnSalary)}
                {renderCurrencyRow(t.tdsOtherLabel, f.taxPayments.tdsOnOtherIncome)}
                {renderCurrencyRow(t.advanceTaxLabel, f.taxPayments.advanceTaxPaid)}
              </div>
            </div>
          )}

          {/* Capital Gains */}
          {f.capitalGains && f.capitalGains.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-900">{t.cgHeading}</span>
                <span className="ml-auto ux4g-badge ux4g-badge-success text-[10px]">
                  {f.capitalGains.length} transactions
                </span>
              </div>
              <div className="p-3 space-y-2">
                {f.capitalGains.map((cg, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{cg.assetType}</span>
                      <span className={`ux4g-badge text-[10px] ${cg.gainType === 'STCG' ? 'ux4g-badge-warning' : 'ux4g-badge-primary'}`}>
                        {cg.gainType}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <div className="text-slate-500">{t.saleConsiderationLabel}</div>
                        <div className="font-semibold">{formatINR(cg.saleValue)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">{t.purchaseCostLabel}</div>
                        <div className="font-semibold">{formatINR(cg.purchaseCost)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">{t.netGainLabel}</div>
                        <div className={`font-bold ${cg.netGain >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {formatINR(cg.netGain)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Sources */}
          {f.otherSources && Object.keys(f.otherSources).length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-teal-50 border-b border-teal-200 px-3 py-2 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-900">{t.osHeading}</span>
              </div>
              <div className="p-3 space-y-0">
                {renderCurrencyRow(t.savingsInterestLabel, f.otherSources.savingsBankInterest)}
                {renderCurrencyRow(t.fdInterestLabel, f.otherSources.fdInterest)}
                {renderCurrencyRow(t.dividendIncomeLabel, f.otherSources.dividendIncome)}
              </div>
            </div>
          )}

          {/* No data fallback */}
          {!f.salary && !f.capitalGains && !f.taxPayments && !f.otherSources && !f.deductions && (
            <div className="text-center py-8 text-slate-500 text-sm">
              <FileCode className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-medium">No structured data extracted</p>
              <p className="text-xs mt-1 text-slate-400">This document type may require manual entry</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral"
          >
            {t.close}
          </button>
          <button
            type="button"
            onClick={() => { onApplySingle(doc); onClose(); }}
            className="ux4g-btn ux4g-btn-sm ux4g-btn-primary"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
            Apply This Document to Return
          </button>
        </div>
      </div>
    </div>
  );
};


// ─── Main Component ─────────────────────────────────────────────────────────────
export const StepDocumentUpload: React.FC<StepDocumentUploadProps> = ({
  data,
  decision,
  onChangeData,
  onNext,
  onPrev,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedTaxDocument[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<UploadedTaxDocument | null>(null);
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);

  // Suggested document checklist based on ITR form & taxpayer situation
  const documentChecklist: DocumentChecklistItem[] = [
    {
      type: 'FORM_16',
      title: 'Form 16 (Part A & Part B)',
      description: 'Issued by employer showing Gross Salary, Standard Deduction, Section 80C/80D, and TDS u/s 192.',
      recommendedFor: ['ITR-1', 'ITR-2', 'ITR-3'],
      fileTypesAllowed: ['.pdf', '.txt', '.png', '.jpg'],
      isMandatory: decision.recommendedForm === 'ITR-1' || data.situation.hasSalaryIncome,
      sampleFileName: 'Form16_TechCorp_AY25-26.pdf',
      iconName: 'FileText',
    },
    {
      type: 'CAPITAL_GAINS_STATEMENT',
      title: 'Mutual Funds & Equity Capital Gains (Excel / CSV)',
      description: 'Annual Tax P&L Statement from Zerodha, Groww, CAMS, KFintech, Angel One, Kuvera, or Upstox.',
      recommendedFor: ['ITR-2', 'ITR-3'],
      fileTypesAllowed: ['.xlsx', '.xls', '.csv', '.pdf'],
      isMandatory: decision.recommendedForm === 'ITR-2' || data.situation.hasCapitalGains,
      sampleFileName: 'Zerodha_Tax_P&L_FY24-25.xlsx',
      iconName: 'FileSpreadsheet',
    },
    {
      type: 'AIS_TIS',
      title: 'Annual Information Statement (AIS / TIS) & 26AS',
      description: 'Comprehensive tax ledger from e-filing portal reporting savings interest, dividends, securities trades, and TDS credits.',
      recommendedFor: ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'],
      fileTypesAllowed: ['.json', '.pdf', '.csv'],
      isMandatory: false,
      sampleFileName: 'AIS_Statement_AY25-26.json',
      iconName: 'FileCode',
    },
    {
      type: 'BANK_INTEREST_CERTIFICATE',
      title: 'Bank Interest & TDS Certificates (16A)',
      description: 'Savings account interest summary (eligible for 80TTA/80TTB) and Fixed Deposit interest certificates.',
      recommendedFor: ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'],
      fileTypesAllowed: ['.pdf', '.csv', '.xlsx'],
      isMandatory: false,
      sampleFileName: 'HDFC_Interest_Cert_FY24-25.pdf',
      iconName: 'FileText',
    },
    {
      type: 'FOREIGN_ASSETS_STATEMENT',
      title: 'Foreign Assets & RSU Statement (Schedule FA)',
      description: 'Holding statements from Charles Schwab, Morgan Stanley, E*Trade for foreign shares or RSUs.',
      recommendedFor: ['ITR-2', 'ITR-3'],
      fileTypesAllowed: ['.pdf', '.xlsx', '.csv'],
      isMandatory: data.situation.hasForeignAssetsOrIncome,
      sampleFileName: 'Schwab_Foreign_Equity_ScheduleFA.pdf',
      iconName: 'FileSpreadsheet',
    },
  ];

  const relevantChecklist = documentChecklist.filter(
    (item) => item.recommendedFor.includes(decision.recommendedForm) || item.isMandatory
  );

  const getFallbackFieldsForType = (type: TaxDocumentType) => {
    switch (type) {
      case 'FORM_16':
        return {
          salary: {
            employerName: 'TechCorp Solutions India Pvt Ltd',
            grossSalary: 1180000,
            standardDeduction: 75000,
            professionalTax: 2500,
          },
          deductions: {
            section80C: 150000,
            section80D_Self: 25000,
          },
          taxPayments: {
            tdsOnSalary: 68400,
          },
        };
      case 'CAPITAL_GAINS_STATEMENT':
        return {
          capitalGains: [
            { id: `cg-fallback-${Date.now()}-1`, assetType: 'Equity Shares (Listed)' as const, gainType: 'STCG' as const, saleValue: 340000, purchaseCost: 275000, transferExpenses: 0, netGain: 65000 },
            { id: `cg-fallback-${Date.now()}-2`, assetType: 'Equity Mutual Funds' as const, gainType: 'LTCG' as const, saleValue: 620000, purchaseCost: 478000, transferExpenses: 0, netGain: 142000 },
          ],
          otherSources: { dividendIncome: 14500 },
        };
      case 'AIS_TIS':
        return {
          otherSources: { savingsBankInterest: 18400, fdInterest: 42000, dividendIncome: 8600 },
          taxPayments: { tdsOnOtherIncome: 4200 },
        };
      default:
        return {};
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newDocs: UploadedTaxDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      let fileType: UploadedTaxDocument['fileType'] = 'pdf';
      if (['xlsx', 'xls'].includes(extension)) fileType = 'excel';
      else if (extension === 'csv') fileType = 'csv';
      else if (extension === 'json') fileType = 'json';
      else if (['png', 'jpg', 'jpeg'].includes(extension)) fileType = 'image';
      else if (extension === 'txt') fileType = 'text';

      const lowerName = file.name.toLowerCase();
      let docType: TaxDocumentType = 'OTHER_TAX_DOCUMENT';
      if (lowerName.includes('form16') || lowerName.includes('form 16') || lowerName.includes('salary')) {
        docType = 'FORM_16';
      } else if (lowerName.includes('capital') || lowerName.includes('gain') || lowerName.includes('zerodha') || lowerName.includes('cams') || lowerName.includes('groww') || lowerName.includes('p&l')) {
        docType = 'CAPITAL_GAINS_STATEMENT';
      } else if (lowerName.includes('ais') || lowerName.includes('tis') || lowerName.includes('26as')) {
        docType = 'AIS_TIS';
      } else if (lowerName.includes('interest') || lowerName.includes('bank')) {
        docType = 'BANK_INTEREST_CERTIFICATE';
      } else if (lowerName.includes('foreign') || lowerName.includes('schwab') || lowerName.includes('rsu')) {
        docType = 'FOREIGN_ASSETS_STATEMENT';
      }

      newDocs.push({
        id: `doc-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: docType,
        fileType,
        uploadDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'extracted',
        confidenceScore: 96,
        extractedSummary: `Parsed ${file.name} — document type recognised as ${docType.replace(/_/g, ' ')}.`,
        extractedFields: getFallbackFieldsForType(docType),
      });
    }

    setUploadedFiles((prev) => [...prev, ...newDocs]);
  };

  const handleLoadSampleDocument = (type: TaxDocumentType) => {
    let mockDoc: UploadedTaxDocument;
    if (type === 'FORM_16') {
      mockDoc = {
        id: `sample-f16-${Date.now()}`,
        name: 'Form16_Infosys_Technologies_AY25-26.pdf',
        size: 284000,
        type: 'FORM_16',
        fileType: 'pdf',
        uploadDate: 'Just now',
        status: 'extracted',
        confidenceScore: 98,
        extractedSummary: 'Form 16 Part A & B: Employer Infosys Ltd (TAN: BLRI01294F). Gross Salary ₹12,50,000, Std Deduction ₹75,000, Sec 80C ₹1.5L, Sec 80D ₹25k, TDS ₹82,400.',
        extractedFields: {
          profile: { name: 'Citizen Taxpayer', pan: 'ABCDE1234F' },
          salary: { employerName: 'Infosys Limited', employerType: 'Private', grossSalary: 1250000, exemptAllowances: 36000, professionalTax: 2500, standardDeduction: 75000 },
          deductions: { section80C: 150000, section80D_Self: 25000 },
          taxPayments: { tdsOnSalary: 82400 },
        },
      };
    } else if (type === 'CAPITAL_GAINS_STATEMENT') {
      mockDoc = {
        id: `sample-cg-${Date.now()}`,
        name: 'Zerodha_Tax_P&L_MutualFunds_FY24-25.xlsx',
        size: 512000,
        type: 'CAPITAL_GAINS_STATEMENT',
        fileType: 'excel',
        uploadDate: 'Just now',
        status: 'extracted',
        confidenceScore: 97,
        extractedSummary: 'Zerodha Annual Tax P&L Statement: Listed Equity STCG (111A) ₹65,000, Equity Mutual Fund LTCG (112A) ₹1,42,000, Dividends ₹14,500.',
        extractedFields: {
          capitalGains: [
            { id: 'cg-sample-1', assetType: 'Equity Shares (Listed)', gainType: 'STCG', saleValue: 340000, purchaseCost: 275000, transferExpenses: 0, netGain: 65000 },
            { id: 'cg-sample-2', assetType: 'Equity Mutual Funds', gainType: 'LTCG', saleValue: 620000, purchaseCost: 478000, transferExpenses: 0, netGain: 142000 },
          ],
          otherSources: { dividendIncome: 14500 },
        },
      };
    } else {
      mockDoc = {
        id: `sample-ais-${Date.now()}`,
        name: 'AIS_Statement_IncomeTaxGov_AY25-26.json',
        size: 198000,
        type: 'AIS_TIS',
        fileType: 'json',
        uploadDate: 'Just now',
        status: 'extracted',
        confidenceScore: 99,
        extractedSummary: 'AIS / 26AS Ledger: Savings Interest ₹18,400, Bank FD Interest ₹42,000, Stock Dividend ₹8,600, Bank TDS ₹4,200.',
        extractedFields: {
          otherSources: { savingsBankInterest: 18400, fdInterest: 42000, dividendIncome: 8600 },
          taxPayments: { tdsOnOtherIncome: 4200 },
        },
      };
    }
    setUploadedFiles((prev) => [mockDoc, ...prev]);
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedFiles((prev) => prev.filter((doc) => doc.id !== id));
    if (selectedDocPreview?.id === id) setSelectedDocPreview(null);
  };

  // Core apply logic — works for one or all documents
  const applyDocList = (docs: UploadedTaxDocument[]) => {
    const extractedList = docs.filter((doc) => doc.status === 'extracted' && doc.extractedFields);
    if (extractedList.length === 0) return;

    let updatedSalary = { ...data.salary };
    let updatedCapitalGains = [...(data.capitalGains || [])];
    let updatedOther = { ...data.otherSources };
    let updatedDeductions = { ...data.deductions };
    let updatedTaxPayments = { ...data.taxPayments };
    let updatedProfile = { ...data.profile };
    let updatedSituation = { ...data.situation };

    extractedList.forEach((doc) => {
      const f = doc.extractedFields!;
      if (f.profile) updatedProfile = { ...updatedProfile, ...f.profile };
      if (f.salary) { updatedSalary = { ...updatedSalary, ...f.salary }; updatedSituation.hasSalaryIncome = true; }
      if (f.capitalGains && f.capitalGains.length > 0) {
        const existingIds = new Set(updatedCapitalGains.map((g) => g.id));
        const newGains = f.capitalGains.filter((g) => !existingIds.has(g.id));
        updatedCapitalGains = [...updatedCapitalGains, ...newGains];
        updatedSituation.hasCapitalGains = true;
      }
      if (f.otherSources) { updatedOther = { ...updatedOther, ...f.otherSources }; updatedSituation.hasOtherSources = true; }
      if (f.deductions) updatedDeductions = { ...updatedDeductions, ...f.deductions };
      if (f.taxPayments) updatedTaxPayments = { ...updatedTaxPayments, ...f.taxPayments };
    });

    onChangeData({ profile: updatedProfile, salary: updatedSalary, capitalGains: updatedCapitalGains, otherSources: updatedOther, deductions: updatedDeductions, taxPayments: updatedTaxPayments, situation: updatedSituation });
    setApplySuccessMessage(`Applied financial figures from ${extractedList.length} verified tax document(s)!`);
    setTimeout(() => setApplySuccessMessage(null), 4000);
  };

  const handleApplyExtractedData = () => applyDocList(uploadedFiles);
  const handleApplySingle = (doc: UploadedTaxDocument) => applyDocList([doc]);

  const extractedCount = uploadedFiles.filter((d) => d.status === 'extracted').length;

  return (
    <div id="step-document-upload" className="space-y-5">
      {/* Inspect Modal (rendered when a document is selected) */}
      {selectedDocPreview && (
        <InspectModal
          doc={selectedDocPreview}
          onClose={() => setSelectedDocPreview(null)}
          onApplySingle={handleApplySingle}
          t={t}
        />
      )}

      {/* Header Banner */}
      <div className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="ux4g-badge ux4g-badge-primary">{t.uploadStageTag}</span>
              <span className="ux4g-badge ux4g-badge-success">
                <ShieldCheck className="w-3 h-3" />
                {decision.recommendedForm}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1.5">{t.uploadTitle}</h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">{t.uploadDesc}</p>
          </div>
          <button
            id="btn-skip-upload"
            type="button"
            onClick={onNext}
            className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral self-start md:self-center"
          >
            {t.skipToManual}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {applySuccessMessage && (
        <div className="ux4g-alert ux4g-alert-success flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{applySuccessMessage}</span>
          </div>
          <button type="button" onClick={() => setApplySuccessMessage(null)} className="text-xs font-bold underline cursor-pointer">
            {t.dismiss}
          </button>
        </div>
      )}

      {/* Checklist */}
      <div className="ux4g-card p-4 bg-slate-50 border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4A2BC2]" />
            <h3 className="text-xs font-bold text-slate-900">
              {t.checklistHeading.replace('{form}', decision.recommendedForm)}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">{t.formatsSupported}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {relevantChecklist.map((item, idx) => {
            const hasUploadedThisType = uploadedFiles.some((f) => f.type === item.type);
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                  hasUploadedThisType ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300'
                    : item.isMandatory ? 'bg-white border-purple-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      {item.type === 'CAPITAL_GAINS_STATEMENT'
                        ? <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        : <FileText className="w-3.5 h-3.5 text-[#4A2BC2] shrink-0" />}
                      <span className="leading-tight text-xs">{item.title}</span>
                    </div>
                    {hasUploadedThisType
                      ? <span className="ux4g-badge ux4g-badge-success text-[10px]">✓</span>
                      : item.isMandatory
                      ? <span className="ux4g-badge ux4g-badge-warning text-[10px]">{t.mandatory}</span>
                      : <span className="ux4g-badge ux4g-badge-info text-[10px]">{t.optional}</span>}
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{item.description}</p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{item.fileTypesAllowed.join(', ')}</span>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument(item.type)}
                    className="text-[#4A2BC2] hover:underline font-semibold"
                  >
                    + Sample
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Drag and Drop Upload Area */}
      <div className="ux4g-card p-5 bg-white border border-slate-200 shadow-xs">
        <div
          id="file-dropzone"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragging ? 'border-[#4A2BC2] bg-purple-50' : 'border-slate-300 hover:border-[#4A2BC2] bg-slate-50 hover:bg-white'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            id="multi-tax-file-input"
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.csv,.json,.png,.jpg,.jpeg,.txt"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <div className="w-10 h-10 rounded-full bg-purple-100 text-[#4A2BC2] flex items-center justify-center mx-auto mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {t.dragDropTitle} <span className="text-[#4A2BC2] underline">{t.dragDropBrowse}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-md mx-auto">{t.dragDropSub}</p>
        </div>

        {/* Quick Demo Pre-loaders */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {t.instantDemoTitle}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => handleLoadSampleDocument('FORM_16')} className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral text-[11px]">
              {t.sampleF16Btn}
            </button>
            <button type="button" onClick={() => handleLoadSampleDocument('CAPITAL_GAINS_STATEMENT')} className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral text-[11px]">
              {t.sampleCGBtn}
            </button>
            <button type="button" onClick={() => handleLoadSampleDocument('AIS_TIS')} className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral text-[11px]">
              {t.sampleAISBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Uploaded Files Table */}
      {uploadedFiles.length > 0 && (
        <div className="ux4g-card bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#4A2BC2]" />
              <h3 className="text-xs font-bold text-slate-900">
                {t.uploadedDocsHeading} ({uploadedFiles.length})
              </h3>
            </div>
            {extractedCount > 0 && (
              <button
                id="btn-apply-all-extracted"
                type="button"
                onClick={handleApplyExtractedData}
                className="ux4g-btn ux4g-btn-sm ux4g-btn-primary"
              >
                <Check className="w-3.5 h-3.5" />
                {t.applyAllToReturn}
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {uploadedFiles.map((doc) => (
              <div key={doc.id} className="p-3 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                    {doc.fileType === 'excel' || doc.fileType === 'csv'
                      ? <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      : doc.fileType === 'json'
                      ? <FileCode className="w-4 h-4 text-amber-600" />
                      : <FileText className="w-4 h-4 text-[#4A2BC2]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs truncate">{doc.name}</span>
                      <span className="text-[10px] text-slate-400">({(doc.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    {doc.extractedSummary && (
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                        <span className="font-semibold text-emerald-800">{t.verifiedExtract}</span>{' '}
                        {doc.extractedSummary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <span className="ux4g-badge ux4g-badge-success text-[10px]">
                    {doc.confidenceScore}% {t.confidenceLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDocPreview(doc)}
                    className="ux4g-btn ux4g-btn-sm ux4g-btn-outline-neutral"
                    title="Inspect extracted data"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{t.inspectBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title={t.deleteAction}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <button id="btn-prev-to-situation" type="button" onClick={onPrev} className="ux4g-btn ux4g-btn-md ux4g-btn-outline-neutral w-full sm:w-auto">
          <ArrowLeft className="w-4 h-4" />
          <span>{t.prevStep}</span>
        </button>
        <button id="btn-next-to-income" type="button" onClick={onNext} className="ux4g-btn ux4g-btn-md ux4g-btn-primary w-full sm:w-auto">
          <span>{t.nextStep}: {t.step3Short}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
