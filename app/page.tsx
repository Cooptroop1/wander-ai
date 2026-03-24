'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map so it only loads on the client
const Map = dynamic(() => import('../components/WorldMap'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8">🌍 WanderAI</h1>
        
        {/* World Map */}
        <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
          <Map />
        </div>

        <p className="text-center text-zinc-400 mt-6 text-sm">
          Click anywhere on the map to start planning your trip
        </p>
      </div>
    </main>
  );
}
