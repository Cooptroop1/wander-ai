'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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

  useEffect(() => {
    if (!orderId) {
      setError('No order ID found in URL');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/duffel/get-order?order_id=${orderId}`);
        const result = await res.json();

        if (!result.success) {
          setError(result.error);
        } else {
          setOrder(result.order);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading your booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div>No order found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Booking Confirmed!</h1>
        <p className="text-green-600">Thank you for your booking.</p>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Booking Details</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Booking Reference (PNR)</p>
            <p className="font-mono text-2xl font-bold tracking-wider">{order.booking_reference}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-semibold capitalize text-lg">{order.status}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Paid</p>
            <p className="font-semibold text-lg">{order.total_currency} {order.total_amount}</p>
          </div>
          <div>
            <p className="text-gray-500">Order ID</p>
            <p className="font-mono text-xs break-all text-gray-600">{order.id}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t text-sm text-gray-600">
          A confirmation email has been sent with your e-ticket.<br />
          To manage or cancel this booking, use the <strong>Booking Reference (PNR)</strong> above on the airline’s website.
        </div>
      </div>

      <div className="mt-8 text-center">
        <a href="/" className="text-blue-600 hover:underline font-medium">
          ← Search for more flights
        </a>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading booking details...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
