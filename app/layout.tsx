import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pilates Gestão',
  description: 'Gestão do seu estúdio de Pilates',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
