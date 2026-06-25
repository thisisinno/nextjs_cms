'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { EnquiryModal } from './EnquiryModal';

type EnquiryModalContextValue = {
  openEnquiry: () => void;
  closeEnquiry: () => void;
};

const EnquiryModalContext = createContext<EnquiryModalContextValue | null>(null);

export function EnquiryModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({
    openEnquiry: () => setOpen(true),
    closeEnquiry: () => setOpen(false),
  }), []);
  return <EnquiryModalContext.Provider value={value}>{children}<EnquiryModal open={open} onClose={() => setOpen(false)} /></EnquiryModalContext.Provider>;
}

export function useEnquiryModal() {
  const context = useContext(EnquiryModalContext);
  if (!context) throw new Error('useEnquiryModal must be used within EnquiryModalProvider');
  return context;
}
