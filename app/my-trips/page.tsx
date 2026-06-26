'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: string;
  duffel_order_id: string;
  status: string;
  total: number;
  currency: string;
  airline: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  created_at: string;
}

export default function MyTrips() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings from Supabase:', error);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>
        <p>Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>

        {bookings.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center">
            <p className="text-zinc-400">You don&apos;t have any trips yet.</p>
            <p className="text-sm text-zinc-500 mt-2">
              Hold a flight and it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">
                      {booking.origin} → {booking.destination}
                    </div>
                    <div className="text-sm text-zinc-400 mt-1">
                      {booking.departure_date}
                      {booking.return_date && ` → ${booking.return_date}`}
                    </div>
                    <div className="text-sm text-zinc-500 mt-1">
                      {booking.airline} • {booking.status}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">
                      {booking.currency} {booking.total}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1">
                      {booking.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
