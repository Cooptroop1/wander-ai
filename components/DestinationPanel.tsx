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

  // Starting place (home city)
  const [homeCity, setHomeCity] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Multi-city
  const [isMultiCity, setIsMultiCity] = useState(false);
  const [secondCity, setSecondCity] = useState('');
  const [secondDeparture, setSecondDeparture] = useState('');
  const [secondReturn, setSecondReturn] = useState('');

  const isFormValid = homeCity.trim() !== '' && departureDate !== '' && returnDate !== '' &&
                     (!isMultiCity || (secondCity.trim() !== '' && secondDeparture !== '' && secondReturn !== ''));

  const generateItinerary = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/grok-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stops: [
            { city: homeCity, departure: departureDate, return: returnDate },
            ...(isMultiCity ? [{ city: secondCity, departure: secondDeparture, return: secondReturn }] : [])
          ]
        }),
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
          {/* Starting place (home city) */}
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2">✈️ Starting city (home) <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. London"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Dates for first stop */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Departure <span className="text-red-400">*</span></label>
              <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Return <span className="text-red-400">*</span></label>
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
            </div>
          </div>

          {/* Multi-city checkbox */}
          <div className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              checked={isMultiCity}
              onChange={(e) => setIsMultiCity(e.target.checked)}
              className="w-5 h-5 accent-emerald-500"
            />
            <label className="text-sm font-medium">I want a multi-city trip (add another stop)</label>
          </div>

          {/* Second stop - shown only if checkbox ticked */}
          {isMultiCity && (
            <div className="mb-8 border border-zinc-700 rounded-3xl p-6">
              <h3 className="font-semibold mb-4">Second stop</h3>
              <input
                type="text"
                placeholder="City name (e.g. Paris)"
                value={secondCity}
                onChange={(e) => setSecondCity(e.target.value)}
                className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 mb-4"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Departure</label>
                  <input type="date" value={secondDeparture} onChange={(e) => setSecondDeparture(e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Return</label>
                  <input type="date" value={secondReturn} onChange={(e) => setSecondReturn(e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
                </div>
              </div>
            </div>
          )}

          <button 
            type="button"
            onClick={generateItinerary}
            disabled={!isFormValid || loading}
            className="w-full py-8 bg-white text-black rounded-3xl font-semibold text-2xl hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "🤖 Asking Grok..." : "✨ Generate multi-city AI itinerary"}
          </button>
        </div>
      </div>
    </div>
  );
}
