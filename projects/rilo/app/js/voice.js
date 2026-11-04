// Voice: speech recognition (push-to-talk or hands-free with "Rilo" wake word), command parser, spoken replies.

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const voiceSupported = !!SR;

const WAKE = /^(hey |ok |okay )?(rilo|riley|relo|rylo|reelo|really low|hello|rio)\b[,.]?\s*/i;
const num = (s) => (s ? parseFloat(s) : null);

/** Turn a sentence into { intent, ...args }. Order matters: most specific first. */
export function parse(raw) {
  const t = raw.toLowerCase().replace(WAKE, '')
    .replace(/(\d),(\d{3})/g, '$1$2') // "12,000" -> "12000"
    .replace(/[.,!?](?!\d)|(?<!\d)[.,!?]/g, ' ') // keep decimal points like 7.5
    .replace(/\s+/g, ' ').trim();
  if (!t) return { intent: 'none' };
  let m;

  // turn-by-turn directions (checked first so "stop navigation" is not read as a break/cancel)
  if (/re-?rout|recalculat|(find|get|give) (me )?(a |another )?(new|different) (route|way)|wrong (way|turn)|missed (the |a )?turn/.test(t)) return { intent: 'reroute' };
  if (/(stop|end|cancel|turn off|disable|switch off|no more)\s+(the\s+)?(navigation|directions|guidance|turn by turn)/.test(t)) return { intent: 'guide', on: false };
  if (/(start|resume|turn on|enable|begin|switch on)\s+(the\s+)?(navigation|directions|guidance|turn by turn)|\bnavigate\b/.test(t)) return { intent: 'guide', on: true };
  if (/\beta\b|how long|time (left|remaining|to go)|how much (time|distance)|distance (left|remaining|to go)|(km|kilometres|kilometers) (left|to go)|when (will|do|are) we (reach|arrive|get|there)|how far (is|to|are we from)( the)? (destination|stop|next stop|there)/.test(t)) return { intent: 'eta' };
  if (/what'?s next|next (turn|instruction|direction|exit)|which way|where (do|should) i turn|repeat( that| the)?( instruction| direction| turn)?|say (that )?again/.test(t)) return { intent: 'navnext' };

  // group features
  if (/(show|open|list|see)\s+(me\s+)?(all\s+)?(the\s+)?riders|who('?s| is) (here|riding|online|in the group)|rider list/.test(t)) return { intent: 'riders' };
  if (/(show|zoom to|fit|see).*(everyone|all riders|all of us|the group|the crew)/.test(t)) return { intent: 'everyone' };
  if (/(add|plan|find|need|get)\s+(a\s+|the\s+)?(group\s+)?(break|food|chai|tea|rest|lunch|breakfast)\s+stop/.test(t)) return { intent: 'breakstop' };
  if (/(add|set|make|drop)\s+(a\s+)?(wait|waiting|regroup|meeting)\s+(point|stop|spot)|regroup here|stop here for the group/.test(t)) return { intent: 'waitstop' };
  if (/(add|new|another)\s+(a\s+)?stop\b|add (a )?place/.test(t) && !/(fuel|petrol|gas|break|food|chai)/.test(t)) return { intent: 'addstop' };
  if (/(add|plan|find|need|get)\s+(a\s+|the\s+)?(group\s+)?(fuel|petrol|gas)\s+stop|fuel stop for (the )?(group|everyone)/.test(t)) return { intent: 'fuelstop' };
  if (/(show|open)\s+(the\s+)?(ride\s+)?(plan|itinerary)/.test(t)) return { intent: 'plan' };
  if (/\backnowledge|got it|copy that|noted\b/.test(t)) return { intent: 'ack' };
  if (/continue (the )?ride|ride on|move on|we are (all )?ready to (go|leave)|everyone is ready/.test(t)) return { intent: 'startRide' };
  if (/wait for me|please wait|hold on|slow down|i('?m| am) (falling )?behind|wait up/.test(t)) return { intent: 'signal', kind: 'wait' };

  if (/\b(cancel|never ?mind|stop)\b/.test(t) && !/stop for|fuel stop|chai stop/.test(t)) return { intent: 'cancel' };

  // bike records
  if (/(log|add|record|filled|refuel(l?ed)?|fuel entry)/.test(t) && /(litre|liter|\bl\b|rupee|rs|₹|fuel|petrol)/.test(t) && /\d/.test(t) && !/find|nearest|nearby/.test(t)) {
    const litres = num((t.match(/(\d+(?:\.\d+)?)\s*(?:l\b|litre|liter)/) || [])[1]);
    const cost = num((t.match(/(\d+(?:\.\d+)?)\s*(?:rupee|rs|₹|rupees|bucks|dollars)/) || t.match(/(?:for|cost|paid)\s*(\d+(?:\.\d+)?)/) || [])[1]);
    const odo = num((t.match(/odometer\s*(?:is|at|to)?\s*(\d+)/) || [])[1]);
    return { intent: 'logFuel', litres, cost, odo };
  }
  if ((m = t.match(/odometer\s*(?:is|at|to|reads?)?\s*(\d+)/))) return { intent: 'setOdo', odo: +m[1] };

  // navigation of the app
  if (/(create|new|plan|start a) (a )?(new )?ride/.test(t) && !/start ride/.test(t)) return { intent: 'goto', to: '#/create' };
  if (/join (a |the )?ride/.test(t)) return { intent: 'goto', to: '#/join' };
  if ((m = t.match(/(open|go to|show|take me to)( my| the)? (garage|bike|records|home|profile|settings)/)))
    return { intent: 'goto', to: { garage: '#/garage', bike: '#/garage', records: '#/garage', home: '#/home', profile: '#/profile', settings: '#/profile' }[m[3]] };

  // ride control
  if (/(end|finish|stop) (the )?ride/.test(t)) return { intent: 'endRide' };
  if (/start (the )?ride|let'?s (go|ride)|begin ride/.test(t)) return { intent: 'startRide' };
  if (/\bready\b/.test(t)) return { intent: 'ready' };

  // search nearby
  if (/(find|nearest|nearby|closest|search|where'?s? (is )?the|any)/.test(t)) {
    if (/hospital|clinic|doctor|medical/.test(t)) return { intent: 'nearby', kind: 'hospital' };
    if (/mechanic|repair|garage|puncture shop|workshop/.test(t)) return { intent: 'nearby', kind: 'repair' };
    if (/food|restaurant|cafe|chai|tea|coffee|eat|dhaba|breakfast|lunch|dinner/.test(t)) return { intent: 'nearby', kind: 'food' };
    if (/fuel|petrol|pump|gas|diesel/.test(t)) return { intent: 'nearby', kind: 'fuel' };
  }

  // assistance
  if (/(low|dying|dead|drain\w*).*(battery|phone|charge)|(battery|phone|charge).*(low|dying|dead|drain\w*|\bout\b)|need (a )?(charg|power ?bank)|charging (help|support)|charger/.test(t)) return { intent: 'assist', need: 'charge' };
  if (/(out of|ran out of|no) (fuel|petrol)|spare (fuel|petrol)|need (fuel|petrol) (can|help)/.test(t)) return { intent: 'assist', need: 'fuel' };
  if (/tools?|spanner|wrench|chain|clutch|mechanic needed/.test(t) && /need|help|have/.test(t)) return { intent: 'assist', need: 'tools' };
  if (/medical|injur|hurt|bleed|first aid|ambulance/.test(t)) return { intent: 'assist', need: 'medical' };
  if (/\bsos\b|emergency|accident|crash|fell|fallen|breakdown|broke down|puncture|\bhelp\b/.test(t)) return { intent: 'assist', need: 'sos', note: /puncture/.test(t) ? 'Puncture' : /breakdown|broke down/.test(t) ? 'Breakdown' : '' };

  // signals
  if (/hazard|danger|pothole|police|speed ?breaker|oil|slippery|gravel|traffic|animal|cow|landslide|obstacle|accident ahead|road ?work|diversion/.test(t)) {
    const w = (t.match(/pothole|police|speed ?breaker|oil|slippery|gravel|traffic|animal|cow|landslide|obstacle|road ?work|diversion/) || [])[0];
    return { intent: 'signal', kind: 'hazard', note: w ? w[0].toUpperCase() + w.slice(1) : '' };
  }
  if (/fuel|petrol|gas\b|refuel|tank|reserve/.test(t)) return { intent: 'signal', kind: 'fuel' };
  if (/break|rest|chai|tea|coffee|food|lunch|breakfast|stretch|washroom|toilet|pit ?stop|halt|stop/.test(t)) return { intent: 'signal', kind: 'break' };

  // queries & map
  if (/status|where is everyone|where'?s everyone|who'?s (behind|ahead|last|first)|how far|everyone|group|team|crew/.test(t)) return { intent: 'status' };
  if (/battery/.test(t)) return { intent: 'status' };
  if (/re-?cent(er|re)|my location|follow me|where am i/.test(t)) return { intent: 'recenter' };
  if (/route|overview|zoom out|whole|fit/.test(t)) return { intent: 'overview' };
  if (/\bunmute|voice on|speak/.test(t)) return { intent: 'mute', on: false };
  if (/\bmute|quiet|silent|voice off/.test(t)) return { intent: 'mute', on: true };

  return { intent: 'unknown', text: t };
}

export function speak(text, on = true) {
  if (!on || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN'; u.rate = 1.05;
    speechSynthesis.speak(u);
  } catch {}
}

/**
 * Recogniser wrapper. onFinal(text) is called with each recognised phrase.
 * handsFree: continuous, only phrases starting with the wake word are passed on.
 */
export class Voice {
  constructor({ onFinal, onState, onInterim, onError }) {
    this.cb = { onFinal, onState, onInterim, onError };
    this.rec = null; this.active = false; this.hands = false; this.wantOn = false;
  }
  _make() {
    const r = new SR();
    r.lang = 'en-IN'; r.interimResults = true; r.maxAlternatives = 3;
    r.continuous = this.hands;
    r.onstart = () => { this.active = true; this.cb.onState?.('listening'); };
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0].transcript.trim();
        if (!res.isFinal) { this.cb.onInterim?.(text); continue; }
        if (this.hands && !WAKE.test(text)) continue; // ignore chatter without wake word
        this.cb.onFinal?.(text);
      }
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { this.wantOn = false; this.cb.onError?.('Microphone blocked. Allow mic access in your browser settings.'); }
      else if (e.error === 'network') this.cb.onError?.('Voice needs an internet connection.');
    };
    r.onend = () => {
      if (this.rec !== r) return; // an older recogniser that was replaced
      this.active = false;
      if (this.wantOn && this.hands) { setTimeout(() => this._begin(), 250); return; }
      this.wantOn = false; this.cb.onState?.('idle');
    };
    return r;
  }
  _begin() {
    if (!SR) return;
    try { this.rec = this._make(); this.rec.start(); } catch { /* already started */ }
  }
  /** One-shot push-to-talk. */
  listenOnce() {
    if (!SR) return this.cb.onError?.('Voice commands need Chrome, Edge or Safari. You can type a command instead.');
    this._halt(); this.hands = false; this.wantOn = true; this._begin();
  }
  startHandsFree() {
    if (!SR) return;
    this._halt(); this.hands = true; this.wantOn = true; this._begin();
  }
  _halt() { this.wantOn = false; const r = this.rec; this.rec = null; try { r?.abort(); } catch {} this.active = false; }
  stop() { this._halt(); this.cb.onState?.('idle'); }
}
