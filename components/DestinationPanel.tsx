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
  const [homeCity, setHomeCity] = useState(''); // ← new field

  const generateMockItinerary = () => {
    setLoading(true);
    setTimeout(() => {
      setItinerary({
        place: placeName,
        home: homeCity || 'your city',
        summary: `Perfect trip to ${placeName} from ${homeCity || 'your city'}!`,
        flights: homeCity 
          ? `Round-trip from ${homeCity} ≈ $420–$720` 
          : "Round-trip from your city ≈ $420–$720",
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
          {/* NEW: Home city input */}
          <div className="mb-8">
            <label className="block text-sm text-zinc-400 mb-2">✈️ Where are you flying from?</label>
            <input
              type="text"
              placeholder="e.g. London, New York, Sydney..."
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <div className="flex gap-2 mt-3 text-xs flex-wrap">
              {['London', 'New York', 'Sydney', 'Los Angeles', 'Paris', 'Tokyo'].map(city => (
                <button
                  key={city}
                  onClick={() => setHomeCity(city)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-3xl transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates */}
          <div className="text-xs font-mono text-zinc-400 mb-8">
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </div>

          {!itinerary ? (
            <div className="space-y-8">
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
              <p className="text-emerald-400 text-xl">{itinerary.summary}</p>
              <div className="bg-zinc-800 rounded-3xl p-6 text-sm space-y-6">
                <div><strong>Flights from {itinerary.home}:</strong> {itinerary.flights}</div>
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
