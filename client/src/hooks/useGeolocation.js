import { useState, useEffect } from 'react';

/**
 * Custom hook to get user's geographical coordinates.
 * Falls back to default coordinates if geolocation is not supported or permission is denied.
 * 
 * @param {number} defaultLat Default latitude
 * @param {number} defaultLon Default longitude
 * @returns {{ lat: number, lon: number }} Coords state
 */
export default function useGeolocation(defaultLat, defaultLon) {
  const [coords, setCoords] = useState({ lat: defaultLat, lon: defaultLon });

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
        },
        (err) => {
          console.warn('[Geolocation] Access denied or error, using default coordinates:', err.message);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      console.warn('[Geolocation] Geolocation not supported by this browser.');
    }
  }, []);

  return coords;
}
