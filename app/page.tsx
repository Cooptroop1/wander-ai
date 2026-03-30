'use client';   // ← This is the important fix

import { useState, useEffect } from 'react';
import WorldMap from '../components/WorldMap';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Only run on client
    if (localStorage.getItem('hasSeenWelcome') === 'true') {
      setShowWelcome(false);
    }
  }, []);

  const handleStart = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
            <div className="text-6xl mb-6">🌍</div>
            <h1 className="text-4xl font-bold mb-2">Welcome to WanderAI</h1>
            <p className="text-zinc-400 mb-8">Your personal AI travel planner</p>

            <div className="text-left space-y-6 mb-10">
              <div className="flex gap-4">
                <span className="text-3xl">🗺️</span>
                <div>
                  <p className="font-semibold">1. Click anywhere on the map</p>
                  <p className="text-sm text-zinc-500">Pick any destination you want to visit</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-3xl">📍</span>
                <div>
                  <p className="font-semibold">2. Enter your home city + dates</p>
                  <p className="text-sm text-zinc-500">So we can make it personal</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-3xl">🤖</span>
                <div>
                  <p className="font-semibold">3. Get a full AI itinerary</p>
                  <p className="text-sm text-zinc-500">Flights, hotels, weather &amp; day-by-day plan</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleStart}
              className="w-full py-6 bg-white text-black rounded-3xl font-semibold text-xl hover:bg-emerald-400 transition-all"
            >
              Got it — Let's Explore!
            </button>
          </div>
        </div>
      )}

      {/* The Map */}
      <WorldMap />
    </main>
  );
}
