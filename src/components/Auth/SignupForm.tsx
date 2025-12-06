import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export default function SignupForm({ onSwitchToLogin, onSuccess }: SignupFormProps) {
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    
    setIsLoading(true);

    const result = await signup(username, email, password);
    
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Account created successfully!');
      onSuccess();
    } else {
      toast.error(result.error || 'Signup failed');
    }
  };

  return (
    <Card variant="neon" className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-glow">Create Account</CardTitle>
        <CardDescription>Join the leaderboard and compete</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="NeonViper"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="player@snake.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" variant="neon" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Create Account
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
