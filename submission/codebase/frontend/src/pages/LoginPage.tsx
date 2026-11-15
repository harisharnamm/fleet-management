import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Shield, UserCheck, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export function LoginPage() {
  const [email, setEmail] = useState('admin@fleetms.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-500/30">
            <Truck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">FleetFlow Management</h1>
          <p className="text-sm text-slate-400">Staff Graded Assignment 2 — Secure Enterprise Gateway</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 bg-slate-950 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-lg">Sign In to Fleet Portal</CardTitle>
            <CardDescription className="text-slate-400">
              Requests route through API Gateway (Port 4000) with API Key verification
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  {error}
                </Alert>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@fleetms.com"
                  required
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Quick Fill Demo Roles */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Fill Demo Credentials
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('admin@fleetms.com')}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-blue-400 mb-1" />
                    <span className="font-medium">Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('manager@fleetms.com')}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
                  >
                    <UserCheck className="h-4 w-4 text-emerald-400 mb-1" />
                    <span className="font-medium">Manager</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('viewer@fleetms.com')}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
                  >
                    <Eye className="h-4 w-4 text-amber-400 mb-1" />
                    <span className="font-medium">Viewer</span>
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In via Gateway'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
