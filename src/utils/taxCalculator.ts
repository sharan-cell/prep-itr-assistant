import { FullTaxPreparationData, TaxRegimeCalculation, TaxComparisonResult } from '../types';

export function calculateTaxUnderRegime(
  data: FullTaxPreparationData,
  regime: 'NEW' | 'OLD'
): TaxRegimeCalculation {
  const isNew = regime === 'NEW';
  const isSenior = data.profile.ageCategory === 'Senior Citizen (60-80)';
  const isSuperSenior = data.profile.ageCategory === 'Super Senior Citizen (80+)';

  // 1. Income from Salary
  let netSalary = 0;
  if (data.situation.hasSalaryIncome || data.situation.hasPensionIncome) {
    const gross = data.salary.grossSalary || 0;
    // Exempt allowances (HRA, LTA etc.) allowed mostly in Old Regime
    const exemptAllowances = isNew ? 0 : (data.salary.exemptAllowances || 0);
    const profTax = isNew ? 0 : (data.salary.professionalTax || 0);
    // Standard deduction: ₹75,000 for New Regime, ₹50,000 for Old Regime in FY 24-25
    const stdDeduction = isNew ? 75000 : 50000;
    netSalary = Math.max(0, gross - exemptAllowances - profTax - stdDeduction);
  }

  // 2. Income from House Property
  let netHouseProperty = 0;
  if (data.situation.hasHouseProperty) {
    const hp = data.houseProperty;
    if (hp.propertyType === 'Self-Occupied') {
      const interest = hp.homeLoanInterest || 0;
      if (isNew) {
        // In New Regime, loss from self-occupied property cannot be set off against other income
        netHouseProperty = 0;
      } else {
        // Old regime allows up to ₹2,00,000 deduction on home loan interest
        netHouseProperty = -Math.min(interest, 200000);
      }
    } else {
      // Let-out property
      const grossRent = hp.grossRentReceived || 0;
      const muniTax = hp.municipalTaxesPaid || 0;
      const netAnnualValue = Math.max(0, grossRent - muniTax);
      const standard30Percent = netAnnualValue * 0.3;
      const interest = hp.homeLoanInterest || 0;
      netHouseProperty = netAnnualValue - standard30Percent - interest;
    }
  }

  // 3. Capital Gains Breakdown
  let normalCapitalGains = 0;
  let stcgEquity111A = 0;
  let ltcgEquity112A = 0;

  if (data.situation.hasCapitalGains && data.capitalGains?.length > 0) {
    data.capitalGains.forEach((cg) => {
      const netGain = Math.max(0, (cg.saleValue || 0) - (cg.purchaseCost || 0) - (cg.transferExpenses || 0));
      if (cg.assetType === 'Equity Shares (Listed)' || cg.assetType === 'Equity Mutual Funds') {
        if (cg.gainType === 'STCG') {
          stcgEquity111A += netGain;
        } else {
          ltcgEquity112A += netGain;
        }
      } else {
        normalCapitalGains += netGain;
      }
    });
  }

  // 4. Business & Profession
  let netBusinessProfit = 0;
  if (data.situation.hasBusinessIncome) {
    const bp = data.businessProfession;
    if (bp.type === '44ADA') {
      // Professional presumptive: at least 50% of receipts
      netBusinessProfit = bp.presumptiveProfitDeclared || (bp.grossReceiptsOrTurnover * 0.5);
    } else if (bp.type === '44AD') {
      // Business presumptive: 6% for digital, 8% for cash
      netBusinessProfit = bp.presumptiveProfitDeclared || (bp.grossReceiptsOrTurnover * 0.06);
    } else {
      // Regular books
      const rev = bp.totalRevenue || bp.grossReceiptsOrTurnover || 0;
      const exp = bp.totalExpenses || 0;
      netBusinessProfit = Math.max(0, rev - exp);
    }
  }

  // 5. Income from Other Sources
  let netOtherSources = 0;
  if (data.situation.hasOtherSources) {
    const os = data.otherSources;
    const savings = os.savingsBankInterest || 0;
    const fd = os.fdInterest || 0;
    const div = os.dividendIncome || 0;
    const other = os.otherIncome || 0;
    const pension = os.familyPension || 0;
    // Family pension deduction: 1/3rd or ₹25k in New, ₹15k in Old
    const famPensionDed = isNew ? Math.min(pension / 3, 25000) : Math.min(pension / 3, 15000);
    const netPension = Math.max(0, pension - famPensionDed);

    netOtherSources = savings + fd + div + other + netPension;
  }

  // Normal taxable income before chapter VI-A deductions
  const normalIncomeBeforeDeductions = Math.max(
    0,
    netSalary + netHouseProperty + normalCapitalGains + netBusinessProfit + netOtherSources
  );

  // 6. Chapter VI-A Deductions
  let totalDeductions = 0;
  if (isNew) {
    // New regime only allows 80CCD(2) (employer contribution to NPS)
    totalDeductions = data.deductions.section80CCD_2 || 0;
  } else {
    // Old regime allows comprehensive deductions
    const d = data.deductions;
    const sec80C = Math.min(d.section80C || 0, 150000);
    
    const selfHealthLimit = isSenior ? 50000 : 25000;
    const parentsHealthLimit = d.isParentsSeniorCitizen ? 50000 : 25000;
    const sec80D = Math.min(d.section80D_Self || 0, selfHealthLimit) + Math.min(d.section80D_Parents || 0, parentsHealthLimit);

    const sec80CCD1B = Math.min(d.section80CCD_1B || 0, 50000);
    const sec80CCD2 = d.section80CCD_2 || 0;
    const sec80E = d.section80E || 0;
    const sec80G = d.section80G || 0;

    let sec80TTA_TTB = 0;
    if (isSenior) {
      sec80TTA_TTB = Math.min((data.otherSources.savingsBankInterest || 0) + (data.otherSources.fdInterest || 0), 50000);
    } else {
      sec80TTA_TTB = Math.min(data.otherSources.savingsBankInterest || 0, 10000);
    }

    const otherDed = d.otherDeductions || 0;
    totalDeductions = sec80C + sec80D + sec80CCD1B + sec80CCD2 + sec80E + sec80G + sec80TTA_TTB + otherDed;
  }

  // Ensure deductions do not exceed normal income
  totalDeductions = Math.min(totalDeductions, normalIncomeBeforeDeductions);

  const taxableNormalIncome = Math.max(0, normalIncomeBeforeDeductions - totalDeductions);
  const grossTotalIncome = normalIncomeBeforeDeductions + stcgEquity111A + ltcgEquity112A;
  const totalTaxableIncome = taxableNormalIncome + stcgEquity111A + ltcgEquity112A;

  // 7. Calculate Basic Slab Tax on Normal Income
  let basicTax = 0;
  const slabBreakdown: TaxRegimeCalculation['slabBreakdown'] = [];

  if (isNew) {
    // New Tax Regime Slabs (FY 2024-25 / AY 2025-26)
    const slabs = [
      { min: 0, max: 300000, rate: 0, label: '₹ 0 - ₹ 3,00,000 (0%)' },
      { min: 300000, max: 700000, rate: 0.05, label: '₹ 3,00,001 - ₹ 7,00,000 (5%)' },
      { min: 700000, max: 1000000, rate: 0.10, label: '₹ 7,00,001 - ₹ 10,00,000 (10%)' },
      { min: 1000000, max: 1200000, rate: 0.15, label: '₹ 10,00,001 - ₹ 12,00,000 (15%)' },
      { min: 1200000, max: 1500000, rate: 0.20, label: '₹ 12,00,001 - ₹ 15,00,000 (20%)' },
      { min: 1500000, max: Infinity, rate: 0.30, label: 'Above ₹ 15,00,000 (30%)' },
    ];

    slabs.forEach((s) => {
      if (taxableNormalIncome > s.min) {
        const amountInSlab = Math.min(taxableNormalIncome, s.max) - s.min;
        const taxForSlab = amountInSlab * s.rate;
        basicTax += taxForSlab;
        slabBreakdown.push({
          slab: s.label,
          rate: `${s.rate * 100}%`,
          taxableAmountInSlab: amountInSlab,
          taxAmount: taxForSlab,
        });
      }
    });
  } else {
    // Old Tax Regime Slabs
    let slab0Limit = 250000;
    if (isSuperSenior) slab0Limit = 500000;
    else if (isSenior) slab0Limit = 300000;

    const slabs = [
      { min: 0, max: slab0Limit, rate: 0, label: `₹ 0 - ₹ ${slab0Limit.toLocaleString('en-IN')} (0%)` },
      { min: slab0Limit, max: 500000, rate: 0.05, label: `₹ ${slab0Limit.toLocaleString('en-IN')} - ₹ 5,00,000 (5%)` },
      { min: 500000, max: 1000000, rate: 0.20, label: '₹ 5,00,001 - ₹ 10,00,000 (20%)' },
      { min: 1000000, max: Infinity, rate: 0.30, label: 'Above ₹ 10,00,000 (30%)' },
    ];

    slabs.forEach((s) => {
      if (taxableNormalIncome > s.min) {
        const amountInSlab = Math.min(taxableNormalIncome, s.max) - s.min;
        const taxForSlab = amountInSlab * s.rate;
        basicTax += taxForSlab;
        slabBreakdown.push({
          slab: s.label,
          rate: `${s.rate * 100}%`,
          taxableAmountInSlab: amountInSlab,
          taxAmount: taxForSlab,
        });
      }
    });
  }

  // 8. Special Rate Tax on Capital Gains
  // STCG 111A: 20% post Budget 2024
  const stcgTax = stcgEquity111A * 0.20;
  // LTCG 112A: 12.5% on gains exceeding ₹1.25 Lakhs
  const taxableLtcg = Math.max(0, ltcgEquity112A - 125000);
  const ltcgTax = taxableLtcg * 0.125;
  const specialRateTax = stcgTax + ltcgTax;

  if (stcgTax > 0) {
    slabBreakdown.push({
      slab: 'Short-Term Capital Gains u/s 111A (20%)',
      rate: '20%',
      taxableAmountInSlab: stcgEquity111A,
      taxAmount: stcgTax,
    });
  }
  if (ltcgTax > 0) {
    slabBreakdown.push({
      slab: 'Long-Term Capital Gains u/s 112A (>₹1.25L @ 12.5%)',
      rate: '12.5%',
      taxableAmountInSlab: taxableLtcg,
      taxAmount: ltcgTax,
    });
  }

  // 9. Rebate under Section 87A
  let rebate87A = 0;
  if (isNew) {
    // New regime rebate: if total taxable income <= ₹7,00,000, full rebate on basic tax (up to ₹25,000)
    if (totalTaxableIncome <= 700000) {
      rebate87A = basicTax;
    } else if (totalTaxableIncome > 700000 && totalTaxableIncome <= 727770) {
      // Marginal relief in New Regime
      const excessIncome = totalTaxableIncome - 700000;
      if (basicTax > excessIncome) {
        rebate87A = basicTax - excessIncome;
      }
    }
  } else {
    // Old regime rebate: if total taxable income <= ₹5,00,000, rebate up to ₹12,500
    if (totalTaxableIncome <= 500000) {
      rebate87A = Math.min(basicTax, 12500);
    }
  }

  const taxAfterRebate = Math.max(0, basicTax - rebate87A) + specialRateTax;

  // 10. Surcharge
  let surcharge = 0;
  if (totalTaxableIncome > 5000000 && totalTaxableIncome <= 10000000) {
    surcharge = taxAfterRebate * 0.10;
  } else if (totalTaxableIncome > 10000000 && totalTaxableIncome <= 20000000) {
    surcharge = taxAfterRebate * 0.15;
  } else if (totalTaxableIncome > 20000000) {
    surcharge = taxAfterRebate * (isNew ? 0.25 : 0.25);
  }

  // 11. Health & Education Cess @ 4%
  const cess = (taxAfterRebate + surcharge) * 0.04;
  const totalTaxLiability = Math.round(taxAfterRebate + surcharge + cess);

  // 12. Taxes Already Paid (TDS, TCS, Advance Tax)
  const tp = data.taxPayments;
  const totalTdsTcsPaid = Math.round(
    (tp.tdsOnSalary || 0) +
    (tp.tdsOnOtherIncome || 0) +
    (tp.tcsCredit || 0) +
    (tp.advanceTaxPaid || 0) +
    (tp.selfAssessmentTaxPaid || 0)
  );

  const balancePayableOrRefund = totalTaxLiability - totalTdsTcsPaid;
  const isRefund = balancePayableOrRefund < 0;

  return {
    regime,
    grossTotalIncome: Math.round(grossTotalIncome),
    totalDeductions: Math.round(totalDeductions),
    totalTaxableIncome: Math.round(totalTaxableIncome),
    basicTax: Math.round(basicTax),
    specialRateTax: Math.round(specialRateTax),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTaxLiability,
    totalTdsTcsPaid,
    balancePayableOrRefund,
    isRefund,
    slabBreakdown,
  };
}

export function compareTaxRegimes(data: FullTaxPreparationData): TaxComparisonResult {
  const newRegime = calculateTaxUnderRegime(data, 'NEW');
  const oldRegime = calculateTaxUnderRegime(data, 'OLD');

  const diff = oldRegime.totalTaxLiability - newRegime.totalTaxLiability;
  const recommendedRegime = diff >= 0 ? 'NEW' : 'OLD';
  const savingsAmount = Math.abs(diff);

  let explanation = '';
  if (recommendedRegime === 'NEW') {
    explanation = `The New Tax Regime results in ${savingsAmount > 0 ? `₹ ${savingsAmount.toLocaleString('en-IN')} lower tax` : 'identical tax'}. It offers lower slab rates and a standard deduction of ₹ 75,000 without requiring proofs for 80C or medical insurance.`;
  } else {
    explanation = `The Old Tax Regime saves you ₹ ${savingsAmount.toLocaleString('en-IN')} because your total eligible deductions under Section 80C, 80D, and Home Loan interest are substantial enough to offset the lower slab rates of the New Regime.`;
  }

  return {
    newRegime,
    oldRegime,
    recommendedRegime,
    savingsAmount,
    explanation,
  };
}
