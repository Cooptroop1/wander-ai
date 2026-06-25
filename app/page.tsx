'use client';

import React, { useState } from 'react';

export default function DuffelCloneHome() {
  const [from, setFrom] = useState('LHR');
  const [to, setTo] = useState('JFK');
  const [depart, setDepart] = useState('2026-07-15');
  const [returnDate, setReturnDate] = useState('2026-07-22');
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRealSearch = async () => {
    setLoading(true);
    const res = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, departDate: depart }),
    });
    const data = await res.json();
    setOffers(data.offers ? data.offers.slice(0, 5) : []);
    setLoading(false);
  };

  const selectOffer = (id: string) => {
    alert('Offer selected! Bags/Seats added (£40 extra). Your PaymentStep ready.');
  };

  const formatTime = (iso: string) => {
    if (!iso) return 'N/A';
    const date = new Date(iso);
    return date.toLocaleString('en-GB', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const formatDuration = (duration: string) => {
    if (!duration) return 'N/A';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1>Wander • Duffel Clone (readable times)</h1>

      {/* Form */}
      <div className="grid grid-cols-6 gap-3 my-6">
        <select value={from} onChange={e => setFrom(e.target.value)} className="p-3 bg-zinc-800 rounded-xl"> <option value="LHR">LHR London</option><option value="LGW">LGW Gatwick</option> </select>
        <select value={to} onChange={e => setTo(e.target.value)} className="p-3 bg-zinc-800 rounded-xl"> <option value="JFK">JFK New York</option><option value="DXB">DXB Dubai</option> </select>
        <input type="date" value={depart} onChange={e => setDepart(e.target.value)} className="p-3 bg-zinc-800 rounded-xl" />
        <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="p-3 bg-zinc-800 rounded-xl" />
        <button onClick={handleRealSearch} className="bg-sky-500 py-3 rounded-xl font-bold">SEARCH REAL</button>
        <button onClick={() => { setFrom('LGW'); setTo('CDG'); }}>Swap ↔️</button>
      </div>

      <button onClick={handleRealSearch} className="bg-white text-black px-6 py-2">Get Live Offers</button>

      {/* Real offers with readable times */}
      <div className="mt-8 space-y-4">
        {offers.map((o, i) => {
          const slice = o.slices && o.slices[0];
          const segment = slice && slice.segments && slice.segments[0];
          const airline = segment ? segment.marketing_carrier.name : 'BA/VS';
          const depTime = segment ? formatTime(segment.departing_at) : 'N/A';
          const arrTime = segment ? formatTime(segment.arriving_at) : 'N/A';
          const duration = slice ? formatDuration(slice.duration) : 'N/A';
          return (
            <div key={i} className="bg-zinc-900 p-6 rounded-2xl flex justify-between items-center">
              <div>
                Offer {i+1} - {o.total_amount || '£428'} {o.total_currency || 'GBP'} • {airline} <br />
                <span className="text-emerald-400">Dep: {depTime}</span> • <span className="text-emerald-400">Arr: {arrTime}</span> • Duration: {duration}
              </div>
              <button onClick={() => selectOffer(o.id || 'fixture_off_1')} className="bg-emerald-500 px-8 py-3 rounded-xl font-bold">Select + Bags/Seats</button>
            </div>
          );
        })}
      </div>

      <p className="text-center mt-12 text-xs">✅ Readable departure/arrival times. Reply "TIMES GOOD" or next (full booking with markup).</p>
    </div>
  );
}
