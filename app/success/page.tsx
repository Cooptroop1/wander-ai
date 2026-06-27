'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

interface Order {
  id: string;
  booking_reference: string;
  status: string;
  total_amount: string;
  total_currency: string;
  passengers: any[];
  slices: any[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Create Supabase client directly (no extra package needed)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!orderId) {
      setError('No order ID found in URL');
      setLoading(false);
      return;
    }

    const fetchAndSaveOrder = async () => {
      try {
        // Fetch order from Duffel
        const res = await fetch(`/api/duffel/get-order?order_id=${orderId}`);
        const result = await res.json();

        if (!result.success) {
          setError(result.error);
          setLoading(false);
          return;
        }

        const orderData = result.order;
        setOrder(orderData);

        // Get current logged in user
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Delete old rows for this user + order
          await supabase
            .from('bookings')
            .delete()
            .eq('user_id', user.id)
            .eq('duffel_order_id', orderData.id);

          // Insert new booking
          const { error: insertError } = await supabase.from('bookings').insert({
            user_id: user.id,
            duffel_order_id: orderData.id,
            booking_reference: orderData.booking_reference,
            status: orderData.status,
            total_amount: orderData.total_amount,
            total_currency: orderData.total_currency,
            slices: orderData.slices,
            passengers: orderData.passengers,
            raw_order: orderData,
          });

          if (!insertError) {
            setSaved(true);
          } else {
            console.error('Insert error:', insertError);
          }
        } else {
          console.warn('User not logged in - booking not linked to account');
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSaveOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-xl">Saving your booking to My Trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!order) return <div>No order found</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-zinc-950 text-white min-h-screen">
      <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-8 text-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">Booking Confirmed!</h1>
        <p className="text-emerald-300">Thank you for your booking.</p>
        {saved && <p className="text-sm text-emerald-400 mt-2">✓ Saved to your My Trips</p>}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h2 className="text-xl font-semibold mb-6">Booking Details</h2>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
          <div>
            <p className="text-zinc-400 text-xs tracking-widest">BOOKING REFERENCE (PNR)</p>
            <p className="font-mono text-3xl font-bold tracking-[3px] mt-1">{order.booking_reference}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs tracking-widest">STATUS</p>
            <p className="font-semibold text-xl capitalize mt-1">{order.status}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs tracking-widest">TOTAL PAID</p>
            <p className="font-semibold text-2xl mt-1">{order.total_currency} {order.total_amount}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs tracking-widest">ORDER ID</p>
            <p className="font-mono text-xs break-all text-zinc-400 mt-1">{order.id}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <a href="/my-trips" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-semibold">
          View My Trips →
        </a>
        <a href="/" className="px-8 py-4 border border-zinc-700 hover:bg-zinc-900 rounded-2xl font-medium">
          Search more flights
        </a>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
