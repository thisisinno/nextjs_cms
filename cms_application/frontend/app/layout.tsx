import './globals.css';

export const metadata = {
  title: 'SCCL | Construction & Consultancy',
  description: 'Construction, engineering and consultancy services.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
