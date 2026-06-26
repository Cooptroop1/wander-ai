'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Loading...');

  const loadTrips = async () => {
    setStatus('Fetching from Supabase...');

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setStatus('ERROR: ' + error.message);
      console.error(error);
    } else {
      setBookings(data || []);
      setStatus(`Loaded ${data ? data.length : 0} trips`);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrips();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>
        <p>{status}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>

        <button onClick={loadTrips} className="bg-emerald-600 px-6 py-2 rounded-xl mb-8">
          Refresh
        </button>

        <p className="mb-4 text-emerald-400">{status}</p>

        {bookings.length === 0 ? (
          <p className="text-zinc-400">Still 0. Check the Supabase table directly in the dashboard.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl">
                <div className="font-semibold">{b.origin} → {b.destination}</div>
                <div className="text-sm text-zinc-400">{b.airline} • {b.status} • £{b.total}</div>
                <div className="text-xs text-zinc-500 mt-1">user_id: {b.user_id || 'MISSING'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
