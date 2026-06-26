'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Trip {
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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips:', error);
      } else {
        setTrips(data || []);
      }
      setLoading(false);
    };

    fetchTrips();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Trips</h1>
          <p>Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>

        {trips.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center">
            <p className="text-zinc-400">You don&apos;t have any trips yet.</p>
            <p className="text-sm text-zinc-500 mt-2">Hold or book a flight to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-lg">
                    {trip.origin} → {trip.destination}
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">
                    {trip.departure_date} {trip.return_date ? `→ ${trip.return_date}` : ''}
                  </div>
                  <div className="text-sm text-zinc-500 mt-1">
                    {trip.airline} • {trip.status}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">£{trip.total}</div>
                  <div className="text-xs text-emerald-400 mt-1">On hold</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
