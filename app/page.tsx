'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export default function WanderAI() {


  // Auth
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'search' | 'trips'>('search');

  // Search states
  const [journeyType, setJourneyType] = useState<'one_way' | 'return'>('one_way');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [depart, setDepart] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');
  const [offers, setOffers] = useState<any[]>([]);

  // Airport suggestions
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Modal for flight confirmation
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // Load user
 React.useEffect(() => {
  // Get current user
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };
  getUser();

  // Listen for auth changes (fixes Google login redirect)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, []);

const handleLogout = async () => {
  await supabase.auth.signOut();
  setUser(null);
};

  // Airport suggestions
  const fetchSuggestions = async (query: string, setSuggestions: any, setShow: any) => {
  if (query.length < 2) {
    setSuggestions([]);
    setShow(false);
    return;
  }
  try {
    const res = await fetch(`/api/places/suggestions?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setSuggestions(data.places?.slice(0, 8) || []);
    setShow(true);
  } catch (e) {
    console.error(e);
  }
};

  // Search flights
  const handleRealSearch = async () => {
  if (!from || !to || !depart) {
    alert('Please fill in From, To and Departure date');
    return;
  }

  try {
    const res = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: from,
        to: to,
        departDate: depart,
        returnDate: journeyType === 'return' ? returnDate : undefined,
        passengers: passengers,
        cabinClass: cabinClass,
      }),
    });

    const data = await res.json();

    if (data.success && data.offers && data.offers.length > 0) {
      setOffers(data.offers);
    } else {
      alert(data.error || 'No flights found');
    }
  } catch (error) {
    console.error(error);
    alert('Search failed');
  }
};

  // Create Duffel Link and redirect
  const createDuffelLink = async (offerId: string) => {
    try {
      const res = await fetch('/api/duffel/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_offers: [offerId],
        }),
      });

      const result = await res.json();

      if (result.success && result.link_url) {
        window.location.href = result.link_url;
      } else {
        alert('Error creating booking link: ' + (result.error || 'Unknown error'));
        console.error(result);
      }
    } catch (error) {
      alert('Failed to create link');
      console.error(error);
    }
  };

  return (
        <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
              <span className="font-bold text-xl">W</span>
            </div>
            <div>
              <div className="font-semibold text-xl">Wander AI</div>
              <div className="text-[10px] text-zinc-500 -mt-1">Flights by Duffel</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <button 
                  onClick={() => setCurrentView('search')} 
                  className={`px-4 py-2 rounded-xl text-sm ${currentView === 'search' ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
                >
                  Search
                </button>
                <button 
                  onClick={() => setCurrentView('trips')} 
                  className={`px-4 py-2 rounded-xl text-sm ${currentView === 'trips' ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}
                >
                  My Trips
                </button>
                <button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-white">Logout</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!user ? (
          <div className="max-w-md mx-auto mt-20 text-center">
            <h1 className="text-4xl font-bold mb-4">Find flights.<br />Book instantly.</h1>
            <p className="text-zinc-400 mb-8">Sign in to start searching</p>
            <button 
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                if (error) alert(error.message);
              }} 
              className="bg-white text-black px-8 py-3 rounded-2xl font-semibold"
            >
              Continue with Google
            </button>
          </div>
        ) : currentView === 'search' ? (
          <>
            {/* Journey Type */}
            <div className="flex gap-2 mb-6">
              <button onClick={() => setJourneyType('one_way')} className={`px-6 py-2 rounded-xl ${journeyType === 'one_way' ? 'bg-sky-500' : 'bg-zinc-800'}`}>One way</button>
              <button onClick={() => setJourneyType('return')} className={`px-6 py-2 rounded-xl ${journeyType === 'return' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Return</button>
            </div>

            {/* Search Form */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
              <div className="relative col-span-1">
                <input type="text" value={fromSearch} onChange={(e) => { setFromSearch(e.target.value); fetchSuggestions(e.target.value, setFromSuggestions, setShowFromDropdown); }} className="p-4 bg-zinc-800 rounded-2xl w-full" placeholder="From (type city)" />
                {showFromDropdown && fromSuggestions.length > 0 && (
                  <div className="absolute mt-1 bg-zinc-800 rounded-xl w-full max-h-60 overflow-auto z-50 border border-zinc-700">
                    {fromSuggestions.map((p: any, i: number) => (
                      <div key={i} onClick={() => { setFrom(p.iata_code || p.code); setFromSearch(p.name || p.city_name); setShowFromDropdown(false); }} className="p-3 hover:bg-zinc-700 cursor-pointer text-sm">
                        {p.name} ({p.iata_code || p.code}) — {p.city_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative col-span-1">
                <input type="text" value={toSearch} onChange={(e) => { setToSearch(e.target.value); fetchSuggestions(e.target.value, setToSuggestions, setShowToDropdown); }} className="p-4 bg-zinc-800 rounded-2xl w-full" placeholder="To (type city)" />
                {showToDropdown && toSuggestions.length > 0 && (
                  <div className="absolute mt-1 bg-zinc-800 rounded-xl w-full max-h-60 overflow-auto z-50 border border-zinc-700">
                    {toSuggestions.map((p: any, i: number) => (
                      <div key={i} onClick={() => { setTo(p.iata_code || p.code); setToSearch(p.name || p.city_name); setShowToDropdown(false); }} className="p-3 hover:bg-zinc-700 cursor-pointer text-sm">
                        {p.name} ({p.iata_code || p.code}) — {p.city_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input type="date" value={depart} onChange={e => setDepart(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />
              {journeyType === 'return' && <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />}
              <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="p-4 bg-zinc-800 rounded-2xl">
                {[1,2,3,4].map(n => <option key={n} value={n}>{n} passengers</option>)}
              </select>
              <button onClick={handleRealSearch} className="bg-sky-500 text-white py-4 rounded-2xl font-bold">SEARCH FLIGHTS</button>
            </div>

            {/* Offers */}
            {offers.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Choose your flight</h3>
                <div className="space-y-3">
                  {offers.map((offer: any, index: number) => {
                    const slice = offer.slices?.[0];
                    const segment = slice?.segments?.[0];
                    const airline = segment?.marketing_carrier?.name || 'Airline';
                    const price = offer.total_amount;

                    return (
                      <div key={index} onClick={() => setSelectedFlight(offer)} className="bg-zinc-900 border border-zinc-700 hover:border-sky-500 rounded-2xl p-6 cursor-pointer flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{airline}</div>
                          <div className="text-sm text-zinc-400">{slice?.duration || ''} • {slice?.segments?.length > 1 ? `${slice.segments.length - 1} stop` : 'Direct'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">£{price}</div>
                          <div className="text-emerald-400 text-sm">Click to book →</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-zinc-400">My Trips coming soon…</div>
        )}
      </div>

     {/* Flight Details Modal */}
{selectedFlight && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-900 rounded-3xl w-full max-w-3xl border border-zinc-700 overflow-hidden flex flex-col max-h-[92vh]">
      
      {/* Header - stays at top */}
      <div className="px-8 pt-8 pb-6 border-b border-zinc-800 flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold">Flight Details</h2>
          <p className="text-zinc-400 text-sm mt-1">Review before booking</p>
        </div>
        <button 
          onClick={() => setSelectedFlight(null)} 
          className="text-zinc-400 hover:text-white text-3xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="p-8 space-y-8 overflow-y-auto flex-1">
        
        {/* Outbound */}
        {selectedFlight.slices?.[0] && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full text-xs font-medium">OUTBOUND</div>
              <div className="text-sm text-zinc-400">{selectedFlight.slices[0].duration}</div>
            </div>
            
            {selectedFlight.slices[0].segments?.map((segment: any, idx: number) => (
              <div key={idx} className="bg-zinc-950 rounded-2xl p-5 mb-3 border border-zinc-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-2xl font-semibold">{segment.origin.iata_code}</div>
                    <div className="text-sm text-zinc-400">{segment.origin.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold">{segment.destination.iata_code}</div>
                    <div className="text-sm text-zinc-400">{segment.destination.name}</div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-emerald-400">Departs</div>
                    <div className="font-medium">{new Date(segment.departing_at).toLocaleString([], { 
                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400">Arrives</div>
                    <div className="font-medium">{new Date(segment.arriving_at).toLocaleString([], { 
                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between text-xs text-zinc-400">
                  <div>{segment.marketing_carrier?.name} • {segment.marketing_carrier?.iata_code}{segment.marketing_carrier_flight_number}</div>
                  <div>{segment.duration} • {segment.stops?.length || 0} stop{(segment.stops?.length || 0) !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Return (if exists) */}
        {selectedFlight.slices?.[1] && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-medium">RETURN</div>
              <div className="text-sm text-zinc-400">{selectedFlight.slices[1].duration}</div>
            </div>

            {selectedFlight.slices[1].segments?.map((segment: any, idx: number) => (
              <div key={idx} className="bg-zinc-950 rounded-2xl p-5 mb-3 border border-zinc-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-2xl font-semibold">{segment.origin.iata_code}</div>
                    <div className="text-sm text-zinc-400">{segment.origin.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold">{segment.destination.iata_code}</div>
                    <div className="text-sm text-zinc-400">{segment.destination.name}</div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-emerald-400">Departs</div>
                    <div className="font-medium">{new Date(segment.departing_at).toLocaleString([], { 
                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400">Arrives</div>
                    <div className="font-medium">{new Date(segment.arriving_at).toLocaleString([], { 
                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between text-xs text-zinc-400">
                  <div>{segment.marketing_carrier?.name} • {segment.marketing_carrier?.iata_code}{segment.marketing_carrier_flight_number}</div>
                  <div>{segment.duration} • {segment.stops?.length || 0} stop{(segment.stops?.length || 0) !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center">
          <div>
            <div className="text-sm text-zinc-400">Total price for all passengers</div>
            <div className="text-xs text-zinc-500 mt-0.5">Includes taxes & fees</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-emerald-400">£{selectedFlight.total_amount}</div>
          </div>
        </div>

      </div>

      {/* Footer - stays at bottom */}
      <div className="px-8 py-6 bg-zinc-950 border-t border-zinc-800 flex gap-4 flex-shrink-0">
        <button 
          onClick={() => setSelectedFlight(null)} 
          className="flex-1 py-4 rounded-2xl border border-zinc-700 hover:bg-zinc-800 font-medium transition"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            createDuffelLink(selectedFlight.id);
            setSelectedFlight(null);
          }} 
          className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-bold text-lg transition"
        >
          Book on Duffel →
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}
