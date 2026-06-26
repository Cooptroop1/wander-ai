'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [status, setStatus] = useState('Starting...');
  const [supabaseUrl, setSupabaseUrl] = useState('');

  const load = async () => {
    setStatus('Fetching...');

    // Show which Supabase project the frontend is actually using
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NO URL FOUND';
    setSupabaseUrl(url);

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setStatus('ERROR: ' + error.message);
      console.error('Supabase error:', error);
    } else {
      setBookings(data || []);
      setStatus(`Loaded ${data ? data.length : 0} rows from Supabase`);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">My Trips - DEBUG</h1>

      <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl mb-8 space-y-2 text-sm">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Supabase URL (frontend is using):</strong> {supabaseUrl}</p>
        <p><strong>Rows found:</strong> {bookings.length}</p>
      </div>

      <button onClick={load} className="bg-emerald-600 px-6 py-2 rounded-xl mb-8">
        Refresh
      </button>

      {bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((b, i) => (
            <div key={i} className="bg-zinc-900 p-4 rounded-xl text-xs">
              <pre>{JSON.stringify(b, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}

      {bookings.length === 0 && (
        <p className="text-red-400">Still showing 0. Check the debug box above.</p>
      )}
    </div>
  );
}
