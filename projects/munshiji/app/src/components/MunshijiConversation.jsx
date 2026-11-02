import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { 
  Mic, 
  Keyboard, 
  RotateCcw, 
  Square, 
  Send, 
  X, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle 
} from 'lucide-react';
import { findKnowledgeAnswer, getMunshijiAIAnswer } from '../utils/munshijiAI';

const SAMPLE_QUESTION = "What’s the difference between a need and a want?";
const SAMPLE_ANSWER_HEADLINE = "Needs are essentials.\nWants are extras.";
const SAMPLE_ANSWER_FULL = "A need is something essential, like groceries or rent. A want adds comfort or enjoyment, like eating out. Plan for your needs first, then make room for wants.";

const SAMPLE_AUDIO_SRC = "./assets/conversation/sample_answer.mp3";

const MunshijiConversation = forwardRef(function MunshijiConversation({
  mode, // 'exploring' | 'conversation'
  onEnterConversation,
  onCloseConversation,
  onMouthStateChange,
  onBodyPoseChange,
  isAudioMuted,
  onToggleNarration,
  onAmbientDuckingChange
}, ref) {
  // Voice states: 'ready' | 'listening' | 'typing' | 'thinking' | 'speaking' | 'finished'
  const [voiceState, setVoiceState] = useState('ready');
  const [currentQuestion, setCurrentQuestion] = useState(SAMPLE_QUESTION);
  const [currentHeadline, setCurrentHeadline] = useState(SAMPLE_ANSWER_HEADLINE);
  const [currentFullAnswer, setCurrentFullAnswer] = useState(SAMPLE_ANSWER_FULL);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(SAMPLE_AUDIO_SRC);
  const [isExpanded, setIsExpanded] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'permission' | 'no_speech' | 'network' | 'unsupported'

  // Audio playback ref
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Scheduled timers ref for gesture coordination
  const gestureTimeoutsRef = useRef([]);
  const phraseCueTimeoutsRef = useRef([]);

  // Precomputed envelope cache for all audio tracks (audioSrc -> Float32Array or Array)
  const envelopesMapRef = useRef(new Map());

  // Speech Recognition ref
  const recognitionRef = useRef(null);

  // Compute RMS envelope from an audio URL at 50fps using Web Audio decodeAudioData
  const loadEnvelopeForAudio = useCallback(async (audioSrc) => {
    if (!audioSrc || envelopesMapRef.current.has(audioSrc)) {
      return envelopesMapRef.current.get(audioSrc);
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      const res = await fetch(audioSrc);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

      const sampleRate = audioBuffer.sampleRate;
      const channelData = audioBuffer.getChannelData(0);
      const fps = 50;
      const windowSize = Math.floor(sampleRate / fps);
      const totalFrames = Math.floor(channelData.length / windowSize);
      const envelope = new Float32Array(totalFrames);

      for (let f = 0; f < totalFrames; f++) {
        const start = f * windowSize;
        const end = Math.min(start + windowSize, channelData.length);
        let sum = 0;
        for (let i = start; i < end; i++) {
          sum += channelData[i] * channelData[i];
        }
        envelope[f] = Math.sqrt(sum / (end - start));
      }
      envelopesMapRef.current.set(audioSrc, envelope);
      return envelope;
    } catch (err) {
      console.warn('Could not decode audio envelope for', audioSrc, err);
      return null;
    }
  }, []);

  // Load sample answer envelope timeline and background pre-decode domain answers
  useEffect(() => {
    fetch('./assets/conversation/sample_answer_envelope.json')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.envelope) {
          envelopesMapRef.current.set(SAMPLE_AUDIO_SRC, data.envelope);
          envelopesMapRef.current.set('./assets/conversation/answers/need_want.mp3', data.envelope);
        }
      })
      .catch(() => {});

    const commonAnswers = [
      './assets/conversation/answers/money.mp3',
      './assets/conversation/answers/savings.mp3',
      './assets/conversation/answers/emergency.mp3',
      './assets/conversation/answers/investing.mp3',
      './assets/conversation/answers/budgeting.mp3',
      './assets/conversation/answers/compounding.mp3',
      './assets/conversation/answers/debt.mp3',
      './assets/conversation/answers/gold_fd.mp3',
      './assets/conversation/answers/inflation.mp3',
      './assets/conversation/answers/insurance.mp3',
      './assets/conversation/answers/retirement.mp3',
      './assets/conversation/answers/general.mp3',
    ];

    commonAnswers.forEach((src) => {
      loadEnvelopeForAudio(src);
    });
  }, [loadEnvelopeForAudio]);

  // Clear all pending gesture and phrase cue timers
  const clearGestureTimers = useCallback(() => {
    gestureTimeoutsRef.current.forEach(clearTimeout);
    gestureTimeoutsRef.current = [];
    phraseCueTimeoutsRef.current.forEach(clearTimeout);
    phraseCueTimeoutsRef.current = [];
  }, []);

  // Stop active speech playback, gestures, and mouth animation immediately
  const stopSpeech = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isPlayingRef.current = false;

    // Cancel all scheduled hand gesture transitions and reset to resting
    clearGestureTimers();
    if (onBodyPoseChange) onBodyPoseChange('resting');

    // Immediately close mouth
    if (onMouthStateChange) onMouthStateChange('closed');
  }, [onMouthStateChange, onBodyPoseChange, clearGestureTimers]);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      stopRecognition();
    };
  }, [stopSpeech]);

  // Duck ambient sound when in listening or speaking
  useEffect(() => {
    if (onAmbientDuckingChange) {
      if (voiceState === 'listening' || voiceState === 'speaking') {
        onAmbientDuckingChange(true);
      } else {
        onAmbientDuckingChange(false);
      }
    }
  }, [voiceState, onAmbientDuckingChange]);

  // Stop speech recognition
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  // Preloaded audio element & Web Audio setup
  const initAudioAnalyser = useCallback((audioEl) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      if (audioContextRef.current && !analyserRef.current) {
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.35;
        const source = audioContextRef.current.createMediaElementSource(audioEl);
        source.connect(analyser);
        analyser.connect(audioContextRef.current.destination);
        analyserRef.current = analyser;
      }
    } catch (e) {
      console.warn('Web Audio Analyser setup notice:', e);
    }
  }, []);

  // Natural hand gesture sequence:
  // resting -> lift (240ms) -> inward (280ms) -> open_high (400ms) -> open_hold (350ms) -> lowering (280ms) -> near_rest (240ms) -> resting
  const triggerHandGesture = useCallback(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Clear any previous active gesture steps
    gestureTimeoutsRef.current.forEach(clearTimeout);
    gestureTimeoutsRef.current = [];

    const steps = [
      { pose: 'lift', delay: 0 },
      { pose: 'inward', delay: 240 },
      { pose: 'open_high', delay: 520 },
      { pose: 'open_hold', delay: 920 },
      { pose: 'lowering', delay: 1270 },
      { pose: 'near_rest', delay: 1550 },
      { pose: 'resting', delay: 1790 },
    ];

    steps.forEach(({ pose, delay }) => {
      const id = setTimeout(() => {
        if (isPlayingRef.current && onBodyPoseChange) {
          onBodyPoseChange(pose);
        }
      }, delay);
      gestureTimeoutsRef.current.push(id);
    });
  }, [onBodyPoseChange]);

  // Play audio file with coordinated lip sync (closed, narrow, open, rounded) and phrase-boundary gestures
  const playStorytellerAudio = useCallback((audioSrc, answerHeadline, answerFull, gestureCueDelays = [1200, 5800]) => {
    stopSpeech();

    // Trigger instant background decode if not already in cache
    loadEnvelopeForAudio(audioSrc);

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = audioSrc;
    audio.preload = 'auto';

    const startAnimationLoop = () => {
      isPlayingRef.current = true;
      initAudioAnalyser(audio);

      const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 0;
      const dataArray = analyserRef.current ? new Uint8Array(bufferLength) : null;

      const prefersReducedMotion = typeof window !== 'undefined' && 
        window.matchMedia && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        if (onMouthStateChange) onMouthStateChange('closed');
        if (onBodyPoseChange) onBodyPoseChange('resting');
      }

      // Schedule natural hand gestures at phrase boundaries
      if (!prefersReducedMotion) {
        gestureCueDelays.forEach((cueMs) => {
          const tid = setTimeout(() => {
            if (isPlayingRef.current) {
              triggerHandGesture();
            }
          }, cueMs);
          phraseCueTimeoutsRef.current.push(tid);
        });
      }

      let currentMouth = 'closed';
      let lastSwitchTime = performance.now();
      const MIN_HOLD_MS = 95;
      let hasRealAudioSignal = false;

      const tick = (now) => {
        if (!isPlayingRef.current) return;

        const curTime = audio.currentTime;

        if (!prefersReducedMotion) {
          let analyserRms = 0;
          let lowEnergy = 0;
          let midHighEnergy = 0;

          if (analyserRef.current && dataArray) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += (dataArray[i] / 255.0) ** 2;
            }
            analyserRms = Math.sqrt(sum / bufferLength);

            for (let i = 1; i <= 4; i++) lowEnergy += dataArray[i];
            for (let i = 5; i <= 20; i++) midHighEnergy += dataArray[i];
            if (analyserRms > 0.02) {
              hasRealAudioSignal = true;
            }
          }

          let envRms = 0;
          const cachedEnv = envelopesMapRef.current.get(audioSrc);
          if (cachedEnv) {
            const idx = Math.floor(curTime * 50);
            if (idx >= 0 && idx < cachedEnv.length) {
              envRms = cachedEnv[idx];
            }
          }

          const hasEnvelope = Boolean(cachedEnv && cachedEnv.length > 0);
          const effectiveRms = Math.max(analyserRms, envRms);

          let targetMouth = 'closed';

          if (hasEnvelope || hasRealAudioSignal) {
            // Signal-driven lip sync (RMS amplitude + spectral balance)
            if (effectiveRms < 0.034) {
              targetMouth = 'closed';
            } else if (effectiveRms < 0.115) {
              targetMouth = 'narrow';
            } else {
              const vowelCycle = Math.floor(curTime * 1000 / 150) % 3;
              if ((lowEnergy > midHighEnergy * 1.3 && effectiveRms > 0.13) || vowelCycle === 1) {
                targetMouth = 'rounded';
              } else {
                targetMouth = 'open';
              }
            }
          } else {
            // Resilient speech cadence fallback for mobile WebViews or while decoding
            if (!audio.paused && !audio.ended && curTime > 0.06) {
              const speechMs = Math.floor(curTime * 1000);
              const clauseMs = speechMs % 2100;
              if (clauseMs > 1920) {
                // Natural micro-pause at phrase boundary
                targetMouth = 'closed';
              } else {
                const pattern = ['narrow', 'open', 'narrow', 'rounded', 'open', 'narrow', 'open'];
                const cycle = Math.floor(speechMs / 140) % pattern.length;
                targetMouth = pattern[cycle];
              }
            } else {
              targetMouth = 'closed';
            }
          }

          const elapsed = now - lastSwitchTime;
          if (targetMouth !== currentMouth) {
            const allowChange = (targetMouth === 'closed' && elapsed >= 60) || elapsed >= MIN_HOLD_MS;
            if (allowChange) {
              currentMouth = targetMouth;
              lastSwitchTime = now;
              if (onMouthStateChange) onMouthStateChange(targetMouth);
            }
          }
        }

        if (!audio.paused && !audio.ended) {
          animFrameRef.current = requestAnimationFrame(tick);
        }
      };

      animFrameRef.current = requestAnimationFrame(tick);
    };

    audio.onended = () => {
      stopSpeech();
      setVoiceState('finished');
    };

    audio.onerror = () => {
      console.warn('Audio playback error.');
      stopSpeech();
      setVoiceState('finished');
    };

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    audio.play().then(() => {
      setVoiceState('speaking');
      startAnimationLoop();
    }).catch((err) => {
      console.warn('Audio play restricted or unavailable:', err);
      stopSpeech();
      setVoiceState('finished');
    });
  }, [stopSpeech, loadEnvelopeForAudio, initAudioAnalyser, onMouthStateChange, onBodyPoseChange, triggerHandGesture]);

  // Fallback speech synthesis
  const fallbackSpeechSynthesis = useCallback((text) => {
    stopSpeech();
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setVoiceState('finished');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.92;

    const mouthCycle = ['narrow', 'open', 'rounded', 'narrow', 'closed'];
    let step = 0;
    let tId = null;

    utterance.onstart = () => {
      setVoiceState('speaking');
      triggerHandGesture();
      tId = setInterval(() => {
        step = (step + 1) % mouthCycle.length;
        if (onMouthStateChange) onMouthStateChange(mouthCycle[step]);
      }, 110);
    };

    utterance.onend = () => {
      if (tId) clearInterval(tId);
      stopSpeech();
      setVoiceState('finished');
    };

    utterance.onerror = () => {
      if (tId) clearInterval(tId);
      stopSpeech();
      setVoiceState('finished');
    };

    window.speechSynthesis.speak(utterance);
  }, [stopSpeech, onMouthStateChange, triggerHandGesture]);

  // Submit question flow (Resolves question with AI and always speaks in Prabhat Indian voice)
  const submitQuestion = useCallback(async (q) => {
    const cleanQ = q.trim();
    if (!cleanQ) return;

    setCurrentQuestion(cleanQ);
    stopRecognition();
    stopSpeech();
    setVoiceState('thinking');
    onEnterConversation();

    try {
      // 1. If it's the core sample question, immediately use the restored Prabhat master audio
      const lower = cleanQ.toLowerCase();
      const isNeedWant = lower.includes('need') && lower.includes('want');
      if (isNeedWant || cleanQ === SAMPLE_QUESTION) {
        setTimeout(() => {
          setCurrentHeadline(SAMPLE_ANSWER_HEADLINE);
          setCurrentFullAnswer(SAMPLE_ANSWER_FULL);
          setCurrentAudioUrl(SAMPLE_AUDIO_SRC);
          playStorytellerAudio(SAMPLE_AUDIO_SRC, SAMPLE_ANSWER_HEADLINE, SAMPLE_ANSWER_FULL, [1200, 5800]);
        }, 350);
        return;
      }

      // 2. Resolve question with AI (Gemini via Puter AI or verified financial knowledge base)
      const aiResult = await getMunshijiAIAnswer(cleanQ);

      const targetHeadline = aiResult.headline;
      const targetFullAnswer = aiResult.fullAnswer;
      // Always use authentic Indian storyteller audio (Prabhat)
      const targetAudioUrl = aiResult.audioUrl || "./assets/conversation/answers/general.mp3";

      setCurrentHeadline(targetHeadline);
      setCurrentFullAnswer(targetFullAnswer);
      setCurrentAudioUrl(targetAudioUrl);

      // Play storyteller audio with synchronized mouth and hand gestures
      playStorytellerAudio(targetAudioUrl, targetHeadline, targetFullAnswer, [1200, 4800]);
    } catch (e) {
      console.warn('Submit question error:', e);
      setVoiceState('finished');
    }
  }, [stopRecognition, stopSpeech, playStorytellerAudio, onEnterConversation]);

  // Start Voice Capture
  const startListening = useCallback(() => {
    stopSpeech();
    setErrorType(null);
    setErrorMessage(null);
    setLiveTranscript('');
    setVoiceState('listening');
    onEnterConversation();

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorType('unsupported');
      setErrorMessage("Voice recognition isn't supported in this browser. Tap Type to ask.");
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        setVoiceState('listening');
      };

      rec.onresult = (e) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            final += t;
          } else {
            interim += t;
          }
        }
        setLiveTranscript(final || interim);
        if (final) {
          rec.stop();
          submitQuestion(final);
        }
      };

      rec.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        if (e.error === 'not-allowed') {
          setErrorType('permission');
          setErrorMessage("Microphone access is blocked. Tap Type to ask.");
        } else if (e.error === 'no-speech') {
          setErrorType('no_speech');
          setErrorMessage("No speech was detected. Tap Try again or Type.");
        } else {
          setErrorType('network');
          setErrorMessage("Couldn’t process audio. Tap Try again or Type.");
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn('Failed to start recognition:', err);
      setErrorType('permission');
      setErrorMessage("Could not start microphone. Tap Type to ask.");
    }
  }, [stopSpeech, submitQuestion, onEnterConversation]);

  // Primary action handlers
  const handleAsk = () => {
    startListening();
  };

  const handleType = () => {
    stopSpeech();
    stopRecognition();
    setVoiceState('typing');
    onEnterConversation();
  };

  const handleCancel = () => {
    stopSpeech();
    stopRecognition();
    setLiveTranscript('');
    setTypedInput('');
    setErrorType(null);
    setErrorMessage(null);

    // If an answer was already present, return to finished answer card; otherwise return to ready bar & exploring
    if (currentHeadline && voiceState !== 'ready') {
      setVoiceState('finished');
    } else {
      setVoiceState('ready');
      onCloseConversation();
    }
  };

  const handleStop = () => {
    stopSpeech();
    setVoiceState('finished');
  };

  const handleReplay = () => {
    stopSpeech();
    onEnterConversation();
    if (currentAudioUrl) {
      playStorytellerAudio(currentAudioUrl, currentHeadline, currentFullAnswer, [1200, 5800]);
    } else {
      fallbackSpeechSynthesis(currentFullAnswer);
    }
  };

  const handleSendTyped = (e) => {
    if (e) e.preventDefault();
    if (typedInput.trim()) {
      submitQuestion(typedInput);
      setTypedInput('');
    }
  };

  // Expose imperative handleBack for hierarchical back navigation
  useImperativeHandle(ref, () => ({
    handleBack: () => {
      // 1. If composer is open, close composer first
      if (voiceState === 'typing') {
        setVoiceState(currentHeadline ? 'finished' : 'ready');
        return true;
      }
      // 2. If listening or thinking, cancel and return
      if (voiceState === 'listening' || voiceState === 'thinking') {
        stopRecognition();
        stopSpeech();
        setVoiceState(currentHeadline ? 'finished' : 'ready');
        return true;
      }
      // 3. If speaking, stop playback and return to ready
      if (voiceState === 'speaking') {
        stopSpeech();
        setVoiceState('ready');
        onCloseConversation();
        return true;
      }
      // 4. If finished answer card is open, close conversation card and return to room exploration
      if (voiceState === 'finished' || mode === 'conversation') {
        stopSpeech();
        setVoiceState('ready');
        onCloseConversation();
        return true;
      }
      return false; // Already in ready state and exploring
    }
  }));

  const isCardState = voiceState === 'finished' || voiceState === 'listening' || voiceState === 'typing' || voiceState === 'thinking' || voiceState === 'speaking';

  return (
    <div className={`munshiji-conversation-container ${mode}`}>
      {/* Liquid Glass Capsule / Card Container */}
      <div 
        className={`glass-controls-capsule ${isCardState ? 'card-expanded' : 'pill-default'}`}
        style={{ fontFamily: 'var(--font-conversation)' }}
      >
        {/* =========================================================================
            STATE 1: DEFAULT / READY (Reference Image 1)
            Two side-by-side primary buttons: [Mic] Ask (Filled Violet) + [Keyboard] Type (Glass)
            ========================================================================= */}
        {voiceState === 'ready' && (
          <div className="glass-buttons-row">
            <button 
              className="glass-btn-ask" 
              onClick={handleAsk}
              aria-label="Ask Munshiji by voice"
            >
              <Mic size={20} color="#ffffff" strokeWidth={2.4} />
              <span>Ask</span>
            </button>
            <button 
              className="glass-btn-type" 
              onClick={handleType}
              aria-label="Type your question"
            >
              <Keyboard size={20} color="#1e1b4b" strokeWidth={2.2} />
              <span>Type</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            STATE 2: FINISHED-ANSWER CARD (Reference Image 2)
            Top: "Munshiji's answer" + circular replay button
            Middle: Headline answer + expandable full explanation
            Bottom: Two buttons: [Mic] Ask + [Keyboard] Type
            ========================================================================= */}
        {voiceState === 'finished' && (
          <div className="glass-finished-card">
            <div className="glass-card-header">
              <span className="glass-card-tag">Munshiji’s answer</span>
              <button 
                className="glass-btn-replay"
                onClick={handleReplay}
                aria-label="Replay answer"
                title="Replay answer"
              >
                <RotateCcw size={15} color="#1e1b4b" strokeWidth={2.4} />
              </button>
            </div>

            <div className="glass-card-body">
              <div className="glass-card-headline">
                {currentHeadline.split('\n').map((line, idx) => (
                  <span key={idx} className="headline-line">{line}</span>
                ))}
              </div>

              {isExpanded && (
                <div className="glass-card-full-desc">
                  {currentFullAnswer}
                </div>
              )}

              <button 
                className="glass-read-more-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
              >
                <span>{isExpanded ? "Show less" : "Read more"}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <div className="glass-buttons-row">
              <button 
                className="glass-btn-ask" 
                onClick={handleAsk}
                aria-label="Ask another question by voice"
              >
                <Mic size={20} color="#ffffff" strokeWidth={2.4} />
                <span>Ask</span>
              </button>
              <button 
                className="glass-btn-type" 
                onClick={handleType}
                aria-label="Type another question"
              >
                <Keyboard size={20} color="#1e1b4b" strokeWidth={2.2} />
                <span>Type</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 3: SPEAKING (Audio Playing + Character Lip & Hand Animation)
            ========================================================================= */}
        {voiceState === 'speaking' && (
          <div className="glass-speaking-card">
            <div className="glass-card-header">
              <div className="glass-speaking-status">
                <div className="glass-soundwave-mini">
                  <span className="sw-bar b1"></span>
                  <span className="sw-bar b2"></span>
                  <span className="sw-bar b3"></span>
                  <span className="sw-bar b4"></span>
                </div>
                <span className="glass-speaking-label">Munshiji is answering…</span>
              </div>
              <button 
                className="glass-btn-stop"
                onClick={handleStop}
                aria-label="Stop speaking"
                title="Stop speaking"
              >
                <Square size={12} fill="currentColor" strokeWidth={0} />
                <span>Stop</span>
              </button>
            </div>

            <div className="glass-card-headline caption">
              {currentHeadline.split('\n').map((line, idx) => (
                <span key={idx} className="headline-line">{line}</span>
              ))}
            </div>

            <div className="glass-buttons-row compact">
              <button 
                className="glass-btn-ask interrupt" 
                onClick={handleAsk}
                aria-label="Interrupt and ask with microphone"
              >
                <Mic size={18} color="#ffffff" strokeWidth={2.4} />
                <span>Ask</span>
              </button>
              <button 
                className="glass-btn-type interrupt" 
                onClick={handleType}
                aria-label="Interrupt and type"
              >
                <Keyboard size={18} color="#1e1b4b" strokeWidth={2.2} />
                <span>Type</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 4: LISTENING (Microphone Capture + Waveform + Live Transcript)
            ========================================================================= */}
        {voiceState === 'listening' && (
          <div className="glass-listening-card">
            <div className="glass-card-header">
              <div className="glass-speaking-status">
                <span className="pulse-dot-red"></span>
                <span className="glass-speaking-label">Listening…</span>
              </div>
              <button 
                className="glass-link-btn"
                onClick={handleCancel}
                aria-label="Cancel listening"
              >
                Cancel
              </button>
            </div>

            {errorType ? (
              <div className="glass-error-container">
                <div className="glass-error-msg">
                  <AlertCircle size={15} color="#ef4444" />
                  <span>{errorMessage || "No speech detected."}</span>
                </div>
                <div className="glass-buttons-row">
                  <button className="glass-btn-ask" onClick={handleAsk}>
                    <Mic size={18} color="#ffffff" />
                    <span>Try again</span>
                  </button>
                  <button className="glass-btn-type" onClick={handleType}>
                    <Keyboard size={18} color="#1e1b4b" />
                    <span>Type</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="glass-transcript-area">
                  <span className={liveTranscript ? "transcript-active" : "transcript-placeholder"}>
                    {liveTranscript || "Speak your question now…"}
                  </span>
                </div>

                <div className="glass-buttons-row">
                  <button 
                    className="glass-btn-ask" 
                    onClick={() => submitQuestion(liveTranscript || SAMPLE_QUESTION)}
                    disabled={!liveTranscript}
                    aria-label="Send spoken question"
                  >
                    <Send size={18} color="#ffffff" strokeWidth={2.4} />
                    <span>Send</span>
                  </button>
                  <button 
                    className="glass-btn-type" 
                    onClick={handleCancel}
                    aria-label="Cancel question"
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* =========================================================================
            STATE 5: THINKING (Discreet Status, Character Mouth Closed)
            ========================================================================= */}
        {voiceState === 'thinking' && (
          <div className="glass-thinking-card">
            <div className="glass-thinking-row">
              <div className="thinking-dots-mini">
                <span className="dot d1"></span>
                <span className="dot d2"></span>
                <span className="dot d3"></span>
              </div>
              <span className="glass-thinking-label">Thinking…</span>
              <button 
                className="glass-link-btn"
                onClick={handleCancel}
                aria-label="Cancel thinking"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 6: TYPING (Compact Text Composer)
            ========================================================================= */}
        {voiceState === 'typing' && (
          <form className="glass-composer-card" onSubmit={handleSendTyped}>
            <div className="glass-composer-input-wrapper">
              <input 
                type="text"
                className="glass-composer-input"
                placeholder="Ask about needs, wants, money…"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                autoFocus
              />
            </div>
            <div className="glass-buttons-row">
              <button 
                type="submit"
                className="glass-btn-ask"
                disabled={!typedInput.trim()}
                aria-label="Send typed question"
              >
                <Send size={18} color="#ffffff" strokeWidth={2.4} />
                <span>Send</span>
              </button>
              <button 
                type="button"
                className="glass-btn-type"
                onClick={handleCancel}
                aria-label="Cancel typing"
              >
                <span>Cancel</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

export default MunshijiConversation;
