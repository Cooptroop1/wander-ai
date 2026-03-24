'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface DestinationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  placeName: string;
}

export default function DestinationPanel({ isOpen, onClose, lat, lng, placeName }: DestinationPanelProps) {
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateMockItinerary = () => {
    setLoading(true);
    setTimeout(() => {
      setItinerary({
        place: placeName,
        summary: `Perfect trip to ${placeName} – we’ll make this real with Grok soon!`,
        flights: "Round-trip from your home city ≈ $420–$720",
        hotels: [
          "🌟 4.9 • Beachfront / City Center Resort – $95/night",
          "🌟 4.7 • Boutique Hotel – $68/night"
        ],
        weather: "28°C • Sunny with light showers",
        itinerary: [
          { day: 1, title: "Arrival & Explore", desc: "Check in + first taste of local food" },
          { day: 2, title: "Main Adventure Day", desc: "Top attractions + best views" },
          { day: 3, title: "Relax & Chill", desc: "Beach / city time" },
        ]
      });
      setLoading(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950 z-[9999] flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-700 flex items-center justify-between">
          <h2 className="text-3xl font-bold">🌍 {placeName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-2xl">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Coordinates (small) */}
          <div className="text-xs font-mono text-zinc-400 mb-8">
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </div>

          {!itinerary ? (
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-3">✈️ Flights from your city</h3>
                <div className="bg-zinc-800 rounded-3xl p-5 text-sm">Round-trip ≈ $420–$720 • Multiple daily options</div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">🏨 Hotels</h3>
                <div className="space-y-3">
                  <div className="bg-zinc-800 rounded-3xl p-5 text-sm">🌟 4.9 • Beachfront Resort – $95/night</div>
                  <div className="bg-zinc-800 rounded-3xl p-5 text-sm">🌟 4.7 • Boutique Hotel – $68/night</div>
                </div>
              </div>

              <button 
                onClick={generateMockItinerary}
                disabled={loading}
                className="w-full py-8 bg-white text-black rounded-3xl font-semibold text-2xl hover:bg-emerald-400 transition-all"
              >
                {loading ? "Generating with AI..." : "✨ Get full AI itinerary"}
              </button>
            </div>
          ) : (
            <div className="space-y-8 text-left">
              {/* Full itinerary content goes here – we’ll expand it later */}
              <p className="text-emerald-400 text-xl">{itinerary.summary}</p>
              <div className="bg-zinc-800 rounded-3xl p-6 text-sm space-y-6">
                <div><strong>Flights:</strong> {itinerary.flights}</div>
                <div><strong>Hotels:</strong> {itinerary.hotels.join(' • ')}</div>
                <div><strong>Weather:</strong> {itinerary.weather}</div>
              </div>
              <button onClick={() => setItinerary(null)} className="text-zinc-400 hover:text-white">← Try another trip</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
