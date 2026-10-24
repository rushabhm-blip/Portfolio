import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  Volume1,
  Mic,
  CheckCircle2,
  Sparkles,
  Star,
  Award,
  ChevronRight,
  BusFront,
  ShoppingBag,
  MapPin,
  RotateCcw,
  Check,
  X,
  VolumeX,
  PartyPopper
} from 'lucide-react';

const KANNADA_WORDS = [
  {
    id: 'namaskara',
    word: 'ನಮಸ್ಕಾರ',
    transliteration: 'Namaskara',
    meaning: 'Hello',
    pronunciationNote: 'Nuh-mus-KAH-rah',
    context: 'A friendly way to greet someone.',
    category: 'Your first hello',
    badge: 'First Hello',
    question: 'Someone greets you. What does Namaskara mean?',
    options: ['Hello', 'Thank you', 'Goodbye'],
    correctIndex: 0,
    tip: 'Greet someone with Namaskara today.',
    image: './kannada-art-lady-clean.png',
    practiceImage: './kannada-art-boy-clean.png'
  },
  {
    id: 'dhanyavada',
    word: 'ಧನ್ಯವಾದ',
    transliteration: 'Dhanyavada',
    meaning: 'Thank you',
    pronunciationNote: 'Dhun-yuh-VAH-duh',
    context: 'A polite way to show appreciation to conductors, drivers & shopkeepers.',
    category: 'Expressing gratitude',
    badge: 'Polite Citizen',
    question: 'You complete your journey. What does Dhanyavada mean?',
    options: ['Please', 'Thank you', 'How much?'],
    correctIndex: 1,
    tip: 'Say Dhanyavada after paying your bus or metro fare.',
    image: './kannada-art-gratitude.png',
    practiceImage: './kannada-art-gratitude.png'
  },
  {
    id: 'eshtu',
    word: 'ಎಷ್ಟು?',
    transliteration: 'Eshtu?',
    meaning: 'How much?',
    pronunciationNote: 'ESH-too',
    context: 'Essential for shopping at local markets and asking auto fares.',
    category: 'At the shop',
    badge: 'Smart Shopper',
    question: 'You want to know the price of coffee. What does Eshtu mean?',
    options: ['Where is it?', 'How much?', 'What time?'],
    correctIndex: 1,
    tip: 'Ask "Ondu coffee, eshtu?" at the local darshini.',
    image: './kannada-art-shop.png',
    practiceImage: './kannada-art-shop.png'
  },
  {
    id: 'hogi-barthini',
    word: 'ಹೋಗಿ ಬರ್ತೀನಿ',
    transliteration: 'Hogi barthini',
    meaning: 'Goodbye / See you',
    pronunciationNote: 'HO-gee bur-THEE-nee',
    context: "Literally means 'I will go and return' — the warmest Kannada goodbye.",
    category: 'Warm farewells',
    badge: 'True Local',
    question: 'You are parting ways with a friend. What does Hogi barthini mean?',
    options: ['Come here', 'Goodbye / See you', 'Good morning'],
    correctIndex: 1,
    tip: 'Use Hogi barthini instead of a plain bye when leaving a friend.',
    image: './kannada-art-farewell.png',
    practiceImage: './kannada-art-farewell.png'
  }
];

// Web Audio sound synthesizer for delightful native game chimes
function playChime(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Happy Major Chord)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (err) {
    // AudioContext not allowed or not supported; fail silently
  }
}

export default function NammaKannadaScreen({ onNavigate, initialStep = 'explore' }) {
  const [step, setStep] = useState(initialStep); // 'explore' | 'listen' | 'practice' | 'celebrate'
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSpeakingMic, setIsSpeakingMic] = useState(false);
  const [micFeedback, setMicFeedback] = useState(null);
  
  // Persisted XP & Words learned
  const [xp, setXp] = useState(() => {
    try {
      return parseInt(localStorage.getItem('sajag_kannada_xp') || '20', 10);
    } catch {
      return 20;
    }
  });

  const [wordsLearnedCount, setWordsLearnedCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('sajag_kannada_words_count') || '1', 10);
    } catch {
      return 1;
    }
  });

  const currentWord = KANNADA_WORDS[wordIndex % KANNADA_WORDS.length];

  const handleSpeakWord = (slow = false) => {
    playChime('click');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(currentWord.transliteration);
      utter.lang = 'kn-IN';
      utter.rate = slow ? 0.65 : 0.95;
      utter.pitch = 1.05;
      
      utter.onstart = () => setIsPlayingAudio(true);
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      
      window.speechSynthesis.speak(utter);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 900);
    }
  };

  const handleMicTest = () => {
    setIsSpeakingMic(true);
    setMicFeedback('Listening...');
    playChime('click');

    setTimeout(() => {
      setIsSpeakingMic(false);
      setMicFeedback('Great pronunciation! 👏');
      playChime('correct');
      setTimeout(() => setMicFeedback(null), 3500);
    }, 1800);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentWord.correctIndex;
    setIsAnswerCorrect(isCorrect);
    setHasCheckedAnswer(true);

    if (isCorrect) {
      playChime('correct');
      const newXp = xp + 10;
      const newWords = Math.max(wordsLearnedCount, wordIndex + 1);
      setXp(newXp);
      setWordsLearnedCount(newWords);
      try {
        localStorage.setItem('sajag_kannada_xp', newXp.toString());
        localStorage.setItem('sajag_kannada_words_count', newWords.toString());
      } catch (err) {}
    } else {
      playChime('wrong');
    }
  };

  const handleNextWord = () => {
    setWordIndex(prev => prev + 1);
    setSelectedOption(null);
    setHasCheckedAnswer(false);
    setIsAnswerCorrect(false);
    setStep('listen');
  };

  const handleBack = () => {
    if (step === 'listen') setStep('explore');
    else if (step === 'practice') setStep('listen');
    else if (step === 'celebrate') setStep('explore');
    else if (onNavigate) onNavigate('home');
  };

  return (
    <div className="w-full h-full bg-[#F4F9FD] overflow-hidden flex flex-col font-sans antialiased text-[#101828] relative">

      {/* ==================== 01 EXPLORE SCREEN ==================== */}
      {step === 'explore' && (
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-white animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-100 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="p-1 -ml-1 text-gray-700 hover:text-gray-900 active:scale-90 cursor-pointer"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">Namma Kannada</h2>
            <div className="w-6" />
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              {/* Headline */}
              <h1 className="text-2xl font-black text-[#101828] tracking-tight leading-tight mb-4">
                Feel at home,<br />one word at a time.
              </h1>

              {/* Hero Artwork (Waving Boy with Speech Bubble & Vidhana Soudha) */}
              <div className="w-full rounded-2xl overflow-hidden mb-4 border border-blue-100/60 shadow-2xs bg-[#EAF5FE] relative">
                <img
                  src="./kannada-art-boy-clean.png"
                  alt="Feel at home, Namaskara"
                  className="w-full h-40 object-cover block"
                />
                {/* Speech bubble matching design */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border-2 border-[#3B82F6] rounded-2xl px-3 py-1 shadow-sm flex flex-col items-center">
                  <span className="text-base font-bold text-[#101828] leading-tight">ನಮಸ್ಕಾರ</span>
                  <span className="text-[10px] font-semibold text-gray-600">Namaskara</span>
                </div>
              </div>

              {/* Featured Course Card: "Your first hello" */}
              <div className="bg-[#EFF7FF] border border-[#D5E7FD] rounded-2xl p-4 mb-5 shadow-2xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-blue-200/80 text-[#155DFC] flex items-center justify-center shadow-2xs shrink-0">
                    <BookOpen className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">Your first hello</h3>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">1 word • 1 minute</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playChime('click');
                    setStep('listen');
                  }}
                  className="w-full py-2.5 bg-[#155DFC] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start learning</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.4]" />
                </button>
              </div>

              {/* Section: Everyday Kannada */}
              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 px-0.5">
                  Everyday Kannada
                </h3>

                <div className="space-y-2">
                  {[
                    { title: 'Getting around', icon: BusFront, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { title: 'At the shop', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { title: 'Asking directions', icon: MapPin, color: 'text-blue-600 bg-blue-50 border-blue-100' }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          playChime('click');
                          setStep('listen');
                        }}
                        className="w-full p-3 bg-white hover:bg-gray-50/80 active:scale-[0.99] border border-gray-200/80 rounded-2xl flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
                            <Icon className="w-4 h-4 stroke-[2.2]" />
                          </div>
                          <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-gray-400 font-medium pt-3 pb-1">
              Learn at your own pace.
            </p>
          </div>
        </div>
      )}

      {/* ==================== 02 LISTEN SCREEN ==================== */}
      {step === 'listen' && (
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-white animate-in fade-in duration-200">
          {/* Top Bar with Step counter */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-100 shrink-0">
            <button
              onClick={handleBack}
              className="p-1 -ml-1 text-gray-700 hover:text-gray-900 active:scale-90 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">{currentWord.category}</h2>
            <span className="text-xs font-semibold text-gray-400">1 of 2</span>
          </div>

          {/* Progress Bar (50%) */}
          <div className="w-full h-1 bg-gray-100">
            <div className="h-full bg-[#155DFC] rounded-r-full transition-all duration-300 w-1/2" />
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Word Display Card */}
              <div className="bg-[#EDF5FF] border border-[#D5E7FD] rounded-3xl p-5 text-center shadow-2xs">
                <div className="text-4xl font-black text-[#101828] tracking-tight mb-1 font-serif">
                  {currentWord.word}
                </div>
                <div className="text-base font-bold text-[#101828] tracking-tight">
                  {currentWord.transliteration}
                </div>
                <div className="text-xs font-medium text-gray-500 mt-0.5">
                  {currentWord.meaning}
                </div>

                {/* Big Circular Listen Button */}
                <div className="mt-4 mb-2 flex flex-col items-center">
                  <button
                    onClick={() => handleSpeakWord(false)}
                    className={`w-14 h-14 rounded-full bg-[#155DFC] hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition-all cursor-pointer ${
                      isPlayingAudio ? 'ring-4 ring-blue-300 animate-pulse' : ''
                    }`}
                    aria-label="Listen to pronunciation"
                  >
                    <Volume2 className="w-6 h-6 fill-white" />
                  </button>
                  <span className="text-xs font-bold text-[#101828] mt-1.5">Listen</span>

                  {/* Play Slowly button */}
                  <button
                    onClick={() => handleSpeakWord(true)}
                    className="mt-2 px-3 py-1 bg-[#E1EEFE] hover:bg-blue-100 active:scale-95 text-[#155DFC] font-bold text-[11px] rounded-full border border-blue-200/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Volume1 className="w-3.5 h-3.5" />
                    <span>Play slowly</span>
                  </button>
                </div>
              </div>

              {/* Cultural Context Note */}
              <p className="text-center text-xs font-medium text-gray-600 px-2">
                {currentWord.context}
              </p>

              {/* Contextual Illustration Card matching the word being learned */}
              <div className="rounded-2xl overflow-hidden border border-blue-100/70 shadow-2xs bg-[#EDF6FE]">
                <img
                  src={currentWord.image}
                  alt={currentWord.meaning}
                  className="w-full h-36 object-cover block"
                />
              </div>

              {/* Try Saying It (Microphone Interactive Button) */}
              <button
                onClick={handleMicTest}
                disabled={isSpeakingMic}
                className="w-full py-2.5 px-4 bg-white hover:bg-blue-50/50 border border-blue-300 rounded-2xl flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer active:scale-[0.99] group"
              >
                <div className="w-7 h-7 rounded-full bg-blue-50 text-[#155DFC] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Mic className={`w-3.5 h-3.5 ${isSpeakingMic ? 'animate-pulse text-red-500' : ''}`} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-900 leading-tight">
                    {micFeedback || 'Try saying it'}
                  </div>
                  {!micFeedback && (
                    <div className="text-[10px] text-gray-400 font-medium">Optional</div>
                  )}
                </div>
              </button>
            </div>

            {/* Bottom Action Button: Practise */}
            <div className="pt-4">
              <button
                onClick={() => {
                  playChime('click');
                  setStep('practice');
                }}
                className="w-full py-3.5 bg-[#155DFC] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Practise</span>
                <ChevronRight className="w-4 h-4 stroke-[2.4]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 03 PRACTISE SCREEN ==================== */}
      {step === 'practice' && (
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-white animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-100 shrink-0">
            <button
              onClick={handleBack}
              className="p-1 -ml-1 text-gray-700 hover:text-gray-900 active:scale-90 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">Quick practice</h2>
            <span className="text-xs font-semibold text-gray-400">2 of 2</span>
          </div>

          {/* Progress Bar (100%) */}
          <div className="w-full h-1 bg-gray-100">
            <div className="h-full bg-[#155DFC] rounded-r-full transition-all duration-300 w-full" />
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              {/* Question Headline (Centered as shown in design) */}
              <h2 className="text-lg sm:text-xl font-bold text-[#101828] text-center tracking-tight leading-snug mb-3">
                {currentWord.question}
              </h2>

              {/* Question Context Artwork matching the word */}
              <div className="rounded-2xl overflow-hidden border border-blue-100/70 shadow-2xs bg-[#EEF6FE] mb-4">
                <img
                  src={currentWord.practiceImage || currentWord.image}
                  alt={currentWord.meaning}
                  className="w-full h-36 object-cover block"
                />
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                {currentWord.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentWord.correctIndex;
                  let borderClass = 'border-gray-200/90 bg-white hover:bg-gray-50';
                  let radioCircle = (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0" />
                  );

                  if (hasCheckedAnswer) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold';
                      radioCircle = (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      );
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-rose-400 bg-rose-50 text-rose-950 font-medium';
                      radioCircle = (
                        <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                          <X className="w-3 h-3 stroke-[3]" />
                        </div>
                      );
                    }
                  } else if (isSelected) {
                    borderClass = 'border-[#155DFC] bg-[#EFF6FF] text-[#155DFC] font-bold shadow-2xs';
                    radioCircle = (
                      <div className="w-5 h-5 rounded-full border-2 border-[#155DFC] flex items-center justify-center shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#155DFC]" />
                      </div>
                    );
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!hasCheckedAnswer) {
                          playChime('click');
                          setSelectedOption(idx);
                        }
                      }}
                      className={`w-full p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${borderClass}`}
                    >
                      {radioCircle}
                      <span className="text-sm font-bold">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert if Wrong */}
              {hasCheckedAnswer && !isAnswerCorrect && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <span>💡 Remember: <span className="font-bold">{currentWord.transliteration}</span> means <span className="font-bold">{currentWord.meaning}</span>. Give it another try!</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4">
              <p className="text-center text-xs text-gray-500 font-medium mb-3">
                Take your time. You can try again.
              </p>

              {!hasCheckedAnswer ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className={`w-full py-3.5 font-bold text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedOption !== null
                      ? 'bg-[#155DFC] hover:bg-blue-700 active:scale-[0.99] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>Check answer</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.4]" />
                </button>
              ) : isAnswerCorrect ? (
                /* Solid, calm, non-bouncing green button matching user mockup */
                <button
                  onClick={() => {
                    playChime('click');
                    setStep('celebrate');
                  }}
                  className="w-full py-3.5 bg-[#009951] hover:bg-[#008244] active:scale-[0.99] text-white font-bold text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Correct! Continue</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.4]" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setHasCheckedAnswer(false);
                    setSelectedOption(null);
                  }}
                  className="w-full py-3.5 bg-[#155DFC] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try again</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 04 CELEBRATE SCREEN ==================== */}
      {step === 'celebrate' && (
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-white animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-100 shrink-0">
            <button
              onClick={() => setStep('explore')}
              className="p-1 -ml-1 text-gray-700 hover:text-gray-900 active:scale-90 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">Namma Kannada</h2>
            <div className="w-6" />
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="text-center">
              {/* Confetti Waving Hand Art */}
              <div className="w-36 h-28 mx-auto overflow-hidden flex items-center justify-center my-1">
                <img
                  src="./kannada-art-celebrate.png"
                  alt="Celebration"
                  className="w-full h-full object-contain block animate-in zoom-in-90 duration-300"
                />
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl font-black text-[#101828] tracking-tight leading-tight mt-2">
                Your first word!
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-1">
                You learned <span className="font-bold text-gray-900">{currentWord.transliteration}</span>.
              </p>

              {/* Stats Card: XP + Words learned */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Star className="w-4 h-4 fill-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-amber-900 leading-tight">+10</div>
                    <div className="text-[10px] text-amber-700 font-medium">learning XP</div>
                  </div>
                </div>

                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-blue-900 leading-tight">{wordsLearnedCount}</div>
                    <div className="text-[10px] text-blue-700 font-medium">word learned</div>
                  </div>
                </div>
              </div>

              {/* Badge Unlocked Pill */}
              <div className="inline-flex items-center gap-1.5 bg-white border border-[#CBDDF8] px-4 py-1.5 rounded-full text-xs font-bold text-[#101828] mt-3 shadow-2xs">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{currentWord.badge}</span>
              </div>

              {/* Real World Practice Tip Card */}
              <div className="bg-[#F0F7FF] border border-[#D5E7FD] rounded-2xl p-3.5 mt-4 text-left flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-blue-200/60 shrink-0">
                  <img
                    src={currentWord.image}
                    alt="Try it in Bengaluru"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Try it in Bengaluru</h4>
                  <p className="text-[11px] text-gray-600 font-medium mt-0.5 leading-snug">
                    {currentWord.tip}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400 font-medium mt-3">
                We'll bring this word back for practice.
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 space-y-2">
              <button
                onClick={handleNextWord}
                className="w-full py-3.5 bg-[#155DFC] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Learn another word</span>
                <ChevronRight className="w-4 h-4 stroke-[2.4]" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('home')}
                className="w-full py-1.5 text-[#155DFC] hover:underline font-bold text-xs transition-all cursor-pointer block text-center"
              >
                Back to home
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
