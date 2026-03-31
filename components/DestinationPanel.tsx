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

  // Multi-city form
  const [stops, setStops] = useState([
    { city: placeName, departure: '', return: '' },   // Stop 1 (the map click)
    { city: '', departure: '', return: '' }           // Stop 2 (user can add)
  ]);

  const isFormValid = stops.every(stop => stop.city.trim() !== '' && stop.departure !== '' && stop.return !== '');

  const generateItinerary = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/grok-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stops }),
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
          <h2 className="text-3xl font-bold">🌍 Multi-City Trip</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-2xl">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {stops.map((stop, index) => (
            <div key={index} className="mb-8 border-b border-zinc-700 pb-8 last:border-none">
              <h3 className="font-semibold mb-3">Stop {index + 1}</h3>
              <input
                type="text"
                placeholder={`City ${index + 1} (e.g. Paris)`}
                value={stop.city}
                onChange={(e) => {
                  const newStops = [...stops];
                  newStops[index].city = e.target.value;
                  setStops(newStops);
                }}
                className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 mb-3"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Departure</label>
                  <input
                    type="date"
                    value={stop.departure}
                    onChange={(e) => {
                      const newStops = [...stops];
                      newStops[index].departure = e.target.value;
                      setStops(newStops);
                    }}
                    className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Return</label>
                  <input
                    type="date"
                    value={stop.return}
                    onChange={(e) => {
                      const newStops = [...stops];
                      newStops[index].return = e.target.value;
                      setStops(newStops);
                    }}
                    className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white"
                  />
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={generateItinerary}
            disabled={!isFormValid || loading}
            className="w-full py-8 bg-white text-black rounded-3xl font-semibold text-2xl hover:bg-emerald-400 transition-all disabled:opacity-50"
          >
            {loading ? "🤖 Asking Grok..." : "✨ Generate multi-city AI itinerary"}
          </button>
        </div>
      </div>
    </div>
  );
}
