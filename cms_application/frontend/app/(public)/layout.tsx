import { CartProvider } from '@/components/cart';
import { PublicHeader } from '@/components/site';
import { PageTransition } from '@/components/PageTransition';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider><PublicHeader /><PageTransition>{children}</PageTransition></CartProvider>;
}
