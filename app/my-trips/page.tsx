'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [status, setStatus] = useState('Loading...');

  const load = async () => {
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
      console.log('Trips loaded:', data);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">My Trips - Debug Mode</h1>

      <button onClick={load} className="bg-emerald-600 px-6 py-3 rounded-xl mb-6">
        🔄 Manual Refresh
      </button>

      <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl mb-8">
        <p>Status: <strong>{status}</strong></p>
        <p>Trips found: <strong>{bookings.length}</strong></p>
      </div>

      {bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((b, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl">
              <div>{b.origin} → {b.destination}</div>
              <div>{b.airline} • {b.status} • £{b.total}</div>
              <div className="text-xs text-zinc-400">User ID: {b.user_id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
