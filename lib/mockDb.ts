// lib/mockDb.ts
export type Booking = {
  id: string;
  duffelId: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  passengers: number;
  total: number;
  status: 'confirmed';
  segments: Array<{ airline: string; flight: string; duration: string }>;
  createdAt: string;
};

let bookings: Booking[] = [
  {
    id: 'bk_001',
    duffelId: 'ord_abc123',
    origin: 'LHR',
    destination: 'MAD',
    departure: '2026-07-05 10:30',
    arrival: '2026-07-05 13:45',
    passengers: 1,
    total: 324,
    status: 'confirmed',
    segments: [{ airline: 'British Airways', flight: 'BA327', duration: '3h 15m' }],
    createdAt: '2026-06-23T14:22:00Z',
  },
];

export const db = {
  getAll: () => [...bookings],
  add: (data: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    const newBooking: Booking = {
      ...data,
      id: `bk_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    bookings.unshift(newBooking);
    // Simulate persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('duffelBookings', JSON.stringify(bookings));
    }
    return newBooking;
  },
  getById: (id: string) => bookings.find((b) => b.id === id || b.duffelId === id),
};
