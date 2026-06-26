'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyTrips() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) {
        setStatus('ERROR: ' + error.message);
      } else {
        setBookings(data || []);
        setStatus('LOADED ' + (data ? data.length : 0) + ' ROWS');
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* BIG OBVIOUS MARKER - YOU CANNOT MISS THIS */}
      <div className="bg-red-600 text-white text-center py-6 mb-8 rounded-2xl">
        <h1 className="text-5xl font-black">🚨 MY TRIPS TEST PAGE - VERSION 999 🚨</h1>
        <p className="text-2xl mt-2">If you see this red box, the NEW file is working</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <p className="text-2xl mb-4">Status: <span className="font-bold text-yellow-400">{status}</span></p>
        <p className="text-2xl mb-8">Rows found: <span className="font-bold text-yellow-400">{bookings.length}</span></p>

        <button 
          onClick={() => window.location.reload()} 
          className="bg-white text-black px-8 py-4 rounded-2xl text-xl font-bold mb-8"
        >
          CLICK TO REFRESH
        </button>

        {bookings.length > 0 && (
          <div className="bg-zinc-900 p-6 rounded-2xl">
            <pre className="text-xs overflow-auto">{JSON.stringify(bookings, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
