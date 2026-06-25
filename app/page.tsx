'use client';

import React, { useState } from 'react';

export default function DuffelCloneHome() {
  const [from, setFrom] = useState('LHR');
  const [to, setTo] = useState('JFK');
  const [depart, setDepart] = useState('2026-07-15');
  const [returnDate, setReturnDate] = useState('2026-07-22');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    // Mock for now - replace with real API call
    setTimeout(() => {
      setResults([
        { airline: "BA", time: "10:30-13:45", price: "£428" },
        { airline: "VS", time: "14:20-17:50", price: "£465" },
        { airline: "KL", time: "09:15-12:30", price: "£399" },
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <nav className="max-w-6xl mx-auto flex justify-between mb-8">
        <div className="text-3xl font-bold">✈️ Wander (Duffel Clone)</div>
        <button className="px-6 py-2 bg-white text-zinc-900 rounded">Login</button>
      </nav>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Enter home airport, destination, dates → Search</h1>

        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <select value={from} onChange={e => setFrom(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl">
            <option value="LHR">LHR - London Heathrow (Home)</option>
            <option value="LGW">LGW - Gatwick</option>
            <option value="CDG">CDG - Paris</option>
          </select>
          <select value={to} onChange={e => setTo(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl">
            <option value="JFK">JFK - New York</option>
            <option value="DXB">DXB - Dubai</option>
          </select>
          <input type="date" value={depart} onChange={e => setDepart(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />
          <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />
          <button onClick={handleSearch} disabled={loading} className="bg-sky-500 text-white py-4 rounded-2xl font-bold">
            {loading ? 'Searching...' : 'SEARCH FLIGHTS'}
          </button>
        </div>

        <div className="mt-8">
          <h2>Search Results</h2>
          {results.length > 0 ? (
            results.map((r, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 p-4 mt-4 rounded-2xl">
                {r.airline} {r.time} - {r.price} • Select to book
              </div>
            ))
          ) : <p>Enter airports and dates then search.</p>}
        </div>
      </div>
    </div>
  );
}
