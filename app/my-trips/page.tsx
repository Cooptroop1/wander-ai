// app/my-trips/page.tsx
'use client';
import { useState } from 'react';

export default function MyTrips() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const viewTicket = (booking: any) => {
    setSelectedTicket(booking);
  };

  const closeTicket = () => setSelectedTicket(null);

  const bookings = [
    { 
      id: "ord_test_123", 
      pnr: "RZPNX8", 
      route: "LHR → JFK", 
      date: "22 Jun 2026", 
      status: "Confirmed", 
      amount: "£32.24",
      passenger: "Alex Cooper",
      seat: "12A"
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-700 bg-zinc-900 py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-between">
          <button onClick={() => window.location.href = "/"} className="text-emerald-400 font-semibold">← Back to Map</button>
          <h1 className="text-3xl font-bold">🌍 My Trips</h1>
          <button onClick={() => window.location.href = "/"} className="px-5 py-2 bg-emerald-600 rounded-2xl">+ New Trip</button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {bookings.map(b => (
          <div key={b.id} className="bg-zinc-900 p-6 rounded-3xl flex justify-between items-center">
            <div>
              <p className="font-bold text-xl">{b.route}</p>
              <p className="text-zinc-400">{b.date} • PNR: {b.pnr}</p>
              <p className="text-emerald-400">✅ Confirmed</p>
            </div>
            <div>
              <button onClick={() => viewTicket(b)} className="px-6 py-3 bg-white text-black rounded-2xl mr-3">📄 View Ticket</button>
              <button className="px-6 py-3 bg-zinc-700 rounded-2xl">Cancel</button>
            </div>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000]">
          <div className="bg-zinc-900 p-8 rounded-3xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold">🎟️ E-Ticket</h2>
            <div className="bg-white text-black p-6 my-6 rounded-2xl">Alex Cooper<br />LHR → JFK<br />Seat 12A • QR Code</div>
            <button onClick={closeTicket} className="px-8 py-3 bg-zinc-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
