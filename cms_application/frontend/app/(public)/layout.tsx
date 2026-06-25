import { CartProvider } from '@/components/cart';
import { EnquiryModalProvider } from '@/components/enquiry-modal-context';
import { PublicHeader } from '@/components/site';
import { PageTransition } from '@/components/PageTransition';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider><EnquiryModalProvider><PublicHeader /><PageTransition>{children}</PageTransition></EnquiryModalProvider></CartProvider>;
}
