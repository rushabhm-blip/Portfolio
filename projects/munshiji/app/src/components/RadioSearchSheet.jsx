import React, { useState, useMemo } from 'react';
import { Search, X, Play, Pause, FileText, Headphones } from 'lucide-react';
import { useAudio, EPISODES_DATA, NEWS_DATA, NEWS_FEATURED_DATA } from '../context/AudioContext';

export default function RadioSearchSheet({ onClose, onSelectEpisode, onSelectNews }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'episodes' | 'news'
  const { currentEpisode, playbackState, playEpisode, togglePlayPause } = useAudio();

  const allNews = useMemo(() => [NEWS_FEATURED_DATA, ...NEWS_DATA], []);

  const isPlaying = (id) => currentEpisode && currentEpisode.id === id && playbackState === 'playing';

  const filteredEpisodes = useMemo(() => {
    if (!query.trim()) return EPISODES_DATA;
    const q = query.toLowerCase();
    return EPISODES_DATA.filter(ep => 
      ep.title.toLowerCase().includes(q) || 
      (ep.subtitle && ep.subtitle.toLowerCase().includes(q)) ||
      (ep.description && ep.description.toLowerCase().includes(q)) ||
      (ep.category && ep.category.toLowerCase().includes(q))
    );
  }, [query]);

  const filteredNews = useMemo(() => {
    if (!query.trim()) return allNews;
    const q = query.toLowerCase();
    return allNews.filter(n => 
      (n.headline && n.headline.toLowerCase().includes(q)) || 
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.summary && n.summary.toLowerCase().includes(q)) ||
      (n.topic && n.topic.toLowerCase().includes(q)) ||
      (n.scope && n.scope.toLowerCase().includes(q))
    );
  }, [query, allNews]);

  const totalResults = (activeFilter === 'news' ? 0 : filteredEpisodes.length) + 
                       (activeFilter === 'episodes' ? 0 : filteredNews.length);

  return (
    <div 
      className="radio-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search radio episodes and news"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      {/* Top Search Input Bar */}
      <div style={{
        padding: '16px 20px 12px 20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          borderRadius: '14px',
          padding: '10px 14px',
          gap: '10px'
        }}>
          <Search size={18} color="#64748b" />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search episodes, topics, news..."
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              outline: 'none',
              color: '#0f172a'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Cancel search"
          style={{
            background: 'none',
            border: 'none',
            color: '#7c3aed',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          Cancel
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 20px',
        borderBottom: '1px solid #f8fafc'
      }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'episodes', label: `Episodes (${filteredEpisodes.length})` },
          { id: 'news', label: `News (${filteredNews.length})` }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeFilter === filter.id ? '#7c3aed' : '#f1f5f9',
              color: activeFilter === filter.id ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px 80px 20px'
      }}>
        {totalResults === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f1ecfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              color: '#7c3aed'
            }}>
              <Search size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              No results for "{query}"
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '240px', lineHeight: 1.5 }}>
              Try searching for "interest", "inflation", "tax", "budget" or "repo rate".
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Episodes group */}
            {(activeFilter === 'all' || activeFilter === 'episodes') && filteredEpisodes.length > 0 && (
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Headphones size={13} />
                  <span>Episodes ({filteredEpisodes.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredEpisodes.map(ep => (
                    <div 
                      key={ep.id}
                      onClick={() => onSelectEpisode && onSelectEpisode(ep)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #f1f5f9',
                        borderRadius: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <img 
                          src={ep.artwork} 
                          alt={ep.title} 
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
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
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        {isPlaying(ep.id) ? (
                          <Pause size={14} fill="#0b1333" />
                        ) : (
                          <Play size={14} fill="#0b1333" style={{ marginLeft: '1px' }} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* News group */}
            {(activeFilter === 'all' || activeFilter === 'news') && filteredNews.length > 0 && (
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FileText size={13} />
                  <span>News & Briefs ({filteredNews.length})</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredNews.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => onSelectNews && onSelectNews(item)}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #f1f5f9',
                        borderRadius: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#7c3aed',
                        marginBottom: '4px'
                      }}>
                        <span>{item.source}</span>
                        <span>·</span>
                        <span style={{ color: '#94a3b8' }}>{item.timeAgo}</span>
                      </div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#080e34',
                        lineHeight: 1.35,
                        marginBottom: '4px'
                      }}>
                        {item.headline}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                        {item.summary}
                      </div>
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
