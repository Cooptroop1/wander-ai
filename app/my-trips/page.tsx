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
      date: "22 Jun 2026 08:45", 
      status: "Confirmed", 
      amount: "£32.24",
      passenger: "Alex Cooper",
      seat: "12A"
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-zinc-700 bg-zinc-900">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => window.location.href = "/"} className="text-emerald-400 font-semibold flex items-center gap-2">
            ← Back to Map
          </button>
          <h1 className="text-3xl font-bold">🌍 My Trips</h1>
          <button onClick={() => window.location.href = "/"} className="px-5 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-2xl">New Trip</button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {bookings.map(b => (
            <div key={b.id} className="bg-zinc-900 p-6 rounded-3xl flex justify-between items-center">
              <div>
                <p className="font-bold text-xl">{b.route}</p>
                <p className="text-zinc-400">{b.date} • PNR: {b.pnr}</p>
                <p className="text-emerald-400 font-medium">✅ {b.status}</p>
              </div>
              <div className="text-right space-y-3">
                <p className="font-bold">{b.amount}</p>
                <button onClick={() => viewTicket(b)} className="px-6 py-2 bg-white text-black rounded-2xl">📄 View Ticket</button>
                <button className="px-6 py-2 bg-zinc-700 rounded-2xl">Cancel</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center space-x-6">
          <button onClick={() => window.location.href = "/"} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-3xl font-semibold">🗺️ Back to Map</button>
          <button className="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-3xl">New Trip</button>
        </div>
      </div>

      {/* Ticket View Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000]">
          <div className="bg-zinc-900 p-8 rounded-3xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">🎟️ E-Ticket • Boarding Pass</h2>
            <div className="bg-white text-black p-6 rounded-2xl text-center">
              <p className="font-bold text-xl">{selectedTicket.passenger}</p>
              <p className="text-xl">{selectedTicket.route}</p>
              <p>{selectedTicket.date} • Seat {selectedTicket.seat}</p>
              <div className="my-6 font-mono text-5xl border-2 border-dashed border-black p-4">QR CODE • SCAN HERE</div>
              <button className="w-full py-3 bg-black text-white rounded-xl">📥 Download Full PDF</button>
            </div>
            <button onClick={closeTicket} className="mt-6 block mx-auto text-zinc-400 underline">Close Ticket</button>
          </div>
        </div>
      )}
    </div>
  );
}
