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
  const [homeCity, setHomeCity] = useState('');

  const generateItinerary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/grok-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeName, homeCity, lat, lng }),
      });

      if (!res.ok) throw new Error('Grok error');
      const data = await res.json();
      setItinerary(data);
    } catch (err) {
      alert('Error with Grok — check F12 console');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950 z-[9999] flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-zinc-700 flex items-center justify-between">
          <h2 className="text-3xl font-bold">🌍 {placeName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-2xl">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Home city */}
          <div className="mb-8">
            <label className="block text-sm text-zinc-400 mb-2">✈️ Where are you flying from?</label>
            <input
              type="text"
              placeholder="e.g. London, New York..."
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <div className="flex gap-2 mt-3 text-xs flex-wrap">
              {['London', 'New York', 'Sydney', 'Los Angeles', 'Paris', 'Tokyo'].map(city => (
                <button key={city} onClick={() => setHomeCity(city)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-3xl transition-colors">
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-mono text-zinc-400 mb-8">
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </div>

          {!itinerary ? (
            <button 
              type="button"
              onClick={generateItinerary}
              disabled={loading}
              className="w-full py-8 bg-white text-black rounded-3xl font-semibold text-2xl hover:bg-emerald-400 transition-all disabled:opacity-70"
            >
              {loading ? "🤖 Asking Grok..." : "✨ Get full AI itinerary"}
            </button>
          ) : (
            <div className="space-y-8">
              <p className="text-emerald-400 text-xl">{itinerary.summary}</p>

              {/* FLIGHTS with affiliate button */}
              <div>
                <h3 className="font-semibold mb-2">✈️ Flights</h3>
                <div className="bg-zinc-800 rounded-3xl p-5 text-sm mb-3">{itinerary.flights}</div>
                <a
                  href={`https://www.kiwi.com/en/search/results?from=${encodeURIComponent(homeCity || 'LON')}&to=${encodeURIComponent(placeName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-center rounded-3xl font-semibold"
                >
                  Book Flight on Kiwi.com →
                </a>
              </div>

              {/* HOTELS with affiliate button */}
              <div>
                <h3 className="font-semibold mb-2">🏨 Hotels</h3>
                <div className="space-y-3">
                  {itinerary.hotels?.map((hotel: string, i: number) => (
                    <div key={i} className="bg-zinc-800 rounded-3xl p-5 text-sm">{hotel}</div>
                  ))}
                </div>
                <a
                  href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(placeName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-center rounded-3xl font-semibold mt-4"
                >
                  Book Hotel on Booking.com →
                </a>
              </div>

              {/* Weather & Itinerary */}
              <div className="bg-zinc-800 rounded-3xl p-6 text-sm">
                <strong>☀️ Weather:</strong> {itinerary.weather}
              </div>

              <div>
                <h3 className="font-semibold mb-4">📅 Day-by-day plan</h3>
                {itinerary.itinerary?.map((day: any, i: number) => (
                  <div key={i} className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="bg-emerald-400 text-black text-xs font-bold w-6 h-6 rounded-2xl flex items-center justify-center">D{day.day}</div>
                      <div className="font-medium">{day.title}</div>
                    </div>
                    <div className="text-zinc-400 pl-9">{day.desc}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => setItinerary(null)} className="text-zinc-400 hover:text-white">← Generate another trip</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
