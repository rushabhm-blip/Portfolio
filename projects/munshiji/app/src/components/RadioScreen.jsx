import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Bookmark, 
  Headphones, 
  Newspaper, 
  Play, 
  Pause, 
  ChevronRight, 
  Loader2, 
  Clock,
  Globe,
  ChevronDown,
  SlidersHorizontal,
  X,
  Check
} from 'lucide-react';
import { 
  useAudio, 
  EPISODES_DATA, 
  NEWS_DATA, 
  NEWS_FEATURED_DATA 
} from '../context/AudioContext';
import EpisodeDetailsSheet from './EpisodeDetailsSheet';
import NewsArticleSheet from './NewsArticleSheet';
import RadioSearchSheet from './RadioSearchSheet';
import RadioSavedSheet from './RadioSavedSheet';
import RadioViewAllSheet from './RadioViewAllSheet';
import MiniPlayer from './MiniPlayer';
import FullPlayerModal from './FullPlayerModal';

export default function RadioScreen({ onBack, onNavigateTab }) {
  const [activeTab, setActiveTab] = useState('listen'); // 'listen' | 'news'
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  
  // News filters: strictly inside the News tab
  const [selectedLocation, setSelectedLocation] = useState('India');
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Scroll position preservation between Listen and News tabs
  const listenScrollRef = useRef(0);
  const newsScrollRef = useRef(0);
  const scrollContainerRef = useRef(null);

  const { 
    currentEpisode, 
    playbackState, 
    playEpisode, 
    togglePlayPause, 
    isMiniPlayerVisible, 
    isSaved, 
    toggleSave 
  } = useAudio();

  // Handle switching tabs while preserving scroll position
  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    if (scrollContainerRef.current) {
      if (activeTab === 'listen') {
        listenScrollRef.current = scrollContainerRef.current.scrollTop;
      } else {
        newsScrollRef.current = scrollContainerRef.current.scrollTop;
      }
    }
    setActiveTab(tab);
  };

  // Restore scroll on tab switch
  useEffect(() => {
    if (scrollContainerRef.current) {
      const targetScroll = activeTab === 'listen' ? listenScrollRef.current : newsScrollRef.current;
      scrollContainerRef.current.scrollTop = targetScroll;
    }
  }, [activeTab]);

  // Listen content items
  const featuredEpisode = EPISODES_DATA.find(ep => ep.isFeatured) || EPISODES_DATA[0];
  const latestEpisodes = EPISODES_DATA.filter(ep => !ep.isFeatured).slice(0, 3);

  // Check if a specific episode is currently playing
  const isEpPlaying = (epId) => currentEpisode && currentEpisode.id === epId && playbackState === 'playing';
  const isEpLoading = (epId) => currentEpisode && currentEpisode.id === epId && playbackState === 'loading';

  // Filtered news items based on location and topic filters
  const filteredStories = NEWS_DATA.filter(item => {
    const locMatch = selectedLocation === 'All' || 
                     (selectedLocation === 'India' && item.scope === 'India') ||
                     (selectedLocation === 'World' && item.scope === 'World') ||
                     item.scope === selectedLocation;
    const topicMatch = selectedTopic === 'All' || item.topic === selectedTopic;
    return locMatch && topicMatch;
  });

  return (
    <div 
      className="munshiji-radio-screen"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* HEADER: Back arrow, "Radio", Search & Saved icons */}
      <header 
        className="radio-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px 8px 16px',
          backgroundColor: '#ffffff',
          zIndex: 10,
          borderBottom: '1px solid rgba(241, 245, 249, 0.8)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onBack}
            aria-label="Back to previous screen"
            className="radio-icon-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#080e34',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              minWidth: '48px',
              minHeight: '48px'
            }}
          >
            <ArrowLeft size={24} strokeWidth={2.6} />
          </button>
          
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#080e34',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Radio
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search radio episodes and news"
            className="radio-icon-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#080e34',
              cursor: 'pointer',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              minWidth: '48px',
              minHeight: '48px'
            }}
          >
            <Search size={22} strokeWidth={2.2} />
          </button>

          <button
            onClick={() => setIsSavedOpen(true)}
            aria-label="Saved episodes and news"
            className="radio-icon-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#080e34',
              cursor: 'pointer',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              minWidth: '48px',
              minHeight: '48px'
            }}
          >
            <Bookmark size={22} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* SLIM TABS: Listen / News with purple underline */}
      <div 
        className="radio-tabs-bar"
        style={{
          display: 'flex',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
          padding: '0 20px',
          position: 'relative',
          zIndex: 9
        }}
      >
        <button
          onClick={() => handleTabSwitch('listen')}
          aria-label="Listen tab"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 0 14px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            color: activeTab === 'listen' ? '#7062C6' : '#64748b',
            fontSize: '15px',
            fontWeight: activeTab === 'listen' ? 700 : 500,
            transition: 'color 0.2s ease',
            minHeight: '48px'
          }}
        >
          <Headphones size={18} strokeWidth={activeTab === 'listen' ? 2.4 : 1.8} />
          <span>Listen</span>
          {activeTab === 'listen' && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '18%',
              right: '18%',
              height: '3px',
              backgroundColor: '#7F5EF4',
              borderRadius: '999px 999px 0 0'
            }} />
          )}
        </button>

        <button
          onClick={() => handleTabSwitch('news')}
          aria-label="News tab"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 0 14px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            color: activeTab === 'news' ? '#7062C6' : '#64748b',
            fontSize: '15px',
            fontWeight: activeTab === 'news' ? 700 : 500,
            transition: 'color 0.2s ease',
            minHeight: '48px'
          }}
        >
          <Newspaper size={18} strokeWidth={activeTab === 'news' ? 2.4 : 1.8} />
          <span>News</span>
          {activeTab === 'news' && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '18%',
              right: '18%',
              height: '3px',
              backgroundColor: '#7F5EF4',
              borderRadius: '999px 999px 0 0'
            }} />
          )}
        </button>
      </div>

      {/* SCROLLABLE CONTENT CONTAINER */}
      <div 
        ref={scrollContainerRef}
        className="radio-scroll-viewport"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          paddingBottom: isMiniPlayerVisible ? '130px' : '70px', // Extra space so mini player never covers content
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {activeTab === 'listen' ? (
          <>
            {/* FEATURED EPISODE CARD (Uncluttered, lavender, separate columns) */}
            <section 
              className="featured-episode-card"
              style={{
                backgroundColor: '#F1ECFE',
                borderRadius: '24px',
                padding: '22px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                marginBottom: '28px',
                boxShadow: '0 4px 20px -2px rgba(124, 58, 237, 0.08)',
                overflow: 'hidden'
              }}
            >
              {/* Left Column: Metadata & Play episode button */}
              <div 
                className="featured-card-content"
                style={{
                  flex: '1 1 60%',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  zIndex: 2,
                  paddingRight: '6px'
                }}
              >
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#7C3AED'
                }}>
                  {featuredEpisode.categoryLabel || 'FEATURED EPISODE'}
                </div>

                <h2 
                  onClick={() => setSelectedEpisode(featuredEpisode)}
                  style={{
                    fontSize: '21px',
                    fontWeight: 800,
                    color: '#050C33',
                    lineHeight: 1.18,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    cursor: 'pointer'
                  }}
                >
                  Why do everyday<br />prices rise?
                </h2>

                <p 
                  onClick={() => setSelectedEpisode(featuredEpisode)}
                  style={{
                    fontSize: '14px',
                    color: '#475569',
                    margin: 0,
                    lineHeight: 1.35,
                    cursor: 'pointer'
                  }}
                >
                  {featuredEpisode.subtitle}
                </p>

                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#64748B',
                  marginTop: '2px',
                  marginBottom: '6px'
                }}>
                  {featuredEpisode.duration}
                </div>

                {/* Primary Play Episode Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentEpisode && currentEpisode.id === featuredEpisode.id) {
                      togglePlayPause();
                    } else {
                      playEpisode(featuredEpisode);
                    }
                  }}
                  aria-label={isEpPlaying(featuredEpisode.id) ? "Pause featured episode" : "Play featured episode"}
                  className="btn-play-featured"
                  style={{
                    backgroundColor: '#131F3B',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    width: 'fit-content',
                    boxShadow: '0 4px 12px rgba(19, 31, 59, 0.25)',
                    transition: 'transform 0.15s ease',
                    minHeight: '44px'
                  }}
                >
                  {isEpLoading(featuredEpisode.id) ? (
                    <Loader2 size={16} className="animate-spin" color="#ffffff" />
                  ) : isEpPlaying(featuredEpisode.id) ? (
                    <>
                      <Pause size={15} fill="#ffffff" color="#ffffff" />
                      <span>Pause episode</span>
                    </>
                  ) : (
                    <>
                      <Play size={15} fill="#ffffff" color="#ffffff" style={{ marginLeft: '1px' }} />
                      <span>Play episode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Clay Radio Artwork in separate column */}
              <div 
                className="featured-card-artwork"
                onClick={() => setSelectedEpisode(featuredEpisode)}
                style={{
                  flex: '0 0 42%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1,
                  paddingLeft: '4px'
                }}
              >
                <img 
                  src={featuredEpisode.artwork} 
                  alt="Munshiji Clay Radio"
                  style={{
                    width: '100%',
                    maxWidth: '155px',
                    height: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 18px rgba(124, 58, 237, 0.18))'
                  }}
                />
              </div>
            </section>

            {/* LATEST EPISODES SECTION */}
            <section className="latest-episodes-section">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#080e34',
                  letterSpacing: '-0.01em',
                  margin: 0
                }}>
                  Latest episodes
                </h3>

                <button
                  onClick={() => setIsViewAllOpen(true)}
                  aria-label="View all episodes"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                    padding: '8px 0',
                    minHeight: '48px'
                  }}
                >
                  <span>View all</span>
                  <ChevronRight size={16} strokeWidth={2.4} />
                </button>
              </div>

              {/* THREE CLEAN ROWS WITH THIN SEPARATORS */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {latestEpisodes.map((episode, index) => {
                  const playing = isEpPlaying(episode.id);
                  const loading = isEpLoading(episode.id);

                  return (
                    <React.Fragment key={episode.id}>
                      <div 
                        className="episode-row-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 0',
                          gap: '14px'
                        }}
                      >
                        {/* Thumbnail + Details */}
                        <div 
                          onClick={() => setSelectedEpisode(episode)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            flex: 1,
                            minWidth: 0,
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            flexShrink: 0,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: index === 0 ? '#FEF3C7' : index === 1 ? '#EDE9FE' : '#F3E8FF',
                            padding: '4px',
                            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.03)'
                          }}>
                            <img 
                              src={episode.artwork} 
                              alt={episode.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          </div>

                          <div style={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px'
                          }}>
                            <div style={{
                              fontSize: '15px',
                              fontWeight: 700,
                              color: '#080e34',
                              lineHeight: 1.25,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {episode.title}
                            </div>
                            <div style={{
                              fontSize: '13px',
                              color: '#64748b',
                              fontWeight: 500
                            }}>
                              {episode.subtitle}
                            </div>
                          </div>
                        </div>

                        {/* Fixed-width circular play button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentEpisode && currentEpisode.id === episode.id) {
                              togglePlayPause();
                            } else {
                              playEpisode(episode);
                            }
                          }}
                          aria-label={playing ? `Pause ${episode.title}` : `Play ${episode.title}`}
                          className="btn-play-circle"
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#080e34',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
                            transition: 'all 0.15s ease',
                            minWidth: '44px',
                            minHeight: '44px'
                          }}
                        >
                          {loading ? (
                            <Loader2 size={16} className="animate-spin" color="#080e34" />
                          ) : playing ? (
                            <Pause size={16} fill="#080e34" color="#080e34" />
                          ) : (
                            <Play size={16} fill="#080e34" color="#080e34" style={{ marginLeft: '2px' }} />
                          )}
                        </button>
                      </div>

                      {index < latestEpisodes.length - 1 && (
                        <div style={{
                          height: '1px',
                          backgroundColor: '#f1f5f9',
                          width: '100%'
                        }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          /* ========================================================
             NEWS TAB: EXACT MATCH TO REFERENCE SCREENSHOT
             - Location Pill (India ⌵) + Filter Pill
             - Featured Clay News Card (Why prices rise)
             - "More stories" heading
             - 3 Story Rows with soft-tint 3D clay icons
             ======================================================== */
          <section className="radio-news-view">
            {/* TOP CONTROLS: Location Dropdown Pill + Filter Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px'
            }}>
              {/* Location Selector (India ⌵) */}
              <button
                onClick={() => setIsLocationPickerOpen(true)}
                aria-label={`Current location filter: ${selectedLocation}. Click to change`}
                style={{
                  backgroundColor: '#EDE9FE',
                  color: '#7062C6',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '7px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  minHeight: '38px'
                }}
              >
                <Globe size={15} color="#7062C6" />
                <span>{selectedLocation}</span>
                <ChevronDown size={14} color="#7062C6" />
              </button>

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                aria-label="Filter news topics and categories"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#080E34',
                  border: '1px solid #E2E8F0',
                  borderRadius: '999px',
                  padding: '7px 15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  transition: 'border-color 0.15s ease',
                  minHeight: '38px'
                }}
              >
                <SlidersHorizontal size={14} color="#080E34" />
                <span>Filter{selectedTopic !== 'All' ? ` · ${selectedTopic}` : ''}</span>
              </button>
            </div>

            {/* FEATURED STORY CARD: Folded 3D Newspaper, Globe, Gold Coins */}
            <article 
              className="featured-news-card"
              onClick={() => setSelectedArticle(NEWS_FEATURED_DATA)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                overflow: 'hidden',
                boxShadow: '0 4px 20px -2px rgba(124, 58, 237, 0.06)',
                cursor: 'pointer',
                marginBottom: '26px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              {/* Top Banner: Soft Lavender 3D Clay Illustration */}
              <div style={{
                width: '100%',
                height: '175px',
                backgroundColor: '#EDE8FC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                padding: '10px 16px'
              }}>
                <img 
                  src={NEWS_FEATURED_DATA.artwork} 
                  alt={NEWS_FEATURED_DATA.headline}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Card Meta & Headline */}
              <div style={{
                padding: '16px 20px 18px 20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#7C3AED'
                  }}>
                    {NEWS_FEATURED_DATA.category}
                  </span>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(`news-${NEWS_FEATURED_DATA.id}`);
                    }}
                    aria-label={isSaved(`news-${NEWS_FEATURED_DATA.id}`) ? "Remove bookmark" : "Bookmark this story"}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isSaved(`news-${NEWS_FEATURED_DATA.id}`) ? '#7C3AED' : '#080E34',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bookmark 
                      size={20} 
                      fill={isSaved(`news-${NEWS_FEATURED_DATA.id}`) ? '#7C3AED' : 'none'} 
                      strokeWidth={2}
                    />
                  </button>
                </div>

                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#080E34',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.22,
                  margin: '0 0 6px 0'
                }}>
                  {NEWS_FEATURED_DATA.headline}
                </h2>

                <div style={{
                  fontSize: '14px',
                  color: '#64748B',
                  fontWeight: 500
                }}>
                  {NEWS_FEATURED_DATA.subtitle}
                </div>
              </div>
            </article>

            {/* "MORE STORIES" SECTION */}
            <section className="news-stories-section">
              <h3 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#080E34',
                letterSpacing: '-0.01em',
                margin: '0 0 14px 0'
              }}>
                More stories
              </h3>

              {/* THREE CLEAN STORY ROWS WITH THIN SEPARATORS */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredStories.map((story, index) => {
                  return (
                    <React.Fragment key={story.id}>
                      <div 
                        className="news-story-row"
                        onClick={() => setSelectedArticle(story)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 0',
                          gap: '16px',
                          cursor: 'pointer'
                        }}
                      >
                        {/* Left: Headline & Read Time */}
                        <div style={{
                          flex: 1,
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#080E34',
                            lineHeight: 1.28
                          }}>
                            {story.headline}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#64748B',
                            fontWeight: 500
                          }}>
                            {story.readTime}
                          </div>
                        </div>

                        {/* Right: Soft clay artwork in tinted rounded square */}
                        <div style={{
                          width: '66px',
                          height: '66px',
                          borderRadius: '16px',
                          backgroundColor: story.bgTint || '#F8FAFC',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.03)'
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
                      </div>

                      {/* Thin Separator */}
                      {index < filteredStories.length - 1 && (
                        <div style={{
                          height: '1px',
                          backgroundColor: '#F1F5F9',
                          width: '100%'
                        }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          </section>
        )}
      </div>

      {/* OVERLAYS & MODAL SHEETS */}
      {selectedEpisode && (
        <EpisodeDetailsSheet 
          episode={selectedEpisode}
          onClose={() => setSelectedEpisode(null)}
        />
      )}

      {selectedArticle && (
        <NewsArticleSheet 
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {/* LOCATION PICKER MODAL (India ⌵) */}
      {isLocationPickerOpen && (
        <div 
          className="radio-modal-overlay"
          onClick={() => setIsLocationPickerOpen(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 20px 32px 20px',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
              animation: 'slideUpSheet 0.25s ease-out'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#080E34', margin: 0 }}>
                Select Region
              </h4>
              <button 
                onClick={() => setIsLocationPickerOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['India', 'World', 'All', 'State (Maharashtra)', 'State (Delhi NCR)', 'State (Karnataka)'].map((loc) => {
                const isSelected = selectedLocation === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsLocationPickerOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid #7C3AED' : '1px solid #F1F5F9',
                      backgroundColor: isSelected ? '#FAF5FF' : '#ffffff',
                      color: isSelected ? '#7C3AED' : '#080E34',
                      fontSize: '14px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{loc}</span>
                    {isSelected && <Check size={18} color="#7C3AED" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FILTER TOPICS MODAL (Filter Button) */}
      {isFilterOpen && (
        <div 
          className="radio-modal-overlay"
          onClick={() => setIsFilterOpen(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 20px 32px 20px',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
              animation: 'slideUpSheet 0.25s ease-out'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#080E34', margin: 0 }}>
                Filter News Topics
              </h4>
              <button 
                onClick={() => setIsFilterOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {['All', 'Economy', 'Markets', 'Policy', 'Commodities'].map((topic) => {
                const isSelected = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '999px',
                      border: isSelected ? '1px solid #7C3AED' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#7C3AED' : '#F8FAFC',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsFilterOpen(false)}
              style={{
                width: '100%',
                backgroundColor: '#080E34',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {/* SEARCH SHEET */}
      {isSearchOpen && (
        <RadioSearchSheet 
          onClose={() => setIsSearchOpen(false)}
          onSelectEpisode={(ep) => {
            setIsSearchOpen(false);
            setSelectedEpisode(ep);
          }}
          onSelectNews={(article) => {
            setIsSearchOpen(false);
            setSelectedArticle(article);
          }}
        />
      )}

      {/* SAVED SHEET */}
      {isSavedOpen && (
        <RadioSavedSheet 
          onClose={() => setIsSavedOpen(false)}
          onSelectEpisode={(ep) => {
            setIsSavedOpen(false);
            setSelectedEpisode(ep);
          }}
          onSelectNews={(article) => {
            setIsSavedOpen(false);
            setSelectedArticle(article);
          }}
        />
      )}

      {/* VIEW ALL EPISODES SHEET */}
      {isViewAllOpen && (
        <RadioViewAllSheet 
          onClose={() => setIsViewAllOpen(false)}
          onSelectEpisode={(ep) => {
            setIsViewAllOpen(false);
            setSelectedEpisode(ep);
          }}
        />
      )}

      {/* SHARED MINI-PLAYER (Appears above bottom navigation when playback starts) */}
      <MiniPlayer />

      {/* FULL AUDIO PLAYER MODAL */}
      <FullPlayerModal />

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="bottom-nav">
        <div className="bottom-nav-tabs">
          {/* Home */}
          <button 
            className="nav-tab-item"
            onClick={() => {
              if (onNavigateTab) onNavigateTab('home');
              else if (onBack) onBack();
            }}
            aria-label="Navigate to Home"
          >
            <div className="nav-tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="nav-tab-label">Home</span>
          </button>

          {/* Gullak */}
          <button 
            className="nav-tab-item"
            onClick={() => onNavigateTab && onNavigateTab('gullak')}
            aria-label="Navigate to Gullak"
          >
            <div className="nav-tab-icon">
              <div 
                role="img"
                aria-label="Gullak"
                style={{ 
                  width: '23px', 
                  height: '19px', 
                  backgroundColor: '#94a3b8',
                  maskImage: 'url(./assets/exact_elephant_icon_trans.png)',
                  WebkitMaskImage: 'url(./assets/exact_elephant_icon_trans.png)',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center'
                }} 
              />
            </div>
            <span className="nav-tab-label">Gullak</span>
          </button>

          {/* Learn (active state indicated by dark navy / highlight as in reference screenshot) */}
          <button 
            className="nav-tab-item active"
            onClick={() => onNavigateTab && onNavigateTab('learn')}
            aria-label="Navigate to Learn"
          >
            <div className="nav-tab-icon">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <span className="nav-tab-label" style={{ color: '#0f172a', fontWeight: 700 }}>Learn</span>
          </button>

          {/* Portfolio */}
          <button 
            className="nav-tab-item"
            onClick={() => onNavigateTab && onNavigateTab('portfolio')}
            aria-label="Navigate to Portfolio"
          >
            <div className="nav-tab-icon">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="nav-tab-label">Portfolio</span>
          </button>

          {/* More */}
          <button 
            className="nav-tab-item"
            onClick={() => onNavigateTab && onNavigateTab('more')}
            aria-label="Navigate to More"
          >
            <div className="nav-tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </div>
            <span className="nav-tab-label">More</span>
          </button>
        </div>

        {/* iOS Bottom Indicator Bar */}
        <div className="home-indicator-bar"></div>
      </nav>
    </div>
  );
}
