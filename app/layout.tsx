import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PilatesProCRM',
  description: 'Gestão elegante para seu estúdio de Pilates',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
