'use client';

import { useState, useEffect } from 'react';

export default function WelcomePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show popup only if user hasn't seen it before
    if (localStorage.getItem('hasSeenWelcome') !== 'true') {
      setShow(true);
    }
  }, []);

  const handleStart = () => {
    setShow(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  if (!show) return null;

  return (
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
              <p className="text-sm text-zinc-500">Pick any destination</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-3xl">📍</span>
            <div>
              <p className="font-semibold">2. Enter home city + dates</p>
              <p className="text-sm text-zinc-500">For a personal trip</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-3xl">🤖</span>
            <div>
              <p className="font-semibold">3. Get full AI itinerary</p>
              <p className="text-sm text-zinc-500">Flights, hotels, weather & day-by-day plan</p>
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
  );
}
