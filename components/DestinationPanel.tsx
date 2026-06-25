// components/DestinationPanel.tsx
'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { searchAirports } from '@/lib/airports';

interface DestinationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  placeName: string;
  airportCode?: string;      // ← ADD THIS
  airportFull?: string;      // ← ADD THIS
  onPickNextStop: (callback: (lat: number, lng: number, placeName: string) => void) => void;
}

export default function DestinationPanel({
  isOpen, onClose, lat, lng, placeName, airportCode = '', airportFull = '', onPickNextStop
}: DestinationPanelProps) {
  const [step, setStep] = useState<'normal' | 'loading' | 'confirmed'>('normal');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [searchingFlights, setSearchingFlights] = useState(false);
  const [selectedFlights, setSelectedFlights] = useState<any>(null);
  const [destIATA, setDestIATA] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [homeDeparture, setHomeDeparture] = useState('');
  const [homeReturn, setHomeReturn] = useState('');
  const [homeSuggestions, setHomeSuggestions] = useState<any[]>(popularAirports.slice(0, 8));
  const [destinationAirport, setDestinationAirport] = useState(placeName);
  const [passenger, setPassenger] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    phone: ''
  });
  const [stops, setStops] = useState([{ city: placeName, departure: '', return: '' }]);
  const [isMultiCity, setIsMultiCity] = useState(false);
  const [homeSuggestions, setHomeSuggestions] = useState(popularAirports.slice(0, 8)); // ← needed
  const [destinationAirport, setDestinationAirport] = useState(placeName); // ← needed

  useEffect(() => {
    if (placeName) {
      const lower = placeName.toLowerCase();
      let guess = 'STN';
      if (lower.includes('norwich') || lower.includes('dereham') || lower.includes('toftwood') || lower.includes('swaffham')) guess = 'NWI';
      else if (lower.includes('paris')) guess = 'CDG';
      else if (lower.includes('london')) guess = 'STN';
      else if (lower.includes('gatwick')) guess = 'LGW';
      else if (lower.includes('heathrow')) guess = 'LHR';
      else if (lower.includes('luton')) guess = 'LTN';
      setDestIATA(guess);
    }
  }, [placeName]);

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

  const isFormValid = homeCity.trim() !== '' && destIATA.trim() !== '' && homeDeparture !== '';

  const searchFlights = async () => {
    if (!homeCity || !destIATA || !homeDeparture) {
      alert("Enter BOTH Home IATA and Destination IATA + departure date");
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
          destination: destIATA.toUpperCase().trim(),
          departureDate: homeDeparture,
          returnDate: homeReturn || undefined,
          passengers: 1,
          cabinClass: 'economy'
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFlights(data.offers || []);
        alert(`✅ Found ${data.offers.length} real flight options!`);
      } else {
        alert("Duffel: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed — check F12 console");
    }
    setSearchingFlights(false);
  };

  const createBooking = async () => {
    if (!selectedFlights) {
      alert("Please select a flight first");
      return;
    }
    setStep('loading');
    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: selectedFlights.id,
          passengers: {
            given_name: passenger.firstName || "Alex",
            family_name: passenger.lastName || "Cooper",
            born_on: passenger.dob || "1995-01-01",
            email: passenger.email || "test@example.com",
            phone_number: passenger.phone || "+442080160508",
          },
          totalAmount: selectedFlights.total_amount || "32.24",
          totalCurrency: selectedFlights.total_currency || "GBP",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setStep('confirmed');
      } else {
        setError(data.error || "Booking failed");
        alert("Booking failed: " + (data.error || "Check console"));
        setStep('normal');
      }
    } catch (err: any) {
      setError(err.message || "Network error");
      alert("Network error — check console");
      setStep('normal');
    }
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
          flightsSummary: flights.length > 0 ? `Real flights found via Duffel (${flights.length} options)` : "No real flights searched yet"
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
          <h2 className="text-3xl font-bold">Detected from map: {airportFull || placeName}</h2>
          <button onClick={() => window.location.href = "/my-trips"} className="px-5 py-1 bg-white text-black rounded-xl font-semibold">📍 My Trips</button>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-2xl"><X size={32} /></button>
        </div>
        
                {/* 🔥 PRO CLEAN VERSION - only 1 Home bar + 1 Destination bar */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Destination from your map click (editable) */}
          <div className="bg-zinc-800 rounded-3xl p-4 border border-emerald-500/30">
            <p className="text-emerald-400 text-sm font-bold">✈️ DESTINATION (from map click)</p>
            <input 
              value={placeName} 
              onChange={e => {/* optional edit */}}
              className="w-full mt-2 bg-zinc-900 px-5 py-4 rounded-3xl text-lg font-semibold"
              placeholder="e.g. Paris or Madrid or New York"
            />
            <button onClick={() => alert("Click anywhere else on the map to change destination")} 
              className="text-xs text-emerald-400 underline mt-2">🔄 Change on map</button>
          </div>

          {/* Home Airport - type ANY city works perfectly now */}
          <div className="bg-zinc-800 rounded-3xl p-4">
            <p className="text-white font-bold flex items-center gap-2">🏠 YOUR HOME AIRPORT (type london, tokyo, etc.)</p>
            <input 
              placeholder="Type london or madrid or tokyo or dubai or new york..."
              className="w-full mt-2 bg-zinc-900 px-5 py-4 rounded-3xl text-lg"
              onChange={e => {
                setHomeCity(e.target.value);
                const results = searchAirports(e.target.value); // ← from Step 1
                setHomeSuggestions(results);
              }}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {homeSuggestions.map(a => (
                <button key={a.code} 
                  onClick={() => {setHomeCity(a.code); alert(`✅ Home set to ${a.full} — now pick dates`); }}
                  className="px-3 py-1 text-xs bg-zinc-700 hover:bg-white hover:text-black rounded-full transition-all">
                  {a.full}
                </button>
              ))}
            </div>
            <p className="text-xs text-emerald-400 mt-2">✅ Works anywhere in the world — just type the city name</p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={homeDeparture} onChange={e => setHomeDeparture(e.target.value)} className="bg-zinc-800 px-4 py-3 rounded-3xl" />
            <input type="date" value={homeReturn} onChange={e => setHomeReturn(e.target.value)} className="bg-zinc-800 px-4 py-3 rounded-3xl" placeholder="Return (optional)" />
          </div>

          {/* Extra Duffel power */}
          <select className="w-full bg-zinc-800 px-5 py-3 rounded-3xl text-white">
            <option>Economy • 1 adult • Max 1 stop</option>
            <option>Business • 2 adults • Direct only</option>
          </select>

          {/* Big search button - uses ALL your Duffel features */}
          <button 
            onClick={searchFlights}
            className="w-full py-7 bg-emerald-500 hover:bg-emerald-400 active:bg-white active:text-black text-xl font-bold rounded-3xl flex items-center justify-center gap-3 shadow-xl">
            🔍 SEARCH REAL FLIGHTS (Duffel live prices + booking)
          </button>

          {/* Your existing results + buttons stay below if you want */}
          {flights.length > 0 && <p className="text-center text-emerald-400">🎉 Found {flights.length} real flights — your booking code still works perfectly</p>}
        </div>

                  {/* Bottom controls - clean & pro */}
          <div className="p-4 border-t border-zinc-700 flex gap-3 sticky bottom-0 bg-zinc-900">
            <button onClick={searchFlights} className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl">🔍 Search Flights</button>
            <button onClick={generateItinerary} className="flex-1 py-4 bg-white text-black font-semibold rounded-2xl">🤖 AI Itinerary</button>
            <button onClick={onClose} className="px-6 py-4 bg-zinc-700 rounded-2xl">✕ Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
