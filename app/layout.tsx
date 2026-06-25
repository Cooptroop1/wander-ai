import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wander • Duffel Flights Clone | Cooptroop.eth',
  description: 'Enter home airport, destination, dates → Search. Built with Duffel API',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Wander • Duffel Flights Clone',
    description: 'Simple flight search app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white min-h-screen">
        {children}
        <footer className="text-center text-xs text-zinc-500 py-8 border-t border-zinc-700">
          Step-by-step build with Grok • Next file will add real Duffel API + nicer inputs
        </footer>
      </body>
    </html>
  );
}
