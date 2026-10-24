// User Location Service: Manages dynamic GPS detection, reverse-geocoding, and cross-screen location synchronization

const DEFAULT_LOCATION = {
  name: 'Peenya, Bengaluru',
  locality: 'Peenya',
  city: 'Bengaluru',
  coords: [13.0328, 77.5332],
  isLiveGPS: false
};

export const POPULAR_LOCATIONS = [
  { name: 'Peenya, Bengaluru', locality: 'Peenya', city: 'Bengaluru', coords: [13.0328, 77.5332], line: 'Green Line Metro' },
  { name: 'Indiranagar, Bengaluru', locality: 'Indiranagar', city: 'Bengaluru', coords: [12.9783, 77.6408], line: 'Purple Line Metro' },
  { name: 'Majestic, Bengaluru', locality: 'Majestic', city: 'Bengaluru', coords: [12.9757, 77.5729], line: 'Central Metro Interchange' },
  { name: 'Whitefield, Bengaluru', locality: 'Whitefield', city: 'Bengaluru', coords: [12.9972, 77.7583], line: 'Purple Line IT Corridor' },
  { name: 'Koramangala, Bengaluru', locality: 'Koramangala', city: 'Bengaluru', coords: [12.9352, 77.6245], line: 'Feeder Bus Hub' },
  { name: 'MG Road, Bengaluru', locality: 'MG Road', city: 'Bengaluru', coords: [12.9754, 77.6066], line: 'Purple Line CBD' },
  { name: 'Connaught Place, Delhi', locality: 'Connaught Place', city: 'Delhi', coords: [28.6328, 77.2197], line: 'Yellow / Blue Line' }
];

export function getSavedUserLocation() {
  try {
    const saved = localStorage.getItem('sajag_user_location');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Could not read user location from storage:', err);
  }
  return DEFAULT_LOCATION;
}

export function saveUserLocation(locationObj) {
  try {
    localStorage.setItem('sajag_user_location', JSON.stringify(locationObj));
  } catch (err) {
    console.warn('Could not save user location:', err);
  }

  // Broadcast to other components in real time
  window.dispatchEvent(new CustomEvent('sajag-user-location-changed', {
    detail: locationObj
  }));
}

export async function reverseGeocodeCoords(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SahajSmartCity/1.0'
        }
      }
    );
    if (!res.ok) throw new Error('Nominatim HTTP ' + res.status);
    const data = await res.json();
    const addr = data.address || {};

    const locality = addr.suburb || 
                     addr.neighbourhood || 
                     addr.residential || 
                     addr.quarter || 
                     addr.subdistrict || 
                     addr.city_district || 
                     addr.village || 
                     addr.road || 
                     'Current Location';

    const city = addr.city || 
                 addr.town || 
                 addr.state_district || 
                 addr.county || 
                 addr.state || 
                 '';

    const formattedName = city && city !== locality 
      ? `${locality}, ${city}` 
      : locality;

    return {
      name: formattedName,
      locality,
      city,
      coords: [lat, lon],
      isLiveGPS: true
    };
  } catch (err) {
    console.warn('Nominatim reverse geocode failed, using fallback:', err);
    // Fallback formatting with lat/lon
    return {
      name: `GPS (${lat.toFixed(3)}, ${lon.toFixed(3)})`,
      locality: 'Current Location',
      city: '',
      coords: [lat, lon],
      isLiveGPS: true
    };
  }
}

export function requestLiveGPSLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by device/browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const location = await reverseGeocodeCoords(latitude, longitude);
          saveUserLocation(location);
          resolve(location);
        } catch (err) {
          const fallback = {
            name: `📍 Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
            locality: 'Live GPS',
            city: '',
            coords: [latitude, longitude],
            isLiveGPS: true
          };
          saveUserLocation(fallback);
          resolve(fallback);
        }
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}
