import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export const AdminResetPassword: React.FC = () => {
  const [step, setStep] = useState<'verify' | 'reset' | 'success'>('verify');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const storedCode = localStorage.getItem('adminResetCode');
    const enteredCode = code.trim();
    
    console.log('Verification attempt:', { entered: enteredCode, stored: storedCode });

    if (storedCode && enteredCode === storedCode.trim()) {
      setStep('reset');
      setError('');
    } else if (!storedCode) {
      setError('No active reset request found. Please try locking the account again.');
    } else {
      setError('Invalid verification code. Please check your email and try again.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('adminCustomPassword', newPassword);
      localStorage.removeItem('adminResetCode');
      localStorage.removeItem('adminLockedUntil');
      setStep('success');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
            <div className="bg-orange-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-600/20">
                <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Password Reset</h1>
            <p className="text-slate-500 text-sm">Verify your identity to regain access</p>
        </div>

        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center text-2xl tracking-widest font-bold"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-xs text-slate-400 mt-2 text-center">
                Enter the 6-digit code sent to seff.carrental31@gmail.com. 
                <br/>
                <span className="text-orange-500 font-medium">Make sure to use the most recent code received.</span>
              </p>
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-lg">
              Verify Code
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="Min. 6 characters"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="Repeat new password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 className="animate-spin" size={20} /> Updating...</> : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="text-green-500" size={64} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Success!</h2>
              <p className="text-slate-500">Your password has been reset successfully. You can now log in with your new password.</p>
            </div>
            <button 
              onClick={() => navigate('/admin')}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-lg"
            >
              Go to Login
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
            <button onClick={() => navigate('/admin')} className="text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 mx-auto">
                <ArrowLeft size={14} /> Back to Login
            </button>
        </div>
      </div>
    </div>
  );
};