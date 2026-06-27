'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Loader } from './Loader';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState('Preparing your experience');

  useEffect(() => {
    setLabel('Preparing your experience');
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onLoading = (event: Event) => {
      const detail = (event as CustomEvent<{ label?: string; duration?: number }>).detail;
      setLabel(detail?.label || 'Updating content');
      setLoading(true);
      window.setTimeout(() => setLoading(false), detail?.duration || 460);
    };
    window.addEventListener('sccl:loading', onLoading);
    return () => window.removeEventListener('sccl:loading', onLoading);
  }, []);

  return <>
    {loading && <Loader label={label} fullScreen={false} overlay size="medium" />}
    <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>{children}</motion.div>
  </>;
}
