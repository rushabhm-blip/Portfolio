// Curated knowledge base of Bengaluru & Delhi landmarks, tech parks, and stations
// to guarantee 100% accurate coordinates even if offline or speech recognition varies slightly.
export const LANDMARK_DIRECTORY = [
  // Tech Parks & Landmarks in Bengaluru
  {
    aliases: ['samhita square', 'samhitha square', 'samhita tech park', 'samhita', 'samhita park'],
    name: 'Samhita Square (IT Corridor, Hoodi)',
    category: 'Tech Park • Whitefield Main Rd',
    coords: [12.9912, 77.7145],
    city: 'bengaluru',
    nearestMetro: 'Hoodi / Garudacharpalya (Purple Line)'
  },
  {
    aliases: ['peenya', 'peenya industrial area', 'peenya metro', 'peenya 1st stage'],
    name: 'Peenya Industrial Area',
    category: 'Green Line Metro • Industrial Zone',
    coords: [13.0328, 77.5332],
    city: 'bengaluru',
    nearestMetro: 'Peenya Metro (Green Line)'
  },
  {
    aliases: ['majestic', 'kempegowda', 'nadaprabhu', 'majestic station', 'central'],
    name: 'Nadaprabhu Kempegowda Majestic',
    category: 'Namma Metro Central Interchange',
    coords: [12.9757, 77.5729],
    city: 'bengaluru',
    nearestMetro: 'Majestic Interchange (Purple & Green)'
  },
  {
    aliases: ['indiranagar', 'indira nagar', '100 feet road'],
    name: 'Indiranagar (100ft Road)',
    category: 'Purple Line Metro • Dining Hub',
    coords: [12.9783, 77.6408],
    city: 'bengaluru',
    nearestMetro: 'Indiranagar (Purple Line)'
  },
  {
    aliases: ['whitefield', 'kadugodi', 'whitefield metro'],
    name: 'Whitefield (Kadugodi Metro)',
    category: 'Purple Line Terminal • IT Corridor',
    coords: [12.9972, 77.7583],
    city: 'bengaluru',
    nearestMetro: 'Whitefield Kadugodi'
  },
  {
    aliases: ['mg road', 'm g road', 'mahatma gandhi road'],
    name: 'MG Road (Mahatma Gandhi Road)',
    category: 'Purple Line Metro • Central CBD',
    coords: [12.9754, 77.6066],
    city: 'bengaluru',
    nearestMetro: 'MG Road (Purple Line)'
  },
  {
    aliases: ['yeshwanthpur', 'yeshwantpur', 'yeswanthpur'],
    name: 'Yeshwanthpur Junction',
    category: 'Green Line Metro & Railway Hub',
    coords: [13.0232, 77.5499],
    city: 'bengaluru',
    nearestMetro: 'Yeshwanthpur (Green Line)'
  },
  {
    aliases: ['electronic city', 'ecity', 'electronics city', 'phase 1'],
    name: 'Electronic City Phase 1',
    category: 'Tech Park Corridor • South Bengaluru',
    coords: [12.8452, 77.6602],
    city: 'bengaluru',
    nearestMetro: 'Electronic City Metro'
  },
  {
    aliases: ['koramangala', 'koramangala 5th block', 'forum mall'],
    name: 'Koramangala (5th Block)',
    category: 'Commercial Hub • Feeder Network',
    coords: [12.9352, 77.6245],
    city: 'bengaluru',
    nearestMetro: 'Dairy Circle / South Feeder'
  },
  {
    aliases: ['silk board', 'central silk board', 'silkboard'],
    name: 'Silk Board Junction',
    category: 'Central Transit Hub & Outer Ring Road',
    coords: [12.9176, 77.6238],
    city: 'bengaluru',
    nearestMetro: 'Silk Board Interchange'
  },
  {
    aliases: ['airport', 'kempegowda airport', 'bial', 'blr airport', 'bangalore airport'],
    name: 'Kempegowda International Airport (BLR)',
    category: 'Airport Corridor • Vayu Vajra E-Bus',
    coords: [13.1986, 77.7066],
    city: 'bengaluru',
    nearestMetro: 'Airport Express Corridor'
  },

  // Delhi NCR
  {
    aliases: ['connaught place', 'cp', 'rajiv chowk'],
    name: 'Connaught Place (Rajiv Chowk)',
    category: 'Yellow & Blue Line Metro Interchange',
    coords: [28.6328, 77.2197],
    city: 'delhi',
    nearestMetro: 'Rajiv Chowk Metro'
  },
  {
    aliases: ['cyber city', 'dlf cyber city', 'dlf phase 2', 'gurgaon', 'gurugram'],
    name: 'Cyber City (DLF Phase 2)',
    category: 'Rapid Metro • Gurugram Hub',
    coords: [28.4950, 77.0895],
    city: 'delhi',
    nearestMetro: 'Cyber City Rapid Metro'
  },
  {
    aliases: ['delhi airport', 'igi airport', 't3 terminal'],
    name: 'IGI Airport Terminal 3',
    category: 'Orange Line Airport Express',
    coords: [28.5540, 77.0840],
    city: 'delhi',
    nearestMetro: 'Airport Express Metro'
  }
];

// Helper: Match a text string to a known landmark or generate coordinates
export function resolveLocationString(input) {
  if (!input || !input.trim()) return null;
  const clean = input.toLowerCase().trim().replace(/^(to|from|the|near|at)\s+/i, '');

  // Exact or alias match
  for (const item of LANDMARK_DIRECTORY) {
    if (item.name.toLowerCase().includes(clean) || clean.includes(item.name.toLowerCase())) {
      return item;
    }
    for (const alias of item.aliases) {
      if (clean.includes(alias) || alias.includes(clean)) {
        return item;
      }
    }
  }

  // Fallback to title-cased name with approximate Bengaluru coordinates
  return {
    name: input.charAt(0).toUpperCase() + input.slice(1),
    category: 'Searched Destination',
    coords: [12.9716 + (Math.random() - 0.5) * 0.08, 77.5946 + (Math.random() - 0.5) * 0.08],
    city: 'bengaluru'
  };
}

// Natural Language Voice Parser
// Handles phrases like:
// "I want to go from Peenya to Samhita Square"
// "Route from Peenya Industrial Area to Samhita"
// "Take me to Indiranagar"
// "Navigate to Whitefield"
// "Find parking"
// "Emergency SOS"
export function parseVoiceCommand(transcript) {
  if (!transcript) return null;
  const text = transcript.toLowerCase().trim();

  // 1. Navigation with both FROM and TO
  // e.g., "from [origin] to [destination]" OR "go from [origin] to [destination]"
  const fromToRegex = /(?:from|leaving)\s+([a-z0-9\s]+?)\s+(?:to|towards|into)\s+([a-z0-9\s]+)$/i;
  const fromToMatch = text.match(fromToRegex);
  if (fromToMatch) {
    const originStr = fromToMatch[1].trim();
    const destStr = fromToMatch[2].trim();
    const originLoc = resolveLocationString(originStr);
    const destLoc = resolveLocationString(destStr);
    return {
      type: 'navigate_route',
      origin: originLoc?.name || originStr,
      originCoords: originLoc?.coords || null,
      destination: destLoc?.name || destStr,
      destinationCoords: destLoc?.coords || null,
      targetScreen: 'explore',
      rawText: text
    };
  }

  // 2. Navigation with only TO / DESTINATION
  // e.g., "take me to samhita square", "go to indiranagar", "route to whitefield"
  const toRegex = /(?:take me to|go to|navigate to|directions to|route to|how to reach|travel to|going to)\s+([a-z0-9\s]+)$/i;
  const toMatch = text.match(toRegex);
  if (toMatch) {
    const destStr = toMatch[1].trim();
    const destLoc = resolveLocationString(destStr);
    return {
      type: 'navigate_route',
      origin: 'Current Location',
      originCoords: [13.0328, 77.5332], // Default to Peenya GPS location
      destination: destLoc?.name || destStr,
      destinationCoords: destLoc?.coords || null,
      targetScreen: 'explore',
      rawText: text
    };
  }

  // 3. Parking Intent
  if (text.includes('parking') || text.includes('park my car') || text.includes('vehicle parking')) {
    return {
      type: 'screen_jump',
      targetScreen: 'parking',
      speechReply: 'Opening Smart Parking. You can view real-time available bays and reserve a slot near you.',
      rawText: text
    };
  }

  // 4. Safety & Emergency Intent
  if (text.includes('emergency') || text.includes('sos') || text.includes('112')) {
    return {
      type: 'screen_jump',
      targetScreen: 'emergency',
      speechReply: 'Opening 112 Emergency Help. Tap Call 112 or select your emergency contacts.',
      rawText: text
    };
  }

  if (text.includes('help') || text.includes('police') || text.includes('safety')) {
    return {
      type: 'screen_jump',
      targetScreen: 'safety',
      speechReply: 'Emergency Safety Screen opened. 112 SOS hotline, women safety corridor, and live safety check-in are active.',
      rawText: text
    };
  }

  // 5. Restrooms / Water ATMs / Amenities
  if (text.includes('restroom') || text.includes('toilet') || text.includes('water') || text.includes('ev charge') || text.includes('amenities')) {
    return {
      type: 'amenity_search',
      targetScreen: 'explore',
      amenityTab: 'amenities',
      speechReply: 'Opening Verified City Amenities. Showing nearby touchless restrooms, RO water ATMs, and fast EV charging hubs.',
      rawText: text
    };
  }

  // 6. City Pass / Wallet
  if (text.includes('wallet') || text.includes('balance') || text.includes('city pass') || text.includes('pass') || text.includes('points')) {
    return {
      type: 'screen_jump',
      targetScreen: 'home',
      speechReply: 'Showing your City Pass and Wallet. Your current balance is 840 Rupees and you have 1,250 Green Points.',
      rawText: text
    };
  }

  // 7. General destination mention fallback (e.g. user just said "Samhita Square" or "Peenya")
  const potentialLoc = resolveLocationString(text);
  if (potentialLoc && potentialLoc.name) {
    return {
      type: 'navigate_route',
      origin: 'Peenya Industrial Area',
      originCoords: [13.0328, 77.5332],
      destination: potentialLoc.name,
      destinationCoords: potentialLoc.coords,
      targetScreen: 'explore',
      rawText: text
    };
  }

  return {
    type: 'unknown',
    speechReply: "I heard you, but I couldn't detect the route. Try saying: 'I want to go from Peenya to Samhita Square'.",
    rawText: text
  };
}

// Speech Synthesis Helper with Natural Indian English Voice Preference
export function speakAloud(text, onEnd = null) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  // Prefer English (India) or friendly natural voice
  const preferredVoice = voices.find(v => v.lang === 'en-IN') ||
                         voices.find(v => v.lang.startsWith('en')) ||
                         voices[0];
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

// Stop Speaking
export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
