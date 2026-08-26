export type ITRFormType = 'ITR-1' | 'ITR-2' | 'ITR-3' | 'ITR-4';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu' | 'kn';

export type TextSizeMode = 'normal' | 'large' | 'xlarge';

export interface TaxpayerSituation {
  hasSalaryIncome: boolean;
  hasPensionIncome: boolean;
  hasHouseProperty: boolean;
  housePropertyCount: 'one' | 'multiple' | 'none';
  hasCapitalGains: boolean; // shares, mutual funds, property, gold
  hasBusinessIncome: boolean;
  isPresumptiveBusiness: boolean; // 44AD
  isPresumptiveProfessional: boolean; // 44ADA
  hasRegularBooksOfAccounts: boolean; // regular business/F&O
  hasOtherSources: boolean; // interest, dividends, gifts
  hasForeignAssetsOrIncome: boolean; // foreign stocks, bank accounts, ESOPs
  isDirectorOrUnlistedShares: boolean;
  hasAgriculturalIncome: boolean;
  agriculturalIncomeAmount: number; // >5000 disqualifies ITR-1/4
  totalIncomeAbove50Lakhs: boolean; // Schedule AL required
  hasBroughtForwardLosses: boolean;
}

export interface SalaryDetails {
  grossSalary: number;
  exemptAllowances: number; // HRA, LTA, conveyance
  professionalTax: number;
  standardDeduction: number; // ₹75,000 for New, ₹50,000 for Old
  employerName: string;
  employerType: 'Private' | 'Central Govt' | 'State Govt' | 'PSU' | 'Other';
}

export interface HousePropertyDetails {
  propertyType: 'Self-Occupied' | 'Let-Out' | 'Deemed Let-Out';
  grossRentReceived: number;
  municipalTaxesPaid: number;
  homeLoanInterest: number; // 24(b) deduction up to 2L
  tenantName?: string;
  propertyAddress?: string;
}

export interface CapitalGainItem {
  id: string;
  assetType: 'Equity Shares (Listed)' | 'Equity Mutual Funds' | 'Real Estate' | 'Debt Mutual Funds' | 'Gold / Others' | 'Unlisted Shares';
  gainType: 'STCG' | 'LTCG';
  saleValue: number;
  purchaseCost: number;
  transferExpenses: number;
  purchaseDate?: string;
  saleDate?: string;
  netGain: number;
}

export interface BusinessProfessionDetails {
  type: '44ADA' | '44AD' | 'Regular';
  professionType?: string; // e.g. Software Consultant, Doctor, CA, Freelancer
  businessType?: string; // e.g. Retail trade, Wholesale, Manufacturing
  grossReceiptsOrTurnover: number;
  digitalTurnoverRatio: number; // % of digital receipt (e.g. 95%)
  presumptiveProfitDeclared: number; // min 50% for 44ADA, min 6%/8% for 44AD
  // For regular books:
  totalRevenue?: number;
  totalExpenses?: number;
  netProfit?: number;
  gstNumber?: string;
  cashInHand?: number;
  bankBalance?: number;
  debtors?: number;
  creditors?: number;
}

export interface OtherSourcesDetails {
  savingsBankInterest: number;
  fdInterest: number;
  dividendIncome: number;
  familyPension: number;
  otherIncome: number; // gifts, lottery, etc.
}

export interface ForeignAssetItem {
  id: string;
  country: string;
  assetCategory: 'Shares / RSUs / ESPP' | 'Bank Account' | 'Financial Interest / Entity' | 'Immovable Property';
  institutionName: string;
  estimatedValueINR: number;
  peakValueDuringYearINR: number;
  incomeDerivedINR: number;
}

export interface DeductionsData {
  section80C: number; // EPF, PPF, ELSS, Life Insurance (max 1.5L)
  section80D_Self: number; // Health insurance self & family (max 25k / 50k for senior)
  section80D_Parents: number; // Health insurance parents (max 25k / 50k for senior)
  isParentsSeniorCitizen: boolean;
  section80CCD_1B: number; // Additional NPS (max 50,000)
  section80CCD_2: number; // Employer contribution to NPS (allowed in both regimes)
  section80E: number; // Education loan interest (no upper limit)
  section80G: number; // Donations to charitable funds
  section80TTA: number; // Savings interest (max 10,000 for non-seniors in Old regime)
  section80TTB: number; // Senior citizen deposit interest (max 50,000 in Old regime)
  otherDeductions: number; // 80GG, 80U, 80DDB, etc.
}

export interface TaxChallan {
  id: string;
  bsrCode: string;
  challanDate: string;
  challanNumber: string;
  amount: number;
  type: 'Advance Tax' | 'Self-Assessment Tax';
}

export interface TaxPaymentsData {
  tdsOnSalary: number;
  tdsOnOtherIncome: number;
  tcsCredit: number;
  advanceTaxPaid: number;
  selfAssessmentTaxPaid: number;
  taxChallans: TaxChallan[];
}

export interface TaxpayerProfile {
  name: string;
  pan: string; // synthetic for privacy
  assessmentYear: '2025-26';
  financialYear: '2024-25';
  ageCategory: 'Below 60' | 'Senior Citizen (60-80)' | 'Super Senior Citizen (80+)';
  residentialStatus: 'Resident' | 'Non-Resident (NRI)' | 'Resident but Not Ordinarily Resident (RNOR)';
  filingStatus: 'Individual' | 'HUF';
  contactEmail?: string;
  contactMobile?: string;
}

export interface FullTaxPreparationData {
  profile: TaxpayerProfile;
  situation: TaxpayerSituation;
  selectedRegime: 'NEW' | 'OLD';
  salary: SalaryDetails;
  houseProperty: HousePropertyDetails;
  capitalGains: CapitalGainItem[];
  businessProfession: BusinessProfessionDetails;
  otherSources: OtherSourcesDetails;
  foreignAssets: ForeignAssetItem[];
  deductions: DeductionsData;
  taxPayments: TaxPaymentsData;
}

export interface ITRFormDecision {
  recommendedForm: ITRFormType;
  confidence: 'High' | 'Medium';
  plainReason: string;
  detailedPoints: string[];
  disqualifiedForms: Array<{
    form: ITRFormType;
    reason: string;
  }>;
  applicableSchedules: Array<{
    code: string;
    name: string;
    description: string;
    citizenCategory: string;
  }>;
}

export interface TaxRegimeCalculation {
  regime: 'NEW' | 'OLD';
  grossTotalIncome: number;
  totalDeductions: number;
  totalTaxableIncome: number;
  basicTax: number;
  specialRateTax: number; // STCG 20%, LTCG 12.5%
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number; // 4%
  totalTaxLiability: number;
  totalTdsTcsPaid: number;
  balancePayableOrRefund: number; // positive = payable, negative = refund
  isRefund: boolean;
  slabBreakdown: Array<{
    slab: string;
    rate: string;
    taxableAmountInSlab: number;
    taxAmount: number;
  }>;
}

export interface TaxComparisonResult {
  newRegime: TaxRegimeCalculation;
  oldRegime: TaxRegimeCalculation;
  recommendedRegime: 'NEW' | 'OLD';
  savingsAmount: number;
  explanation: string;
}

export interface ValidationIssue {
  id: string;
  severity: 'missing' | 'review' | 'info';
  category: 'Salary' | 'House Property' | 'Capital Gains' | 'Business' | 'Deductions' | 'TDS/TCS' | 'Foreign Assets' | 'General';
  title: string;
  description: string;
  recommendation: string;
  affectedSchedule?: string;
  actionStep?: string;
}

export interface PreparationReadinessSummary {
  overallStatus: 'Ready' | 'Needs Attention' | 'Incomplete';
  readinessScore: number; // 0-100%
  completedSections: string[];
  reviewNeededSections: string[];
  missingSections: string[];
  issues: ValidationIssue[];
}

export type TaxCalculationSummary = TaxRegimeCalculation;
export type ReadinessAuditResult = PreparationReadinessSummary;

export type TaxDocumentType =
  | 'FORM_16'
  | 'CAPITAL_GAINS_STATEMENT'
  | 'AIS_TIS'
  | 'FORM_26AS'
  | 'BANK_INTEREST_CERTIFICATE'
  | 'PRESUMPTIVE_RECEIPTS_INVOICES'
  | 'FOREIGN_ASSETS_STATEMENT'
  | 'RENT_OR_HOME_LOAN_PROOF'
  | 'OTHER_TAX_DOCUMENT';

export interface UploadedTaxDocument {
  id: string;
  name: string;
  size: number;
  type: TaxDocumentType;
  fileType: 'pdf' | 'excel' | 'csv' | 'json' | 'image' | 'text';
  uploadDate: string;
  status: 'ready' | 'processing' | 'extracted' | 'error';
  errorMessage?: string;
  extractedSummary?: string;
  confidenceScore?: number;
  extractedFields?: {
    profile?: Partial<TaxpayerProfile>;
    salary?: Partial<SalaryDetails>;
    capitalGains?: CapitalGainItem[];
    businessProfession?: Partial<BusinessProfessionDetails>;
    otherSources?: Partial<OtherSourcesDetails>;
    deductions?: Partial<DeductionsData>;
    taxPayments?: Partial<TaxPaymentsData>;
  };
}

export interface DocumentChecklistItem {
  type: TaxDocumentType;
  title: string;
  description: string;
  recommendedFor: ITRFormType[];
  fileTypesAllowed: string[];
  isMandatory: boolean;
  sampleFileName: string;
  iconName: string;
}
