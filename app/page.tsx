'use client';

import React, { useState } from 'react';

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

  const selectOffer = (offer: any) => {
    setSelectedOffer(offer);
    setShowCheckout(true);
    setShowHoldInfo(false);
    setShowOrderHeld(false);
  };

  const closeCheckout = () => {
    setShowCheckout(false);
    setSelectedOffer(null);
    setShowHoldInfo(false);
    setShowOrderHeld(false);
  };

  const bookNow = () => {
    const newTrip = {
      id: selectedOffer?.id || 'ORD' + Date.now(),
      status: 'Booked',
      total: selectedOffer?.total_amount || '£118.00',
      currency: selectedOffer?.total_currency || 'GBP',
      airline: 'Duffel Airways',
      created: new Date().toLocaleString('en-GB'),
      flights: [
        { date: '26 Jun 2026', time: '19:21 - 22:39', route: 'STN - MAD', status: 'Confirmed' },
        { date: '27 Jun 2026', time: '20:07 - 21:25', route: 'MAD - STN', status: 'Confirmed' }
      ],
      passenger: { name: 'mr James Cooper', dob: '04/12/1978', gender: 'Male', email: 'jcooper4888@aol.co.uk', phone: '+447368841330' }
    };
    setMyTrips([...myTrips, newTrip]);
    alert('✅ Booking confirmed! Check My Trips.');
    closeCheckout();
    setCurrentView('myTrips');
  };

  const showHoldConfirmation = () => {
    setShowHoldInfo(true);
  };

  const confirmHold = () => {
    const newTrip = {
      id: selectedOffer?.id || 'ORD' + Date.now(),
      status: 'On hold',
      total: selectedOffer?.total_amount || '£158.00',
      currency: selectedOffer?.total_currency || 'GBP',
      airline: 'Duffel Airways',
      created: new Date().toLocaleString('en-GB'),
      holdUntil: '28 Jun 2026',
      flights: [
        { date: '26 Jun 2026', time: '19:21 - 22:39', route: 'STN - MAD', status: 'On hold' },
        { date: '27 Jun 2026', time: '20:07 - 21:25', route: 'MAD - STN', status: 'On hold' }
      ],
      passenger: { name: 'mr James Cooper', dob: '04/12/1978', gender: 'Male', email: 'jcooper4888@aol.co.uk', phone: '+447368841330' }
    };
    setMyTrips([...myTrips, newTrip]);
    setShowHoldInfo(false);
    setShowOrderHeld(true);
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
      {/* Top Navigation */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-2">
          <button onClick={() => setCurrentView('search')} className={`px-6 py-2 rounded-xl ${currentView === 'search' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Search</button>
          <button onClick={() => setCurrentView('myTrips')} className={`px-6 py-2 rounded-xl ${currentView === 'myTrips' ? 'bg-sky-500' : 'bg-zinc-800'}`}>My Trips ({myTrips.length})</button>
        </div>
        <h1 className="text-2xl font-bold">Wander • Duffel Clone</h1>
      </div>

      {/* SEARCH VIEW */}
      {currentView === 'search' && (
        <>
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

            {selectedTrip.flights.map((f: any, fi: number) => (
              <div key={fi} className="mb-6">
                <div className="font-bold mb-2">{f.date} {f.time} • {f.route}</div>
                <div className="text-sm text-emerald-400 mb-2">{f.status}</div>
                <div className="text-sm">19:21 Depart London Stansted (STN) Terminal 2</div>
                <div className="text-sm">22:39 Arrive Madrid (MAD) Terminal 1</div>
                <div className="text-sm mt-1">Economy • Duffel Airways • Boeing 777-300 • ZZ5528</div>
                <div className="text-sm">1 carry-on bag • 1 checked bag</div>
              </div>
            ))}

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

      {/* Checkout Modal (same as before) */}
      {showCheckout && selectedOffer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto p-8">
            {/* ... (same checkout content as previous version) ... */}
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">Checkout</h2>
              <button onClick={closeCheckout} className="text-2xl">×</button>
            </div>

            <div className="mb-8">
              <div className="text-sm text-zinc-400 mb-2">Return • 1 Passenger • Economy</div>
              <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
                <div className="font-bold mb-2">Selected flights</div>
                <div className="mb-4">
                  <div className="font-semibold">Fri, 26 Jun 2026 19:21 - 22:39</div>
                  <div>Basic • Duffel Airways • 02h 18m • STN - MAD • Non-stop</div>
                  <div className="text-sm mt-1">19:21 Depart London Stansted (STN) Terminal 2</div>
                  <div className="text-sm">22:39 Arrive Madrid (MAD) Terminal 1</div>
                  <div className="text-sm mt-1">Economy • Duffel Airways • ZZ5528 • 1 carry-on + 1 checked bag included</div>
                </div>
                <div>
                  <div className="font-semibold">Sat, 27 Jun 2026 20:07 - 21:25</div>
                  <div>Basic • Duffel Airways • 02h 18m • MAD - STN • Non-stop</div>
                  <div className="text-sm mt-1">20:07 Depart Madrid (MAD) Terminal 2</div>
                  <div className="text-sm">21:25 Arrive London Stansted (STN) Terminal 1</div>
                  <div className="text-sm mt-1">Economy • Duffel Airways • ZZ5528 • 1 carry-on + 1 checked bag included</div>
                </div>
              </div>
            </div>

            {!showHoldInfo && !showOrderHeld && (
              <div className="mb-8">
                <div className="font-bold mb-3">Paying now, or later?</div>
                <div className="flex gap-4">
                  <button onClick={bookNow} className="flex-1 bg-emerald-500 py-4 rounded-2xl font-bold">Pay now and confirm seat and baggage selection</button>
                  <button onClick={showHoldConfirmation} className="flex-1 bg-zinc-700 py-4 rounded-2xl">Hold order (pay later)</button>
                </div>
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
                  <button onClick={confirmHold} className="flex-1 bg-emerald-500 py-4 rounded-2xl font-bold">Confirm hold</button>
                  <button onClick={() => setShowHoldInfo(false)} className="flex-1 bg-zinc-700 py-4 rounded-2xl">Cancel</button>
                </div>
              </div>
            )}

            {showOrderHeld && (
              <div className="mb-8">
                <div className="bg-emerald-900/30 border border-emerald-500 p-6 rounded-2xl mb-6">
                  <div className="text-2xl font-bold text-emerald-400 mb-2">Order held</div>
                  <div className="text-sm">The price guarantee expires in 2 days. After this prices for your trip may change.</div>
                  <div className="text-sm">Space expires in 3 days. After this the space will be released and you will need to rebook.</div>
                </div>

                <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
                  <div className="grid grid-cols-3 gap-4 text-sm mb-6">
                    <div>
                      <div className="text-zinc-400">25 Jun 2026 23:38 BST</div>
                      <div className="font-semibold">Booked</div>
                    </div>
                    <div>
                      <div className="text-zinc-400">27 Jun 2026 23:16 BST</div>
                      <div className="font-semibold">Price hold expires</div>
                      <div className="text-emerald-400">£158.00</div>
                    </div>
                    <div>
                      <div className="text-zinc-400">28 Jun 2026 23:16 BST</div>
                      <div className="font-semibold">Space hold expires</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="font-bold mb-2">26 Jun 2026 19:21 BST • Flight to MAD</div>
                    <div>19:21 - 22:39 • Basic • Duffel Airways • 02h 18m • STN - MAD • Non-stop</div>
                    <div className="text-sm mt-1">19:21 Depart London Stansted (STN) Terminal 2</div>
                    <div className="text-sm">22:39 Arrive Madrid (MAD) Terminal 1</div>
                    <div className="text-sm mt-1">Economy • Duffel Airways • Boeing 777-300 • ZZ5528</div>
                    <div className="text-sm">1 carry-on bag • 1 checked bag</div>
                  </div>

                  <div className="mb-6">
                    <div className="font-bold mb-2">27 Jun 2026 20:07 BST • Flight to STN</div>
                    <div>20:07 - 21:25 • Basic • Duffel Airways • 02h 18m • MAD - STN • Non-stop</div>
                    <div className="text-sm mt-1">20:07 Depart Madrid (MAD) Terminal 2</div>
                    <div className="text-sm">21:25 Arrive London Stansted (STN) Terminal 1</div>
                    <div className="text-sm mt-1">Economy • Duffel Airways • Boeing 777-300 • ZZ5528</div>
                    <div className="text-sm">1 carry-on bag • 2 checked bags</div>
                  </div>

                  <div className="text-sm mb-6">
                    <div>Order change policy: This order is not changeable</div>
                    <div>Order refund policy: This order is not refundable</div>
                  </div>

                  <div className="mb-6">
                    <div className="font-bold mb-2">Passengers • adult 1</div>
                    <div>Name: mr James Cooper</div>
                    <div>Date of birth: 04/12/1978</div>
                    <div>Gender: Male</div>
                    <div>E-mail: jcooper4888@aol.co.uk</div>
                    <div>Contact number: +447368841330</div>
                  </div>

                  <div>
                    <div className="font-bold mb-2">Summary</div>
                    <div>Order ID: {selectedOffer?.id || 'ord_0000B7hok9gr34aFUMqM80'}</div>
                    <div>Status: On hold</div>
                    <div>Airline: Duffel Airways</div>
                    <div>James Cooper created this order. {new Date().toLocaleString('en-GB')}</div>
                  </div>
                </div>

                <button onClick={closeCheckout} className="w-full bg-emerald-500 py-4 rounded-2xl font-bold">Done - View in My Trips</button>
              </div>
            )}

            {!showHoldInfo && !showOrderHeld && (
              <>
                <div className="mb-8">
                  <div className="font-bold mb-3">Contact details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="email" placeholder="Email*" className="p-3 bg-zinc-800 rounded-xl" />
                    <input type="tel" placeholder="Phone number*" className="p-3 bg-zinc-800 rounded-xl" />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="font-bold mb-3">Passengers • Adult 1</div>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="p-3 bg-zinc-800 rounded-xl"><option>Mr</option><option>Ms</option><option>Mrs</option><option>Miss</option><option>Dr</option></select>
                    <input type="text" placeholder="Given name*" className="p-3 bg-zinc-800 rounded-xl" />
                    <input type="text" placeholder="Family name*" className="p-3 bg-zinc-800 rounded-xl" />
                    <input type="date" className="p-3 bg-zinc-800 rounded-xl" />
                    <select className="p-3 bg-zinc-800 rounded-xl"><option>Male</option><option>Female</option></select>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="font-bold mb-3">Passport details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="p-3 bg-zinc-800 rounded-xl"><option>United Kingdom (GB)</option><option>Spain (ES)</option></select>
                    <input type="text" placeholder="Passport number" className="p-3 bg-zinc-800 rounded-xl" />
                    <input type="date" placeholder="Expiry date" className="p-3 bg-zinc-800 rounded-xl" />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="font-bold mb-3">Add extras</div>
                  <div className="bg-zinc-800 p-6 rounded-2xl mb-4">
                    <div>Flight to MAD • 26 Jun 2026 • Passenger 1</div>
                    <div>1 cabin bag and 1 checked bag included</div>
                    <div className="mt-4">Price for 0 extra bags + £0.00</div>
                  </div>
                  <div className="bg-zinc-800 p-6 rounded-2xl">
                    <div>Flight to MAD • 26 Jun 2026 • Passenger 1 • Select seat</div>
                    <div className="grid grid-cols-6 gap-2 text-center text-sm mb-4">
                      {[28,29,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,46,47,48,49,50].map(n => (
                        <div key={n} className="bg-zinc-700 py-1 rounded cursor-pointer hover:bg-emerald-600">{n}</div>
                      ))}
                    </div>
                    <div>Price for 0 seats + £0.00</div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="font-bold mb-3">Payment</div>
                  <div className="bg-zinc-800 p-6 rounded-2xl">
                    <div className="flex justify-between"><div>Fare</div><div>£100.00</div></div>
                    <div className="flex justify-between"><div>Fare taxes</div><div>£18.00</div></div>
                    <div className="flex justify-between font-bold mt-4 pt-4 border-t border-zinc-700"><div>Total (GBP)</div><div>£118.00</div></div>
                  </div>
                </div>

                <button onClick={bookNow} className="w-full bg-emerald-500 py-4 rounded-2xl font-bold">Pay now and confirm booking</button>
              </>
            )}
          </div>
        </div>
      )}

      <p className="text-center mt-12 text-xs">✅ My Trips as its own screen + tap for full details. Reply "DETAILS GOOD" or next.</p>
    </div>
  );
}
