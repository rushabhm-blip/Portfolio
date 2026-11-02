import React from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Bookmark, 
  Share2, 
  Loader2, 
  AlertCircle,
  Volume2
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function FullPlayerModal() {
  const { 
    currentEpisode, 
    playbackState, 
    togglePlayPause, 
    seek, 
    seekRelative, 
    currentTime, 
    duration, 
    playbackRate, 
    setPlaybackRate, 
    isFullPlayerOpen, 
    setIsFullPlayerOpen,
    isSaved,
    toggleSave,
    retry
  } = useAudio();

  if (!isFullPlayerOpen || !currentEpisode) {
    return null;
  }

  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';
  const isError = playbackState === 'error';
  const saved = isSaved(currentEpisode.id);

  const totalDuration = duration > 0 ? duration : currentEpisode.durationSec || 600;
  const progressPercent = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0;

  const handleSliderChange = (e) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleCycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  return (
    <div 
      className="munshiji-full-player-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Audio episode full player"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 55,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="full-player-sheet"
        style={{
          width: '100%',
          maxHeight: '92%',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          padding: '20px 24px 34px 24px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto'
        }}
      >
        {/* Top drag handle / minimize */}
        <button 
          onClick={() => setIsFullPlayerOpen(false)}
          aria-label="Minimize player"
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '12px'
          }}
        >
          <div style={{
            width: '36px',
            height: '4px',
            backgroundColor: '#cbd5e1',
            borderRadius: '999px',
            marginBottom: '6px'
          }}></div>
          <ChevronDown size={22} color="#64748b" />
        </button>

        {/* Large Artwork with soft glow */}
        <div style={{
          width: '210px',
          height: '210px',
          backgroundColor: '#f1ecfe',
          borderRadius: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 30px -4px rgba(124, 58, 237, 0.18)',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <img 
            src={currentEpisode.artwork} 
            alt={currentEpisode.title}
            style={{
              width: '80%',
              height: '80%',
              objectFit: 'contain'
            }}
          />
          {isPlaying && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: 'rgba(124, 58, 237, 0.9)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Volume2 size={12} />
              <span>LIVE</span>
            </div>
          )}
        </div>

        {/* Header Metadata */}
        <div style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#7c3aed',
            marginBottom: '4px'
          }}>
            {currentEpisode.categoryLabel || currentEpisode.category || 'MUNSHIJI RADIO'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#080e34',
              lineHeight: 1.25,
              margin: 0
            }}>
              {currentEpisode.title}
            </h2>
            <button
              onClick={() => toggleSave(currentEpisode.id)}
              aria-label={saved ? "Remove from bookmarks" : "Save episode"}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                color: saved ? '#7c3aed' : '#94a3b8'
              }}
            >
              <Bookmark size={22} fill={saved ? '#7c3aed' : 'none'} strokeWidth={2} />
            </button>
          </div>
          <div style={{
            fontSize: '13px',
            color: '#64748b',
            marginTop: '4px'
          }}>
            {currentEpisode.subtitle || currentEpisode.duration}
          </div>
        </div>

        {/* Scrubbable Range Slider */}
        <div style={{ width: '100%', marginBottom: '16px' }}>
          <input 
            type="range"
            min="0"
            max={totalDuration}
            step="1"
            value={currentTime}
            onChange={handleSliderChange}
            aria-label="Audio timeline slider"
            style={{
              width: '100%',
              accentColor: '#7c3aed',
              cursor: 'pointer',
              background: `linear-gradient(to right, #7c3aed ${progressPercent}%, #e2e8f0 ${progressPercent}%)`
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            marginTop: '4px'
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Error message / retry display */}
        {isError && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>Audio track unavailable.</span>
            </div>
            <button
              onClick={retry}
              style={{
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Playback Controls Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          width: '100%',
          marginBottom: '20px'
        }}>
          {/* Rewind 15s */}
          <button
            onClick={() => seekRelative(-15)}
            aria-label="Rewind 15 seconds"
            style={{
              background: 'none',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px'
            }}
          >
            <RotateCcw size={22} strokeWidth={2.2} />
            <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '2px' }}>15s</span>
          </button>

          {/* Primary Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause episode" : "Play episode"}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#0b1333',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(11, 19, 51, 0.28)',
              transition: 'transform 0.1s ease'
            }}
          >
            {isLoading ? (
              <Loader2 size={26} className="animate-spin" color="#ffffff" />
            ) : isPlaying ? (
              <Pause size={26} fill="#ffffff" color="#ffffff" />
            ) : (
              <Play size={26} fill="#ffffff" color="#ffffff" style={{ marginLeft: '3px' }} />
            )}
          </button>

          {/* Forward 30s */}
          <button
            onClick={() => seekRelative(30)}
            aria-label="Forward 30 seconds"
            style={{
              background: 'none',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px'
            }}
          >
            <RotateCw size={22} strokeWidth={2.2} />
            <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '2px' }}>30s</span>
          </button>
        </div>

        {/* Speed & Extra Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          width: '100%',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <button
            onClick={handleCycleSpeed}
            aria-label={`Playback speed currently ${playbackRate}x`}
            style={{
              background: '#f1f5f9',
              border: 'none',
              color: '#0f172a',
              borderRadius: '999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {playbackRate}x Speed
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: currentEpisode.title,
                  text: `Listening to "${currentEpisode.title}" on Munshiji Radio 📻`,
                  url: window.location.href
                }).catch(() => {});
              }
            }}
            aria-label="Share episode"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 10px'
            }}
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
