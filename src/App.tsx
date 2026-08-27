import React, { useState, useMemo, useEffect } from 'react';
import { 
  FullTaxPreparationData, 
  LanguageCode, 
  TextSizeMode, 
  TaxpayerSituation,
  TaxpayerProfile
} from './types';
import { determineITRForm } from './utils/itrDecisionEngine';
import { compareTaxRegimes } from './utils/taxCalculator';
import { validateTaxPreparationReadiness } from './utils/validationRules';
import { translations } from './data/translations';
import { SampleScenario } from './data/sampleScenarios';

import { Navbar } from './components/Navbar';
import { StageProgress } from './components/StageProgress';
import { StepSituation } from './components/StepSituation';
import { StepDocumentUpload } from './components/StepDocumentUpload';
import { StepIncomeSources } from './components/StepIncomeSources';
import { StepDeductionsAndRegime } from './components/StepDeductionsAndRegime';
import { StepTaxesPaid } from './components/StepTaxesPaid';
import { StepReadinessSummary } from './components/StepReadinessSummary';
import { SampleScenariosModal } from './components/SampleScenariosModal';
import { AuthPage, initialMockUsers, MockAuthUser } from './components/AuthPage';
import { ShieldCheck, Building2 } from 'lucide-react';

const initialData: FullTaxPreparationData = {
  profile: {
    name: 'Citizen Taxpayer',
    pan: '',
    assessmentYear: '2025-26',
    financialYear: '2024-25',
    ageCategory: 'Below 60',
    residentialStatus: 'Resident',
    filingStatus: 'Individual',
  },
  situation: {
    hasSalaryIncome: true,
    hasPensionIncome: false,
    hasHouseProperty: false,
    housePropertyCount: 'none',
    hasCapitalGains: false,
    hasBusinessIncome: false,
    isPresumptiveBusiness: false,
    isPresumptiveProfessional: false,
    hasRegularBooksOfAccounts: false,
    hasOtherSources: true,
    hasForeignAssetsOrIncome: false,
    isDirectorOrUnlistedShares: false,
    hasAgriculturalIncome: false,
    agriculturalIncomeAmount: 0,
    totalIncomeAbove50Lakhs: false,
    hasBroughtForwardLosses: false,
  },
  selectedRegime: 'NEW',
  salary: {
    grossSalary: 850000,
    exemptAllowances: 0,
    professionalTax: 2500,
    standardDeduction: 75000,
    employerName: 'XYZ Technologies Pvt Ltd',
    employerType: 'Private',
  },
  houseProperty: {
    propertyType: 'Self-Occupied',
    grossRentReceived: 0,
    municipalTaxesPaid: 0,
    homeLoanInterest: 0,
  },
  capitalGains: [],
  businessProfession: {
    type: '44ADA',
    grossReceiptsOrTurnover: 0,
    digitalTurnoverRatio: 100,
    presumptiveProfitDeclared: 0,
  },
  otherSources: {
    savingsBankInterest: 12000,
    fdInterest: 0,
    dividendIncome: 0,
    familyPension: 0,
    otherIncome: 0,
  },
  foreignAssets: [],
  deductions: {
    section80C: 150000,
    section80D_Self: 15000,
    section80D_Parents: 0,
    isParentsSeniorCitizen: false,
    section80CCD_1B: 0,
    section80CCD_2: 0,
    section80E: 0,
    section80G: 0,
    section80TTA: 10000,
    section80TTB: 0,
    otherDeductions: 0,
  },
  taxPayments: {
    tdsOnSalary: 32000,
    tdsOnOtherIncome: 0,
    tcsCredit: 0,
    advanceTaxPaid: 0,
    selfAssessmentTaxPaid: 0,
    taxChallans: [],
  },
};

export default function App() {
  const [data, setData] = useState<FullTaxPreparationData>(initialData);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [maxCompletedStage, setMaxCompletedStage] = useState<number>(1);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [textSize, setTextSize] = useState<TextSizeMode>('normal');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState<boolean>(false);
  const [authPath, setAuthPath] = useState<'login' | 'register' | 'app'>(() => {
    const path = window.location.pathname;
    return path === '/register' ? 'register' : path === '/app' ? 'app' : 'login';
  });
  const [mockUsers, setMockUsers] = useState<MockAuthUser[]>(initialMockUsers);
  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);

  // Scale the document root so rem-based typography (including Tailwind's
  // text utilities) grows with the selected accessibility text size. The
  // previous implementation only changed the app container's inherited
  // font-size, which left fixed/rem-based text unchanged.
  useEffect(() => {
    const root = document.documentElement;
    const previousFontSize = root.style.fontSize;
    const rootFontSize = textSize === 'xlarge' ? '125%' : textSize === 'large' ? '112.5%' : '100%';

    root.style.fontSize = rootFontSize;

    return () => {
      root.style.fontSize = previousFontSize;
    };
  }, [textSize]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setAuthPath(path === '/register' ? 'register' : path === '/app' ? 'app' : 'login');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const t = translations[currentLang] || translations.en;

  // Helper for partial data updates
  const handleUpdateData = (updated: Partial<FullTaxPreparationData>) => {
    setData((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateSituation = (updated: Partial<TaxpayerSituation>) => {
    setData((prev) => ({ ...prev, situation: { ...prev.situation, ...updated } }));
  };

  const handleUpdateProfile = (updated: Partial<TaxpayerProfile>) => {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, ...updated } }));
  };

  // Form decision engine
  const decision = useMemo(() => {
    return determineITRForm(data.situation, data.profile);
  }, [data.situation, data.profile]);

  // Dual Regime calculation
  const comparison = useMemo(() => {
    return compareTaxRegimes(data);
  }, [data]);

  const activeSummary = data.selectedRegime === 'NEW' ? comparison.newRegime : comparison.oldRegime;

  // Validation / Readiness score
  const readiness = useMemo(() => {
    return validateTaxPreparationReadiness(data, decision, activeSummary);
  }, [data, decision, activeSummary]);

  // Stage navigation
  const handleNextStage = (targetStage: number) => {
    setCurrentStage(targetStage);
    if (targetStage > maxCompletedStage) {
      setMaxCompletedStage(targetStage);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStage = (targetStage: number) => {
    setCurrentStage(targetStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to blank
  const handleReset = () => {
    if (window.confirm(t.confirmReset)) {
      setData(initialData);
      setCurrentStage(1);
      setMaxCompletedStage(1);
    }
  };

  // Load sample scenario
  const handleSelectScenario = (scenario: SampleScenario) => {
    setData(scenario.data);
    setCurrentStage(1);
    setMaxCompletedStage(1);
  };

  const navigateTo = (target: 'login' | 'register' | 'app') => {
    const nextPath = target === 'app' ? '/app' : `/${target}`;
    window.history.pushState(null, '', nextPath);
    setAuthPath(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (user: MockAuthUser) => {
    setCurrentUser(user);
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: user.name,
        contactEmail: user.email,
      },
    }));
    navigateTo('app');
  };

  const handleRegister = (user: MockAuthUser) => {
    setMockUsers((prev) => [...prev, user]);
    handleLogin(user);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setIsScenariosOpen(false);
    navigateTo('login');
  };

  const isAuthScreen = authPath === 'login' || authPath === 'register' || !currentUser;

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-100 text-slate-900 transition-all ${
        textSize === 'large'
          ? 'text-size-large'
          : textSize === 'xlarge'
          ? 'text-size-xlarge'
          : 'text-size-normal'
      } ${isHighContrast ? 'high-contrast-mode' : ''}`}
    >
      {isAuthScreen ? (
        <AuthPage
          mode={authPath === 'register' ? 'register' : 'login'}
          mockUsers={mockUsers}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onNavigate={navigateTo}
        />
      ) : (
        <>
      {/* Top Universal Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        textSize={textSize}
        onTextSizeChange={setTextSize}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        onOpenScenarios={() => setIsScenariosOpen(true)}
        onReset={handleReset}
        currentUserName={currentUser.name}
        onSignOut={handleSignOut}
      />

      {/* Stage Stepper */}
      <StageProgress
        currentStage={currentStage}
        onSelectStage={(stage) => {
          setCurrentStage(stage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentLang={currentLang}
        maxCompletedStage={maxCompletedStage}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 py-5">
        {currentStage === 1 && (
          <StepSituation
            situation={data.situation}
            profile={data.profile}
            decision={decision}
            onChangeSituation={handleUpdateSituation}
            onChangeProfile={handleUpdateProfile}
            onNext={() => handleNextStage(2)}
            currentLang={currentLang}
          />
        )}

        {currentStage === 2 && (
          <StepDocumentUpload
            data={data}
            decision={decision}
            onChangeData={handleUpdateData}
            onNext={() => handleNextStage(3)}
            onPrev={() => handlePrevStage(1)}
            currentLang={currentLang}
          />
        )}

        {currentStage === 3 && (
          <StepIncomeSources
            data={data}
            onChangeData={handleUpdateData}
            onNext={() => handleNextStage(4)}
            onPrev={() => handlePrevStage(2)}
            currentLang={currentLang}
          />
        )}

        {currentStage === 4 && (
          <StepDeductionsAndRegime
            data={data}
            comparison={comparison}
            onChangeData={handleUpdateData}
            onNext={() => handleNextStage(5)}
            onPrev={() => handlePrevStage(3)}
            currentLang={currentLang}
          />
        )}

        {currentStage === 5 && (
          <StepTaxesPaid
            data={data}
            activeSummary={activeSummary}
            onChangeData={handleUpdateData}
            onNext={() => handleNextStage(6)}
            onPrev={() => handlePrevStage(4)}
            currentLang={currentLang}
          />
        )}

        {currentStage === 6 && (
          <StepReadinessSummary
            data={data}
            decision={decision}
            summary={activeSummary}
            readiness={readiness}
            onPrev={() => handlePrevStage(5)}
            onReset={handleReset}
            currentLang={currentLang}
            onNavigateToStage={(stage) => handleNextStage(stage)}
          />
        )}
      </main>

      {/* Clean & Minimal Footer */}
      <footer className="w-full bg-[#141824] text-slate-300 border-t border-slate-800 py-5 px-4 text-xs mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-center md:text-left">
            <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-xs sm:text-sm">{t.appTitle} • {t.appSubtitle}</div>
              <div className="text-[11px] text-slate-400">
                {t.independentPrototype}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t.clientSidePrivate}
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsScenariosOpen(true)}
              className="text-slate-300 hover:text-white"
            >
              {t.loadScenario}
            </button>
          </div>
        </div>
      </footer>

      {/* Sample Scenarios Modal */}
      <SampleScenariosModal
        isOpen={isScenariosOpen}
        onClose={() => setIsScenariosOpen(false)}
        onSelectScenario={handleSelectScenario}
        currentLang={currentLang}
      />
        </>
      )}
    </div>
  );
}
