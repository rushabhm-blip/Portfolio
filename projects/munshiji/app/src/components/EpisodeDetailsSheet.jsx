import React from 'react';
import { X, Play, Pause, Bookmark, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function EpisodeDetailsSheet({ episode, onClose }) {
  const { 
    currentEpisode, 
    playbackState, 
    playEpisode, 
    togglePlayPause, 
    isSaved, 
    toggleSave 
  } = useAudio();

  if (!episode) return null;

  const isThisEpisodeCurrent = currentEpisode && currentEpisode.id === episode.id;
  const isPlaying = isThisEpisodeCurrent && playbackState === 'playing';
  const isLoading = isThisEpisodeCurrent && playbackState === 'loading';
  const saved = isSaved(episode.id);

  const handlePlayClick = () => {
    if (isThisEpisodeCurrent) {
      togglePlayPause();
    } else {
      playEpisode(episode);
    }
  };

  return (
    <div 
      className="episode-details-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Episode details sheet"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="episode-details-sheet"
        style={{
          width: '100%',
          maxHeight: '88%',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '30px',
          borderTopRightRadius: '30px',
          padding: '24px 22px 36px 22px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto'
        }}
      >
        {/* Header with Close */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#7c3aed',
            backgroundColor: '#ede9fe',
            padding: '4px 10px',
            borderRadius: '999px'
          }}>
            {episode.category || 'EPISODE'}
          </span>
          <button
            onClick={onClose}
            aria-label="Close details"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* Thumbnail & Title Row */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#f1ecfe',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img 
              src={episode.artwork} 
              alt={episode.title}
              style={{
                width: '80%',
                height: '80%',
                objectFit: 'contain'
              }}
            />
          </div>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#080e34',
              lineHeight: 1.25,
              marginBottom: '6px'
            }}>
              {episode.title}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              <Clock size={14} />
              <span>{episode.duration}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Play + Bookmark */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px'
        }}>
          <button
            onClick={handlePlayClick}
            aria-label={isPlaying ? "Pause episode" : "Play episode"}
            style={{
              flex: 1,
              backgroundColor: '#0b1333',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(11, 19, 51, 0.25)'
            }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" color="#ffffff" />
            ) : isPlaying ? (
              <>
                <Pause size={16} fill="#ffffff" color="#ffffff" />
                <span>Pause episode</span>
              </>
            ) : (
              <>
                <Play size={16} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
                <span>Play episode</span>
              </>
            )}
          </button>

          <button
            onClick={() => toggleSave(episode.id)}
            aria-label={saved ? "Remove bookmark" : "Bookmark episode"}
            style={{
              backgroundColor: saved ? '#ede9fe' : '#f8fafc',
              border: `1px solid ${saved ? '#c4b5fd' : '#e2e8f0'}`,
              borderRadius: '999px',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: saved ? '#7c3aed' : '#64748b',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Bookmark size={20} fill={saved ? '#7c3aed' : 'none'} strokeWidth={2} />
          </button>
        </div>

        {/* Synopsis */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '13px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#64748b',
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}>
            About this episode
          </h3>
          <p style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#334155'
          }}>
            {episode.description}
          </p>
        </div>

        {/* Key Takeaways */}
        {episode.takeaways && episode.takeaways.length > 0 && (
          <div>
            <h3 style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#64748b',
              letterSpacing: '0.05em',
              marginBottom: '10px'
            }}>
              Key Takeaways
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {episode.takeaways.map((point, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: '#f8fafc',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9'
                }}>
                  <CheckCircle2 size={16} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.45 }}>
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
