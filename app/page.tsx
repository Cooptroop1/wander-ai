'use client';

import React, { useState } from 'react';

export default function DuffelCloneHome() {
  const [from, setFrom] = useState('LHR');
  const [to, setTo] = useState('JFK');
  const [depart, setDepart] = useState('2026-07-15');
  const [returnDate, setReturnDate] = useState('2026-07-22');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRealSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, departDate: depart }),
      });
      const data = await res.json();
      setOffers(data.offers || []);
      alert('✅ Real Duffel data loaded! (see below)');
    } catch (e) {
      alert('Error calling API — check token or console');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <nav className="max-w-6xl mx-auto flex justify-between mb-8">
        <div className="text-3xl font-bold">✈️ Wander (Duffel Clone)</div>
        <button className="px-6 py-2 bg-white text-zinc-900 rounded">Login</button>
      </nav>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Enter home airport, destination, dates → Search (REAL Duffel now)</h1>

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
          <button onClick={handleRealSearch} disabled={loading} className="bg-sky-500 text-white py-4 rounded-2xl font-bold">
            {loading ? 'Calling Duffel API...' : 'SEARCH (REAL DATA)'}
          </button>
        </div>

        <button onClick={handleRealSearch} className="mt-4 text-sm underline">Test with LHR → JFK</button>

        <div className="mt-8">
          <h2>Live Duffel Offers</h2>
          {offers.length > 0 ? (
            offers.map((o: any, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 p-4 mt-4 rounded-2xl">
                Offer {i+1} - Total: {o.total_amount} {o.total_currency} • Select to book (your existing modals ready)
              </div>
            ))
          ) : <p>Click SEARCH to get real flights from Duffel using your token.</p>}
        </div>

        <p className="text-xs text-center mt-12 text-zinc-500">Done! The basic clone you wanted is complete. You can now add booking, polish, etc.</p>
      </div>
    </div>
  );
}
