import React from 'react';
import { X, Bookmark, Play, Pause, Trash2, Newspaper, Headphones } from 'lucide-react';
import { useAudio, EPISODES_DATA, NEWS_DATA, NEWS_FEATURED_DATA } from '../context/AudioContext';

export default function RadioSavedSheet({ onClose, onSelectEpisode, onSelectNews }) {
  const { 
    savedIds, 
    toggleSave, 
    currentEpisode, 
    playbackState, 
    playEpisode, 
    togglePlayPause 
  } = useAudio();

  const allNews = [NEWS_FEATURED_DATA, ...NEWS_DATA];

  const savedEpisodes = EPISODES_DATA.filter(ep => savedIds.includes(ep.id));
  const savedNews = allNews.filter(n => savedIds.includes(`news-${n.id}`) || savedIds.includes(n.id));

  const totalCount = savedEpisodes.length + savedNews.length;

  const isPlaying = (id) => currentEpisode && currentEpisode.id === id && playbackState === 'playing';

  return (
    <div 
      className="radio-saved-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Saved items sheet"
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
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '85%',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          padding: '22px 20px 36px 20px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#ede9fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed'
            }}>
              <Bookmark size={16} fill="#7c3aed" />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#080e34', margin: 0 }}>
                Saved for later
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close saved items"
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

        {/* Content */}
        {totalCount === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '36px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              marginBottom: '12px'
            }}>
              <Bookmark size={22} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              No saved items yet
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '240px', lineHeight: 1.5 }}>
              Tap the bookmark icon on any episode or news story to save it here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Saved Episodes */}
            {savedEpisodes.length > 0 && (
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#7062C6',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Headphones size={13} />
                  <span>Episodes ({savedEpisodes.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {savedEpisodes.map(ep => (
                    <div 
                      key={ep.id}
                      onClick={() => onSelectEpisode && onSelectEpisode(ep)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #f1f5f9',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <img 
                          src={ep.artwork} 
                          alt={ep.title} 
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            backgroundColor: '#f1ecfe',
                            objectFit: 'contain'
                          }} 
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#080e34',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {ep.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {ep.subtitle || ep.duration}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentEpisode && currentEpisode.id === ep.id) {
                              togglePlayPause();
                            } else {
                              playEpisode(ep);
                            }
                          }}
                          aria-label={isPlaying(ep.id) ? "Pause" : "Play"}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0b1333',
                            cursor: 'pointer'
                          }}
                        >
                          {isPlaying(ep.id) ? (
                            <Pause size={14} fill="#0b1333" />
                          ) : (
                            <Play size={14} fill="#0b1333" style={{ marginLeft: '1px' }} />
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(ep.id);
                          }}
                          aria-label="Remove from saved"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'none',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved News */}
            {savedNews.length > 0 && (
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#7062C6',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Newspaper size={13} />
                  <span>Articles & Stories ({savedNews.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {savedNews.map(story => (
                    <div 
                      key={story.id}
                      onClick={() => onSelectNews && onSelectNews(story)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #f1f5f9',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          backgroundColor: story.bgTint || '#ede8fc',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img 
                            src={story.artwork} 
                            alt={story.headline} 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }} 
                          />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#080e34',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {story.headline}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {story.source || 'Munshiji'} · {story.readTime}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(`news-${story.id}`);
                        }}
                        aria-label="Remove news from saved"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
