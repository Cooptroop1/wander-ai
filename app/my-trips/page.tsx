'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Check current session when page loads
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await loadTripsForUser(session.user.id);
      } else {
        setUser(null);
        setBookings([]);
      }
      setLoading(false);
    };

    checkSession();

    // 2. Listen for login/logout events (so it updates live)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadTripsForUser(session.user.id);
        } else {
          setUser(null);
          setBookings([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadTripsForUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)           // ← Only get trips for this user
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading trips:', error);
    } else {
      setBookings(data || []);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>
        <p className="text-zinc-400">Loading your trips...</p>
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
            <p className="text-sm text-zinc-500 mt-2">
              Hold a flight while logged in and it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <div 
                key={index} 
                className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6"
              >
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
                    <div className="font-semibold">
                      {booking.currency} {booking.total}
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
