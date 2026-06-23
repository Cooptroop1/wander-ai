'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DestinationPanel from './DestinationPanel';
import { getNearestAirport } from '@/lib/airports';

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number, placeName: string, airport: any) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng, '', null);
    },
  });
  return null;
}

export default function WorldMap() {
  const [panelData, setPanelData] = useState<any>(null);
  const [pickingNextStop, setPickingNextStop] = useState(false);
  const [nextStopCallback, setNextStopCallback] = useState<any>(null);

  const handleMapClick = async (lat: number, lng: number) => {
    // Get city name (keeps your original nice reverse geocode)
    let placeName = `Near ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E`;
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await res.json();
      placeName = data.city || data.locality || placeName;
    } catch {}

    // 🔥 NEW: Find nearest real airport
    const nearestAirport = getNearestAirport(lat, lng);
    const displayName = `${nearestAirport.city} ${nearestAirport.full}`;

    if (pickingNextStop && nextStopCallback) {
      nextStopCallback(lat, lng, displayName);
      setPickingNextStop(false);
      setNextStopCallback(null);
      return;
    }

    setPanelData({
      lat,
      lng,
      placeName: displayName,        // ← now shows "London Heathrow (LHR)"
      airport: nearestAirport,
    });
  };

  const startPickingNextStop = (callback: any) => {
    setPickingNextStop(true);
    setNextStopCallback(() => callback);
    setPanelData(null);
  };

  const closePanel = () => setPanelData(null);

  return (
    <>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '600px', width: '100%' }} className="rounded-3xl">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onClick={handleMapClick} />

        {/* Example markers */}
        <Marker position={[51.47, -0.45]}><Popup>✈️ LHR London</Popup></Marker>
        <Marker position={[40.64, -73.78]}><Popup>✈️ JFK New York</Popup></Marker>
        <Marker position={[35.55, 139.77]}><Popup>✈️ HND Tokyo</Popup></Marker>
      </MapContainer>

      {panelData && (
        <DestinationPanel
          isOpen={true}
          onClose={closePanel}
          lat={panelData.lat}
          lng={panelData.lng}
          placeName={panelData.placeName}           // ← now realistic!
          airportCode={panelData.airport.code}
          airportFull={panelData.airport.full}
          onPickNextStop={startPickingNextStop}
        />
      )}
    </>
  );
}
