'use client';

import { X } from 'lucide-react';

interface DestinationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
}

export default function DestinationPanel({ isOpen, onClose, lat, lng }: DestinationPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - click to close */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-96 bg-zinc-900 border-l border-zinc-700 shadow-2xl z-[9999] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              🌍 Destination
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-zinc-800 rounded-2xl transition-colors"
            >
              <X size={28} />
            </button>
          </div>

          {/* Coordinates */}
          <div className="bg-zinc-800 rounded-3xl p-6 mb-8">
            <p className="text-zinc-400 text-sm mb-1">You clicked near</p>
            <p className="font-mono text-2xl font-medium">
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </p>
          </div>

          {/* Placeholder content (AI will fill this next) */}
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">✈️ Flights from your city</h3>
              <div className="bg-zinc-800 rounded-2xl p-4 text-sm">
                Round-trip ≈ $420–$680 • 3 direct options
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">🏨 Hotels</h3>
              <div className="bg-zinc-800 rounded-2xl p-4 text-sm space-y-3">
                <div>🌟 4.8 • Beachfront Resort – $89/night</div>
                <div>🌟 4.6 • City Center Hotel – $65/night</div>
              </div>
            </div>

            <button 
              onClick={() => alert('🚀 Next step: Grok API will generate full AI itinerary here!')}
              className="w-full py-6 bg-white text-black rounded-3xl font-semibold text-xl hover:bg-emerald-400 transition-all active:scale-95"
            >
              ✨ Generate full AI itinerary with Grok
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
