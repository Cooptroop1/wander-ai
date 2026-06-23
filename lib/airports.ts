// lib/airports.ts
export type Airport = {
  code: string;
  city: string;
  full: string;
  lat: number;
  lng: number;
};

export const popularAirports: Airport[] = [
  { code: "LHR", city: "London", full: "London Heathrow (LHR)", lat: 51.47, lng: -0.45 },
  { code: "STN", city: "London", full: "London Stansted (STN)", lat: 51.89, lng: 0.24 },
  { code: "LGW", city: "London", full: "London Gatwick (LGW)", lat: 51.15, lng: -0.18 },
  { code: "CDG", city: "Paris", full: "Paris Charles de Gaulle (CDG)", lat: 49.01, lng: 2.55 },
  { code: "MAD", city: "Madrid", full: "Madrid Barajas (MAD)", lat: 40.47, lng: -3.57 },
  { code: "BCN", city: "Barcelona", full: "Barcelona-El Prat (BCN)", lat: 41.30, lng: 2.08 },
  { code: "AMS", city: "Amsterdam", full: "Amsterdam Schiphol (AMS)", lat: 52.31, lng: 4.77 },
  { code: "FRA", city: "Frankfurt", full: "Frankfurt (FRA)", lat: 50.03, lng: 8.57 },
  { code: "DXB", city: "Dubai", full: "Dubai International (DXB)", lat: 25.25, lng: 55.36 },
  { code: "JFK", city: "New York", full: "New York JFK (JFK)", lat: 40.64, lng: -73.78 },
  { code: "LAX", city: "Los Angeles", full: "Los Angeles (LAX)", lat: 33.94, lng: -118.41 },
  { code: "HND", city: "Tokyo", full: "Tokyo Haneda (HND)", lat: 35.55, lng: 139.77 },
  { code: "NRT", city: "Tokyo", full: "Tokyo Narita (NRT)", lat: 35.76, lng: 140.39 },
  { code: "SYD", city: "Sydney", full: "Sydney Kingsford Smith (SYD)", lat: -33.94, lng: 151.18 },
  { code: "SIN", city: "Singapore", full: "Singapore Changi (SIN)", lat: 1.36, lng: 103.99 },
];

export function getNearestAirport(lat: number, lng: number): Airport {
  let closest = popularAirports[0];
  let minDistance = Infinity;

  for (const airport of popularAirports) {
    const d = Math.hypot(airport.lat - lat, airport.lng - lng); // fast approximate distance
    if (d < minDistance) {
      minDistance = d;
      closest = airport;
    }
  }
  return closest;
}
