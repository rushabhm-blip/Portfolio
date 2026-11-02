import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const AudioContext = createContext(null);

export const EPISODES_DATA = [
  {
    id: 'ep-inflation',
    isFeatured: true,
    categoryLabel: 'FEATURED EPISODE',
    category: 'Economics',
    title: 'Why do everyday prices rise?',
    subtitle: 'Inflation, made simple.',
    duration: '12 min',
    durationSec: 720,
    audioUrl: './audio/ep_inflation.mp3',
    artwork: './assets/radio/radio_clay_v2.png',
    description: 'From the price of morning milk to your favorite vegetables, inflation silently changes what your money can buy. Learn what causes price levels to creep up and how to safeguard your savings from shrinking in real terms.',
    takeaways: [
      'Inflation represents the gradual rise in prices and decline in purchasing power.',
      'Keeping cash idle in low-interest accounts loses value over 5 to 10 years.',
      'Investing in assets that beat the inflation rate preserves your real wealth.'
    ]
  },
  {
    id: 'ep-interest',
    isFeatured: false,
    category: 'Money basics',
    title: 'Interest rates, explained',
    subtitle: 'Money basics · 8 min',
    duration: '8 min',
    durationSec: 480,
    audioUrl: './audio/ep_interest.mp3',
    artwork: './assets/radio/episode_coins_clean.png',
    description: 'Why do home loan EMIs move up and down, and why do fixed deposits pay different returns across seasons? We unpack central bank repo rates and how interest shapes everyday borrowing and investing.',
    takeaways: [
      'Central banks increase interest rates when they need to temper inflation.',
      'Higher rates make borrowing costlier but boost fixed-income yields.',
      'Locking in high fixed deposit rates during peak cycles maximizes secure returns.'
    ]
  },
  {
    id: 'ep-tax',
    isFeatured: false,
    category: 'Public finance',
    title: 'Where does your tax go?',
    subtitle: 'Public finance · 10 min',
    duration: '10 min',
    durationSec: 600,
    audioUrl: './audio/ep_tax.mp3',
    artwork: './assets/radio/episode_wallet_clean.png',
    description: 'Every rupee collected through income tax and GST contributes to the national balance sheet. Explore where public revenue is allocated across infrastructure, healthcare, defense, and public welfare.',
    takeaways: [
      'Direct taxes fund central infrastructure, defense logistics, and healthcare.',
      'State taxes support local urban transit, policing, and municipal amenities.',
      'Legitimate tax planning under new and old regimes is every citizen’s right.'
    ]
  },
  {
    id: 'ep-budget',
    isFeatured: false,
    category: 'Everyday money',
    title: 'A budget that works for you',
    subtitle: 'Everyday money · 9 min',
    duration: '9 min',
    durationSec: 540,
    audioUrl: './audio/ep_budget.mp3',
    artwork: './assets/radio/episode_notebook_clean.png',
    description: 'Forget painful spreadsheets that induce financial anxiety. Learn the 50/30/20 bucketing strategy customized for Indian city lifestyles, family commitments, and spontaneous joys.',
    takeaways: [
      'Automate your 20% savings deposit on payday before any discretionary spending.',
      'Separate guilt-free fun money into a dedicated wallet so you never overspend.',
      'Review your recurring subscriptions twice a year to cull unused services.'
    ]
  },
  {
    id: 'ep-compounding',
    isFeatured: false,
    category: 'Wealth building',
    title: 'The magic of compounding',
    subtitle: 'Wealth building · 7 min',
    duration: '7 min',
    durationSec: 420,
    audioUrl: './audio/ep_inflation.mp3',
    artwork: './assets/icon_learn.png',
    description: 'Albert Einstein famously called compounding the eighth wonder of the world. Witness how small, disciplined monthly deposits in your Gullak or index funds transform over 10, 20, and 30 years.',
    takeaways: [
      'Time in the market compounds more powerfully than timing the market.',
      'Reinvesting dividend payouts exponentially accelerates portfolio size.'
    ]
  },
  {
    id: 'ep-emergency-fund',
    isFeatured: false,
    category: 'Financial security',
    title: 'Your safety shield: Emergency funds',
    subtitle: 'Financial security · 6 min',
    duration: '6 min',
    durationSec: 360,
    audioUrl: './audio/ep_interest.mp3',
    artwork: './assets/icon_goals.png',
    description: 'Why having 3 to 6 months of mandatory living costs safely parked in liquid accounts protects you from sudden medical emergencies or career transitions without touching long-term investments.',
    takeaways: [
      'Keep emergency reserves separate from daily UPI accounts to avoid temptation.',
      'High-liquidity savings accounts or liquid mutual funds make ideal repositories.'
    ]
  },
  {
    id: 'ep-test-error',
    isFeatured: false,
    category: 'Special Report',
    title: 'Global Macro: Unreleased Episode',
    subtitle: 'Unavailable Audio · Test Error State',
    duration: '15 min',
    durationSec: 900,
    audioUrl: './audio/ep_missing_file_test.wav',
    artwork: './assets/radio/radio_clay_v2.png',
    description: 'This episode demonstrates how the shared audio player gracefully handles missing or corrupt audio streams with a helpful retry option.',
    takeaways: [
      'Graceful error handling ensures no simulated playback occurs on failure.'
    ]
  }
];

export const NEWS_FEATURED_DATA = {
  id: 'news-featured-prices',
  category: 'ECONOMY',
  categoryLabel: 'ECONOMY',
  title: 'Why prices rise',
  headline: 'Why prices rise',
  subtitle: 'Munshiji Explains · 4 min',
  source: 'Munshiji Explains',
  readTime: '4 min read',
  timeAgo: '4 min',
  artwork: './assets/radio/news_featured.png',
  scope: 'India',
  topic: 'Economy',
  summary: 'From food staples to fuel, learn the everyday mechanics of inflation, why prices creep up across seasons, and how central banks manage purchasing power.',
  content: [
    'When consumer demand outpaces available supply, sellers adjust prices upward.',
    'Cost-push inflation occurs when raw material and energy prices rise across the economy.',
    'Munshiji Insight: Keeping idle cash causes money to lose real purchasing power over time.'
  ],
  audioSummary: './audio/ep_inflation.mp3'
};

export const NEWS_DATA = [
  {
    id: 'news-interest-rates',
    headline: 'Interest rates & you',
    readTime: '3 min read',
    source: 'Central Bank Watch',
    timeAgo: '3 min read',
    topic: 'Markets',
    scope: 'India',
    artwork: './assets/radio/news_bank.png',
    bgTint: '#E0F2FE',
    summary: 'How central bank repo rate decisions ripple down to your savings bank interest, fixed deposits, and home loan EMIs.',
    content: [
      'When interest rates rise, borrowing becomes more expensive, cooling excessive demand.',
      'Savers benefit from higher returns on bank fixed deposits and liquid funds.',
      'Munshiji Insight: Locking in peak fixed deposit rates helps protect retirement income.'
    ],
    audioSummary: './audio/ep_interest.mp3'
  },
  {
    id: 'news-where-taxes-go',
    headline: 'Where taxes go',
    readTime: '5 min read',
    source: 'Public Finance Review',
    timeAgo: '5 min read',
    topic: 'Policy',
    scope: 'India',
    artwork: './assets/radio/news_govt.png',
    bgTint: '#FFEDD5',
    summary: 'A clear breakdown of where public revenue is invested—from expressways and rural healthcare to defense logistics and public welfare.',
    content: [
      'Direct taxes fund national infrastructure, railways, defense logistics, and healthcare.',
      'State collections support local policing, roads, and municipal public works.',
      'Munshiji Insight: Proper tax planning under official regimes is every saver’s right.'
    ],
    audioSummary: './audio/ep_tax.mp3'
  },
  {
    id: 'news-oil-prices',
    headline: 'Why oil prices matter',
    readTime: '4 min read',
    source: 'Global Commodities',
    timeAgo: '4 min read',
    topic: 'Economy',
    scope: 'World',
    artwork: './assets/radio/news_globe.png',
    bgTint: '#EDE9FE',
    summary: 'Global crude oil benchmarks directly influence transportation, chemical manufacturing, food logistics, and the valuation of the rupee.',
    content: [
      'Crude oil is a primary input across modern supply chains, affecting transport costs of essential food items.',
      'High oil import bills put pressure on currency exchange rates and import inflation.',
      'Munshiji Insight: Diversifying across domestic growth sectors buffers your portfolio against global commodity shocks.'
    ],
    audioSummary: './audio/ep_budget.mp3'
  }
];


export function AudioProvider({ children }) {
  const [currentEpisode, setCurrentEpisode] = useState(null);
  // 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'
  const [playbackState, setPlaybackState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);

  // Saved bookmark IDs persisted in localStorage
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('munshiji_saved_radio');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return ['ep-inflation']; // initial saved item for demonstration
  });

  const audioRef = useRef(null);

  // Sync saved items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('munshiji_saved_radio', JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  const toggleSave = useCallback((id) => {
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds]);

  // Audio element management
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onWaiting = () => setPlaybackState('loading');
    const onPlaying = () => {
      setPlaybackState('playing');
      setErrorMessage(null);
    };
    const onPause = () => {
      if (playbackState !== 'loading' && playbackState !== 'error') {
        setPlaybackState('paused');
      }
    };
    const onEnded = () => {
      setPlaybackState('ended');
      setCurrentTime(0);
    };
    const onError = () => {
      setPlaybackState('error');
      setErrorMessage('Audio unavailable. Please check connection and retry.');
    };
    const onTimeUpdate = () => {
      if (!isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const retry = useCallback(() => {
    if (!audioRef.current || !currentEpisode) return;
    const audio = audioRef.current;
    setPlaybackState('loading');
    setErrorMessage(null);
    audio.load();
    audio.play().catch(() => {
      setPlaybackState('error');
      setErrorMessage('Audio unavailable on retry. Please check network.');
    });
  }, [currentEpisode]);

  // Play an episode
  const playEpisode = useCallback((episode) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    // If tapping the same episode that is already playing/paused
    if (currentEpisode && currentEpisode.id === episode.id) {
      if (playbackState === 'playing') {
        audio.pause();
        setPlaybackState('paused');
      } else if (playbackState === 'paused' || playbackState === 'ended') {
        setPlaybackState('loading');
        audio.play().catch(() => {
          setPlaybackState('error');
          setErrorMessage('Playback could not be started.');
        });
      } else if (playbackState === 'error') {
        retry();
      }
      return;
    }

    // New episode: stop current and switch
    audio.pause();
    setCurrentTime(0);
    setCurrentEpisode(episode);
    setDuration(episode.durationSec || 0);
    setPlaybackState('loading');
    setErrorMessage(null);
    setIsMiniPlayerVisible(true);

    audio.src = episode.audioUrl;
    audio.load();

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play error:', err);
        setPlaybackState('error');
        setErrorMessage('Audio source missing or failed. Tap retry.');
      });
    }
  }, [currentEpisode, playbackState, retry]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentEpisode) return;
    const audio = audioRef.current;

    if (playbackState === 'playing') {
      audio.pause();
      setPlaybackState('paused');
    } else if (playbackState === 'paused' || playbackState === 'ended') {
      setPlaybackState('loading');
      audio.play().catch(() => {
        setPlaybackState('error');
        setErrorMessage('Playback could not be resumed.');
      });
    } else if (playbackState === 'error') {
      retry();
    }
  }, [currentEpisode, playbackState, retry]);

  const seek = useCallback((timeInSec) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(timeInSec, duration || audio.duration || 1000));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const seekRelative = useCallback((deltaSec) => {
    if (!audioRef.current) return;
    seek(audioRef.current.currentTime + deltaSec);
  }, [seek]);

  const closeMiniPlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaybackState('idle');
    setIsMiniPlayerVisible(false);
    setIsFullPlayerOpen(false);
  }, []);

  return (
    <AudioContext.Provider value={{
      currentEpisode,
      playbackState,
      errorMessage,
      currentTime,
      duration,
      playbackRate,
      setPlaybackRate,
      isFullPlayerOpen,
      setIsFullPlayerOpen,
      isMiniPlayerVisible,
      playEpisode,
      togglePlayPause,
      seek,
      seekRelative,
      retry,
      closeMiniPlayer,
      savedIds,
      toggleSave,
      isSaved
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
