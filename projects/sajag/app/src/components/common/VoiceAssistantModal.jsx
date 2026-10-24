import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  X, 
  MapPin, 
  CircleParking, 
  Shield, 
  Keyboard, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { parseVoiceCommand, speakAloud, stopSpeaking } from '../../services/voiceAssistantService';

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  onApplyVoiceRoute,
  onNavigate
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [assistantStatus, setAssistantStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [assistantReply, setAssistantReply] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [typeQuery, setTypeQuery] = useState('');

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English accent tuned

      recognition.onstart = () => {
        setIsListening(true);
        setAssistantStatus('listening');
        setErrorMsg('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          setInterimTranscript('');
          processUserSpeech(final);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        setAssistantStatus('idle');
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access blocked. Please allow mic permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Tap mic to try again.');
        } else {
          setErrorMsg(`Voice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setErrorMsg('Voice recognition not supported in this browser. Try quick suggestions below!');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSpeaking();
    };
  }, []);

  // Automatically start listening when modal opens
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setInterimTranscript('');
      setAssistantReply('');
      setParsedResult(null);
      setErrorMsg('');
      setShowTypeInput(false);
      setTypeQuery('');
      startListening();
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen]);

  const startListening = () => {
    stopSpeaking();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
      setAssistantStatus('idle');
    } else {
      startListening();
    }
  };

  // Process user speech command
  const processUserSpeech = (speechText) => {
    setAssistantStatus('processing');
    const result = parseVoiceCommand(speechText);
    setParsedResult(result);

    if (result.type === 'navigate_route') {
      const speechTextReply = `Routing from ${result.origin} to ${result.destination}.`;
      setAssistantReply(speechTextReply);
      setAssistantStatus('speaking');

      if (!isMuted) {
        speakAloud(speechTextReply, () => {
          setAssistantStatus('idle');
        });
      }

      // Auto-apply route after a brief moment
      setTimeout(() => {
        if (onApplyVoiceRoute) {
          onApplyVoiceRoute(result);
        }
        onClose();
      }, 2600);

    } else if (result.type === 'screen_jump') {
      setAssistantReply(result.speechReply);
      setAssistantStatus('speaking');
      if (!isMuted) {
        speakAloud(result.speechReply, () => setAssistantStatus('idle'));
      }
      setTimeout(() => {
        if (onNavigate) onNavigate(result.targetScreen);
        onClose();
      }, 2200);

    } else if (result.type === 'amenity_search') {
      setAssistantReply(result.speechReply);
      setAssistantStatus('speaking');
      if (!isMuted) {
        speakAloud(result.speechReply, () => setAssistantStatus('idle'));
      }
      setTimeout(() => {
        if (onNavigate) onNavigate('explore');
        onClose();
      }, 2200);

    } else {
      setAssistantReply(result.speechReply || "Could not understand destination. Try: 'Peenya to Samhita Square'.");
      setAssistantStatus('speaking');
      if (!isMuted) {
        speakAloud(result.speechReply, () => setAssistantStatus('idle'));
      }
    }
  };

  const handleQuickPrompt = (phrase) => {
    setTranscript(phrase);
    setInterimTranscript('');
    processUserSpeech(phrase);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (assistantReply) speakAloud(assistantReply);
    } else {
      setIsMuted(true);
      stopSpeaking();
    }
  };

  const handleTypeSubmit = (e) => {
    e.preventDefault();
    if (typeQuery.trim()) {
      handleQuickPrompt(typeQuery.trim());
      setShowTypeInput(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
      
      {/* Voice Assistant Sheet — strictly bounded to mobile phone frame */}
      <div 
        className="w-full max-w-[430px] mx-auto bg-white rounded-t-[32px] p-5 pb-6 shadow-2xl flex flex-col max-h-[90%] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Center Drag Handle Pill */}
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto -mt-1.5 mb-2.5 shrink-0" />

        {/* TOP BAR: Logo + Title + Volume Mute + Close */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            {/* Custom Speech Waveform Icon Badge */}
            <div className="w-10 h-10 rounded-2xl bg-[#155DFC] flex items-center justify-center text-white shrink-0 shadow-xs">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="8" y1="9" x2="8" y2="13" />
                <line x1="12" y1="7" x2="12" y2="15" />
                <line x1="16" y1="10" x2="16" y2="12" />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-[#0B1528] tracking-tight">
              Sajag Voice
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isMuted ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all cursor-pointer"
              title="Close Voice Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HERO TITLE */}
        <h2 className="text-2xl sm:text-[27px] font-extrabold text-[#0B1528] tracking-tight text-center leading-tight mt-3.5 px-4">
          Where would you<br />like to go?
        </h2>

        {/* MICROPHONE HERO SECTION WITH CONCENTRIC CIRCLES */}
        <div className="flex flex-col items-center justify-center mt-4">
          
          {/* Concentric Circle Backdrop */}
          <div className="relative w-36 h-36 rounded-full bg-[#EBF3FF] flex items-center justify-center transition-all">
            <div className="w-28 h-28 rounded-full bg-[#D6E7FF] flex items-center justify-center transition-all">
              
              {/* Main Action Button */}
              <button
                onClick={toggleMic}
                className="w-20 h-20 rounded-full bg-[#155DFC] hover:bg-[#114ED3] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
                title="Tap to speak"
              >
                <Mic className="w-9 h-9 stroke-[2.2] text-white" />
              </button>

            </div>
          </div>

          {/* AUDIO WAVEFORM EQUALIZER */}
          <div className="flex items-center justify-center gap-[3px] h-6 mt-3.5">
            {[8, 14, 18, 24, 22, 26, 20, 16, 12, 8, 5].map((height, idx) => (
              <span
                key={idx}
                style={{
                  height: isListening ? `${Math.max(6, (height + (idx % 3) * 4) % 26)}px` : `${height}px`,
                  transition: 'height 0.2s ease-in-out'
                }}
                className={`w-[3px] rounded-full bg-[#155DFC] ${isListening ? 'animate-pulse' : ''}`}
              />
            ))}
          </div>

          {/* STATUS LABEL & SUBTITLE */}
          <div className="mt-2.5 text-center">
            <div className="text-base font-bold text-[#0B1528]">
              {isListening ? 'Listening...' : assistantStatus === 'processing' ? 'Processing...' : 'Tap mic to speak'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Speak naturally. I’m listening.
            </div>
          </div>

          {/* REAL-TIME SPEECH FEEDBACK OR PROMPT PILL */}
          {transcript || interimTranscript ? (
            <div className="mt-3 px-4 py-2 bg-blue-50/70 border border-blue-200/80 rounded-2xl max-w-xs text-center animate-in fade-in">
              <p className="text-xs font-bold text-[#155DFC]">
                "{transcript || interimTranscript}"
              </p>
            </div>
          ) : (
            <button
              onClick={() => handleQuickPrompt('Peenya to Samitha Square')}
              className="mt-3 px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 font-medium transition-all active:scale-98 cursor-pointer"
            >
              Try “Peenya to Samitha Square”
            </button>
          )}

          {/* AI Response feedback if route found */}
          {parsedResult?.type === 'navigate_route' && (
            <div className="mt-3 w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
              <div className="flex items-center gap-1.5 truncate pr-2">
                <span className="font-bold text-emerald-700">{parsedResult.origin}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-bold text-emerald-700">{parsedResult.destination}</span>
              </div>
              <button
                onClick={() => {
                  if (onApplyVoiceRoute) onApplyVoiceRoute(parsedResult);
                  onClose();
                }}
                className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg shrink-0 active:scale-95"
              >
                Go
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* OR TRY A SUGGESTION SECTION */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs font-bold text-gray-500 mb-2.5 text-left">
            Or try a suggestion
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* 1. Plan a trip */}
            <button
              onClick={() => handleQuickPrompt('I want to go from Peenya to Samhita Square')}
              className="py-2.5 px-2 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#155DFC] shrink-0" />
              <span className="text-[11px] font-bold text-[#0B1528] truncate">Plan a trip</span>
            </button>

            {/* 2. Find parking */}
            <button
              onClick={() => handleQuickPrompt('Find parking')}
              className="py-2.5 px-2 rounded-2xl border border-blue-200 bg-white hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <CircleParking className="w-4 h-4 text-[#155DFC] shrink-0" />
              <span className="text-[11px] font-bold text-[#0B1528] truncate">Find parking</span>
            </button>

            {/* 3. Safety help */}
            <button
              onClick={() => handleQuickPrompt('Safety')}
              className="py-2.5 px-2 rounded-2xl border border-blue-200 bg-white hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-[#155DFC] shrink-0" />
              <span className="text-[11px] font-bold text-[#0B1528] truncate">Safety help</span>
            </button>
          </div>
        </div>

        {/* TYPE INSTEAD FOOTER */}
        <div className="mt-3.5 pt-2 flex flex-col items-center justify-center">
          {showTypeInput ? (
            <form onSubmit={handleTypeSubmit} className="w-full flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={typeQuery}
                onChange={(e) => setTypeQuery(e.target.value)}
                placeholder="Type destination, e.g. Majestic..."
                className="flex-1 py-2 px-3 text-xs rounded-xl border border-blue-200 focus:outline-none focus:border-[#155DFC] text-gray-800"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#155DFC] text-white text-xs font-bold rounded-xl active:scale-95 cursor-pointer"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setShowTypeInput(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowTypeInput(true)}
              className="flex items-center space-x-1.5 text-xs font-bold text-[#155DFC] hover:underline cursor-pointer py-1"
            >
              <Keyboard className="w-4 h-4 text-[#155DFC]" />
              <span>Type instead</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
