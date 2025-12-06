import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup'>(defaultView);

  const handleSuccess = () => {
    onClose();
    setView('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{view === 'login' ? 'Login' : 'Sign Up'}</DialogTitle>
        </VisuallyHidden>
        {view === 'login' ? (
          <LoginForm
            onSwitchToSignup={() => setView('signup')}
            onSuccess={handleSuccess}
          />
        ) : (
          <SignupForm
            onSwitchToLogin={() => setView('login')}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
