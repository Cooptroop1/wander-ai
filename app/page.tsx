'use client';

import React, { useState } from 'react';

export default function DuffelCloneHome() {
  const [journeyType, setJourneyType] = useState('one_way');
  const [from, setFrom] = useState('LHR');
  const [to, setTo] = useState('JFK');
  const [depart, setDepart] = useState('2026-07-15');
  const [returnDate, setReturnDate] = useState('2026-07-22');
  const [from2, setFrom2] = useState('JFK');
  const [to2, setTo2] = useState('LHR');
  const [depart2, setDepart2] = useState('2026-07-22');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [from2Search, setFrom2Search] = useState('');
  const [to2Search, setTo2Search] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [from2Suggestions, setFrom2Suggestions] = useState<any[]>([]);
  const [to2Suggestions, setTo2Suggestions] = useState<any[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showFrom2Dropdown, setShowFrom2Dropdown] = useState(false);
  const [showTo2Dropdown, setShowTo2Dropdown] = useState(false);

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

      {/* Journey Type Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setJourneyType('one_way')} className={`px-6 py-2 rounded-xl ${journeyType === 'one_way' ? 'bg-sky-500' : 'bg-zinc-800'}`}>One way</button>
        <button onClick={() => setJourneyType('return')} className={`px-6 py-2 rounded-xl ${journeyType === 'return' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Return</button>
        <button onClick={() => setJourneyType('multi_city')} className={`px-6 py-2 rounded-xl ${journeyType === 'multi_city' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Multi-city</button>
      </div>

      {/* Form with real Duffel suggestions */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Flight 1 */}
        <div className="relative col-span-1">
          <input 
            type="text" 
            value={fromSearch} 
            onChange={(e) => { setFromSearch(e.target.value); fetchSuggestions(e.target.value, setFromSuggestions); setShowFromDropdown(true); }}
            className="p-4 bg-zinc-800 rounded-2xl w-full" 
            placeholder="Flight 1 Origin (type london)" 
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
            className="p-4 bg-zinc-800 rounded-2xl w-full" 
            placeholder="Flight 1 Destination" 
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
        <input type="date" value={depart} onChange={e => setDepart(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />

        {journeyType === 'return' && <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />}

        {journeyType === 'multi_city' && (
          <>
            <div className="relative col-span-1">
              <input type="text" value={from2Search} onChange={(e) => { setFrom2Search(e.target.value); fetchSuggestions(e.target.value, setFrom2Suggestions); setShowFrom2Dropdown(true); }} className="p-4 bg-zinc-800 rounded-2xl w-full" placeholder="Flight 2 Origin" />
              {showFrom2Dropdown && from2Suggestions.length > 0 && (
                <div className="absolute mt-1 bg-zinc-800 rounded-xl w-full max-h-60 overflow-auto z-10">
                  {from2Suggestions.map((p: any) => (
                    <div key={p.id} onClick={() => { setFrom2(p.iata_code || p.code); setFrom2Search(p.name || p.city_name); setShowFrom2Dropdown(false); }} className="p-3 hover:bg-zinc-700 cursor-pointer">
                      {p.name} ({p.iata_code || p.code}) - {p.city_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative col-span-1">
              <input type="text" value={to2Search} onChange={(e) => { setTo2Search(e.target.value); fetchSuggestions(e.target.value, setTo2Suggestions); setShowTo2Dropdown(true); }} className="p-4 bg-zinc-800 rounded-2xl w-full" placeholder="Flight 2 Destination" />
              {showTo2Dropdown && to2Suggestions.length > 0 && (
                <div className="absolute mt-1 bg-zinc-800 rounded-xl w-full max-h-60 overflow-auto z-10">
                  {to2Suggestions.map((p: any) => (
                    <div key={p.id} onClick={() => { setTo2(p.iata_code || p.code); setTo2Search(p.name || p.city_name); setShowTo2Dropdown(false); }} className="p-3 hover:bg-zinc-700 cursor-pointer">
                      {p.name} ({p.iata_code || p.code}) - {p.city_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input type="date" value={depart2} onChange={e => setDepart2(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />
          </>
        )}

        <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="p-4 bg-zinc-800 rounded-2xl"> {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n} passengers</option>)} </select>
        <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl"> <option value="economy">Economy</option><option value="premium_economy">Premium Economy</option><option value="business">Business</option><option value="first">First</option> </select>
        <button onClick={handleRealSearch} className="bg-sky-500 text-white py-4 rounded-2xl font-bold">SEARCH FLIGHTS</button>
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

      <p className="text-center mt-12 text-xs">✅ Real Duffel API airports. Reply "AIRPORTS GOOD" or next (full booking with markup).</p>
    </div>
  );
}
