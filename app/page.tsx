'use client';

import { AuthButton } from '@/components/auth-button';
import { DeployButton } from '@/components/deploy-button';
import WorldMap from '../components/WorldMap';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold flex items-center gap-2">
              🌍 WanderAI
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <DeployButton />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* The Map */}
      <div className="flex-1">
        <WorldMap />
      </div>
    </main>
  );
}
