'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { searchAirports, popularAirports } from '@/lib/airports';
import dynamic from 'next/dynamic';

// Robust import for DuffelAncillaries
const DuffelAncillaries = dynamic(
  () =>
    import('@duffel/components').then((mod: any) => {
      return mod.DuffelAncillaries || mod.default || mod;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 bg-zinc-900 rounded-2xl text-center text-zinc-400 border border-zinc-700">
        Loading Duffel seat map &amp; baggage selector...
      </div>
    ),
  }
);

// Proper types for Duffel passenger (fixes the TypeScript error)
interface Passenger {
  id?: string;
  given_name: string;
  family_name: string;
  title: 'mr' | 'mrs' | 'ms' | 'miss' | 'dr' | 'prof';
  gender: 'm' | 'f' | 'x';
  born_on: string;
  email: string;
  phone_number: string;
}

interface DestinationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  placeName: string;
  airportCode?: string;
  airportFull?: string;
  onPickNextStop: any;
}

export default function DestinationPanel({
  isOpen,
  onClose,
  lat,
  lng,
  placeName,
  airportCode = '',
  airportFull = '',
  onPickNextStop,
}: DestinationPanelProps) {
  const [homeCity, setHomeCity] = useState('');
  const [homeDeparture, setHomeDeparture] = useState('');
  const [homeReturn, setHomeReturn] = useState('');
  const [destIATA, setDestIATA] = useState(airportCode || 'LHR');
  const [homeSuggestions, setHomeSuggestions] = useState(popularAirports.slice(0, 8));

  const [flights, setFlights] = useState<any[]>([]);
  const [searchingFlights, setSearchingFlights] = useState(false);

  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [ancillaryPayload, setAncillaryPayload] = useState<any>(null);

  // Typed passenger state (this fixes the TS error)
  const [passenger, setPassenger] = useState<Passenger>({
    given_name: 'James',
    family_name: 'Cooper',
    title: 'mr',
    gender: 'm',
    born_on: '1990-05-15',
    email: 'james.cooper@example.com',
    phone_number: '+447700900123',
  });

  const searchFlights = async () => {
    if (!homeCity || !homeDeparture) {
      alert('Please enter your home airport and departure date');
      return;
    }

    setSearchingFlights(true);
    setFlights([]);
    setSelectedOffer(null);
    setAncillaryPayload(null);

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
          cabinClass: 'economy',
        }),
      });

      const data = await res.json();

      if (data.success && data.offers?.length > 0) {
        setFlights(data.offers);
      } else {
        alert('No flights found or API error. Check console.');
        console.error(data);
      }
    } catch (e) {
      console.error(e);
      alert('Error searching flights. Check console.');
    }

    setSearchingFlights(false);
  };

  const handleSelectOffer = (offer: any) => {
    setSelectedOffer(offer);
    setAncillaryPayload(null);

    setTimeout(() => {
      const el = document.getElementById('customize-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handlePassengerChange = (field: keyof Passenger, value: string) => {
    setPassenger((prev) => ({ ...prev, [field]: value as any }));
  };

  const handleAncillariesReady = (data: any, metadata: any) => {
    console.log('Duffel ancillaries ready:', { data, metadata });
    setAncillaryPayload(data);
  };

  const handleConfirmBooking = async () => {
    if (!selectedOffer) {
      alert('No flight selected');
      return;
    }
    if (!ancillaryPayload) {
      alert('Please finish selecting seats and/or bags first.');
      return;
    }

    console.log('=== FINAL DUFFEL ORDER PAYLOAD ===');
    console.log(JSON.stringify(ancillaryPayload, null, 2));

    alert(
      '✅ Full booking payload logged to console.\n\nSend this to your backend /api/flights/create-order route.'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950 z-[9999] flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-700 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-3xl font-bold">🗺️ {airportFull || placeName}</h2>
            <p className="text-sm text-zinc-400">Plan your trip from here</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-2xl">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          {/* Search Form */}
          <div className="space-y-6">
            <div>
              <p className="font-semibold text-sm mb-1.5 text-emerald-400">DESTINATION</p>
              <div className="bg-zinc-800 px-5 py-4 rounded-3xl text-lg font-medium">
                {placeName} {airportCode && `(${airportCode})`}
              </div>
            </div>

            <div>
              <p className="font-semibold text-sm mb-1.5">HOME AIRPORT</p>
              <input
                placeholder="e.g. London, Manchester..."
                className="w-full bg-zinc-800 px-5 py-4 rounded-3xl text-lg"
                value={homeCity}
                onChange={(e) => {
                  setHomeCity(e.target.value);
                  setHomeSuggestions(searchAirports(e.target.value));
                }}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {homeSuggestions.map((a) => (
                  <button
                    key={a.code}
                    onClick={() => setHomeCity(a.code)}
                    className="px-4 py-1.5 bg-zinc-700 hover:bg-emerald-600 rounded-2xl text-sm"
                  >
                    {a.full} ({a.code})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm mb-1.5">DEPARTURE DATE</p>
                <input
                  type="date"
                  className="w-full bg-zinc-800 px-5 py-4 rounded-3xl text-lg"
                  value={homeDeparture}
                  onChange={(e) => setHomeDeparture(e.target.value)}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1.5">RETURN DATE (optional)</p>
                <input
                  type="date"
                  className="w-full bg-zinc-800 px-5 py-4 rounded-3xl text-lg"
                  value={homeReturn}
                  onChange={(e) => setHomeReturn(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={searchFlights}
              disabled={searchingFlights}
              className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 text-xl font-bold rounded-3xl"
            >
              {searchingFlights ? 'Searching Duffel...' : '🔍 SEARCH REAL FLIGHTS WITH DUFFEL'}
            </button>
          </div>

          {/* Flight Results */}
          {flights.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl">Choose a flight</h3>
                <span className="text-sm text-emerald-400">{flights.length} offers found</span>
              </div>

              <div className="space-y-3">
                {flights.slice(0, 8).map((offer: any, index: number) => {
                  const firstSlice = offer.slices?.[0];
                  const firstSegment = firstSlice?.segments?.[0];

                  return (
                    <div
                      key={index}
                      onClick={() => handleSelectOffer(offer)}
                      className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-emerald-500 p-5 rounded-3xl cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-3xl font-bold tracking-tight">
                            {offer.total_amount} {offer.total_currency}
                          </div>
                          <div className="text-sm text-zinc-400 mt-0.5">
                            {firstSegment?.marketing_airline?.name || 'Airline'} •{' '}
                            {firstSlice?.segments?.length || 1} segment(s)
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOffer(offer);
                          }}
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold rounded-2xl text-sm"
                        >
                          Choose &amp; add extras →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customize Section */}
          {selectedOffer && (
            <div id="customize-section" className="bg-zinc-800 rounded-3xl p-6 space-y-6 border border-emerald-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-2xl">Customize this flight</h3>
                  <p className="text-emerald-400 text-sm">Add seats &amp; extra bags with Duffel</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOffer(null);
                    setAncillaryPayload(null);
                  }}
                  className="text-sm px-4 py-2 bg-zinc-700 rounded-2xl hover:bg-zinc-600"
                >
                  Change flight
                </button>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-4 text-sm">
                <div className="font-mono text-emerald-400 text-xs mb-1">SELECTED OFFER</div>
                <div className="font-bold text-xl">
                  {selectedOffer.total_amount} {selectedOffer.total_currency}
                </div>
              </div>

              {/* Passenger Form */}
              <div>
                <p className="font-semibold mb-3 text-sm">PASSENGER DETAILS</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="First name"
                    value={passenger.given_name}
                    onChange={(e) => handlePassengerChange('given_name', e.target.value)}
                    className="bg-zinc-900 px-5 py-3.5 rounded-2xl"
                  />
                  <input
                    placeholder="Last name"
                    value={passenger.family_name}
                    onChange={(e) => handlePassengerChange('family_name', e.target.value)}
                    className="bg-zinc-900 px-5 py-3.5 rounded-2xl"
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    value={passenger.email}
                    onChange={(e) => handlePassengerChange('email', e.target.value)}
                    className="bg-zinc-900 px-5 py-3.5 rounded-2xl"
                  />
                  <input
                    placeholder="Phone"
                    value={passenger.phone_number}
                    onChange={(e) => handlePassengerChange('phone_number', e.target.value)}
                    className="bg-zinc-900 px-5 py-3.5 rounded-2xl"
                  />
                  <input
                    type="date"
                    value={passenger.born_on}
                    onChange={(e) => handlePassengerChange('born_on', e.target.value)}
                    className="bg-zinc-900 px-5 py-3.5 rounded-2xl"
                  />
                  <select
                    value={passenger.title}
                    onChange={(e) => handlePassengerChange('title', e.target.value)}
                    className="bg-zinc-900 px-5 py-3.5 rounded-2xl"
                  >
                    <option value="mr">Mr</option>
                    <option value="mrs">Mrs</option>
                    <option value="ms">Ms</option>
                    <option value="dr">Dr</option>
                  </select>
                </div>
              </div>

              {/* Duffel Ancillaries Component */}
              <div>
                <p className="font-semibold mb-3 text-sm text-emerald-400">SEATS &amp; EXTRA BAGGAGE</p>

                <DuffelAncillaries
                  key={selectedOffer.id}
                  debug={true}
                  offer={selectedOffer}
                  services={['bags', 'seats']}
                  passengers={[
                    {
                      id: 'pas_1',
                      ...(passenger as any), // Safe cast to satisfy strict Duffel types
                    },
                  ]}
                  onPayloadReady={handleAncillariesReady}
                  markup={{
                    bags: { amount: 5, rate: 0.1 },
                    seats: { amount: 0, rate: 0.05 },
                  }}
                />
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={!ancillaryPayload}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 text-xl font-bold rounded-3xl"
              >
                {ancillaryPayload
                  ? '✅ Confirm Booking with Chosen Seats & Bags'
                  : 'Select seats and/or bags above to continue'}
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-700 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-4 bg-zinc-700 hover:bg-zinc-600 rounded-2xl font-semibold">
            Close
          </button>
          <button
            onClick={() => alert('Wire this button to your AI itinerary function')}
            className="flex-1 py-4 bg-white text-black font-bold rounded-2xl"
          >
            ✨ Generate AI Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}
