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
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const generateItinerary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/grok-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeName, homeCity, lat, lng, departureDate, returnDate }),
      });

      if (!res.ok) throw new Error('Grok error');
      const data = await res.json();
      setItinerary(data);
    } catch (err) {
      alert('Error — check F12 console');
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
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2">✈️ Where are you flying from?</label>
            <input
              type="text"
              placeholder="e.g. London, New York..."
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Departure date</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Return date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white"
              />
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

              {/* REAL FLIGHT SEARCH WITH DATES */}
              <div>
                <h3 className="font-semibold mb-2">✈️ Flights</h3>
                <div className="bg-zinc-800 rounded-3xl p-5 text-sm mb-3">{itinerary.flights}</div>
                <a
                  href={`https://www.kiwi.com/en/search/results/${encodeURIComponent(homeCity || 'LON')}/${encodeURIComponent(placeName)}/${departureDate.replace(/-/g, '')}/${returnDate.replace(/-/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-center rounded-3xl font-semibold text-lg"
                >
                  🔎 Search real flights &amp; prices on Kiwi.com →
                </a>
              </div>

              {/* REAL HOTEL SEARCH WITH DATES */}
              <div>
                <h3 className="font-semibold mb-2">🏨 Hotels</h3>
                <div className="space-y-3">
                  {itinerary.hotels?.map((hotel: string, i: number) => (
                    <div key={i} className="bg-zinc-800 rounded-3xl p-5 text-sm">{hotel}</div>
                  ))}
                </div>
                <a
                  href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(placeName)}&checkin=${departureDate}&checkout=${returnDate}&group_adults=2&no_rooms=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-center rounded-3xl font-semibold mt-4"
                >
                  🔎 Search real hotels &amp; prices on Booking.com →
                </a>
              </div>

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
