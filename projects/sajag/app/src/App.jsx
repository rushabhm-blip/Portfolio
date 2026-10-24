import React, { useState, useEffect } from 'react';
import SplashScreen from './components/screens/SplashScreen';
import WelcomeScreen from './components/screens/WelcomeScreen';
import HomeScreen from './components/screens/HomeScreen';
import SafetyScreen from './components/screens/SafetyScreen';
import ParkingScreen from './components/screens/ParkingScreen';
import ExploreScreen from './components/screens/ExploreScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import CityMakersScreen from './components/screens/CityMakersScreen';
import EmergencyHelpScreen from './components/screens/safety/EmergencyHelpScreen';
import NammaKannadaScreen from './components/screens/NammaKannadaScreen';
import BottomNav from './components/common/BottomNav';
import VoiceAssistantModal from './components/common/VoiceAssistantModal';
import PendingSnapshotPromptModal from './components/common/PendingSnapshotPromptModal';
import { 
  getPendingSnapshot, 
  clearPendingSnapshot, 
  setupHardwareRhythmListener 
} from './services/safetySnapshotService';
import { Mic, Sparkles } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [showSplash, setShowSplash] = useState(true);
  const [activeNavTab, setActiveNavTab] = useState('Home');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceRouteQuery, setVoiceRouteQuery] = useState(null);
  const [activePromptSnapshot, setActivePromptSnapshot] = useState(null);

  const handleSplashFinish = () => {
    setShowSplash(false);
    setCurrentScreen('welcome');
  };

  // Setup hardware rhythm listener (power button 2+2 pattern) & check for existing snapshot on app open
  useEffect(() => {
    // Check if user previously captured a snapshot while traveling
    const existing = getPendingSnapshot();
    if (existing) {
      setActivePromptSnapshot(existing);
    }

    // Listen for hardware power button rhythm: press-press, [pause], press-press
    const cleanup = setupHardwareRhythmListener((newSnapshot) => {
      setActivePromptSnapshot(newSnapshot);
    });

    const handleSnapshotEvent = (e) => {
      if (e.detail) {
        setActivePromptSnapshot(e.detail);
      }
    };
    window.addEventListener('sajag-safety-snapshot-updated', handleSnapshotEvent);

    return () => {
      cleanup();
      window.removeEventListener('sajag-safety-snapshot-updated', handleSnapshotEvent);
    };
  }, []);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
    if (screen === 'home') setActiveNavTab('Home');
    else if (screen === 'explore') setActiveNavTab('Explore');
    else if (screen === 'safety') setActiveNavTab('Explore');
    else if (screen === 'parking') setActiveNavTab('Explore');
    else if (screen === 'citymakers') setActiveNavTab('Report');
    else if (screen === 'profile') setActiveNavTab('Profile');
  };

  const handleApplyVoiceRoute = (parsed) => {
    if (parsed.type === 'navigate_route') {
      setVoiceRouteQuery({
        origin: parsed.origin,
        originCoords: parsed.originCoords,
        destination: parsed.destination,
        destinationCoords: parsed.destinationCoords
      });
      handleNavigate('explore');
    }
  };

  const isSplashActive = showSplash || currentScreen === 'splash';

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0B0F19] flex justify-center items-center overflow-hidden select-none no-scrollbar p-0 sm:py-6 sm:px-4">
      {/* PHONE DEVICE CONTAINER */}
      <div 
        className="w-full h-full max-w-[412px] relative overflow-hidden bg-white sm:rounded-[40px] sm:border-[8px] sm:border-[#1E293B] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col justify-between"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* MAIN VIEWPORT AREA */}
        <div className="flex-1 w-full h-full overflow-hidden relative flex flex-col">
          {currentScreen === 'welcome' && (
            <WelcomeScreen 
              onGetStarted={() => {
                try {
                  localStorage.setItem('sajag_onboarding_completed', 'true');
                } catch (e) {}
                handleNavigate('home');
              }}
              onLogin={() => {
                try {
                  localStorage.setItem('sajag_onboarding_completed', 'true');
                } catch (e) {}
                handleNavigate('profile');
              }}
            />
          )}

          {currentScreen === 'home' && (
            <HomeScreen onNavigate={handleNavigate} onOpenVoice={() => setIsVoiceOpen(true)} />
          )}

          {currentScreen === 'explore' && (
            <ExploreScreen 
              onNavigate={handleNavigate} 
              initialRouteQuery={voiceRouteQuery}
              onOpenVoice={() => setIsVoiceOpen(true)}
            />
          )}

          {currentScreen === 'safety' && (
            <SafetyScreen 
              onNavigate={handleNavigate}
              activeTab={activeNavTab}
              setActiveTab={setActiveNavTab}
            />
          )}

          {currentScreen === 'parking' && (
            <ParkingScreen onNavigate={handleNavigate} />
          )}

          {currentScreen === 'citymakers' && (
            <CityMakersScreen onNavigate={handleNavigate} />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen onNavigate={handleNavigate} />
          )}

          {currentScreen === 'emergency' && (
            <EmergencyHelpScreen 
              onClose={() => handleNavigate('safety')}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'nammakannada' && (
            <NammaKannadaScreen 
              onNavigate={handleNavigate} 
            />
          )}
        </div>

        {/* GLOBAL PERSISTENT BOTTOM NAVIGATION - Only appears after splash & welcome screens */}
        {!isSplashActive && currentScreen !== 'welcome' && currentScreen !== 'emergency' && currentScreen !== 'nammakannada' && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
            <BottomNav 
              activeTab={activeNavTab} 
              onNavigate={handleNavigate} 
            />
          </div>
        )}

        {/* ONE-TIME ANIMATED SPLASH SCREEN OVERLAY - Occupies whole screen */}
        {isSplashActive && (
          <SplashScreen 
            onFinish={() => {
              handleSplashFinish();
            }} 
          />
        )}

        {/* VOICE ASSISTANT MODAL */}
        <VoiceAssistantModal 
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onApplyVoiceRoute={handleApplyVoiceRoute}
          onNavigate={handleNavigate}
        />

        {/* PENDING SNAPSHOT NOTIFICATION PROMPT MODAL */}
        {activePromptSnapshot && currentScreen !== 'emergency' && (
          <PendingSnapshotPromptModal 
            snapshot={activePromptSnapshot}
            onReportNow={() => {
              setActivePromptSnapshot(null);
              handleNavigate('safety');
            }}
            onDismiss={() => {
              setActivePromptSnapshot(null);
            }}
            onDiscard={() => {
              clearPendingSnapshot();
              setActivePromptSnapshot(null);
            }}
          />
        )}

      </div>
    </div>
  );
}
