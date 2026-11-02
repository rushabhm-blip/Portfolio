import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, Bookmark } from 'lucide-react';
import { useAudio, EPISODES_DATA } from '../context/AudioContext';

export default function RadioViewAllSheet({ onClose, onSelectEpisode }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { currentEpisode, playbackState, playEpisode, togglePlayPause, isSaved, toggleSave } = useAudio();

  const categories = ['All', 'Economics', 'Money basics', 'Public finance', 'Everyday money', 'Wealth building'];

  const filtered = selectedCategory === 'All' 
    ? EPISODES_DATA 
    : EPISODES_DATA.filter(ep => ep.category === selectedCategory);

  const isPlaying = (id) => currentEpisode && currentEpisode.id === id && playbackState === 'playing';

  return (
    <div 
      className="radio-viewall-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="All episodes library"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        zIndex: 48,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Top Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            aria-label="Back to Radio feed"
            style={{
              background: 'none',
              border: 'none',
              color: '#080e34',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#080e34', margin: 0 }}>
            All Episodes
          </h2>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
          {filtered.length} episodes
        </span>
      </div>

      {/* Category Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 20px',
        overflowX: 'auto',
        borderBottom: '1px solid #f8fafc',
        scrollbarWidth: 'none'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              whiteSpace: 'nowrap',
              border: 'none',
              borderRadius: '999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: selectedCategory === cat ? '#0b1333' : '#f1f5f9',
              color: selectedCategory === cat ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Episode List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px 84px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {filtered.map(ep => {
          const saved = isSaved(ep.id);
          return (
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
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <img 
                  src={ep.artwork} 
                  alt={ep.title} 
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: '#f1ecfe',
                    objectFit: 'contain',
                    flexShrink: 0
                  }} 
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#080e34',
                    lineHeight: 1.3,
                    marginBottom: '4px'
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
                    toggleSave(ep.id);
                  }}
                  aria-label={saved ? "Remove bookmark" : "Bookmark episode"}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: saved ? '#7c3aed' : '#cbd5e1',
                    cursor: 'pointer',
                    padding: '6px'
                  }}
                >
                  <Bookmark size={18} fill={saved ? '#7c3aed' : 'none'} />
                </button>

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
                    width: '40px',
                    height: '40px',
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
                    <Pause size={16} fill="#0b1333" />
                  ) : (
                    <Play size={16} fill="#0b1333" style={{ marginLeft: '2px' }} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
