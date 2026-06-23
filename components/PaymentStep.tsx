// components/PaymentStep.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';

interface PaymentStepProps {
  bookingData: any; // origin, destination, total, segments, etc. from context/flow
  onSuccess: (bookingId: string) => void;
  onBack: () => void;
}

export default function PaymentStep({ bookingData, onSuccess, onBack }: PaymentStepProps) {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('424');

  const total = bookingData?.total || 487;

  const handlePay = async () => {
    setProcessing(true);

    // Simulate Stripe + real Duffel create
    await new Promise((r) => setTimeout(r, 1650));

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...bookingData,
        paymentConfirmed: true,
      }),
    });

    const result = await res.json();

    setProcessing(false);
    onSuccess(result.booking.id);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={onBack}>← Passenger details</Button>
        <div className="text-right">
          <div className="text-3xl font-bold">£{total}</div>
          <div className="text-xs text-emerald-600">All taxes & fees included • Instant confirmation</div>
        </div>
      </div>

      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" /> Secure checkout • Powered by Stripe
            <div className="ml-auto flex gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Visa_2014_logo_detail.svg" alt="visa" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Mastercard_2019_logo.svg" alt="mastercard" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Amex_logo_%282020%29.svg" alt="amex" className="h-5" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Card number</Label>
              <div className="relative">
                <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="pl-11" />
                <CreditCard className="absolute left-3 top-3 text-zinc-400" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>Expiry date</Label>
                <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
              </div>
              <div>
                <Label>CVC</Label>
                <Input value={cvc} onChange={(e) => setCvc(e.target.value)} maxLength={4} />
              </div>
            </div>
            <div>
              <Label>Name on card</Label>
              <Input defaultValue="Cooptroop Cooper" />
            </div>
          </div>

          <Button
            onClick={handlePay}
            disabled={processing}
            className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700"
          >
            {processing ? '🔒 Processing payment • Contacting Duffel...' : `Pay £${total} & Confirm flight`}
          </Button>

          <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
            <div className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</div>
            <div>Duffel • Stripe • 3D Secure ready</div>
          </div>
          <p className="text-center text-xs text-zinc-400">
            Your ticket and receipt will be sent to cooper48888@gmail.com instantly
          </p>
        </CardContent>
      </Card>

      <button className="mx-auto block mt-6 text-sm text-zinc-500 underline" onClick={onBack}>
        Need to edit details?
      </button>
    </div>
  );
}
