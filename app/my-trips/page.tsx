'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState('Initialising...');

  const fetchTrips = async () => {
    setStatus('Fetching from Supabase...');
    console.log('=== MY TRIPS DEBUG: Fetching ===');

    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session);

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Raw data from Supabase:', data);
    console.log('Error:', error);

    if (error) {
      setStatus('ERROR: ' + error.message);
    } else {
      setBookings(data || []);
      setStatus(`Loaded ${data ? data.length : 0} trips`);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Trips — DEBUG MODE</h1>

        <button onClick={fetchTrips} className="bg-emerald-600 px-6 py-2 rounded-xl mb-6">
          Manual Refresh
        </button>

        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
          <p>Status: {status}</p>
          <p>Logged in user: {user ? user.email : 'Not logged in'}</p>
          <p>Trips found: {bookings.length}</p>

          <pre className="text-xs mt-4 overflow-auto max-h-96 bg-zinc-950 p-4">
            {JSON.stringify(bookings, null, 2)}
          </pre>
        </div>

        {bookings.length === 0 && (
          <p className="mt-8 text-zinc-400">No trips shown. Check the debug box above.</p>
        )}
      </div>
    </div>
  );
}
