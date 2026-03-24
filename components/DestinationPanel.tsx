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
    
    // Fake delay so it feels real
    setTimeout(() => {
      setItinerary({
        place: placeName,
        days: 4,
        budget: "$1200",
        summary: `Perfect 4-day trip to ${placeName}. Beach, food, adventure — all planned for you!`,
        flights: "Round-trip from your city ≈ $380–$620 • 2 direct flights daily",
        hotels: [
          "🌟 4.9 • Ocean View Resort – $95/night",
          "🌟 4.7 • Boutique Guesthouse – $68/night"
        ],
        weather: "28°C • Sunny with a chance of afternoon showers",
        itinerary: [
          { day: 1, title: "Arrival & Beach Day", desc: "Check in, sunset dinner at the cliff restaurant" },
          { day: 2, title: "Explore the city", desc: "Temple visit + street food tour" },
          { day: 3, title: "Adventure day", desc: "Snorkeling + waterfall hike" },
          { day: 4, title: "Relax & depart", desc: "Morning yoga + airport transfer" }
        ]
      });
      setLoading(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[9998]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-96 bg-zinc-900 border-l border-zinc-700 shadow-2xl z-[9999] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              🌍 {placeName}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-2xl transition-colors">
              <X size={28} />
            </button>
          </div>

          {/* Coordinates */}
          <div className="bg-zinc-800 rounded-3xl p-4 mb-8 text-xs font-mono text-zinc-400">
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </div>

          {!itinerary ? (
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-3">✈️ Flights from your city</h3>
                <div className="bg-zinc-800 rounded-2xl p-4 text-sm">Round-trip ≈ $380–$620 • 2 direct options</div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">🏨 Hotels</h3>
                <div className="bg-zinc-800 rounded-2xl p-4 text-sm space-y-3">
                  <div>🌟 4.9 • Ocean View Resort – $95/night</div>
                  <div>🌟 4.7 • Boutique Guesthouse – $68/night</div>
                </div>
              </div>

              <button 
                onClick={generateMockItinerary}
                disabled={loading}
                className="w-full py-6 bg-white text-black rounded-3xl font-semibold text-xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? "Generating with AI..." : "✨ Generate full AI itinerary with Grok"}
              </button>
            </div>
          ) : (
            /* BEAUTIFUL MOCK ITINERARY */
            <div className="space-y-6">
              <div className="text-emerald-400 font-medium">{itinerary.summary}</div>
              
              <div>
                <h3 className="font-semibold mb-2">✈️ Flights</h3>
                <div className="bg-zinc-800 rounded-2xl p-4 text-sm">{itinerary.flights}</div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🏨 Hotels</h3>
                {itinerary.hotels.map((hotel: string, i: number) => (
                  <div key={i} className="bg-zinc-800 rounded-2xl p-4 text-sm mb-3">{hotel}</div>
                ))}
              </div>

              <div>
                <h3 className="font-semibold mb-2">☀️ Weather</h3>
                <div className="bg-zinc-800 rounded-2xl p-4 text-sm">{itinerary.weather}</div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">📅 Day-by-day plan</h3>
                {itinerary.itinerary.map((day: any, i: number) => (
                  <div key={i} className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="bg-emerald-400 text-black text-xs font-bold w-6 h-6 rounded-2xl flex items-center justify-center">D{day.day}</div>
                      <div className="font-medium">{day.title}</div>
                    </div>
                    <div className="text-zinc-400 text-sm pl-9">{day.desc}</div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => { setItinerary(null); }}
                className="w-full py-4 text-zinc-400 hover:text-white transition-colors"
              >
                ← Back to generate another trip
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
