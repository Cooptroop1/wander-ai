'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [status, setStatus] = useState('Loading...');
  const [url, setUrl] = useState('');

  useEffect(() => {
    const check = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NO URL FOUND';
      setUrl(supabaseUrl);

      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) {
        setStatus('ERROR: ' + error.message);
      } else {
        setBookings(data || []);
        setStatus(`Found ${data ? data.length : 0} rows`);
      }
    };
    check();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">My Trips - TEST</h1>

      <div className="bg-red-900 border border-red-500 p-6 rounded-2xl mb-8">
        <p className="font-bold">Frontend Supabase URL:</p>
        <p className="font-mono text-sm break-all">{url}</p>
        <p className="mt-4">Status: {status}</p>
        <p>Rows: {bookings.length}</p>
      </div>

      <button onClick={() => window.location.reload()} className="bg-emerald-600 px-6 py-2 rounded-xl">
        Refresh Page
      </button>
    </div>
  );
}
