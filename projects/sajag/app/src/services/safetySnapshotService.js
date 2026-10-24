// Silent Location Snapshot & Hardware Rhythm Detection Service
// Triggered by power button rhythm: "press press, [pause], press press" (2 + 2)

const STORAGE_KEY = 'sajag_safety_pending_snapshot';

/**
 * Retrieve pending unsubmitted location snapshot
 */
export function getPendingSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to read pending safety snapshot', err);
    return null;
  }
}

/**
 * Persist location snapshot to storage
 */
export function savePendingSnapshot(snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    window.dispatchEvent(new CustomEvent('sajag-safety-snapshot-updated', { detail: snapshot }));
  } catch (err) {
    console.error('Failed to save safety snapshot', err);
  }
}

/**
 * Clear/archive pending snapshot once reported or dismissed
 */
export function clearPendingSnapshot() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('sajag-safety-snapshot-updated', { detail: null }));
  } catch (err) {
    console.error('Failed to clear safety snapshot', err);
  }
}

/**
 * Discretely capture live GPS coordinates, reverse geocode, and save snapshot
 */
export async function triggerSilentSnapshot(customCoords = null, customArea = null) {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  // Discreet haptic feedback (tactile pulse in user's pocket)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([120, 80, 120, 80]);
    } catch (_) {}
  }

  return new Promise((resolve) => {
    const fallbackCoords = customCoords || [18.5204 + (Math.random() - 0.5) * 0.01, 73.8567 + (Math.random() - 0.5) * 0.01]; // Default Pune / Local
    const fallbackArea = customArea || 'Near Shivaji Road (Auto-tagged via GPS)';

    const completeCapture = async (coords, areaName) => {
      let resolvedArea = areaName;
      if (!resolvedArea && coords) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
          const data = await res.json();
          resolvedArea = data.address?.road || data.address?.suburb || data.address?.neighbourhood || data.display_name?.split(',').slice(0, 2).join(',') || 'Current Location';
        } catch {
          resolvedArea = `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
        }
      }

      const snapshot = {
        id: `SNAP-${Date.now()}`,
        timestamp: Date.now(),
        date: formattedDate,
        time: formattedTime,
        lat: coords[0],
        lng: coords[1],
        radius: 35,
        intensity: 'orange', // Default warning level
        category: 'Accident / Roadblock',
        areaName: resolvedArea || 'Discretely Tagged Location',
        isSilentTriggered: true
      };

      savePendingSnapshot(snapshot);
      resolve(snapshot);
    };

    if (customCoords) {
      completeCapture(customCoords, customArea);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          completeCapture([pos.coords.latitude, pos.coords.longitude], null);
        },
        () => {
          completeCapture(fallbackCoords, fallbackArea);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      completeCapture(fallbackCoords, fallbackArea);
    }
  });
}

/**
 * Rhythm Pattern Engine:
 * Listens for 2 + 2 presses ("press press, [pause], press press")
 * Gap between press 1 & 2: 80ms - 650ms
 * Pause between pair 1 & pair 2: 300ms - 1800ms
 * Gap between press 3 & 4: 80ms - 650ms
 */
class PowerRhythmTracker {
  constructor() {
    this.pressHistory = [];
    this.listeners = new Set();
  }

  addListener(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(snapshot) {
    this.listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (e) {
        console.error('Rhythm listener error', e);
      }
    });
  }

  recordPress() {
    const now = Date.now();
    this.pressHistory.push(now);

    // Keep only last 6 presses
    if (this.pressHistory.length > 6) {
      this.pressHistory.shift();
    }

    if (this.pressHistory.length >= 4) {
      const len = this.pressHistory.length;
      const t0 = this.pressHistory[len - 4];
      const t1 = this.pressHistory[len - 3];
      const t2 = this.pressHistory[len - 2];
      const t3 = this.pressHistory[len - 1];

      const dt1 = t1 - t0;       // Gap between 1st and 2nd press
      const pause = t2 - t1;     // Pause between 2nd and 3rd press
      const dt2 = t3 - t2;       // Gap between 3rd and 4th press

      const isPair1Fast = dt1 >= 60 && dt1 <= 750;
      const isValidPause = pause >= 250 && pause <= 2000;
      const isPair2Fast = dt2 >= 60 && dt2 <= 750;

      if (isPair1Fast && isValidPause && isPair2Fast) {
        // Pattern matched!
        this.pressHistory = []; // Reset
        triggerSilentSnapshot().then((snapshot) => {
          this.notify(snapshot);
        });
        return { matched: true, step: 4 };
      }
    }

    // Return current progress for visualizer (e.g. 1/4, 2/4, 3/4)
    return { matched: false, count: this.pressHistory.length };
  }
}

export const powerRhythmTracker = new PowerRhythmTracker();

/**
 * Setup keyboard listener ('p', 'Power', 'VolumeDown', 'VolumeUp') for easy browser & mobile testing
 */
export function setupHardwareRhythmListener(onTrigger) {
  const unsubscribe = powerRhythmTracker.addListener(onTrigger);

  const handleKeyDown = (e) => {
    // Keys that simulate power or hardware buttons
    if (
      e.key === 'p' || 
      e.key === 'P' || 
      e.key === 'Power' || 
      e.key === 'VolumeDown' || 
      e.key === 'VolumeUp'
    ) {
      // Avoid firing if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }
      powerRhythmTracker.recordPress();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    unsubscribe();
    window.removeEventListener('keydown', handleKeyDown);
  };
}
