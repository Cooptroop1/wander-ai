'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserTrips(session.user.id);
        } else {
          setUser(null);
          setBookings([]);
        }
        setLoading(false);
      }
    );

    // Check current session on page load
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserTrips(session.user.id);
      }
      setLoading(false);
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const loadUserTrips = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading trips:', error);
    } else {
      setBookings(data || []);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center">
          <p>Please log in to see your trips.</p>
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
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
                <div>{b.origin} → {b.destination}</div>
                <div className="text-sm text-zinc-400">{b.airline} • {b.status}</div>
                <div>£{b.total}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
