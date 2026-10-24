import React, { useState } from 'react';
import ProfileWelcomeScreen from './profile/ProfileWelcomeScreen';
import ProfileRegistrationScreen from './profile/ProfileRegistrationScreen';
import ProfileRegisteredView from './profile/ProfileRegisteredView';

export default function ProfileScreen({ onNavigate }) {
  // Profile state initialized with default / saved data
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('sajag_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      fullName: 'Sahaj Sharma',
      email: 'sahaj.sharma@example.com',
      phone: '+91 98765 43210',
      city: 'New Delhi',
      emergencyContact: '+91 91234 56789',
      citizenPoints: 1245,
      walletBalance: 840,
      co2SavedKg: 42.8
    };
  });

  // Step: 'register' | 'registered'
  const [step, setStep] = useState('registered');

  const handleCreateProfileClick = () => {
    setStep('register');
  };

  const handleRegistrationComplete = (data) => {
    try {
      localStorage.setItem('sajag_user_profile', JSON.stringify(data));
      localStorage.setItem('sajag_profile_registered', 'true');
    } catch (e) {}
    setProfileData(data);
    setStep('registered');
  };

  const handleEditProfile = () => {
    setStep('register');
  };

  const handleResetProfile = () => {
    setStep('register');
  };

  if (step === 'welcome') {
    return (
      <ProfileWelcomeScreen
        onCreateProfile={handleCreateProfileClick}
        onSkip={() => onNavigate && onNavigate('home')}
        onNavigate={onNavigate}
      />
    );
  }

  if (step === 'register') {
    return (
      <ProfileRegistrationScreen
        initialData={profileData || {}}
        onBack={() => {
          if (profileData) {
            setStep('registered');
          } else if (onNavigate) {
            onNavigate('home');
          }
        }}
        onComplete={handleRegistrationComplete}
      />
    );
  }

  if (step === 'registered') {
    return (
      <ProfileRegisteredView
        profile={profileData}
        onEditProfile={handleEditProfile}
        onResetProfile={handleResetProfile}
        onNavigate={onNavigate}
      />
    );
  }

  return null;
}
