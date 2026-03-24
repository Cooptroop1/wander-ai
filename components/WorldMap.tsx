'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function WorldMap() {
  const handleMapClick = (lat: number, lng: number) => {
    const message = `🌍 You clicked near latitude ${lat.toFixed(2)}, longitude ${lng.toFixed(2)}\n\nNext step: AI will show flights, hotels, attractions + full trip plan for this place!`;
    alert(message);
    // Later we’ll replace this alert with a beautiful popup + AI call
  };

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '600px', width: '100%' }}
      className="rounded-3xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <ClickHandler onClick={handleMapClick} />

      {/* Demo markers for popular places */}
      <Marker position={[40.7128, -74.0060]}>
        <Popup>New York - Clicked! (AI trip coming soon)</Popup>
      </Marker>
      <Marker position={[-33.8688, 151.2093]}>
        <Popup>Sydney - Clicked! (AI trip coming soon)</Popup>
      </Marker>
      <Marker position={[35.6762, 139.6503]}>
        <Popup>Tokyo - Clicked! (AI trip coming soon)</Popup>
      </Marker>
    </MapContainer>
  );
}
