import React, { useState } from 'react';
import CityMakersDashboard from './citymakers/CityMakersDashboard';
import CityMakersReportForm from './citymakers/CityMakersReportForm';
import CityMakersFeed from './citymakers/CityMakersFeed';
import CityMakersIssueDetails from './citymakers/CityMakersIssueDetails';

export default function CityMakersScreen({ onNavigate }) {
  // Step: 'dashboard' | 'report' | 'feed' | 'details'
  const [step, setStep] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [userStats, setUserStats] = useState({
    reports: 8,
    resolved: 5,
    points: 340
  });

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setStep('report');
  };

  const handleReportClick = () => {
    setSelectedCategory({ id: 'pothole', label: 'Pothole' });
    setStep('report');
  };

  const handleReportSuccess = (newReport) => {
    setUserStats((prev) => ({
      ...prev,
      reports: prev.reports + 1,
      points: prev.points + 10
    }));
    setSelectedIssue(newReport);
    setStep('details');
  };

  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    setStep('details');
  };

  if (step === 'report') {
    return (
      <CityMakersReportForm
        initialCategory={selectedCategory}
        onBack={() => setStep('dashboard')}
        onSubmitSuccess={handleReportSuccess}
      />
    );
  }

  if (step === 'feed') {
    return (
      <CityMakersFeed
        onSelectIssue={handleSelectIssue}
        onBack={() => setStep('dashboard')}
        onNavigate={onNavigate}
      />
    );
  }

  if (step === 'details') {
    return (
      <CityMakersIssueDetails
        issue={selectedIssue}
        onBack={() => setStep('feed')}
        onNavigateToMap={() => onNavigate && onNavigate('safety')}
      />
    );
  }

  // Default: Dashboard (c1)
  return (
    <CityMakersDashboard
      stats={userStats}
      onSelectCategory={handleSelectCategory}
      onReportClick={handleReportClick}
      onViewFeed={() => setStep('feed')}
      onBack={() => onNavigate && onNavigate('home')}
      onNavigate={onNavigate}
    />
  );
}
