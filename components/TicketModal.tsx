// components/TicketModal.tsx
'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TicketModalProps {
  booking: any;
  onClose: () => void;
}

export default function TicketModal({ booking, onClose }: TicketModalProps) {
  const handleDownload = () => {
    alert('📄 Ticket PDF downloaded (duffel-ticket-' + booking.duffelId + '.pdf) • Saved to Downloads');
    // Real app: generate with jsPDF / react-pdf or server PDF
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-[460px] w-full shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="font-semibold">Boarding Pass • {booking.duffelId}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6 bg-zinc-100">
          <div className="bg-white border-2 border-dashed border-zinc-400 rounded-xl p-5 text-center">
            <div className="flex justify-between text-xs mb-3">
              <div>BA 327</div>
              <div>10 JUL 2026 • 09:15 LHR</div>
            </div>
            <div className="flex justify-between text-3xl font-bold tracking-widest mb-4">
              {booking.origin}  →  {booking.destination}
            </div>
            <div className="text-xs opacity-60">COOPER TROOP • 1 ADULT • SEAT 12A • BAGGAGE 1PC</div>

            <div className="my-6 text-[42px] font-mono tracking-[8px] text-zinc-300 select-none">
              QR•DUFFEL•{booking.duffelId.slice(-6)}
            </div>

            <Button onClick={handleDownload} className="w-full">
              ⬇️ Download PDF • Add to Apple Wallet
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Button variant="outline" onClick={() => alert('✅ Ticket emailed again')}>Email again</Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>

          <p className="text-center text-xs text-zinc-400">
            Real Duffel order ticket link would be here • Download works instantly
          </p>
        </div>

        <div className="px-6 py-4 flex gap-3 border-t">
          <Button className="flex-1" onClick={handleDownload}>Save PDF</Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
