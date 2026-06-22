// app/my-trips/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([
    { 
      id: "ord_test_123", 
      pnr: "RZPNX8", 
      route: "LHR → JFK", 
      date: "22 Jun 2026", 
      status: "Confirmed", 
      amount: "£32.24" 
    },
  ]);
  const [canceling, setCanceling] = useState<string | null>(null);

  const cancelBooking = async (orderId: string) => {
    if (!confirm("Cancel this booking? This cannot be undone.")) return;

    setCanceling(orderId);
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`Cancellation quote: £${data.refundAmount} refund. (In real app we would confirm here)`);
        // Refresh list or mark as cancelled
        setBookings(bookings.map(b => b.id === orderId ? {...b, status: "Cancelled"} : b));
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      alert("Cancel request failed");
    }
    setCanceling(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">🌍 My Trips</h1>

      <div className="space-y-6">
        {bookings.map(b => (
          <div key={b.id} className="bg-zinc-900 p-6 rounded-3xl flex justify-between items-center">
            <div>
              <p className="font-bold text-xl">{b.route}</p>
              <p className="text-zinc-400">{b.date} • PNR: {b.pnr}</p>
              <p className={`font-medium ${b.status === "Confirmed" ? "text-emerald-400" : "text-red-400"}`}>
                {b.status}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">{b.amount}</p>
              {b.status === "Confirmed" && (
                <button 
                  onClick={() => cancelBooking(b.id)}
                  disabled={canceling === b.id}
                  className="mt-3 px-6 py-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 rounded-2xl text-sm"
                >
                  {canceling === b.id ? "Cancelling..." : "Cancel Booking"}
                </button>
              )}
              <button className="mt-2 px-6 py-2 bg-white text-black rounded-2xl">View Ticket</button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-zinc-500 mt-12">
        Refunds follow airline rules. Money returns to original payment method.
      </p>
    </div>
  );
}
