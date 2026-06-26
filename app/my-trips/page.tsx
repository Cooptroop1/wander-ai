'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUserAndTrips = async () => {
      // Get current logged in user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch only this user's bookings (RLS will also help)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips:', error);
      } else {
        setBookings(data || []);
      }

      setLoading(false);
    };

    getUserAndTrips();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center">
          <p className="text-lg">Please log in to see your trips.</p>
        </div>
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
            <p className="text-sm text-zinc-500 mt-2">Hold a flight and it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
                <div className="flex justify-between items-center">
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
                    <div className="font-semibold">{booking.currency} {booking.total}</div>
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
