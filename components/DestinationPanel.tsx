// components/DestinationPanel.tsx
'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DestinationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  placeName: string;
  onPickNextStop: (callback: (lat: number, lng: number, placeName: string) => void) => void;
}

export default function DestinationPanel({ isOpen, onClose, lat, lng, placeName, onPickNextStop }: DestinationPanelProps) {
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
  const [passenger, setPassenger] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    phone: ''
  });
  const [stops, setStops] = useState([{ city: placeName, departure: '', return: '' }]);
  const [isMultiCity, setIsMultiCity] = useState(false);

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
    if (!selectedFlights || !passenger.firstName || !passenger.email) {
      alert("Select a flight + fill passenger details first");
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
            given_name: passenger.firstName,
            family_name: passenger.lastName,
            born_on: passenger.dob,
            email: passenger.email,
            phone_number: passenger.phone,
          },
          totalAmount: selectedFlights.total_amount || "249.00",
          totalCurrency: selectedFlights.total_currency || "GBP",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setStep('confirmed');
      } else {
        setError(data.error || "Booking failed");
        setStep('normal');
      }
    } catch (err: any) {
      setError(err.message || "Network error");
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
          <h2 className="text-3xl font-bold">🌍 {placeName} • Full Booking Flow</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-2xl"><X size={32} /></button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* All your original sections */}
          <div className="mb-8">
            <label className="block text-sm text-zinc-400 mb-2">✈️ Home airport IATA code <span className="text-red-400">*</span></label>
            <input type="text" placeholder="LHR" value={homeCity} onChange={(e) => setHomeCity(e.target.value.toUpperCase().trim())} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 font-mono tracking-widest" />
          </div>

          <div className="mb-8">
            <label className="block text-sm text-zinc-400 mb-2">✈️ Destination airport IATA code <span className="text-red-400">*</span></label>
            <input type="text" placeholder="NWI" value={destIATA} onChange={(e) => setDestIATA(e.target.value.toUpperCase().trim())} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 font-mono tracking-widest" />
            <p className="text-xs text-zinc-500 mt-1">Edit this to match the place you clicked on the map</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <input type="date" value={homeDeparture} onChange={(e) => setHomeDeparture(e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
            <input type="date" value={homeReturn} onChange={(e) => setHomeReturn(e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <input type="checkbox" checked={isMultiCity} onChange={(e) => { setIsMultiCity(e.target.checked); if (e.target.checked) addStop(); }} className="w-5 h-5 accent-emerald-500" />
            <label className="text-sm font-medium">I want a multi-city trip</label>
          </div>

          {isMultiCity && stops.map((stop, index) => (
            <div key={index} className="mb-6 border border-zinc-700 rounded-3xl p-6">
              <h4 className="font-medium mb-3">Stop {index + 1}</h4>
              <input type="text" placeholder="Airport IATA code" value={stop.city} onChange={(e) => updateStop(index, 'city', e.target.value.toUpperCase().trim())} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white placeholder:text-zinc-500 mb-4 font-mono tracking-widest" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={stop.departure} onChange={(e) => updateStop(index, 'departure', e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
                <input type="date" value={stop.return} onChange={(e) => updateStop(index, 'return', e.target.value)} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 text-white" />
              </div>
            </div>
          ))}

          <div className="mb-8 p-6 border border-emerald-500/30 bg-zinc-900/50 rounded-3xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">✈️ Cheap Flights Search (Duffel)</h3>
            <button onClick={searchFlights} disabled={searchingFlights || !homeCity || !homeDeparture} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 rounded-3xl font-semibold mb-6">
              {searchingFlights ? "Searching real flights..." : "🔍 Search Cheap Flights"}
            </button>
            {flights.length > 0 && (
              <div className="max-h-80 overflow-y-auto space-y-3">
                {flights.slice(0, 8).map((offer: any, i: number) => (
                  <div key={i} onClick={() => setSelectedFlights(selectedFlights?.id === offer.id ? null : offer)} className={`bg-zinc-800 p-4 rounded-2xl cursor-pointer hover:bg-zinc-700 border ${selectedFlights?.id === offer.id ? 'ring-2 ring-emerald-500' : 'border-zinc-700'}`}>
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-xl text-white">{offer.total_amount} {offer.total_currency}</div>
                      <button className="text-xs bg-emerald-600 px-3 py-1 rounded-full">Select</button>
                    </div>
                    <button onClick={createBooking} className="mt-3 w-full py-2 bg-green-600 hover:bg-green-500 rounded-2xl text-sm font-medium">✅ Confirm Booking Now</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedFlights && step !== 'confirmed' && (
            <div className="mb-8 p-6 bg-zinc-900/50 border border-zinc-700 rounded-3xl">
              <h3 className="font-semibold mb-4">Passenger Details for Booking</h3>
              <input type="text" placeholder="First Name" value={passenger.firstName} onChange={(e) => setPassenger({...passenger, firstName: e.target.value})} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 mb-3" />
              <input type="text" placeholder="Last Name" value={passenger.lastName} onChange={(e) => setPassenger({...passenger, lastName: e.target.value})} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 mb-3" />
              <input type="date" value={passenger.dob} onChange={(e) => setPassenger({...passenger, dob: e.target.value})} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 mb-3" />
              <input type="email" placeholder="Email" value={passenger.email} onChange={(e) => setPassenger({...passenger, email: e.target.value})} className="w-full bg-zinc-800 rounded-3xl px-5 py-4 mb-3" />
              <input type="tel" placeholder="Phone" value={passenger.phone} onChange={(e) => setPassenger({...passenger, phone: e.target.value})} className="w-full bg-zinc-800 rounded-3xl px-5 py-4" />
              <button onClick={createBooking} className="w-full mt-6 py-4 bg-green-600 hover:bg-green-500 rounded-3xl font-semibold text-lg">
                Confirm Booking on Duffel
              </button>
            </div>
          )}

          {step === 'loading' && <div className="text-center py-12 text-xl">⏳ Creating real booking with Duffel...</div>}

          {step === 'confirmed' && (
            <div className="p-8 bg-emerald-950 border border-emerald-500 rounded-3xl text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold">Booking Confirmed!</h2>
              <p className="font-mono text-xl mt-2">Order: {order?.id}</p>
              <p className="text-2xl font-bold mt-2">PNR: {order?.booking_reference || "RZPNX8"}</p>
              <div className="flex flex-col gap-3 mt-8">
                <button onClick={() => window.location.href = "/my-trips"} className="w-full py-4 bg-white text-black rounded-3xl font-semibold text-lg">
                  → Go to My Trips
                </button>
                <button onClick={onClose} className="w-full py-4 bg-zinc-700 hover:bg-zinc-600 rounded-3xl">
                  Close Panel
                </button>
              </div>
            </div>
          )}

          <button onClick={generateItinerary} disabled={!isFormValid || loading} className="w-full py-8 bg-white text-black rounded-3xl font-semibold text-2xl hover:bg-emerald-400 transition-all disabled:opacity-50">
            {loading ? "🤖 Asking Grok..." : "✨ Use selected flight + Generate full itinerary"}
          </button>

          {itinerary && (
            <div className="mt-8 p-6 bg-zinc-800 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4">Your Trip</h3>
              <div className="space-y-4 text-sm">
                <p><strong>Summary:</strong> {itinerary.summary}</p>
                {itinerary.flights && <p><strong>Flights:</strong> {itinerary.flights}</p>}
                {itinerary.hotels && <div><strong>Hotels:</strong><ul className="list-disc pl-5">{itinerary.hotels.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul></div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
