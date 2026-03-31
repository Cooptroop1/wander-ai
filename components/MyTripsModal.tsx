'use client';

import { X, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MyTripsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [savedTrips, setSavedTrips] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const trips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      setSavedTrips(trips);
    }
  }, [isOpen]);

  const openTrip = (trip: any) => {
    // For now we just alert — we can reopen the full panel later
    alert(`Opened saved trip: ${trip.placeName}\n\n${trip.summary}\n\nDeparture: ${trip.departureDate}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-zinc-700 flex items-center justify-between">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <MapPin /> My Trips
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-2xl">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {savedTrips.length === 0 ? (
            <p className="text-zinc-400 text-center py-12">No saved trips yet.<br />Generate and save your first one!</p>
          ) : (
            <div className="space-y-4">
              {savedTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => openTrip(trip)}
                  className="bg-zinc-800 hover:bg-zinc-700 rounded-3xl p-5 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{trip.placeName}</p>
                      <p className="text-sm text-zinc-400">
                        {trip.departureDate} → {trip.returnDate}
                      </p>
                    </div>
                    <div className="text-xs bg-emerald-400 text-black px-3 py-1 rounded-3xl font-medium">
                      Saved
                    </div>
                  </div>
                  <p className="text-sm text-emerald-400 mt-3 line-clamp-2">{trip.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
