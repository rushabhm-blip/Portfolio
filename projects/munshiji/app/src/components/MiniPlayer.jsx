import React from 'react';
import { Play, Pause, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function MiniPlayer() {
  const { 
    currentEpisode, 
    playbackState, 
    togglePlayPause, 
    closeMiniPlayer, 
    setIsFullPlayerOpen,
    currentTime,
    duration,
    retry,
    isMiniPlayerVisible
  } = useAudio();

  if (!isMiniPlayerVisible || !currentEpisode) {
    return null;
  }

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';
  const isError = playbackState === 'error';

  return (
    <div 
      className="munshiji-mini-player"
      role="region"
      aria-label="Audio player mini bar"
      style={{
        position: 'absolute',
        bottom: '86px', // Directly above the bottom navigation bar (which is 82px)
        left: '12px',
        right: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.16), 0 2px 8px -2px rgba(124, 58, 237, 0.12)',
        zIndex: 42,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUpMini 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Top progress indicator bar */}
      <div style={{
        width: '100%',
        height: '3px',
        backgroundColor: '#e2e8f0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          backgroundColor: '#7c3aed',
          transition: 'width 0.2s linear'
        }} />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        gap: '10px'
      }}>
        {/* Artwork thumbnail */}
        <div 
          onClick={() => setIsFullPlayerOpen(true)}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#f1ecfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            overflow: 'hidden'
          }}
        >
          <img 
            src={currentEpisode.artwork} 
            alt={currentEpisode.title}
            style={{
              width: '84%',
              height: '84%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Title and subtitle (tap opens full player) */}
        <div 
          onClick={() => setIsFullPlayerOpen(true)}
          style={{
            flex: 1,
            minWidth: 0,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#080e34',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentEpisode.title}
          </div>
          
          <div style={{
            fontSize: '11px',
            color: isError ? '#ef4444' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {isError ? (
              <>
                <AlertCircle size={11} color="#ef4444" />
                <span>Error playing track · Tap retry</span>
              </>
            ) : isLoading ? (
              <span>Loading audio...</span>
            ) : (
              <>
                {/* Visual equalizer wave only animates when actually playing */}
                <span className={`audio-wave-pill ${isPlaying ? 'playing' : 'paused'}`}>
                  <span className="wave-bar bar-1"></span>
                  <span className="wave-bar bar-2"></span>
                  <span className="wave-bar bar-3"></span>
                </span>
                <span>{currentEpisode.subtitle || currentEpisode.duration}</span>
              </>
            )}
          </div>
        </div>

        {/* Controls: Play/Pause/Retry + Close */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0
        }}>
          {isError ? (
            <button
              onClick={retry}
              aria-label="Retry audio playback"
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          ) : (
            <button
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause episode" : "Play episode"}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#0b1333',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
                flexShrink: 0
              }}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" color="#ffffff" />
              ) : isPlaying ? (
                <Pause size={15} fill="#ffffff" color="#ffffff" />
              ) : (
                <Play size={15} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
              )}
            </button>
          )}

          {/* Dismiss button: stops playback and dismisses */}
          <button
            onClick={closeMiniPlayer}
            aria-label="Close audio player"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <X size={17} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
