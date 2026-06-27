'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type PublicLanguage = 'en' | 'sw';

const STORAGE_KEY = 'sccl-language';

const dictionary = {
  en: {
    loading: 'Loading',
    switchingLanguage: 'Switching language',
    home: 'Home',
    about: 'About',
    services: 'Services',
    advertisement: 'Advertisement',
    contact: 'Contact',
    login: 'Login',
    sendMessage: 'Send Message',
    sending: 'Sending...',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    subject: 'Subject',
    message: 'Message',
    checkOurServices: 'Check Our Services',
    checkOurAdvertisements: 'Check Our Advertisements',
    contactUs: 'Contact Us',
    weAreProudOn: 'We are proud on:',
    happyClients: 'Happy Clients',
    projects: 'Projects',
    yearsExperience: 'Years of experience',
    workingDays: 'Working Days',
    servicesTime: 'Services Time',
    location: 'Location',
    email: 'Email',
    call: 'Call',
    needQuotation: 'Need a quotation?',
    openEnquiryForm: 'Open enquiry form',
    completeEnquiry: 'Complete enquiry',
    details: 'Details',
    addToEnquiry: 'Add to enquiry',
    serviceAdded: 'Service added to enquiry',
    serviceAlreadyInEnquiry: 'Service already in enquiry cart',
    openingServices: 'Opening services',
    openingServiceDetails: 'Opening service details',
    updatingProjects: 'Updating projects',
    selectServicesSubmit: 'Select services and submit your enquiry.',
    thankYouReceived: 'Thank you. We have received your message.',
    yourEnquiry: 'Your enquiry',
    clearSelectedServices: 'Clear selected services',
    company: 'Company',
    selectedProject: 'Selected project',
    all: 'ALL',
    completed: 'COMPLETED',
    continues: 'CONTINUES',
    daily: 'DAILY',
  },
  sw: {
    loading: 'Inapakia',
    switchingLanguage: 'Inabadilisha lugha',
    home: 'Mwanzo',
    about: 'Kuhusu',
    services: 'Huduma',
    advertisement: 'Matangazo',
    contact: 'Mawasiliano',
    login: 'Ingia',
    sendMessage: 'Tuma Ujumbe',
    sending: 'Inatuma...',
    yourName: 'Jina Lako',
    yourEmail: 'Barua Pepe',
    subject: 'Somo',
    message: 'Ujumbe',
    checkOurServices: 'Angalia Huduma Zetu',
    checkOurAdvertisements: 'Angalia Matangazo Yetu',
    contactUs: 'Wasiliana Nasi',
    weAreProudOn: 'Tunajivunia:',
    happyClients: 'Wateja Wenye Furaha',
    projects: 'Miradi',
    yearsExperience: 'Miaka ya Uzoefu',
    workingDays: 'Siku za Kazi',
    servicesTime: 'Muda wa Huduma',
    location: 'Mahali',
    email: 'Barua Pepe',
    call: 'Simu',
    needQuotation: 'Unahitaji makadirio ya bei?',
    openEnquiryForm: 'Fungua fomu ya maombi',
    completeEnquiry: 'Kamilisha maombi',
    details: 'Maelezo',
    addToEnquiry: 'Ongeza kwenye maombi',
    serviceAdded: 'Huduma imeongezwa kwenye ombi',
    serviceAlreadyInEnquiry: 'Huduma tayari ipo kwenye ombi',
    openingServices: 'Inafungua huduma',
    openingServiceDetails: 'Inafungua maelezo ya huduma',
    updatingProjects: 'Inasasisha miradi',
    selectServicesSubmit: 'Chagua huduma kisha tuma ombi lako.',
    thankYouReceived: 'Asante. Tumepokea ujumbe wako.',
    yourEnquiry: 'Ombi lako',
    clearSelectedServices: 'Futa huduma ulizochagua',
    company: 'Kampuni',
    selectedProject: 'Mradi uliochaguliwa',
    all: 'ZOTE',
    completed: 'ZILIZOKAMILIKA',
    continues: 'ZINAZOENDELEA',
    daily: 'KILA SIKU',
  },
} as const;

type Key = keyof typeof dictionary.en;

type LanguageContextValue = {
  language: PublicLanguage;
  setLanguage: (language: PublicLanguage) => void;
  toggleLanguage: () => void;
  t: (key: Key) => string;
  pick: (enValue?: string | null, swValue?: string | null, fallback?: string) => string;
  translateCms: <T extends Record<string, any>>(item: T | null | undefined, field: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<PublicLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'sw' || saved === 'en') setLanguageState(saved);
  }, []);

  const setLanguage = (next: PublicLanguage) => {
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(
      new CustomEvent('sccl:loading', {
        detail: {
          label: next === 'sw' ? dictionary.sw.switchingLanguage : dictionary.en.switchingLanguage,
          duration: 360,
        },
      })
    );
  };

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === 'en' ? 'sw' : 'en'),
    t: (key) => dictionary[language][key] || dictionary.en[key] || key,
    pick: (enValue, swValue, fallback = '') => {
      if (language === 'sw' && swValue && String(swValue).trim()) return String(swValue);
      if (enValue && String(enValue).trim()) return String(enValue);
      return fallback;
    },
    translateCms: (item, field, fallback = '') => {
      const swField = `${field}_sw`;
      if (language === 'sw' && item?.[swField] && String(item[swField]).trim()) {
        return String(item[swField]);
      }
      if (item?.[field] && String(item[field]).trim()) return String(item[field]);
      return fallback;
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
