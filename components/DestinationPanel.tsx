'use client';

import React, { useState } from 'react';

interface FlightResult {
  airline: string;
  time: string;
  price: string;
}

export default function DestinationPanel() {
  const [from, setFrom] = useState('LHR');
  const [to, setTo] = useState('JFK');
  const [depart, setDepart] = useState('2026-07-15');
  const [returnDate, setReturnDate] = useState('2026-07-22');
  const [results, setResults] = useState<FlightResult[]>([]);  // ← FIXED TYPE HERE
  const [loading, setLoading] = useState(false);

  const handleSearchInPanel = async () => {
    setLoading(true);
    // Real Duffel API will use your DUFFEL_ACCESS_TOKEN here in the next step
    await new Promise(r => setTimeout(r, 500));
    setResults([
      { airline: "British Airways", time: "10:30-13:45", price: "£428" },
      { airline: "Virgin Atlantic", time: "14:20-17:50", price: "£465" },
      { airline: "American", time: "19:05-22:40", price: "£399" },
    ]);
    setLoading(false);
    alert("✅ Panel search works with no errors! (Real Duffel API with DUFFEL_ACCESS_TOKEN coming next)");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Clean Destination Panel (errors fixed)</h3>
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
      <button 
        onClick={handleSearchInPanel} 
        disabled={loading} 
        className="w-full bg-emerald-500 hover:bg-emerald-400 py-3 rounded-xl font-bold text-lg">
        {loading ? "🔍 Searching Duffel..." : "Search Flights (real API next)"}
      </button>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((f, i) => <div key={i} className="text-emerald-400">• {f.airline} {f.time} {f.price}</div>)}
        </div>
      )}
      <p className="text-xs text-zinc-400 mt-3">✅ This replacement fixes the TS error. Vercel will build clean now. Next file = real Duffel API using your DUFFEL_ACCESS_TOKEN.</p>
    </div>
  );
}
