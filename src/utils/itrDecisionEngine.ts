import { TaxpayerProfile, TaxpayerSituation, ITRFormDecision, ITRFormType } from '../types';

export function determineITRForm(situation: TaxpayerSituation, profile: TaxpayerProfile): ITRFormDecision {
  const isResident = profile.residentialStatus === 'Resident';
  const hasCapitalGains = situation.hasCapitalGains;
  const hasBusiness = situation.hasBusinessIncome;
  const isPresumptive = situation.isPresumptiveBusiness || situation.isPresumptiveProfessional;
  const hasRegularBooks = situation.hasRegularBooksOfAccounts;
  const hasForeignAssets = situation.hasForeignAssetsOrIncome;
  const isDirectorOrUnlisted = situation.isDirectorOrUnlistedShares;
  const isAgriOver5k = situation.hasAgriculturalIncome && situation.agriculturalIncomeAmount > 5000;
  const hasMultipleProperties = situation.housePropertyCount === 'multiple';
  const isIncomeOver50L = situation.totalIncomeAbove50Lakhs;
  const hasBroughtForwardLosses = situation.hasBroughtForwardLosses;

  let recommendedForm: ITRFormType = 'ITR-1';
  let plainReason = '';
  const detailedPoints: string[] = [];
  const disqualifiedForms: Array<{ form: ITRFormType; reason: string }> = [];

  // Determine Form
  if (hasBusiness && (hasRegularBooks || (!isPresumptive && hasBusiness))) {
    // Regular business / Profession / F&O trading -> ITR-3
    recommendedForm = 'ITR-3';
    plainReason = 'You reported income from a business or profession with regular accounts or trading activities.';
    detailedPoints.push('ITR-3 is designed for individuals and HUFs having income from proprietary business, profession, or derivative/speculative trading.');
    if (hasCapitalGains) detailedPoints.push('Also includes your investment capital gains.');
    if (hasForeignAssets) detailedPoints.push('Includes foreign assets reporting (Schedule FA).');
  } else if (hasBusiness && isPresumptive) {
    // Presumptive taxation -> ITR-4 (unless foreign assets, capital gains, or directorship present)
    if (hasForeignAssets || hasCapitalGains || isDirectorOrUnlisted || isAgriOver5k || isIncomeOver50L || !isResident) {
      recommendedForm = 'ITR-3';
      plainReason = 'You have presumptive business income, but also have special items (like capital gains, foreign assets, or high income) that require ITR-3.';
      detailedPoints.push('While you qualify for presumptive taxation, having capital gains or foreign assets necessitates filing ITR-3.');
    } else {
      recommendedForm = 'ITR-4';
      plainReason = 'You are using simplified presumptive taxation (Section 44AD for business or 44ADA for professionals).';
      detailedPoints.push('ITR-4 (Sugam) is a simplified form for small businesses and professionals declaring income on a presumptive percentage basis without maintaining books.');
    }
  } else if (hasCapitalGains || hasForeignAssets || isDirectorOrUnlisted || isAgriOver5k || hasMultipleProperties || isIncomeOver50L || hasBroughtForwardLosses || !isResident) {
    // Capital gains / Foreign assets / Multiple house properties / NRI / >50L without business -> ITR-2
    recommendedForm = 'ITR-2';
    plainReason = 'You have salary, capital gains, multiple properties, or foreign assets, but no business income.';
    
    if (hasCapitalGains) detailedPoints.push('Capital gains from shares, mutual funds, or property cannot be reported in ITR-1.');
    if (hasForeignAssets) detailedPoints.push('Holding foreign assets/investments requires Schedule FA, available in ITR-2.');
    if (hasMultipleProperties) detailedPoints.push('Owning more than one house property requires ITR-2.');
    if (isIncomeOver50L) detailedPoints.push('Total income exceeding ₹50 Lakhs requires Schedule AL, supported in ITR-2.');
    if (!isResident) detailedPoints.push('Non-Residents (NRIs) are not eligible for ITR-1 and must use ITR-2.');
    if (isAgriOver5k) detailedPoints.push('Agricultural income exceeding ₹5,000 requires ITR-2.');
  } else {
    // Straightforward salary / single house / other sources <= 50L -> ITR-1
    recommendedForm = 'ITR-1';
    plainReason = 'Your income is straightforward (salary/pension, one house property, and bank interest under ₹50 Lakhs).';
    detailedPoints.push('ITR-1 (Sahaj) is the quickest and simplest form for resident individuals with salary, one house property, and interest income.');
  }

  // Compile Disqualifications for transparency
  if (recommendedForm !== 'ITR-1') {
    const reasons: string[] = [];
    if (hasCapitalGains) reasons.push('Capital gains are present');
    if (hasBusiness) reasons.push('Business or professional income is present');
    if (hasForeignAssets) reasons.push('Foreign assets or foreign income exist');
    if (hasMultipleProperties) reasons.push('Multiple house properties are owned');
    if (isIncomeOver50L) reasons.push('Total income exceeds ₹50 Lakhs');
    if (!isResident) reasons.push('Residential status is Non-Resident (NRI)');
    if (isDirectorOrUnlisted) reasons.push('Director in a company or holds unlisted shares');
    if (isAgriOver5k) reasons.push('Agricultural income is above ₹5,000');

    disqualifiedForms.push({
      form: 'ITR-1',
      reason: `ITR-1 cannot be used because: ${reasons.join(', ')}.`,
    });
  }

  if (recommendedForm !== 'ITR-4' && (hasBusiness || hasCapitalGains)) {
    if (hasCapitalGains && !hasBusiness) {
      disqualifiedForms.push({
        form: 'ITR-4',
        reason: 'ITR-4 cannot be used to report capital gains from shares, mutual funds, or property.',
      });
    }
  }

  // Applicable schedules
  const applicableSchedules: ITRFormDecision['applicableSchedules'] = [];

  if (situation.hasSalaryIncome || situation.hasPensionIncome) {
    applicableSchedules.push({
      code: 'Schedule S',
      name: 'Salary & Allowances',
      description: 'Breakdown of salary from employers, exempt allowances, standard deduction',
      citizenCategory: 'Salary Income',
    });
  }

  if (situation.hasHouseProperty) {
    applicableSchedules.push({
      code: 'Schedule HP',
      name: 'House Property Income',
      description: 'Rental income, municipal tax, 30% statutory deduction, home loan interest',
      citizenCategory: 'House / Property',
    });
  }

  if (situation.hasCapitalGains) {
    applicableSchedules.push({
      code: 'Schedule CG',
      name: 'Capital Gains',
      description: 'Short-term and long-term gains from stocks, equity funds, real estate, gold',
      citizenCategory: 'Investments & Gains',
    });
  }

  if (situation.hasBusinessIncome) {
    if (isPresumptive) {
      applicableSchedules.push({
        code: 'Schedule 44AD / 44ADA',
        name: 'Presumptive Business & Profession',
        description: 'Gross receipts/turnover and deemed presumptive net taxable profit',
        citizenCategory: 'Presumptive Business',
      });
    } else {
      applicableSchedules.push({
        code: 'Schedule BP',
        name: 'Business & Professional Income',
        description: 'P&L accounts, balance sheet summary, depreciation, allowable business deductions',
        citizenCategory: 'Business & Profession',
      });
    }
  }

  if (situation.hasOtherSources) {
    applicableSchedules.push({
      code: 'Schedule OS',
      name: 'Income from Other Sources',
      description: 'Savings bank interest, FD interest, dividends, family pension, gifts',
      citizenCategory: 'Other Income',
    });
  }

  if (situation.hasForeignAssetsOrIncome) {
    applicableSchedules.push({
      code: 'Schedule FA',
      name: 'Foreign Assets & Foreign Income',
      description: 'Foreign stocks (RSUs/ESPPs), foreign bank accounts, overseas income',
      citizenCategory: 'Foreign Assets',
    });
  }

  applicableSchedules.push({
    code: 'Schedule VIA',
    name: 'Chapter VI-A Deductions',
    description: 'Deductions under Section 80C, 80D, 80CCD, 80E, 80G, 80TTA/80TTB',
    citizenCategory: 'Tax Deductions',
  });

  applicableSchedules.push({
    code: 'Schedule TDS / TCS',
    name: 'Taxes Deducted & Collected',
    description: 'TDS from Form 16/26AS, TCS on remittances, advance tax & self-assessment challans',
    citizenCategory: 'Tax Credits',
  });

  if (isIncomeOver50L) {
    applicableSchedules.push({
      code: 'Schedule AL',
      name: 'Assets and Liabilities',
      description: 'Disclosure of immovable and movable assets for total income above ₹50 Lakhs',
      citizenCategory: 'High Income Disclosure',
    });
  }

  return {
    recommendedForm,
    confidence: 'High',
    plainReason,
    detailedPoints,
    disqualifiedForms,
    applicableSchedules,
  };
}

export const evaluateITRForm = determineITRForm;
