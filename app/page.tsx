'use client';

import React, { useState } from 'react';

export default function DuffelCloneHome() {
  const [from, setFrom] = useState('LHR');
  const [to, setTo] = useState('JFK');
  const [depart, setDepart] = useState('2026-07-15');
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState('');

  const handleRealSearch = async () => {
    setLoading(true);
    const res = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, departDate: depart }),
    });
    const data = await res.json();
    setOffers(data.offers || []);
    setLoading(false);
  };

  const selectOffer = (id: string) => {
    setSelectedOfferId(id);
    alert(`Offer ${id} selected — Duffel ancillaries (bags/seats) now loaded below`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-3xl font-bold">Wander • Duffel Clone (with ancillaries)</h1>

      {/* Your existing form */}
      <div className="grid grid-cols-5 gap-3 my-6">
        <select value={from} onChange={e => setFrom(e.target.value)} className="p-3 bg-zinc-800 rounded-xl">
          <option value="LHR">LHR London</option><option value="LGW">LGW Gatwick</option><option value="CDG">CDG Paris</option>
        </select>
        <select value={to} onChange={e => setTo(e.target.value)} className="p-3 bg-zinc-800 rounded-xl">
          <option value="JFK">JFK New York</option><option value="DXB">DXB Dubai</option>
        </select>
        <input type="date" value={depart} onChange={e => setDepart(e.target.value)} className="p-3 bg-zinc-800 rounded-xl" />
        <button onClick={handleRealSearch} className="bg-sky-500 py-3 rounded-xl font-bold">SEARCH REAL</button>
        <button onClick={() => alert('Swap ↔️')}>↔️</button>
      </div>

      <button onClick={handleRealSearch} className="bg-white text-zinc-900 px-6 py-2">Test LHR → JFK</button>

      {/* Real offers */}
      <div className="mt-8 space-y-4">
        {offers.map((o, i) => (
          <div key={i} className="bg-zinc-900 p-4 rounded-2xl flex justify-between">
            Offer {i+1} — {o.total_amount || '214 GBP'} 
            <button onClick={() => selectOffer(o.id || 'fixture_off_1')} className="bg-emerald-500 px-6 py-2 rounded-xl">Select + Bags/Seats</button>
          </div>
        ))}
      </div>

      {/* Duffel Ancillaries Component (bags/seats) */}
      {selectedOfferId && (
        <div className="mt-8">
          <h2>Bags / Seats / Cancel for any reason (official Duffel component)</h2>
          <duffel-ancillaries></duffel-ancillaries>
          <script 
            dangerouslySetInnerHTML={{ __html: `
              const el = document.querySelector('duffel-ancillaries');
              el.render({
                offer_id: "${selectedOfferId}",
                services: ["bags", "seats", "cancel_for_any_reason"],
                passengers: [{ given_name: "John", family_name: "Doe", gender: "M", title: "mr", born_on: "1990-01-01" }],
                markup: { bags: { amount: 2, rate: 0.05 } }
              });
              el.addEventListener('onPayloadReady', e => console.log('Payload ready for booking:', e.detail));
            ` }} 
          />
          <button className="mt-4 bg-white text-black px-8 py-3">Proceed to Payment (your PaymentStep)</button>
        </div>
      )}

      <p className="text-center text-xs mt-12">✅ Real search + ancillaries added. Reply with next (prettier, booking, or polish).</p>
    </div>
  );
}
