import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AuditStep = 1 | 2 | 3 | 4 | 5 | 6;

interface NightAuditState {
  currentStep: AuditStep;
  businessDate: string;
  isDashboardReviewed: boolean;
  isChecklistValidated: boolean;
  isAutoPostingComplete: boolean;
  isCashierClosed: boolean;
  isManagerApproved: boolean;
  
  setStep: (step: AuditStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  setDashboardReviewed: (status: boolean) => void;
  setChecklistValidated: (status: boolean) => void;
  setAutoPostingComplete: (status: boolean) => void;
  setCashierClosed: (status: boolean) => void;
  setManagerApproved: (status: boolean) => void;
  
  rollOverDate: () => void;
}

const NightAuditContext = createContext<NightAuditState | undefined>(undefined);

export function NightAuditProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<AuditStep>(1);
  const [businessDate, setBusinessDate] = useState("2026-07-01");
  
  const [isDashboardReviewed, setDashboardReviewed] = useState(false);
  const [isChecklistValidated, setChecklistValidated] = useState(false);
  const [isAutoPostingComplete, setAutoPostingComplete] = useState(false);
  const [isCashierClosed, setCashierClosed] = useState(false);
  const [isManagerApproved, setManagerApproved] = useState(false);

  const setStep = (step: AuditStep) => setCurrentStep(step);
  
  const nextStep = () => {
    if (currentStep < 6) setCurrentStep((prev) => (prev + 1) as AuditStep);
  };
  
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as AuditStep);
  };

  const rollOverDate = () => {
    // In a real app, this would be an API call to roll over the business date
    const date = new Date(businessDate);
    date.setDate(date.getDate() + 1);
    setBusinessDate(date.toISOString().split('T')[0]);
  };

  return (
    <NightAuditContext.Provider
      value={{
        currentStep,
        businessDate,
        isDashboardReviewed,
        isChecklistValidated,
        isAutoPostingComplete,
        isCashierClosed,
        isManagerApproved,
        setStep,
        nextStep,
        prevStep,
        setDashboardReviewed,
        setChecklistValidated,
        setAutoPostingComplete,
        setCashierClosed,
        setManagerApproved,
        rollOverDate,
      }}
    >
      {children}
    </NightAuditContext.Provider>
  );
}

export function useNightAudit() {
  const context = useContext(NightAuditContext);
  if (context === undefined) {
    throw new Error('useNightAudit must be used within a NightAuditProvider');
  }
  return context;
}
