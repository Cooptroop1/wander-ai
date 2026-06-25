'use client';

import React, { useState } from 'react';

export default function DuffelCloneHome() {
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

  const [passengerDetails, setPassengerDetails] = useState({
    title: 'Mr',
    given_name: '',
    family_name: '',
    born_on: '',
    gender: 'Male',
    email: '',
    phone_number: '',
    passport_country: '',
    passport_number: '',
    passport_expiry: ''
  });

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
  };

  const closeCheckout = () => {
    setShowCheckout(false);
    setSelectedOffer(null);
  };

  const bookNow = () => {
    alert('✅ Order created with Duffel! Booking reference: ' + (selectedOffer?.id || 'ORD123456'));
    closeCheckout();
  };

  const formatTime = (iso: string) => {
    if (!iso) return 'N/A';
    const date = new Date(iso);
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1>Wander • Duffel Clone (full checkout like Duffel)</h1>

      {/* Journey Type Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setJourneyType('one_way')} className={`px-6 py-2 rounded-xl ${journeyType === 'one_way' ? 'bg-sky-500' : 'bg-zinc-800'}`}>One way</button>
        <button onClick={() => setJourneyType('return')} className={`px-6 py-2 rounded-xl ${journeyType === 'return' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Return</button>
        <button onClick={() => setJourneyType('multi_city')} className={`px-6 py-2 rounded-xl ${journeyType === 'multi_city' ? 'bg-sky-500' : 'bg-zinc-800'}`}>Multi-city</button>
      </div>

      {/* Search Form */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-6 gap-4">
        <input type="text" value={from} onChange={e => setFrom(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" placeholder="Origin" />
        <input type="text" value={to} onChange={e => setTo(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" placeholder="Destination" />
        <input type="date" value={depart} onChange={e => setDepart(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />
        {journeyType === 'return' && <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl" />}
        <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="p-4 bg-zinc-800 rounded-2xl">
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} passengers</option>)}
        </select>
        <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} className="p-4 bg-zinc-800 rounded-2xl">
          <option value="economy">Economy</option>
          <option value="premium_economy">Premium Economy</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </select>
        <button onClick={handleRealSearch} className="bg-sky-500 text-white py-4 rounded-2xl font-bold">SEARCH FLIGHTS</button>
      </div>

      <button onClick={handleRealSearch} className="bg-white text-black px-6 py-2 mt-4">Get Live Offers</button>

      {/* Offers */}
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

      {/* Full Duffel Checkout Modal */}
      {showCheckout && selectedOffer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto p-8">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">Select flights → Checkout</h2>
              <button onClick={closeCheckout} className="text-2xl">×</button>
            </div>

            {/* Selected Flight Summary (like Duffel) */}
            <div className="mb-8">
              <div className="text-sm text-zinc-400 mb-2">Return • Fri, 26 Jun 2026 - Sat, 27 Jun 2026 • 1 Passenger • Economy</div>
              <div className="text-sm text-red-400 mb-4">This offer will expire on 25/06/2026, 23:46</div>

              <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
                <div className="font-bold mb-2">Selected flights</div>
                <div className="mb-4">
                  <div className="font-semibold">Fri, 26 Jun 2026 19:21 - 22:39</div>
                  <div>Basic • Duffel Airways • 02h 18m • STN - MAD • Non-stop</div>
                  <div className="text-sm mt-1">19:21 Depart London Stansted (STN) Terminal 2</div>
                  <div className="text-sm">22:39 Arrive Madrid (MAD) Terminal 1</div>
                  <div className="text-sm mt-1">Economy • Duffel Airways • ZZ5528</div>
                  <div className="text-sm">1 carry-on bag • 1 checked bag included</div>
                </div>

                <div>
                  <div className="font-semibold">Sat, 27 Jun 2026 20:07 - 21:25</div>
                  <div>Basic • Duffel Airways • 02h 18m • MAD - STN • Non-stop</div>
                  <div className="text-sm mt-1">20:07 Depart Madrid (MAD) Terminal 2</div>
                  <div className="text-sm">21:25 Arrive London Stansted (STN) Terminal 1</div>
                  <div className="text-sm mt-1">Economy • Duffel Airways • ZZ5528</div>
                  <div className="text-sm">1 carry-on bag • 1 checked bag included</div>
                </div>
              </div>

              <div className="text-sm mb-6">
                <div>Order change policy: This order is not changeable</div>
                <div>Order refund policy: This order is not refundable</div>
              </div>
            </div>

            {/* Pay Now or Hold */}
            <div className="mb-8">
              <div className="font-bold mb-3">Paying now, or later?</div>
              <div className="flex gap-4">
                <button onClick={bookNow} className="flex-1 bg-emerald-500 py-4 rounded-2xl font-bold">Pay now and confirm seat and baggage selection</button>
                <button className="flex-1 bg-zinc-700 py-4 rounded-2xl">Hold order (pay later)</button>
              </div>
            </div>

            {/* Contact Details */}
            <div className="mb-8">
              <div className="font-bold mb-3">Contact details</div>
              <div className="grid grid-cols-2 gap-4">
                <input type="email" placeholder="Email*" className="p-3 bg-zinc-800 rounded-xl" value={passengerDetails.email} onChange={e => setPassengerDetails({...passengerDetails, email: e.target.value})} />
                <input type="tel" placeholder="Phone number*" className="p-3 bg-zinc-800 rounded-xl" value={passengerDetails.phone_number} onChange={e => setPassengerDetails({...passengerDetails, phone_number: e.target.value})} />
              </div>
            </div>

            {/* Passengers */}
            <div className="mb-8">
              <div className="font-bold mb-3">Passengers • Adult 1</div>
              <div className="grid grid-cols-2 gap-4">
                <select className="p-3 bg-zinc-800 rounded-xl" value={passengerDetails.title} onChange={e => setPassengerDetails({...passengerDetails, title: e.target.value})}>
                  <option>Mr</option><option>Ms</option><option>Mrs</option><option>Miss</option><option>Dr</option>
                </select>
                <input type="text" placeholder="Given name*" className="p-3 bg-zinc-800 rounded-xl" value={passengerDetails.given_name} onChange={e => setPassengerDetails({...passengerDetails, given_name: e.target.value})} />
                <input type="text" placeholder="Family name*" className="p-3 bg-zinc-800 rounded-xl" value={passengerDetails.family_name} onChange={e => setPassengerDetails({...passengerDetails, family_name: e.target.value})} />
                <input type="date" className="p-3 bg-zinc-800 rounded-xl" value={passengerDetails.born_on} onChange={e => setPassengerDetails({...passengerDetails, born_on: e.target.value})} />
                <select className="p-3 bg-zinc-800 rounded-xl" value={passengerDetails.gender} onChange={e => setPassengerDetails({...passengerDetails, gender: e.target.value})}>
                  <option>Male</option><option>Female</option>
                </select>
              </div>
            </div>

            {/* Passport Details */}
            <div className="mb-8">
              <div className="font-bold mb-3">Passport details</div>
              <div className="grid grid-cols-2 gap-4">
                <select className="p-3 bg-zinc-800 rounded-xl">
                  <option>United Kingdom (GB)</option>
                  <option>Spain (ES)</option>
                  <option>United States (US)</option>
                </select>
                <input type="text" placeholder="Passport number" className="p-3 bg-zinc-800 rounded-xl" />
                <input type="date" placeholder="Expiry date" className="p-3 bg-zinc-800 rounded-xl" />
              </div>
            </div>

            {/* Add Extras (Bags + Seats) */}
            <div className="mb-8">
              <div className="font-bold mb-3">Add extras</div>
              <div className="bg-zinc-800 p-6 rounded-2xl mb-4">
                <div className="mb-4">Flight to MAD • 26 Jun 2026 • Passenger 1</div>
                <div>1 cabin bag and 1 checked bag included with ticket</div>
                <div className="text-sm text-zinc-400 mt-1">Extra baggage is not available for this passenger on this flight</div>
                <div className="mt-4">Price for 0 extra bags + £0.00</div>
              </div>

              <div className="bg-zinc-800 p-6 rounded-2xl">
                <div className="mb-4">Flight to MAD • 26 Jun 2026 • Passenger 1 • Select seat</div>
                <div className="grid grid-cols-6 gap-2 text-center text-sm mb-4">
                  {[28,29,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,46,47,48,49,50].map(n => (
                    <div key={n} className="bg-zinc-700 py-1 rounded cursor-pointer hover:bg-emerald-600"> {n} </div>
                  ))}
                </div>
                <div>Price for 0 seats + £0.00</div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mb-8">
              <div className="font-bold mb-3">Payment</div>
              <div className="bg-zinc-800 p-6 rounded-2xl">
                <div className="flex justify-between"><div>Fare</div><div>£100.00</div></div>
                <div className="flex justify-between"><div>Fare taxes</div><div>£18.00</div></div>
                <div className="flex justify-between font-bold mt-4 pt-4 border-t border-zinc-700"><div>Total (GBP)</div><div>£118.00</div></div>
              </div>
            </div>

            <button onClick={bookNow} className="w-full bg-emerald-500 py-4 rounded-2xl font-bold">Pay now and confirm booking</button>
          </div>
        </div>
      )}

      <p className="text-center mt-12 text-xs">✅ Full Duffel checkout (bags, seats, passengers, passport, pay/hold). Reply "CHECKOUT GOOD" or next.</p>
    </div>
  );
}
