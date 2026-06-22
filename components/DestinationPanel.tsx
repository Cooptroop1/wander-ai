'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface DestinationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  placeName: string;
  onPickNextStop: (callback: (lat: number, lng: number, placeName: string) => void) => void;
}

export default function DestinationPanel({ isOpen, onClose, lat, lng, placeName, onPickNextStop }: DestinationPanelProps) {
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Flight search states
  const [flights, setFlights] = useState<any[]>([]);
  const [searchingFlights, setSearchingFlights] = useState(false);
  const [selectedFlights, setSelectedFlights] = useState<any>(null);

  // Home
  const [homeCity, setHomeCity] = useState('');
  const [homeDeparture, setHomeDeparture] = useState('');
  const [homeReturn, setHomeReturn] = useState('');

  // Stops (Stop 1 is the clicked place)
  const [stops, setStops] = useState([{ city: placeName, departure: '', return: '' }]);
  const [isMultiCity, setIsMultiCity] = useState(false);

  const addStop = () => {
    onPickNextStop((newLat, newLng, newPlaceName) => {
      const newStops = [...stops];
      newStops.push({ city: newPlaceName, departure: '', return: '' });
      setStops(newStops);
    });
  };

  const updateStop = (index: number, field: string, value: string) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setStops(newStops);
  };

  const isFormValid = homeCity.trim() !== '' && homeDeparture !== '' && homeReturn !== '' &&
                      stops.every(s => s.city.trim() !== '' && s.departure !== '' && s.return !== '');

  const searchFlights = async () => {
    if (!homeCity || !homeDeparture) {
      alert("Please enter home airport IATA code and departure date");
      return;
    }
    
    setSearchingFlights(true);
    setFlights([]);
    
    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: homeCity.toUpperCase().trim(),
          destination: placeName.toUpperCase().trim(),
          departureDate: homeDeparture,
          returnDate: homeReturn || undefined,
          passengers: 1,
          cabinClass: 'economy'
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFlights(data.offers || []);
        if (data.offers?.length === 0) {
          alert("No flights found for these dates. Try different dates or airports.");
        }
      } else {
        alert("Search error: " + (data.error || "Unknown error from Duffel"));
      }
    } catch (err) {
      console.error(err);
      alert("Flight search failed — check F12 console");
    }
    setSearchingFlights(false);
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
          placeName,
          flightsSummary: flights.length > 0 
            ? `Real flights found via Duffel (${flights.length} options)` 
            : "No real flights searched yet"
        }),
      });

      if (!res.ok) throw new Error('Grok error');
      const data = await res.json();
      setItinerary(data);
    } catch (err) {
      alert('Error generating itinerary — check console');
      console.error(err);
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
          {/* Home Airport - IATA focused */}
          <div className="mb-8">
            <label className="block text-sm text-zinc-400 mb-2">
              ✈️ Home airport IATA code <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. LHR, STN, NWI, LGW, LTN"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value.toUpperCase().trim())}
              className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 mb-2 font-mono tracking-widest text-lg"
            />
            <p className="text-xs text-zinc-500 mb-4">
              Common: <span className="font-mono">LHR</span> (Heathrow) • <span className="font-mono">STN</span> (Stansted) • <span className="font-mono">NWI</span> (Norwich) • <span className="font-mono">LGW</span> (Gatwick) • <span className="font-mono">LTN</span> (Luton)
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Departure <span className="text-red-400">*</span></label>
                <input type="date" value={homeDeparture} onChange={(e) => setHomeDeparture(e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Return</label>
                <input type="date" value={homeReturn} onChange={(e) => setHomeReturn(e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
              </div>
            </div>
          </div>

          {/* Multi-city checkbox */}
          <div className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              checked={isMultiCity}
              onChange={(e) => {
                setIsMultiCity(e.target.checked);
                if (e.target.checked) addStop();
              }}
              className="w-5 h-5 accent-emerald-500"
            />
            <label className="text-sm font-medium">I want a multi-city trip</label>
          </div>

          {/* Stops */}
          {isMultiCity && (
            <div className="mb-8">
              {stops.map((stop, index) => (
                <div key={index} className="mb-6 border border-zinc-700 rounded-3xl p-6">
                  <h4 className="font-medium mb-3">Stop {index + 1}</h4>
                  <input
                    type="text"
                    placeholder="Airport IATA code (e.g. NWI, STN)"
                    value={stop.city}
                    onChange={(e) => updateStop(index, 'city', e.target.value.toUpperCase().trim())}
                    className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 mb-4 font-mono tracking-widest"
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
            </div>
          )}

          {/* === FLIGHT SEARCH SECTION === */}
          <div className="mb-8 p-6 border border-emerald-500/30 bg-zinc-900/50 rounded-3xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ✈️ Cheap Flights Search (Duffel)
            </h3>
            
            <button 
              onClick={searchFlights}
              disabled={searchingFlights || !homeCity || !homeDeparture}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 rounded-3xl font-semibold mb-6 transition-all"
            >
              {searchingFlights ? "Searching real flights..." : "🔍 Search Cheap Flights"}
            </button>

            {flights.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-3">
                <p className="text-sm text-emerald-400">Top options found:</p>
                {flights.slice(0, 6).map((offer: any, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedFlights(offer)}
                    className={`bg-zinc-800 p-4 rounded-2xl text-sm cursor-pointer hover:bg-zinc-700 transition-all ${selectedFlights?.id === offer.id ? 'ring-2 ring-emerald-500' : ''}`}
                  >
                    <div className="font-medium">{offer.total_amount} {offer.total_currency}</div>
                    <div className="text-zinc-400 text-xs">
                      {offer.slices?.[0]?.segments?.[0]?.operating_carrier?.name || 'Airline'} • {offer.slices?.[0]?.duration}
                    </div>
                    {selectedFlights?.id === offer.id && (
                      <div className="text-emerald-400 text-xs mt-1">✓ Selected for itinerary</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generate Itinerary Button */}
          <button 
            type="button"
            onClick={generateItinerary}
            disabled={!isFormValid || loading}
            className="w-full py-8 bg-white text-black rounded-3xl font-semibold text-2xl hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "🤖 Asking Grok..." : "✨ Generate AI itinerary"}
          </button>

          {/* Itinerary Results */}
          {itinerary && (
            <div className="mt-8 p-6 bg-zinc-800 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4">Your Trip</h3>
              <div className="space-y-4 text-sm">
                <p><strong>Summary:</strong> {itinerary.summary}</p>
                {itinerary.flights && <p><strong>Flights:</strong> {itinerary.flights}</p>}
                {itinerary.hotels && (
                  <div>
                    <strong>Hotels:</strong>
                    <ul className="list-disc pl-5 mt-1">
                      {itinerary.hotels.map((h: string, i: number) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
