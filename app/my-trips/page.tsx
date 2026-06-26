'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [status, setStatus] = useState('Loading...');
  const [connectedUrl, setConnectedUrl] = useState('');

  const check = async () => {
    setStatus('Checking Supabase connection...');

    // Show which project the frontend is actually connected to
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT FOUND';
    setConnectedUrl(url);

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setStatus('ERROR: ' + error.message);
      console.error('Supabase error:', error);
    } else {
      setBookings(data || []);
      setStatus(`SUCCESS - Found ${data ? data.length : 0} rows in bookings table`);
    }
  };

  useEffect(() => {
    check();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">My Trips - Connection Test</h1>

      <div className="bg-zinc-900 border border-red-500 p-6 rounded-2xl mb-8">
        <p className="font-bold text-red-400 mb-2">IMPORTANT - Compare these two URLs:</p>
        <p><strong>Frontend is connected to this Supabase project:</strong></p>
        <p className="font-mono text-sm break-all bg-zinc-950 p-2 mt-1">{connectedUrl}</p>
        
        <p className="mt-4"><strong>Rows found in "bookings" table:</strong> {bookings.length}</p>
        <p className="mt-2"><strong>Status:</strong> {status}</p>
      </div>

      <button onClick={check} className="bg-emerald-600 px-6 py-2 rounded-xl mb-8">
        Test Again
      </button>

      {bookings.length > 0 && (
        <div>
          <p className="mb-4 text-emerald-400">Data exists! Here are the rows:</p>
          {bookings.map((b, i) => (
            <div key={i} className="bg-zinc-900 p-4 rounded-xl mb-2 text-xs">
              <pre>{JSON.stringify(b, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}

      {bookings.length === 0 && (
        <p className="text-red-400">Still 0 rows. The frontend is probably connected to a different Supabase project than the one you're looking at.</p>
      )}
    </div>
  );
}
