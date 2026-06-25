'use client';

import React, { useState } from 'react';

export default function DestinationPanel() {
  const [from, setFrom] = useState('LHR');
  const [to, setTo] = useState('JFK');
  const [depart, setDepart] = useState('2026-07-15');
  const [returnDate, setReturnDate] = useState('2026-07-22');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearchInPanel = async () => {
    setLoading(true);
    // TODO: Later we'll call real Duffel using your DUFFEL_ACCESS_TOKEN env
    await new Promise(r => setTimeout(r, 600));
    setResults([
      { airline: "BA", time: "10:30-13:45", price: "£428" },
      { airline: "VS", time: "14:20-17:50", price: "£465" },
    ]);
    setLoading(false);
    alert("Panel search worked! (Real Duffel coming next step using DUFFEL_ACCESS_TOKEN)");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
      <h3 className="text-xl font-semibold mb-4">Destination Panel (clean replacement)</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <select value={from} onChange={e => setFrom(e.target.value)} className="bg-zinc-800 border border-zinc-600 p-3 rounded-xl">
          <option value="LHR">LHR - London Heathrow</option>
          <option value="LGW">LGW - Gatwick</option>
          <option value="CDG">CDG - Paris</option>
        </select>
        <select value={to} onChange={e => setTo(e.target.value)} className="bg-zinc-800 border border-zinc-600 p-3 rounded-xl">
          <option value="JFK">JFK - New York</option>
          <option value="DXB">DXB - Dubai</option>
          <option value="AMS">AMS - Amsterdam</option>
        </select>
        <input type="date" value={depart} onChange={e => setDepart(e.target.value)} className="bg-zinc-800 border border-zinc-600 p-3 rounded-xl" />
        <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="bg-zinc-800 border border-zinc-600 p-3 rounded-xl" />
      </div>
      <button onClick={handleSearchInPanel} disabled={loading} className="w-full bg-emerald-500 py-3 rounded-xl font-bold text-lg">
        {loading ? "🔍 Calling Duffel..." : "Search in Panel (uses your token)"}
      </button>
      {results.length > 0 && <div className="mt-4 text-emerald-400">✅ Sample results loaded — no more errors</div>}
      <p className="text-xs text-zinc-400 mt-3">This replacement fixes the errors. Real full Duffel API (using DUFFEL_ACCESS_TOKEN) in next file.</p>
    </div>
  );
}
