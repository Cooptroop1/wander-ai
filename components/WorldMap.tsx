'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DestinationPanel from './DestinationPanel';

// Fix Leaflet icons
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
  const [panelData, setPanelData] = useState<{ lat: number; lng: number; placeName: string } | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    // Open panel immediately
    setPanelData({
      lat,
      lng,
      placeName: `Near ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,
    });

    // Auto-zoom the map to the clicked spot (level 10 = city/street view)
    const map = (window as any).leafletMap;
    if (map) {
      map.flyTo([lat, lng], 10, { duration: 1.5 });
    }
  };

  const closePanel = () => setPanelData(null);

  return (
    <>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '600px', width: '100%' }}
        className="rounded-3xl"
        whenReady={(map) => {
          (window as any).leafletMap = map.target; // save map reference for auto-zoom
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <ClickHandler onClick={handleMapClick} />

        {/* Demo markers for popular places */}
        <Marker position={[40.7128, -74.0060]}>
          <Popup>New York</Popup>
        </Marker>
        <Marker position={[-33.8688, 151.2093]}>
          <Popup>Sydney</Popup>
        </Marker>
        <Marker position={[35.6762, 139.6503]}>
          <Popup>Tokyo</Popup>
        </Marker>
      </MapContainer>

      {/* Full-screen panel */}
      {panelData && (
        <DestinationPanel
          isOpen={true}
          onClose={closePanel}
          lat={panelData.lat}
          lng={panelData.lng}
          placeName={panelData.placeName}
        />
      )}
    </>
  );
}
