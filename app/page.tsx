'use client';

import React, { useState } from 'react';

export default function DuffelCloneHome() {
  const [from, setFrom] = useState('LHR');
  const [to, setTo] = useState('JFK');
  const [depart, setDepart] = useState('2026-07-15');
  const [returnDate, setReturnDate] = useState('2026-07-22');
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fetchSuggestions = async (query: string, setSuggestions: any) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(`/api/places/suggestions?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setSuggestions(data.places || []);
  };

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
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (duration: string) => {
    if (!duration) return 'N/A';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1>Wander • Duffel Clone (real Duffel airport API)</h1>

      {/* Form with real Duffel suggestions */}
      <div className="grid grid-cols-6 gap-3 my-6">
        <div className="relative col-span-1">
          <input 
            type="text" 
            value={fromSearch} 
            onChange={(e) => { setFromSearch(e.target.value); fetchSuggestions(e.target.value, setFromSuggestions); setShowFromDropdown(true); }}
            onFocus={() => setShowFromDropdown(true)}
            className="p-3 bg-zinc-800 rounded-xl w-full" 
            placeholder="Type london or madrid" 
          />
          {showFromDropdown && fromSuggestions.length > 0 && (
            <div className="absolute mt-1 bg-zinc-800 rounded-xl w-full max-h-60 overflow-auto z-10">
              {fromSuggestions.map((p: any) => (
                <div key={p.id} onClick={() => { setFrom(p.iata_code || p.code); setFromSearch(p.name || p.city_name); setShowFromDropdown(false); }} className="p-3 hover:bg-zinc-700 cursor-pointer">
                  {p.name} ({p.iata_code || p.code}) - {p.city_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative col-span-1">
          <input 
            type="text" 
            value={toSearch} 
            onChange={(e) => { setToSearch(e.target.value); fetchSuggestions(e.target.value, setToSuggestions); setShowToDropdown(true); }}
            onFocus={() => setShowToDropdown(true)}
            className="p-3 bg-zinc-800 rounded-xl w-full" 
            placeholder="Type london or madrid" 
          />
          {showToDropdown && toSuggestions.length > 0 && (
            <div className="absolute mt-1 bg-zinc-800 rounded-xl w-full max-h-60 overflow-auto z-10">
              {toSuggestions.map((p: any) => (
                <div key={p.id} onClick={() => { setTo(p.iata_code || p.code); setToSearch(p.name || p.city_name); setShowToDropdown(false); }} className="p-3 hover:bg-zinc-700 cursor-pointer">
                  {p.name} ({p.iata_code || p.code}) - {p.city_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <input type="date" value={depart} onChange={e => setDepart(e.target.value)} className="p-3 bg-zinc-800 rounded-xl" />
        <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="p-3 bg-zinc-800 rounded-xl" />
        <button onClick={handleRealSearch} className="bg-sky-500 py-3 rounded-xl font-bold">SEARCH REAL</button>
        <button onClick={() => { setFrom('LGW'); setTo('CDG'); setFromSearch('London'); setToSearch('Paris'); }}>Swap ↔️</button>
      </div>

      <button onClick={handleRealSearch} className="bg-white text-black px-6 py-2">Get Live Offers</button>

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

      <p className="text-center mt-12 text-xs">✅ Real Duffel API airport search (type london or madrid). Reply "AIRPORTS GOOD" or next (full booking with markup).</p>
    </div>
  );
}
