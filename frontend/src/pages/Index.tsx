import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Layout/Header';
import Navigation, { View } from '@/components/Layout/Navigation';
import SnakeGame from '@/components/Game/SnakeGame';
import Leaderboard from '@/components/Leaderboard/Leaderboard';
import WatchMode from '@/components/Watch/WatchMode';
import AuthModal from '@/components/Auth/AuthModal';

function GameApp() {
  const [currentView, setCurrentView] = useState<View>('play');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'play':
        return <SnakeGame />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'watch':
        return <WatchMode />;
      default:
        return <SnakeGame />;
    }
  };

  return (
    <div className="min-h-screen bg-background scanlines">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
      </div>

      <Header onLoginClick={() => setIsAuthModalOpen(true)} />
      
      <main className="container mx-auto px-4 pt-20 pb-8 relative">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        
        <div className="mt-6">
          {renderView()}
        </div>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}

export default function Index() {
  return (
    <AuthProvider>
      <GameApp />
    </AuthProvider>
  );
}
