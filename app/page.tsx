'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AuthButton } from '@/components/auth-button';
import { DeployButton } from '@/components/deploy-button';

const WorldMap = dynamic(() => import('../components/WorldMap'), { ssr: false });
const WelcomePopup = dynamic(() => import('../components/WelcomePopup'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Navigation Bar with Login */}
      <nav className="w-full border-b border-zinc-800 bg-zinc-900 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            🌍 WanderAI
          </Link>

          <div className="flex items-center gap-4">
            <DeployButton />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Welcome Popup */}
      <WelcomePopup />

      {/* The Map */}
      <div className="flex-1">
        <WorldMap />
      </div>
    </main>
  );
}
