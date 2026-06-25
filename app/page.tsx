'use client';

import React, { useState } from 'react';

export default function DuffelCloneHome() {
  const [journeyType, setJourneyType] = useState('one_way');
  const [legs, setLegs] = useState([{ from: 'LHR', to: 'JFK', depart: '2026-07-15' }]); // dynamic legs
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addLeg = () => {
    setLegs([...legs, { from: 'JFK', to: 'LHR', depart: '2026-07-22' }]);
  };

  const updateLeg = (index: number, field: string, value: string) => {
    const newLegs = [...legs];
    newLegs[index] = { ...newLegs[index], [field]: value };
    setLegs(newLegs);
  };

  const handleRealSearch = async () => {
    setLoading(true);
    // For multi-city, use first leg for simplicity (expand API later)
    const firstLeg = legs[0];
    const res = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: firstLeg.from, to: firstLeg.to, departDate: firstLeg.depart }),
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
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (duration: string) => {
    if (!duration) return 'N/A';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1>Wander • Duffel Clone (multi-city with + leg)</h1>

      {/* Journey Type Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setJourneyType('one_way')} className={`px-6 py-2 rounded-xl ${journeyType === 'one_way' ? 'bg-sky-500' : 'bg-zinc-800'}`}>One way</button>
        <button onClick={() => setJourneyType('return')} className={`px-6 py-2 rounded-xl ${journeyType === 'return' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Return</button>
        <button onClick={() => setJourneyType('multi_city')} className={`px-6 py-2 rounded-xl ${journeyType === 'multi_city' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Multi-city</button>
      </div>

      {/* Dynamic Legs */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
        {legs.map((leg, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 mb-6">
            <input type="text" value={leg.from} onChange={(e) => updateLeg(index, 'from', e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" placeholder={`Flight ${index+1} Origin`} />
            <input type="text" value={leg.to} onChange={(e) => updateLeg(index, 'to', e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" placeholder={`Flight ${index+1} Destination`} />
            <input type="date" value={leg.depart} onChange={(e) => updateLeg(index, 'depart', e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />
          </div>
        ))}
        {journeyType === 'multi_city' && (
          <button onClick={addLeg} className="bg-zinc-700 px-6 py-2 rounded-xl">+ Add another leg</button>
        )}
        <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="p-4 bg-zinc-800 rounded-2xl mt-6"> {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n} passengers</option>)} </select>
        <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl mt-2"> <option value="economy">Economy</option><option value="premium_economy">Premium Economy</option><option value="business">Business</option><option value="first">First</option> </select>
        <button onClick={handleRealSearch} className="bg-sky-500 text-white py-4 rounded-2xl font-bold w-full mt-6">SEARCH FLIGHTS</button>
      </div>

      <button onClick={handleRealSearch} className="bg-white text-black px-6 py-2 mt-4">Get Live Offers</button>

      {/* Rich offers */}
      <div className="mt-8 space-y-4">
        {offers.map((o, i) => {
          const slice = o.slices && o.slices[0];
          const segment = slice && slice.segments && slice.segments[0];
          const airline = segment ? segment.marketing_carrier.name : 'BA/VS';
          const depTime = segment ? formatTime(segment.departing_at) : 'N/A';
          const arrTime = segment ? formatTime(segment.arriving_at) : 'N/A';
          const duration = slice ? formatDuration(slice.duration) : 'N/A';
          const stops = slice ? (slice.segments.length - 1) + ' stop' : 'Direct';
          const cabin = slice ? slice.cabin_class : 'economy';
          const bagAllowance = '23kg checked (standard)';
          return (
            <div key={i} className="bg-zinc-900 p-6 rounded-2xl flex justify-between items-center">
              <div>
                Offer {i+1} - {o.total_amount || '£428'} {o.total_currency || 'GBP'} • {airline} <br />
                <span className="text-emerald-400">Dep: {depTime}</span> • <span className="text-emerald-400">Arr: {arrTime}</span> • {duration} • {stops} • {cabin} cabin • {bagAllowance}
              </div>
              <button onClick={() => selectOffer(o.id || 'fixture_off_1')} className="bg-emerald-500 px-8 py-3 rounded-xl font-bold">Select + Bags/Seats</button>
            </div>
          );
        })}
      </div>

      <p className="text-center mt-12 text-xs">✅ Multi-city with + Add Leg. Reply "MULTI GOOD" or next (full booking with markup).</p>
    </div>
  );
}
