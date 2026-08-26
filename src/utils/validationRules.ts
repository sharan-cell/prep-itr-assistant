import { FullTaxPreparationData, ValidationIssue, PreparationReadinessSummary, ITRFormType } from '../types';

export function validateTaxPreparation(
  data: FullTaxPreparationData,
  recommendedForm: ITRFormType
): PreparationReadinessSummary {
  const issues: ValidationIssue[] = [];
  const completedSections: string[] = [];
  const reviewNeededSections: string[] = [];
  const missingSections: string[] = [];

  // 1. Profile Validation
  if (!data.profile.name || data.profile.name.trim() === '') {
    issues.push({
      id: 'profile-name-missing',
      severity: 'missing',
      category: 'General',
      title: 'Taxpayer Name is missing',
      description: 'Your legal name as per PAN is needed to identify your tax return preparation record.',
      recommendation: 'Enter your full name as appearing on your PAN card.',
      actionStep: 'Update Personal Profile',
    });
  }

  // 2. Salary Section
  if (data.situation.hasSalaryIncome || data.situation.hasPensionIncome) {
    if ((data.salary.grossSalary || 0) <= 0) {
      issues.push({
        id: 'salary-gross-zero',
        severity: 'missing',
        category: 'Salary',
        title: 'Gross Salary amount is missing',
        description: 'You indicated salary/pension income, but the annual gross salary is currently ₹ 0.',
        recommendation: 'Enter the Gross Salary from Part B (Clause 17) of your Form 16.',
        affectedSchedule: 'Schedule S',
        actionStep: 'Complete Salary Details',
      });
      missingSections.push('Salary Income');
    } else {
      if (data.salary.grossSalary > 1000000 && data.taxPayments.tdsOnSalary === 0) {
        issues.push({
          id: 'salary-tds-zero-review',
          severity: 'review',
          category: 'TDS/TCS',
          title: 'Zero TDS on high salary',
          description: 'Your gross salary is above ₹ 10 Lakhs, but TDS from salary is ₹ 0. Usually employers deduct TDS on higher salary brackets.',
          recommendation: 'Cross-check Form 16 (Part A/B) or Form 26AS to confirm if TDS was deducted.',
          affectedSchedule: 'Schedule TDS-1',
        });
        reviewNeededSections.push('Salary Income');
      } else {
        completedSections.push('Salary Income');
      }
    }
  }

  // 3. House Property Section
  if (data.situation.hasHouseProperty) {
    const hp = data.houseProperty;
    if (hp.propertyType === 'Let-Out' && hp.grossRentReceived <= 0) {
      issues.push({
        id: 'hp-rent-zero',
        severity: 'missing',
        category: 'House Property',
        title: 'Rental income value missing for let-out property',
        description: 'You selected a Let-Out house property, but have not entered the annual gross rent received.',
        recommendation: 'Enter the total rent received or receivable during the financial year.',
        affectedSchedule: 'Schedule HP',
      });
      missingSections.push('House Property');
    } else {
      completedSections.push('House Property');
    }
  }

  // 4. Capital Gains Section
  if (data.situation.hasCapitalGains) {
    if (!data.capitalGains || data.capitalGains.length === 0) {
      issues.push({
        id: 'cg-no-items',
        severity: 'missing',
        category: 'Capital Gains',
        title: 'No capital gain transactions added',
        description: 'You selected investment or property sale gains, but no transaction details have been entered.',
        recommendation: 'Add your share, mutual fund, or property sale details from your annual broker Tax P&L statement.',
        affectedSchedule: 'Schedule CG',
      });
      missingSections.push('Capital Gains');
    } else {
      let hasItemIssue = false;
      data.capitalGains.forEach((item, idx) => {
        if (item.saleValue <= 0) {
          issues.push({
            id: `cg-sale-zero-${idx}`,
            severity: 'missing',
            category: 'Capital Gains',
            title: `Sale value is zero for ${item.assetType}`,
            description: 'The sale consideration amount must be greater than zero.',
            recommendation: 'Check your broker capital gains statement for total sale proceeds.',
            affectedSchedule: 'Schedule CG',
          });
          hasItemIssue = true;
        }
        if (item.purchaseCost > item.saleValue) {
          issues.push({
            id: `cg-loss-info-${idx}`,
            severity: 'info',
            category: 'Capital Gains',
            title: `Capital loss recorded for ${item.assetType}`,
            description: `Purchase cost (₹${item.purchaseCost.toLocaleString('en-IN')}) exceeds sale value (₹${item.saleValue.toLocaleString('en-IN')}). This creates a capital loss.`,
            recommendation: 'Capital losses can be set off against other capital gains and carried forward for up to 8 assessment years in ITR-2 / ITR-3.',
            affectedSchedule: 'Schedule CFL',
          });
        }
      });

      if (hasItemIssue) {
        missingSections.push('Capital Gains');
      } else {
        completedSections.push('Capital Gains');
      }
    }
  }

  // 5. Business / Profession Section
  if (data.situation.hasBusinessIncome) {
    const bp = data.businessProfession;
    if (bp.type === '44ADA') {
      if (bp.grossReceiptsOrTurnover <= 0) {
        issues.push({
          id: 'bp-44ada-gross-zero',
          severity: 'missing',
          category: 'Business',
          title: 'Gross Professional Receipts missing',
          description: 'Section 44ADA requires gross receipts from professional services (consulting, medical, legal, engineering, etc.).',
          recommendation: 'Enter total gross receipts received during the financial year.',
          affectedSchedule: 'Schedule 44ADA',
        });
        missingSections.push('Business / Profession');
      } else if (bp.grossReceiptsOrTurnover > 7500000) {
        issues.push({
          id: 'bp-44ada-limit-exceeded',
          severity: 'review',
          category: 'Business',
          title: 'Gross receipts exceed Section 44ADA threshold',
          description: 'Section 44ADA is only applicable for receipts up to ₹ 50 Lakhs (or ₹ 75 Lakhs if digital receipts >= 95%).',
          recommendation: 'You may need to maintain regular books of accounts under Section 44AB/Schedule BP (ITR-3).',
          affectedSchedule: 'Schedule BP',
        });
        reviewNeededSections.push('Business / Profession');
      } else {
        completedSections.push('Business / Profession');
      }
    } else if (bp.type === '44AD') {
      if (bp.grossReceiptsOrTurnover <= 0) {
        issues.push({
          id: 'bp-44ad-turnover-zero',
          severity: 'missing',
          category: 'Business',
          title: 'Gross Business Turnover is missing',
          description: 'Section 44AD requires total gross turnover from business operations.',
          recommendation: 'Enter annual business turnover from sales/services.',
          affectedSchedule: 'Schedule 44AD',
        });
        missingSections.push('Business / Profession');
      } else if (bp.grossReceiptsOrTurnover > 30000000) {
        issues.push({
          id: 'bp-44ad-limit-exceeded',
          severity: 'review',
          category: 'Business',
          title: 'Turnover exceeds Section 44AD limit',
          description: 'Section 44AD limit is ₹ 2 Crore (or ₹ 3 Crore if cash receipts < 5%).',
          recommendation: 'Consider regular books of account with tax audit if applicable under ITR-3.',
          affectedSchedule: 'Schedule BP',
        });
        reviewNeededSections.push('Business / Profession');
      } else {
        completedSections.push('Business / Profession');
      }
    } else {
      completedSections.push('Business / Profession');
    }
  }

  // 6. Foreign Assets Section
  if (data.situation.hasForeignAssetsOrIncome) {
    if (!data.foreignAssets || data.foreignAssets.length === 0) {
      issues.push({
        id: 'fa-details-missing',
        severity: 'missing',
        category: 'Foreign Assets',
        title: 'Schedule FA details missing',
        description: 'You indicated foreign assets/investments (e.g. US stocks/RSUs), but no foreign asset records are listed.',
        recommendation: 'Reporting foreign assets in Schedule FA is mandatory for resident individuals under Indian Black Money Act provisions.',
        affectedSchedule: 'Schedule FA',
      });
      missingSections.push('Foreign Assets');
    } else {
      completedSections.push('Foreign Assets');
    }
  }

  // 7. Deductions under New vs Old Regime
  if (data.selectedRegime === 'NEW') {
    const d = data.deductions;
    const oldRegimeOnly = (d.section80C || 0) + (d.section80D_Self || 0) + (d.section80D_Parents || 0) + (d.section80CCD_1B || 0);
    if (oldRegimeOnly > 0) {
      issues.push({
        id: 'deductions-new-regime-ignored',
        severity: 'info',
        category: 'Deductions',
        title: 'Chapter VI-A deductions are not active in New Regime',
        description: `You have ₹ ${oldRegimeOnly.toLocaleString('en-IN')} in 80C/80D/NPS entries, but under the New Tax Regime, these deductions are not allowed (Standard deduction ₹ 75,000 is given automatically).`,
        recommendation: 'You can compare Old vs New Regime in Step 3 to see if switching to the Old Regime saves more tax.',
        affectedSchedule: 'Schedule VIA',
      });
    }
  }
  completedSections.push('Deductions & Regime');

  // 8. Taxes Paid & TDS
  completedSections.push('Taxes Paid & TDS');

  // 9. Form compatibility check
  if (recommendedForm === 'ITR-1' && data.situation.hasForeignAssetsOrIncome) {
    issues.push({
      id: 'form-mismatch-fa',
      severity: 'review',
      category: 'General',
      title: 'ITR-1 cannot be filed with foreign assets',
      description: 'Taxpayers with foreign assets or overseas income must file ITR-2 or ITR-3.',
      recommendation: 'Select ITR-2 or update your situation responses.',
    });
  }

  // Calculate readiness score
  const totalRequired = 5;
  const completedCount = completedSections.length;
  const missingCount = missingSections.length;
  const reviewCount = reviewNeededSections.length;

  let readinessScore = Math.round(
    Math.max(10, Math.min(100, (completedCount / (completedCount + missingCount + reviewCount * 0.5)) * 100))
  );
  if (missingCount > 0) {
    readinessScore = Math.min(readinessScore, 75);
  }

  let overallStatus: PreparationReadinessSummary['overallStatus'] = 'Ready';
  if (missingCount > 0) overallStatus = 'Incomplete';
  else if (reviewCount > 0 || issues.some((i) => i.severity === 'review')) overallStatus = 'Needs Attention';

  return {
    overallStatus,
    readinessScore,
    completedSections: Array.from(new Set(completedSections)),
    reviewNeededSections: Array.from(new Set(reviewNeededSections)),
    missingSections: Array.from(new Set(missingSections)),
    issues,
  };
}

export function validateTaxPreparationReadiness(
  data: FullTaxPreparationData,
  decision: { recommendedForm: ITRFormType },
  _summary?: any
): PreparationReadinessSummary {
  return validateTaxPreparation(data, decision.recommendedForm);
}
