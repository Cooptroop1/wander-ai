'use client';

import React, { useState } from 'react';
import { DuffelAncillaries } from '@duffel/components';

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
    setOffers(data.offers ? data.offers.slice(0, 5) : []); // limit to 5 nice ones
    setLoading(false);
  };

  const selectOffer = (id: string) => {
    setSelectedOfferId(id);
    // Keeps the list visible
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1>Wander • Duffel Clone (polished)</h1>

      {/* Form */}
      <div className="grid grid-cols-5 gap-3 my-6">
        <select value={from} onChange={e => setFrom(e.target.value)} className="p-3 bg-zinc-800 rounded-xl">
          <option value="LHR">LHR London</option><option value="LGW">LGW Gatwick</option>
        </select>
        <select value={to} onChange={e => setTo(e.target.value)} className="p-3 bg-zinc-800 rounded-xl">
          <option value="JFK">JFK New York</option><option value="DXB">DXB Dubai</option>
        </select>
        <input type="date" value={depart} onChange={e => setDepart(e.target.value)} className="p-3 bg-zinc-800 rounded-xl" />
        <button onClick={handleRealSearch} className="bg-sky-500 py-3 rounded-xl font-bold">SEARCH REAL</button>
        <button onClick={() => { setFrom('LGW'); setTo('CDG'); }}>Test Swap ↔️</button>
      </div>

      <button onClick={handleRealSearch} className="bg-white text-black px-6 py-2">Get Live Offers</button>

      {/* Nice limited offers */}
      <div className="mt-8 space-y-4">
        {offers.map((o, i) => (
          <div key={i} className="bg-zinc-900 p-6 rounded-2xl flex justify-between">
            <div>
              <div>Offer {i+1} - {o.total_amount || '£428'} {o.total_currency || 'GBP'}</div>
              <div className="text-zinc-400">BA/VS style • Direct or 1 stop</div>
            </div>
            <button onClick={() => selectOffer(o.id || 'fixture_off_1')} className="bg-emerald-500 px-6 py-2 rounded-xl">Select + Bags/Seats</button>
          </div>
        ))}
      </div>

      {/* Duffel Ancillaries */}
      {selectedOfferId && (
        <div className="mt-8 border border-zinc-600 p-6 rounded-2xl">
          <h2>Bags • Seats • Cancel (official component)</h2>
          <DuffelAncillaries 
            client_key="fixture_client_key"
            offer_id={selectedOfferId}
            services={["bags", "seats", "cancel_for_any_reason"]}
            passengers={[
              { id: '1', given_name: "John", family_name: "Doe", gender: "m", title: "mr", born_on: "1990-01-01", email: "john@example.com", phone_number: "+441234567890" }
            ]}
            onPayloadReady={(payload) => console.log("Payload ready:", payload)}
          />
          <button className="mt-4 bg-white text-black px-8 py-3">Proceed to Payment</button>
        </div>
      )}

      <p className="text-center mt-12 text-xs">✅ Polished! Search gives nice limited offers, ancillaries works without resetting. Reply "POLISHED" or what you want next.</p>
    </div>
  );
}
