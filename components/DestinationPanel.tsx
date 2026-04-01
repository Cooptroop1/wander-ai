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

  // Home
  const [homeCity, setHomeCity] = useState('');
  const [homeDeparture, setHomeDeparture] = useState('');
  const [homeReturn, setHomeReturn] = useState('');

  // Multi-city
  const [isMultiCity, setIsMultiCity] = useState(false);
  const [stops, setStops] = useState([{ city: placeName, departure: '', return: '' }]);

  const MAX_DAYS = 28;

  // Calculate total days
  const calculateTotalDays = () => {
    let total = 0;
    // Home stay
    if (homeDeparture && homeReturn) {
      const start = new Date(homeDeparture);
      const end = new Date(homeReturn);
      total += Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    }
    // All stops
    stops.forEach(stop => {
      if (stop.departure && stop.return) {
        const start = new Date(stop.departure);
        const end = new Date(stop.return);
        total += Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      }
    });
    return total;
  };

  const totalDays = calculateTotalDays();
  const isOverLimit = totalDays > MAX_DAYS;
  const isFormValid = homeCity.trim() !== '' && homeDeparture !== '' && homeReturn !== '' &&
                      (!isMultiCity || stops.every(s => s.city.trim() !== '' && s.departure !== '' && s.return !== '')) &&
                      !isOverLimit;

  const addStop = () => {
    if (stops.length >= 5) return;
    setStops([...stops, { city: '', departure: '', return: '' }]);
  };

  const updateStop = (index: number, field: string, value: string) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setStops(newStops);
  };

  const generateItinerary = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/grok-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeCity,
          homeDeparture,
          homeReturn,
          stops: isMultiCity ? stops : []
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
          {/* Home */}
          <div className="mb-8">
            <label className="block text-sm text-zinc-400 mb-2">✈️ Starting city (home) <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. London"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Departure <span className="text-red-400">*</span></label>
                <input type="date" value={homeDeparture} onChange={(e) => setHomeDeparture(e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Return <span className="text-red-400">*</span></label>
                <input type="date" value={homeReturn} onChange={(e) => setHomeReturn(e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
              </div>
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
            <label className="text-sm font-medium">I want a multi-city trip (add extra stops)</label>
          </div>

          {/* Extra stops */}
          {isMultiCity && (
            <div className="mb-8">
              {stops.map((stop, index) => (
                <div key={index} className="mb-6 border border-zinc-700 rounded-3xl p-6">
                  <h4 className="font-medium mb-3">Stop {index + 1}</h4>
                  <input
                    type="text"
                    placeholder="City name"
                    value={stop.city}
                    onChange={(e) => updateStop(index, 'city', e.target.value)}
                    className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 mb-4"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Departure</label>
                      <input type="date" value={stop.departure} onChange={(e) => updateStop(index, 'departure', e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Return</label>
                      <input type="date" value={stop.return} onChange={(e) => updateStop(index, 'return', e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
                    </div>
                  </div>
                </div>
              ))}

              {stops.length < 5 && (
                <button onClick={addStop} className="w-full py-4 border border-dashed border-zinc-600 text-zinc-400 hover:text-white rounded-3xl">
                  + Add another stop
                </button>
              )}
            </div>
          )}

          {/* Limit warning */}
          {isOverLimit && (
            <div className="bg-red-900/30 text-red-400 text-sm p-4 rounded-3xl mb-6">
              Trip is too long ({totalDays} days). Maximum allowed is {MAX_DAYS} days to protect Grok credits.
            </div>
          )}

          <button 
            type="button"
            onClick={generateItinerary}
            disabled={!isFormValid || loading}
            className="w-full py-8 bg-white text-black rounded-3xl font-semibold text-2xl hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "🤖 Asking Grok..." : "✨ Generate AI itinerary"}
          </button>
        </div>
      </div>
    </div>
  );
}
