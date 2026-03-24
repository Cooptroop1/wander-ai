'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DestinationPanel from './DestinationPanel';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function ClickHandler({ onZoom, onSelect }: { 
  onZoom: (lat: number, lng: number) => void;
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // If map is already zoomed in (level 6 or higher), treat this as "select" click
      if (e.target.getZoom() >= 6) {
        onSelect(lat, lng);
      } else {
        // First click = zoom only
        onZoom(lat, lng);
      }
    },
  });
  return null;
}

export default function WorldMap() {
  const [panelData, setPanelData] = useState<{ lat: number; lng: number; placeName: string } | null>(null);
  const mapRef = useRef<any>(null);

  const handleZoom = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 8, { duration: 1.2 });
    }
  };

  const handleSelect = (lat: number, lng: number) => {
    setPanelData({
      lat,
      lng,
      placeName: `Near ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,
    });
  };

  const closePanel = () => setPanelData(null);

  return (
    <>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '600px', width: '100%' }}
        className="rounded-3xl"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <ClickHandler onZoom={handleZoom} onSelect={handleSelect} />

        {/* Demo markers */}
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

      {/* Full-screen panel only opens on 2nd click */}
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
