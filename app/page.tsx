'use client';

import React, { useState } from 'react';

export default function DuffelCloneHome() {
  const [tripType, setTripType] = useState<'oneway' | 'round'>('round');
  const [homeAirport, setHomeAirport] = useState('LHR');
  const [destination, setDestination] = useState('JFK');
  const [departDate, setDepartDate] = useState('2026-07-15');
  const [returnDate, setReturnDate] = useState('2026-07-22');
  const [passengers, setPassengers] = useState(2);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const airports = [
    { code: 'LHR', name: 'London Heathrow (LHR)' },
    { code: 'LGW', name: 'London Gatwick (LGW)' },
    { code: 'CDG', name: 'Paris Charles de Gaulle (CDG)' },
    { code: 'JFK', name: 'New York JFK (JFK)' },
    { code: 'DXB', name: 'Dubai (DXB)' },
    { code: 'AMS', name: 'Amsterdam (AMS)' },
  ];

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {  // simulate API call
      setSearchResults([
        {
          id: 1,
          airline: "British Airways",
          departure: "10:30",
          arrival: "13:45",
          duration: "7h 15m",
          price: "£428",
          stops: "Direct",
        },
        {
          id: 2,
          airline: "Virgin Atlantic",
          departure: "14:20",
          arrival: "17:50",
          duration: "7h 30m",
          price: "£465",
          stops: "1 stop",
        },
        {
          id: 3,
          airline: "American Airlines",
          departure: "19:05",
          arrival: "22:40",
          duration: "7h 35m",
          price: "£399",
          stops: "Direct",
        },
      ]);
      setIsSearching(false);
      alert("✅ Search successful! (This uses mock data now. Next file will connect real Duffel API.)");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-700 bg-zinc-900">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-sky-400">✈️ Wander</div>
            <span className="text-xl font-semibold">Flights • Duffel Clone</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm hover:bg-zinc-800 rounded">My Trips</button>
            <button className="px-5 py-2 bg-white text-zinc-900 font-medium rounded">Login / Sign up</button>
          </div>
        </div>
      </nav>

      {/* Hero + Form */}
      <div className="max-w-4xl mx-auto pt-12 px-6">
        <h1 className="text-5xl font-bold text-center mb-8">
          Book flights the easy way
        </h1>

        {/* Trip type tabs */}
        <div className="flex justify-center gap-1 bg-zinc-800 rounded-full p-1 w-fit mx-auto mb-8">
          <button 
            onClick={() => setTripType('round')}
            className={`px-6 py-2 rounded-full font-medium ${tripType === 'round' ? 'bg-white text-zinc-900' : 'hover:bg-zinc-700'}`}>
            Round trip
          </button>
          <button 
            onClick={() => setTripType('oneway')}
            className={`px-6 py-2 rounded-full font-medium ${tripType === 'oneway' ? 'bg-white text-zinc-900' : 'hover:bg-zinc-700'}`}>
            One way
          </button>
        </div>

        {/* Main search card */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* Home Airport */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">FROM (Home airport)</label>
              <select 
                value={homeAirport}
                onChange={e => setHomeAirport(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-sky-400">
                {airports.map(a => (
                  <option key={a.code} value={a.code}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">TO (Destination)</label>
              <select 
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-sky-400">
                {airports.map(a => (
                  <option key={a.code} value={a.code}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Depart Date */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">DEPART</label>
              <input 
                type="date" 
                value={departDate}
                onChange={e => setDepartDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-lg" />
            </div>

            {/* Return Date */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">RETURN</label>
              <input 
                type="date" 
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-lg" />
            </div>

            {/* Passengers + Search */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">PASSENGERS</label>
              <select 
                value={passengers}
                onChange={e => setPassengers(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-lg mb-2">
                <option value={1}>1 passenger</option>
                <option value={2}>2 passengers</option>
                <option value={3}>3 passengers</option>
              </select>
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-semibold py-3 rounded-xl text-lg shadow-lg disabled:opacity-70">
                {isSearching ? "🔍 Searching with Duffel API..." : "🔍 SEARCH FLIGHTS"}
              </button>
            </div>
          </div>

          {/* Optional extras */}
          <div className="flex gap-3 text-sm mt-6 opacity-70">
            <button className="underline">Add cabin class ▼</button>
            <button className="underline">Swap airports ↔️</button>
          </div>
        </div>

        {/* Results section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(f => (
                <div key={f.id} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <div className="font-bold">{f.airline}</div>
                    <div className="text-xl">{f.departure} → {f.arrival} • {f.duration}</div>
                    <div className="text-zinc-400">{f.stops}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-400">{f.price}</div>
                    <button className="mt-2 px-8 py-2 bg-white text-zinc-900 font-medium rounded-xl hover:bg-zinc-100">
                      Select • Book
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-center text-sm text-zinc-500">✅ This is a fully working demo. Next file will connect real Duffel API + better inputs.</p>
            </div>
          ) : (
            <p className="text-zinc-400 text-center py-12">Click the big SEARCH FLIGHTS button above to see sample results (real Duffel results coming in next step)</p>
          )}
        </div>

        <div className="text-center text-xs text-zinc-500 mt-12">
          Built for you • Next step: layout + real Duffel integration • Reply with what you see / any errors
        </div>
      </div>
    </div>
  );
}
