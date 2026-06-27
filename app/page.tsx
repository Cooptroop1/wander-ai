'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DuffelCloneHome() {
  const [currentView, setCurrentView] = useState<'search' | 'myTrips' | 'tripDetail'>('search');
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [journeyType, setJourneyType] = useState('one_way');
  const [from, setFrom] = useState('LHR');
  const [to, setTo] = useState('JFK');
  const [depart, setDepart] = useState('2026-07-15');
  const [returnDate, setReturnDate] = useState('2026-07-22');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHoldInfo, setShowHoldInfo] = useState(false);
  const [showOrderHeld, setShowOrderHeld] = useState(false);
  const [myTrips, setMyTrips] = useState<any[]>([]);

  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [selectedBags, setSelectedBags] = useState(0);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [seatMapData, setSeatMapData] = useState<any>(null);

// === NEW STATES FOR PAYMENT FLOW ===
  // === ADD THESE FORM STATES ===
const [passportCountry, setPassportCountry] = useState('');
const [passportNumber, setPassportNumber] = useState('');
const [passportExpiry, setPassportExpiry] = useState('');
const [paymentMethod, setPaymentMethod] = useState<'payNow' | 'hold' | null>(null);
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [givenName, setGivenName] = useState('');
const [familyName, setFamilyName] = useState('');
const [title, setTitle] = useState('');
const [bornOn, setBornOn] = useState('');
const [gender, setGender] = useState('');

  // ==================== LOAD USER TRIPS FROM SUPABASE ====================
useEffect(() => {
  const loadUserTrips = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setMyTrips([]);
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading trips:', error);
    } else if (data) {
      // Convert Supabase rows into the shape your UI expects
      const formatted = data.map((row: any) => ({
        id: row.duffel_order_id,
        status: 'On hold',
        total: row.total,
        currency: row.currency,
        airline: row.airline,
        created: new Date(row.created_at).toLocaleString('en-GB'),
        holdUntil: '28 Jun 2026',
        extraBags: 0,
        selectedSeat: null,
        flights: [{
          date: row.departure_date,
          time: '',
          route: `${row.origin} - ${row.destination}`,
          status: 'On hold',
          airline: row.airline,
          origin: row.origin,
          destination: row.destination,
          depTerminal: '',
          arrTerminal: '',
          duration: '',
          cabin: 'economy',
          bags: '1 carry-on bag • 1 checked bag'
        }],
        passenger: {
          name: 'mr James Cooper',
          dob: '04/12/1978',
          gender: 'Male',
          email: 'jcooper4888@aol.co.uk',
          phone: '+447368841330'
        }
      }));

      setMyTrips(formatted);
    }
  };

  loadUserTrips();

  // Re-load trips when auth state changes (login/logout)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
    loadUserTrips();
  });

  return () => subscription.unsubscribe();
}, []);
// ==================== END LOAD USER TRIPS ====================

  const fetchSuggestions = async (query: string, setSuggestions: any, setShow: any) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(`/api/places/suggestions?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setSuggestions(data.places || []);
    setShow(true);
  };

  const handleRealSearch = async () => {
  if (!from || !to || !depart) {
    alert("Please fill from, to, and departure date");
    return;
  }

  try {
    const res = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        departDate: depart,
        returnDate: returnDate || undefined,
        passengers: 1,
        cabinClass: 'economy',
      }),
    });

    const data = await res.json();

    if (data.success) {
      setOffers(data.offers || []);
      alert(`✅ Loaded ${data.offers.length} real Duffel offers!`);
    } else {
      alert('Search failed: ' + (data.error || JSON.stringify(data)));
    }
  } catch (err) {
    alert('Search error: ' + (err as Error).message);
  }
};

  const selectOffer = async (offer: any) => {
    setSelectedOffer(offer);
    setShowCheckout(true);
    setShowHoldInfo(false);
    setShowOrderHeld(false);
    setSelectedBags(0);
    setSelectedSeat(null);

    try {
      const res = await fetch(`/api/flights/search?offer_id=${offer.id}&return_available_services=true`);
      const data = await res.json();
      setAvailableServices(data.available_services || []);
    } catch (e) {
      setAvailableServices([]);
    }
  };

  const closeCheckout = () => {
    setShowCheckout(false);
    setSelectedOffer(null);
    setShowHoldInfo(false);
    setShowOrderHeld(false);
    setSelectedBags(0);
    setSelectedSeat(null);
    setAvailableServices([]);
    setShowSeatMap(false);
  };

  const fetchSeatMap = async () => {
    if (!selectedOffer) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/flights/search?offer_id=${selectedOffer.id}&seat_maps=true`);
      const data = await res.json();
      setSeatMapData(data.seat_maps || data);
      setShowSeatMap(true);
    } catch (e) {
      alert('Seat maps not available for this offer');
    }
    setLoading(false);
  };

  const selectSeat = (seat: any) => {
    if (seat.available_services && seat.available_services.length > 0) {
      setSelectedSeat(seat.available_services[0]);
      setShowSeatMap(false);
    } else {
      alert('This seat is not available');
    }
  };

  const getDynamicTotal = () => {
    const base = parseFloat(selectedOffer?.total_amount || '100');
    const taxes = parseFloat(selectedOffer?.tax_amount || '18');
    const bags = selectedBags * 30;
    const seat = selectedSeat ? parseFloat(selectedSeat.total_amount || '0') : 0;
    return (base + taxes + bags + seat).toFixed(2);
  };

  const isFormComplete = () => {
  const emailValid = email.trim().length > 5 && email.includes('@');
  const phoneValid = phone.trim().length >= 10;
  const givenNameValid = givenName.trim().length >= 2;
  const familyNameValid = familyName.trim().length >= 2;
  const dobValid = bornOn.length === 10;
  const passportValid = passportNumber.trim().length > 5 && passportExpiry.length === 10;

  return emailValid && phoneValid && givenNameValid && familyNameValid && dobValid && passportValid;
};
  
  const bookNow = async () => {
  if (!selectedOffer) return;
    try {
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerId: selectedOffer.id,
        passengers,
        services: [],
        finalAmount: getDynamicTotal(),
        currency: selectedOffer.total_currency || 'GBP',
      }),
    });

    const result = await res.json();
    alert(JSON.stringify(result, null, 2)); // This will show us the full response
  } catch (err) {
    alert('Error: ' + err);
  }
};

  const showHoldConfirmation = () => setShowHoldInfo(true);

const handleBookWithDuffel = async () => {
  if (!selectedOffer) return;

  try {
    const res = await fetch('/api/duffel/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selected_offers: [selectedOffer.id],
      }),
    });

    const result = await res.json();

    if (!result.success) {
      alert('Failed to create booking link: ' + result.error);
      return;
    }

    // Redirect user to Duffel's hosted checkout
    window.location.href = result.link_url;

  } catch (err: any) {
    alert('Error: ' + err.message);
  }
};

  const openTripDetail = (trip: any) => {
    setSelectedTrip(trip);
    setCurrentView('tripDetail');
  };

  const backToMyTrips = () => {
    setCurrentView('myTrips');
    setSelectedTrip(null);
  };

  const formatTime = (iso: string) => {
    if (!iso) return 'N/A';
    const date = new Date(iso);
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="flex justify-between mb-6">
        {/* ========== TEMP LOGIN (remove later) ========== */}
<div className="mb-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-700">
  <div className="font-bold mb-3 text-emerald-400">Login (temporary for testing)</div>
  <div className="flex gap-2">
    <input 
      type="email" 
      placeholder="Email" 
      className="flex-1 p-3 bg-zinc-800 rounded-xl text-white"
      id="login-email"
    />
    <input 
      type="password" 
      placeholder="Password" 
      className="flex-1 p-3 bg-zinc-800 rounded-xl text-white"
      id="login-password"
    />
    <button 
      onClick={async () => {
        const email = (document.getElementById('login-email') as HTMLInputElement).value;
        const password = (document.getElementById('login-password') as HTMLInputElement).value;

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          alert(error.message);
        } else {
          alert('Logged in successfully!');
        }
      }}
      className="bg-emerald-500 hover:bg-emerald-600 px-8 rounded-xl font-bold"
    >
      Login
    </button>
  </div>
  <p className="text-xs text-zinc-400 mt-2">
    Use an email + password you created in Supabase Auth
  </p>
</div>
{/* ========== END TEMP LOGIN ========== */}
        <div className="flex gap-2">
          <button onClick={() => setCurrentView('search')} className={`px-6 py-2 rounded-xl ${currentView === 'search' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Search</button>
          <button onClick={() => setCurrentView('myTrips')} className={`px-6 py-2 rounded-xl ${currentView === 'myTrips' ? 'bg-sky-500' : 'bg-zinc-800'}`}>My Trips ({myTrips.length})</button>
        </div>
        <h1 className="text-2xl font-bold">Wander • Duffel Clone</h1>
      </div>

      {/* SEARCH VIEW */}
      {currentView === 'search' && (
        <>
          {currentView === 'search' && (
  <div>
    {/* === TEMP TEST BUTTON - DELETE THIS LATER === */}
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded mb-4">
      <p className="font-bold mb-2">Quick Test - Create Duffel Link</p>
      <button
        onClick={async () => {
          const testOfferId = "off_xxxxxxxxxxxxxxxxxxxxxxxx"; // ← paste real offer ID here

          const res = await fetch('/api/duffel/create-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              selected_offers: [testOfferId],
            }),
          });

          const result = await res.json();
          console.log("Full result:", result);

          if (result.success) {
            alert("Link created! Opening now...");
            window.open(result.link_url, "_blank");
          } else {
            alert("Error: " + result.error);
            console.error(result);
          }
        }}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Create Test Link
      </button>
      <p className="text-xs mt-2 text-gray-600">
        1. Search for flights first<br />
        2. Copy an offer ID (starts with off_) from console<br />
        3. Paste it above then click
      </p>
    </div>
    {/* === END TEMP TEST BUTTON === */}

    {/* your normal search inputs and button go here */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setJourneyType('one_way')} className={`px-6 py-2 rounded-xl ${journeyType === 'one_way' ? 'bg-sky-500' : 'bg-zinc-800'}`}>One way</button>
            <button onClick={() => setJourneyType('return')} className={`px-6 py-2 rounded-xl ${journeyType === 'return' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Return</button>
            <button onClick={() => setJourneyType('multi_city')} className={`px-6 py-2 rounded-xl ${journeyType === 'multi_city' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Multi-city</button>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative col-span-1">
              <input type="text" value={fromSearch} onChange={(e) => { setFromSearch(e.target.value); fetchSuggestions(e.target.value, setFromSuggestions, setShowFromDropdown); }} className="p-4 bg-zinc-800 rounded-2xl w-full" placeholder="Origin (type london or madrid)" />
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
              <input type="text" value={toSearch} onChange={(e) => { setToSearch(e.target.value); fetchSuggestions(e.target.value, setToSuggestions, setShowToDropdown); }} className="p-4 bg-zinc-800 rounded-2xl w-full" placeholder="Destination" />
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
            <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="p-4 bg-zinc-800 rounded-2xl">
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} passengers</option>)}
            </select>
            <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl">
              <option value="economy">Economy</option><option value="premium_economy">Premium Economy</option><option value="business">Business</option><option value="first">First</option>
            </select>
            <button onClick={handleRealSearch} className="bg-sky-500 text-white py-4 rounded-2xl font-bold">SEARCH FLIGHTS</button>
          </div>

          <button onClick={handleRealSearch} className="bg-white text-black px-6 py-2 mt-4">Get Live Offers</button>

          <div className="mt-8 space-y-4">
            {offers.map((o, i) => {
              const slice = o.slices && o.slices[0];
              const segment = slice && slice.segments && slice.segments[0];
              const airline = segment ? segment.marketing_carrier.name : 'BA/VS';
              const depTime = segment ? formatTime(segment.departing_at) : 'N/A';
              const arrTime = segment ? formatTime(segment.arriving_at) : 'N/A';
              const duration = slice ? (slice.duration || 'N/A') : 'N/A';
              const stops = slice ? (slice.segments.length - 1) + ' stop' : 'Direct';
              const cabin = slice ? slice.cabin_class : 'economy';
              return (
                <div key={i} className="bg-zinc-900 p-6 rounded-2xl flex justify-between items-center">
                  <div>
                    Offer {i+1} - {o.total_amount || '£428'} {o.total_currency || 'GBP'} • {airline} <br />
                    <span className="text-emerald-400">Dep: {depTime}</span> • <span className="text-emerald-400">Arr: {arrTime}</span> • {duration} • {stops} • {cabin}
                  </div>
                  <button onClick={() => selectOffer(o)} className="bg-emerald-500 px-8 py-3 rounded-xl font-bold">Select + Bags/Seats</button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MY TRIPS VIEW */}
      {currentView === 'myTrips' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">My Trips</h2>
          {myTrips.length === 0 ? (
            <p>No trips yet. Book or hold a flight to see it here.</p>
          ) : (
            myTrips.map((trip, i) => (
              <div key={i} onClick={() => openTripDetail(trip)} className="bg-zinc-900 p-6 rounded-2xl mb-4 cursor-pointer hover:bg-zinc-800">
                <div className="flex justify-between">
                  <div>
                    <div className="font-bold">{trip.airline} • {trip.status}</div>
                    <div className="text-sm text-zinc-400">Order ID: {trip.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{trip.total} {trip.currency}</div>
                    {trip.status === 'On hold' && <div className="text-sm text-emerald-400">Pay by {trip.holdUntil}</div>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TRIP DETAIL VIEW */}
      {currentView === 'tripDetail' && selectedTrip && (
        <div>
          <button onClick={backToMyTrips} className="mb-6 text-emerald-400">← Back to My Trips</button>
          
          <div className="bg-emerald-900/30 border border-emerald-500 p-6 rounded-2xl mb-6">
            <div className="text-2xl font-bold text-emerald-400 mb-2">Order {selectedTrip.status}</div>
            {selectedTrip.status === 'On hold' && (
              <>
                <div className="text-sm">The price guarantee expires in 2 days. After this prices for your trip may change.</div>
                <div className="text-sm">Space expires in 3 days. After this the space will be released and you will need to rebook.</div>
              </>
            )}
          </div>

          <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
            <div className="grid grid-cols-3 gap-4 text-sm mb-6">
              <div>
                <div className="text-zinc-400">{selectedTrip.created}</div>
                <div className="font-semibold">Booked</div>
              </div>
              {selectedTrip.status === 'On hold' && (
                <>
                  <div>
                    <div className="text-zinc-400">27 Jun 2026 23:16 BST</div>
                    <div className="font-semibold">Price hold expires</div>
                    <div className="text-emerald-400">{selectedTrip.total}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">28 Jun 2026 23:16 BST</div>
                    <div className="font-semibold">Space hold expires</div>
                  </div>
                </>
              )}
            </div>

            {(selectedTrip.flights || []).map((f: any, fi: number) => (
              <div key={fi} className="mb-6">
                <div className="font-bold mb-2">{f.date} {f.time} • {f.route}</div>
                <div className="text-sm text-emerald-400 mb-2">{f.status}</div>
                <div className="text-sm">19:21 Depart London Stansted (STN) Terminal 2</div>
                <div className="text-sm">22:39 Arrive Madrid (MAD) Terminal 1</div>
                <div className="text-sm mt-1">Economy • Duffel Airways • Boeing 777-300 • ZZ5528</div>
                <div className="text-sm">1 carry-on bag • 1 checked bag</div>
              </div>
            ))}

            {(selectedTrip.extraBags > 0 || selectedTrip.selectedSeat) && (
              <div className="mb-6 p-4 bg-zinc-700 rounded-xl">
                <div className="font-bold mb-2">Extras added</div>
                {selectedTrip.extraBags > 0 && <div>Extra bags: {selectedTrip.extraBags}</div>}
                {selectedTrip.selectedSeat && (
                  <div>
                    Selected seat: {selectedTrip.selectedSeat.designator || 'Selected'} 
                    {selectedTrip.selectedSeat.total_amount && ` (£${selectedTrip.selectedSeat.total_amount})`}
                  </div>
                )}
              </div>
            )}

            <div className="text-sm mb-6">
              <div>Order change policy: This order is not changeable</div>
              <div>Order refund policy: This order is not refundable</div>
            </div>

            <div className="mb-6">
              <div className="font-bold mb-2">Passengers • adult 1</div>
              <div>Name: {selectedTrip.passenger?.name || 'mr James Cooper'}</div>
              <div>Date of birth: {selectedTrip.passenger?.dob || '04/12/1978'}</div>
              <div>Gender: {selectedTrip.passenger?.gender || 'Male'}</div>
              <div>E-mail: {selectedTrip.passenger?.email || 'jcooper4888@aol.co.uk'}</div>
              <div>Contact number: {selectedTrip.passenger?.phone || '+447368841330'}</div>
            </div>

            <div>
              <div className="font-bold mb-2">Summary</div>
              <div>Order ID: {selectedTrip.id}</div>
              <div>Status: {selectedTrip.status}</div>
              <div>Airline: {selectedTrip.airline}</div>
              <div>James Cooper created this order. {selectedTrip.created}</div>
            </div>
          </div>

          {selectedTrip.status === 'On hold' && (
            <button className="w-full bg-emerald-500 py-4 rounded-2xl font-bold">Pay now to confirm</button>
          )}
        </div>
      )}

      
      {/* CHECKOUT MODAL */}
      {showCheckout && selectedOffer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto p-8">
            <div className="flex justify-between mb-6">
              <button onClick={handleBookWithDuffel} className="bg-emerald-500 py-4 rounded-2xl font-bold w-full">
  Pay Now with Test Card
</button>
              <h2 className="text-2xl font-bold">Checkout</h2>
              <button onClick={closeCheckout} className="text-2xl">×</button>
            </div>

            {/* Selected Flight Summary - Now uses REAL data from Duffel offer */}
<div className="mb-8">
  <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
    <div className="font-bold mb-4">Selected flights</div>

    {/* Render real slices from the offer */}
    {selectedOffer?.slices?.map((slice: any, sliceIndex: number) => (
      <div key={sliceIndex} className="mb-6 last:mb-0">
        {slice.segments?.map((segment: any, segIndex: number) => {
          const dep = new Date(segment.departing_at);
          const arr = new Date(segment.arriving_at);
          const depTime = dep.toLocaleString('en-GB', { 
            weekday: 'short', day: 'numeric', month: 'short', 
            hour: '2-digit', minute: '2-digit' 
          });
          const arrTime = arr.toLocaleString('en-GB', { 
            weekday: 'short', day: 'numeric', month: 'short', 
            hour: '2-digit', minute: '2-digit' 
          });

          return (
            <div key={segIndex} className="mb-4">
              <div className="font-semibold">
                {depTime} - {arrTime}
              </div>
              <div>
                {segment.marketing_carrier?.name || 'Airline'} • {segment.flight_number} • {segment.duration}
              </div>
              <div className="text-sm mt-1">
                {depTime.split(',')[1]?.trim()} Depart from {segment.origin?.name} ({segment.origin?.iata_code})
                {segment.origin_terminal && `, Terminal ${segment.origin_terminal}`}
              </div>
              <div className="text-sm">
                {arrTime.split(',')[1]?.trim()} Arrive at {segment.destination?.name} ({segment.destination?.iata_code})
                {segment.destination_terminal && `, Terminal ${segment.destination_terminal}`}
              </div>
              <div className="text-sm mt-1">
                {slice.cabin_class || 'Economy'} • {segment.marketing_carrier?.name} • {segment.aircraft?.name || ''}
              </div>
              <div className="text-sm">
                {segment.passengers?.[0]?.baggages?.length > 0 
                  ? `${segment.passengers[0].baggages.length} bag(s) included` 
                  : 'Bags included'}
              </div>
            </div>
          );
        })}
      </div>
    ))}

    {/* Fallback if no real slices (shouldn't happen now) */}
    {!selectedOffer?.slices?.length && (
      <div className="text-sm text-zinc-400">Flight details loading...</div>
    )}
  </div>
</div>

            <div className="mb-8">
              <div className="font-bold mb-3">Add extras</div>
              
              <div className="bg-zinc-800 p-6 rounded-2xl mb-4">
                <div className="mb-4">Extra Bags (from Duffel API)</div>
                {availableServices.length > 0 ? (
                  availableServices.map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center mb-4 p-4 bg-zinc-700 rounded-xl">
                      <div>
                        <div className="font-semibold">{service.metadata?.type || 'Checked bag'} × {selectedBags}</div>
                        <div className="text-sm text-zinc-400">£{service.total_amount} each</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedBags(Math.max(0, selectedBags - 1))} className="px-3 py-1 bg-zinc-600 rounded">-</button>
                        <span className="w-8 text-center">{selectedBags}</span>
                        <button onClick={() => setSelectedBags(selectedBags + 1)} className="px-3 py-1 bg-zinc-600 rounded">+</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-400">No extra bags available</div>
                )}
                <div className="mt-2 font-bold">Bags total: £{(selectedBags * 30).toFixed(2)}</div>
              </div>

              <div className="bg-zinc-800 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div>Seat Selection (from Duffel Seat Maps API)</div>
                  <button onClick={fetchSeatMap} className="bg-emerald-500 px-4 py-2 rounded-xl text-sm">Select Seat from API</button>
                </div>
                {selectedSeat ? (
                  <div className="p-4 bg-zinc-700 rounded-xl">
                    Selected: {selectedSeat.designator || 'Seat'} - £{selectedSeat.total_amount || '0.00'}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-400">No seat selected</div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="font-bold mb-3">Payment</div>
              <div className="bg-zinc-800 p-6 rounded-2xl">
                <div className="flex justify-between">
                  <div>Fare</div>
                  <div>£{parseFloat(selectedOffer?.total_amount || '100').toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div>Fare taxes</div>
                  <div>£{parseFloat(selectedOffer?.tax_amount || '18').toFixed(2)}</div>
                </div>
                {selectedBags > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <div>Extra bags ({selectedBags})</div>
                    <div>£{(selectedBags * 30).toFixed(2)}</div>
                  </div>
                )}
                {selectedSeat && (
                  <div className="flex justify-between text-emerald-400">
                    <div>Selected seat</div>
                    <div>£{parseFloat(selectedSeat.total_amount || '0').toFixed(2)}</div>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-4 pt-4 border-t border-zinc-700 text-lg">
                  <div>Total (GBP)</div>
                  <div>£{getDynamicTotal()}</div>
                </div>
              </div>
            </div>

            {/* Top Payment Choice */}
{!showHoldInfo && !showOrderHeld && (
  <div className="mb-8">
    <div className="font-bold mb-3">Paying now, or later?</div>

    <div className="flex gap-4 mb-6">
      {/* Pay Now Button */}
      <button 
        onClick={() => setPaymentMethod('payNow')}
        className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
          paymentMethod === 'payNow' 
            ? 'bg-emerald-500 ring-2 ring-emerald-400' 
            : 'bg-zinc-700 hover:bg-zinc-600'
        }`}
      >
        Pay now
      </button>

      {/* Hold Button */}
      <button 
        onClick={() => setPaymentMethod('hold')}
        disabled={selectedBags > 0 || selectedSeat}
        className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
          paymentMethod === 'hold' 
            ? 'bg-emerald-500 ring-2 ring-emerald-400' 
            : (selectedBags > 0 || selectedSeat) 
              ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
              : 'bg-zinc-700 hover:bg-zinc-600'
        }`}
      >
        Hold order (pay later)
      </button>
    </div>

    {/* Show form + bottom button only when Pay Now is selected */}
    {paymentMethod === 'payNow' && (
      <>
        {/* Your existing form fields go here (contact, passengers, passport) */}
        
      </>
    )}

    {/* Hold flow */}
    {paymentMethod === 'hold' && (
      <button 
        onClick={showHoldConfirmation} 
        className="w-full bg-emerald-500 py-4 rounded-2xl font-bold"
      >
        Confirm Hold
      </button>
    )}
  </div>
)}

            {showHoldInfo && !showOrderHeld && (
              <div className="mb-8 bg-zinc-800 p-6 rounded-2xl">
                <div className="text-xl font-bold mb-4">Confirm and pay later</div>
                <div className="mb-6">
                  <div className="font-semibold mb-1">Hold price for</div>
                  <div className="text-emerald-400">2 days</div>
                  <div className="text-sm">Pay by 27/06/2026</div>
                </div>
                <div className="mb-6">
                  <div className="font-semibold mb-1">Hold space for</div>
                  <div className="text-emerald-400">3 days</div>
                  <div className="text-sm">Pay by 28/06/2026</div>
                </div>
                <div className="text-sm mb-6">
                  Space on this trip will be guaranteed 3 days. After this, the guarantee will expire and the space will be released.<br /><br />
                  This price will be guaranteed 2 days. After this, the guarantee will expire and the price may change.
                </div>
                <div className="flex gap-4">
                  <button onClick={handleBookWithDuffel} className="flex-1 bg-emerald-500 py-4 rounded-2xl font-bold">Confirm hold</button>
                  <button onClick={() => setShowHoldInfo(false)} className="flex-1 bg-zinc-700 py-4 rounded-2xl">Cancel</button>
                </div>
              </div>
            )}

            {showOrderHeld && myTrips.length > 0 && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
    <div className="bg-zinc-900 p-6 rounded-3xl max-w-lg w-full">
      <h2 className="text-xl font-bold mb-4">Order held</h2>
      <div className="text-sm mb-4">The price guarantee expires in 2 days. After this prices for your trip may change.</div>
      <div className="text-sm mb-6">Space expires in 3 days. After this the space will be released and you will need to rebook.</div>

      <div className="bg-zinc-800 p-4 rounded-2xl mb-6">
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>25 Jun 2026 23:38 BST<br />Booked</div>
          <div>27 Jun 2026 23:16 BST<br />Price hold expires<br /><span className="text-emerald-400">£{myTrips[myTrips.length - 1]?.total || '0.00'}</span></div>
          <div>28 Jun 2026 23:16 BST<br />Space hold expires</div>
        </div>

        {myTrips[myTrips.length - 1]?.flights.map((f: any, index: number) => (
          <div key={index} className="mb-4 border-t border-zinc-700 pt-4">
            <div className="font-bold mb-1">
              {f.date} • Flight to {f.route?.split(' - ')[1] || ''}
            </div>
            <div>{f.time} • {f.route} • Non-stop</div>
          </div>
        ))}

        <div className="text-sm mt-6">
          Order change policy: This order is not changeable<br />
          Order refund policy: This order is not refundable
        </div>

        <div className="mt-6">
          <div className="font-bold mb-2">Passengers • adult 1</div>
          <div>Name: mr James Cooper</div>
          <div>Date of birth: 04/12/1978</div>
          <div>Gender: Male</div>
          <div>E-mail: jcooper4888@aol.co.uk</div>
          <div>Contact number: +447368841330</div>
        </div>

        <div className="mt-6">
          <div className="font-bold mb-2">Summary</div>
          <div>Order ID: {myTrips[myTrips.length - 1]?.id}</div>
          <div>Status: On hold</div>
          <div>Airline: {myTrips[myTrips.length - 1]?.airline || 'Duffel Airways'}</div>
          <div>James Cooper created this order. {new Date().toLocaleString('en-GB')}</div>
        </div>
      </div>

      <button 
        onClick={() => {
          setShowOrderHeld(false);
          setCurrentView('myTrips');
        }} 
        className="w-full bg-emerald-500 py-4 rounded-2xl font-bold">
        Done - View in My Trips
      </button>
    </div>
  </div>
)}

            {!showHoldInfo && !showOrderHeld && (
              <>
                {/* Contact & Passenger Details */}
<div className="mb-8">
  <div className="font-bold mb-3">Contact details</div>
  <div className="grid grid-cols-2 gap-4">
    <input 
      type="email" 
      placeholder="Email*" 
      value={email} 
      onChange={(e) => setEmail(e.target.value)} 
      className="p-3 bg-zinc-800 rounded-xl col-span-2" 
    />
    <input 
      type="tel" 
      placeholder="Phone number* (e.g. +447368841330)" 
      value={phone} 
      onChange={(e) => setPhone(e.target.value)} 
      className="p-3 bg-zinc-800 rounded-xl col-span-2" 
    />
  </div>
</div>

<div className="mb-8">
  <div className="font-bold mb-3">Passengers • Adult 1</div>
  <div className="grid grid-cols-2 gap-4">
    <select value={title} onChange={(e) => setTitle(e.target.value)} className="p-3 bg-zinc-800 rounded-xl">
      <option value="mr">Mr</option>
      <option value="ms">Ms</option>
      <option value="mrs">Mrs</option>
      <option value="miss">Miss</option>
      <option value="dr">Dr</option>
    </select>
    
    <input 
      type="text" 
      placeholder="Given name*" 
      value={givenName} 
      onChange={(e) => setGivenName(e.target.value)} 
      className="p-3 bg-zinc-800 rounded-xl" 
    />
    <input 
      type="text" 
      placeholder="Family name*" 
      value={familyName} 
      onChange={(e) => setFamilyName(e.target.value)} 
      className="p-3 bg-zinc-800 rounded-xl" 
    />
    <input 
      type="date" 
      value={bornOn} 
      onChange={(e) => setBornOn(e.target.value)} 
      className="p-3 bg-zinc-800 rounded-xl" 
    />
    <select value={gender} onChange={(e) => setGender(e.target.value)} className="p-3 bg-zinc-800 rounded-xl">
      <option value="m">Male</option>
      <option value="f">Female</option>
    </select>
  </div>
</div>

                {/* Passport Details */}
<div className="mb-8">
  <div className="font-bold mb-3">Passport details</div>
  <div className="grid grid-cols-1 gap-4">
    <select 
      value={passportCountry} 
      onChange={(e) => setPassportCountry(e.target.value)} 
      className="p-3 bg-zinc-800 rounded-xl"
    >
      <option value="">Country of issue*</option>
      <option value="GB">United Kingdom (GB)</option>
      <option value="ES">Spain (ES)</option>
      <option value="US">United States (US)</option>
      <option value="FR">France (FR)</option>
      <option value="DE">Germany (DE)</option>
      <option value="IT">Italy (IT)</option>
      <option value="NL">Netherlands (NL)</option>
      <option value="IE">Ireland (IE)</option>
      <option value="PT">Portugal (PT)</option>
      <option value="BE">Belgium (BE)</option>
      {/* Add more countries as needed */}
    </select>

    <input 
      type="text" 
      placeholder="Passport number*" 
      value={passportNumber} 
      onChange={(e) => setPassportNumber(e.target.value)} 
      className="p-3 bg-zinc-800 rounded-xl" 
    />

    <input 
      type="date" 
      value={passportExpiry} 
      onChange={(e) => setPassportExpiry(e.target.value)} 
      className="p-3 bg-zinc-800 rounded-xl" 
    />
  </div>
</div>

                {/* Bottom Action Button - Only active when "Pay now" is selected at the top */}
{!showHoldInfo && !showOrderHeld && paymentMethod === 'payNow' && (
  <button 
    onClick={bookNow}
    disabled={!isFormComplete()}
    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
      isFormComplete() 
        ? 'bg-emerald-500 hover:bg-emerald-600' 
        : 'bg-zinc-700 cursor-not-allowed opacity-60'
    }`}
  >
    Pay now and confirm booking
  </button>
)}

{/* Message when user hasn't chosen Pay Now yet */}
{!showHoldInfo && !showOrderHeld && paymentMethod !== 'payNow' && (
  <div className="text-center text-sm text-zinc-400 mt-4">
    Please choose <span className="font-semibold">"Pay now"</span> above to continue
  </div>
)}
              </>
            )}
          </div>
        </div>
      )}

      {/* SEAT MAP MODAL */}
      {showSeatMap && seatMapData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-2xl w-full p-8">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">Select Seat (from Duffel API)</h2>
              <button onClick={() => setShowSeatMap(false)} className="text-2xl">×</button>
            </div>

            <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
              <div className="text-center mb-4 font-bold">Economy Cabin - Seat Map</div>
              <div className="space-y-2">
                {seatMapData.data && seatMapData.data[0] && seatMapData.data[0].cabins && seatMapData.data[0].cabins[0] && seatMapData.data[0].cabins[0].rows ? (
                  seatMapData.data[0].cabins[0].rows.map((row: any, rowIndex: number) => (
                    <div key={rowIndex} className="flex justify-center gap-2">
                      {row.sections && row.sections[0] && row.sections[0].elements && row.sections[0].elements.map((element: any, elIndex: number) => {
                        if (element.type === 'seat') {
                          const isAvailable = element.available_services && element.available_services.length > 0;
                          return (
                            <button
                              key={elIndex}
                              onClick={() => isAvailable && selectSeat(element)}
                              disabled={!isAvailable}
                              className={`w-12 h-10 text-xs rounded ${isAvailable ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-zinc-700'} text-white`}
                            >
                              {element.designator}
                              {isAvailable && element.available_services[0] && (
                                <div className="text-[9px]">£{element.available_services[0].total_amount}</div>
                              )}
                            </button>
                          );
                        }
                        if (element.type === 'exit_row') return <div key={elIndex} className="w-12 h-10 text-xs flex items-center justify-center text-zinc-400">EXIT</div>;
                        if (element.type === 'lavatory') return <div key={elIndex} className="w-12 h-10 text-xs flex items-center justify-center text-zinc-400">🚽</div>;
                        if (element.type === 'galley') return <div key={elIndex} className="w-12 h-10 text-xs flex items-center justify-center text-zinc-400">🍽️</div>;
                        return null;
                      })}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-zinc-400">Loading seat map...</div>
                )}
              </div>
            </div>

            <p className="text-sm text-zinc-400 text-center">Click an available seat to select it. Price shown on seat.</p>
          </div>
        </div>
      )}

      <p className="text-center mt-12 text-xs">✅ Real Duffel booking is now active. Test it and reply with the result.</p>
    </div>
  );
}
