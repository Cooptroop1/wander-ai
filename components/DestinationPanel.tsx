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
  airportCode?: string;
  airportFull?: string;
  onPickNextStop: (callback: (lat: number, lng: number, placeName: string) => void) => void;
}

export default function DestinationPanel({
  isOpen,
  onClose,
  lat,
  lng,
  placeName,
  airportCode = '',
  airportFull = '',
  onPickNextStop
}: DestinationPanelProps) {
  const [step, setStep] = useState<'normal' | 'loading' | 'confirmed'>('normal');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [searchingFlights, setSearchingFlights] = useState(false);
  const [selectedFlights, setSelectedFlights] = useState<any>(null);
  const [destIATA, setDestIATA] = useState(airportCode || 'LHR');
  const [homeCity, setHomeCity] = useState('');
  const [homeDeparture, setHomeDeparture] = useState('');
  const [homeReturn, setHomeReturn] = useState('');
  const [passenger, setPassenger] = useState({
    firstName: 'Alex',
    lastName: 'Cooper',
    dob: '1995-01-01',
    email: 'cooper48888@gmail.com',
    phone: '+442080160508'
  });
  const [stops, setStops] = useState([{ city: placeName || 'London', departure: '', return: '' }]);
  const [isMultiCity, setIsMultiCity] = useState(false);

  useEffect(() => {
    if (airportCode) setDestIATA(airportCode);
    else if (placeName) {
      const lower = placeName.toLowerCase();
      let guess = 'STN';
      if (lower.includes('paris')) guess = 'CDG';
      else if (lower.includes('madrid')) guess = 'MAD';
      else if (lower.includes('tokyo') || lower.includes('japan')) guess = 'HND';
      else if (lower.includes('new york')) guess = 'JFK';
      else if (lower.includes('sydney')) guess = 'SYD';
      setDestIATA(guess);
    }
  }, [placeName, airportCode]);

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
        const offers = data.offers || [];
        setFlights(offers);
        alert(`Found ${offers.length} real flight options from Duffel!`);
      } else {
        alert("Duffel: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed — check F12 console");
    }
    setSearchingFlights(false);
  };

  const selectFlight = (flight: any) => {
    setSelectedFlights(flight);
    alert(`Selected: ${flight.airline || 'Duffel'} flight - Ready to book`);
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
            given_name: passenger.firstName,
            family_name: passenger.lastName,
            born_on: passenger.dob,
            email: passenger.email,
            phone_number: passenger.phone,
          },
          totalAmount: selectedFlights.total_amount || "324",
          totalCurrency: selectedFlights.total_currency || "GBP",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setStep('confirmed');
        alert("Booking created! Check My Trips");
      } else {
        alert("Booking failed: " + (data.error || "Check console"));
        setStep('normal');
      }
    } catch (err: any) {
      alert("Network error");
      setStep('normal');
    }
  };

  const generateItinerary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/grok-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeCity,
          homeDeparture,
          homeReturn,
          placeName: airportFull || placeName,
          flightsSummary: flights.length > 0 ? `Real flights found via Duffel (${flights.length} options)` : "No real flights searched yet"
        }),
      });
      const data = await res.json();
      setItinerary(data);
      alert("Itinerary generated!");
    } catch (err) {
      alert('Error generating itinerary — check console');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950 z-[9999] flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        <div className="px-6 py-5 border-b border-zinc-700 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Destination • {airportFull || placeName}</h2>
          <button onClick={() => window.location.href = "/my-trips"} className="px-5 py-1 bg-white text-black rounded-xl font-semibold">My Trips</button>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-2xl"><X size={32} /></button>
        </div>

        {/* YOUR REQUESTED BLOCK - placed here */}
        <div className="px-6 pt-4 pb-3 border-b border-zinc-700">
          <div className="text-xl font-semibold">
            {airportFull || placeName || "London Heathrow (LHR)"}
          </div>
          <input 
            defaultValue={airportCode || "Search airport..."} 
            className="w-full mt-3 bg-zinc-800 border border-zinc-700 focus:border-white text-white px-5 py-4 rounded-3xl text-lg font-mono"
            placeholder="e.g. MAD, HND, JFK or type London"
          />
          <p className="text-xs text-emerald-500 mt-1">🗺️ Nearest airport from your map click • Typing London/Madrid/Tokyo still works</p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Home airport input */}
          <input 
            placeholder="Home city or code (London, MAD, Tokyo...)" 
            value={homeCity}
            onChange={e => setHomeCity(e.target.value)}
            className="w-full bg-zinc-800 px-5 py-4 rounded-3xl"
          />

          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={homeDeparture} onChange={e => setHomeDeparture(e.target.value)} className="bg-zinc-800 px-5 py-4 rounded-3xl" />
            <input type="date" value={homeReturn} onChange={e => setHomeReturn(e.target.value)} className="bg-zinc-800 px-5 py-4 rounded-3xl" />
          </div>

          <button 
            onClick={searchFlights}
            disabled={searchingFlights}
            className="w-full py-4 bg-emerald-600 font-bold text-lg rounded-3xl"
          >
            {searchingFlights ? "Searching..." : "🔍 Search Real Flights"}
          </button>

          {/* FLIGHTS LIST NOW SHOWS HERE */}
          {flights.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold">Available Flights ({flights.length})</h3>
              {flights.map((f, i) => (
                <div key={i} className="bg-zinc-800 p-4 rounded-3xl flex justify-between items-center">
                  <div>
                    <div>{f.airline || 'British Airways'} • {f.flight || 'BA327'}</div>
                    <div className="text-sm text-zinc-400">£{f.total_amount || '324'} • {f.duration || '3h 15m'}</div>
                  </div>
                  <button 
                    onClick={() => { setSelectedFlights(f); selectFlight(f); }}
                    className="px-6 py-2 bg-white text-black font-semibold rounded-xl"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={generateItinerary} className="w-full py-3 bg-zinc-700 rounded-3xl">Generate Grok Itinerary</button>

          <button 
            onClick={createBooking}
            className="w-full py-4 bg-white text-black font-bold text-xl rounded-3xl"
          >
            {step === 'loading' ? "Booking..." : "Confirm Booking + Save to My Trips"}
          </button>

          <button onClick={addStop} className="text-blue-400 underline">+ Add another city stop</button>
          <button onClick={onClose} className="w-full text-zinc-400">Close</button>
        </div>
      </div>
    </div>
  );
}
