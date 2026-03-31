'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DestinationPanel from './DestinationPanel';
import MyTripsModal from './MyTripsModal';

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
  const [showMyTrips, setShowMyTrips] = useState(false);

  const handleMapClick = async (lat: number, lng: number) => {
    let placeName = `Near ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await res.json();
      placeName = data.city || data.locality || data.principalSubdivision || data.countryName || placeName;
    } catch (e) {}

    setPanelData({ lat, lng, placeName });
  };

  const closePanel = () => setPanelData(null);

  return (
    <>
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

      {/* My Trips Button - always visible */}
      <button
        onClick={() => setShowMyTrips(true)}
        className="fixed top-6 right-6 bg-white text-black px-6 py-3 rounded-3xl font-semibold flex items-center gap-2 shadow-2xl z-[99999] hover:bg-emerald-400 transition-all"
      >
        📖 My Trips
      </button>

      {/* Destination Panel */}
      {panelData && (
        <DestinationPanel
          isOpen={true}
          onClose={closePanel}
          lat={panelData.lat}
          lng={panelData.lng}
          placeName={panelData.placeName}
        />
      )}

      {/* My Trips Modal */}
      <MyTripsModal isOpen={showMyTrips} onClose={() => setShowMyTrips(false)} />
    </>
  );
}
