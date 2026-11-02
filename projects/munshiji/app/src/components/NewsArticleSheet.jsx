import React from 'react';
import { X, Bookmark, Share2, Play, Pause, Loader2, Clock, Volume2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function NewsArticleSheet({ article, onClose }) {
  const { 
    currentEpisode, 
    playbackState, 
    playEpisode, 
    togglePlayPause, 
    isSaved, 
    toggleSave 
  } = useAudio();

  if (!article) return null;

  const audioId = `news-audio-${article.id}`;
  const isAudioPlaying = currentEpisode && currentEpisode.id === audioId && playbackState === 'playing';
  const isAudioLoading = currentEpisode && currentEpisode.id === audioId && playbackState === 'loading';
  const saved = isSaved(`news-${article.id}`);

  const handlePlayBriefing = () => {
    const briefEpisode = {
      id: audioId,
      title: article.headline || article.title,
      subtitle: `${article.source || 'Munshiji'} · Audio Brief`,
      duration: article.readTime || '3 min',
      durationSec: 180,
      audioUrl: article.audioSummary || './audio/ep_inflation.mp3',
      artwork: article.artwork || './assets/radio/news_featured.jpg',
      category: article.category || 'NEWS BRIEF'
    };

    if (currentEpisode && currentEpisode.id === audioId) {
      togglePlayPause();
    } else {
      playEpisode(briefEpisode);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.headline || article.title,
        text: article.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div 
      className="news-article-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="News article details"
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
      onClick={onClose}
    >
      <div 
        className="news-article-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '90%',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          padding: '20px 22px 34px 22px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto'
        }}
      >
        {/* Top Header Actions */}
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
            color: '#7C3AED',
            backgroundColor: '#EDE9FE',
            padding: '4px 10px',
            borderRadius: '999px'
          }}>
            {article.category || article.topic || 'FINANCIAL NEWS'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => toggleSave(`news-${article.id}`)}
              aria-label={saved ? "Remove article bookmark" : "Bookmark article"}
              style={{
                background: saved ? '#EDE9FE' : '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: saved ? '#7C3AED' : '#64748B',
                cursor: 'pointer'
              }}
            >
              <Bookmark size={18} fill={saved ? '#7C3AED' : 'none'} />
            </button>

            <button
              onClick={handleShare}
              aria-label="Share article"
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              <Share2 size={17} />
            </button>

            <button
              onClick={onClose}
              aria-label="Close article"
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* 3D Clay Illustration */}
        {article.artwork && (
          <div style={{
            width: '100%',
            height: '170px',
            borderRadius: '18px',
            overflow: 'hidden',
            backgroundColor: article.bgTint || '#EDE8FC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            marginBottom: '18px'
          }}>
            <img 
              src={article.artwork} 
              alt={article.headline || article.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        )}

        {/* Headline */}
        <h2 style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#080E34',
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          margin: '0 0 8px 0'
        }}>
          {article.headline || article.title}
        </h2>

        {/* Source & Metadata */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#64748B',
          marginBottom: '18px',
          fontWeight: 500
        }}>
          <span>{article.source || 'Munshiji Explains'}</span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={13} />
            {article.readTime || '4 min read'}
          </span>
        </div>

        {/* Listen to Audio Briefing button */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          border: '1px solid #F1F5F9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#EDE9FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7C3AED'
            }}>
              <Volume2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#080E34' }}>
                Listen to Audio Brief
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Quick voice summary · {article.readTime || '3 min'}
              </div>
            </div>
          </div>

          <button
            onClick={handlePlayBriefing}
            aria-label={isAudioPlaying ? "Pause audio brief" : "Play audio brief"}
            style={{
              backgroundColor: '#080E34',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            {isAudioLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isAudioPlaying ? (
              <>
                <Pause size={13} fill="#ffffff" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={13} fill="#ffffff" style={{ marginLeft: '1px' }} />
                <span>Play</span>
              </>
            )}
          </button>
        </div>

        {/* Summary */}
        <p style={{
          fontSize: '15px',
          color: '#334155',
          lineHeight: 1.6,
          margin: '0 0 16px 0'
        }}>
          {article.summary}
        </p>

        {/* Key Takeaways */}
        {article.content && (
          <div style={{
            backgroundColor: '#FAF5FF',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #F3E8FF',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#7C3AED',
              marginBottom: '10px'
            }}>
              Key Insights
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {article.content.map((point, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#475569', lineHeight: 1.45 }}>
                  <span style={{ color: '#7C3AED', fontWeight: 800 }}>•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            backgroundColor: '#F1F5F9',
            color: '#080E34',
            border: 'none',
            borderRadius: '14px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'center',
            marginTop: '8px'
          }}
        >
          Back to Radio News
        </button>
      </div>
    </div>
  );
}
