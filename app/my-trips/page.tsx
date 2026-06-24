// app/my-trips/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TicketModal from '@/components/TicketModal';

type Booking = {
  id: string;
  duffelId: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  total: number;
  passengers: number;
  segments: any[];
};

export default function MyTrips() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openTicket = (booking: Booking) => setSelectedBooking(booking);

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-semibold mb-2">My Trips</h1>
        <button 
  onClick={() => window.location.href = '/'}
  className="mb-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl flex items-center gap-2"
>
  ← Back to World Map / Book New Flight
</button>
        <p className="text-zinc-600 mb-8">All bookings • Powered by Duffel • Real DB sync</p>

        {loading ? (
          <div className="text-center py-20">Loading your trips...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">No trips yet • Book your first flight above</div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <Card className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-700">
                <div className="flex gap-6 items-center">
                  <div className="text-4xl">✈️</div>
                  <div>
                    <div className="font-semibold text-lg">
                      {b.origin} → {b.destination} • {b.departure.split(' ')[0]}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {b.segments[0]?.airline} {b.segments[0]?.flight} • {b.passengers} passenger • £{b.total}
                    </div>
                    <div className="text-emerald-600 text-xs font-medium">✓ Confirmed • Ticket ready</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => openTicket(b)}>
                    View Ticket
                  </Button>
                  <Button variant="default" onClick={() => window.open(`/ticket/${b.id}`, '_blank')}>
                    Download PDF
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 text-center text-xs text-zinc-400">
          New bookings from PaymentStep appear here instantly • Fully synced with mock DB + localStorage
        </div>
      </div>

      {selectedBooking && (
        <TicketModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
}
