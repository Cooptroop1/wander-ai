'use client';

import dynamic from 'next/dynamic';

const WorldMap = dynamic(() => import('../components/WorldMap'), { ssr: false });
const WelcomePopup = dynamic(() => import('../components/WelcomePopup'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <WelcomePopup />
      <WorldMap />
    </main>
  );
}
