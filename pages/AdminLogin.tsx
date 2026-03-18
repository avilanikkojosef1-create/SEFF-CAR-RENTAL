import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CarFront, AlertTriangle, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // EmailJS Configuration (matching Booking.tsx)
  const SERVICE_ID = 'service_v7na3aq';
  const TEMPLATE_ID = 'template_iwg5rh6';
  const PUBLIC_KEY = 'fI-S_OmFDBeHwzWkM';

  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const lockedTime = localStorage.getItem('adminLockedUntil');
    if (lockedTime) {
      const now = new Date().getTime();
      if (now < parseInt(lockedTime)) {
        setIsLocked(true);
        setError('Too many failed attempts. Account locked. An email has been sent to the administrator.');
      } else {
        localStorage.removeItem('adminLockedUntil');
      }
    }
  }, []);

  const sendSecurityAlert = async () => {
    setIsLoading(true);
    try {
      // Generate a 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('adminResetCode', verificationCode);

      const templateParams = {
        user_name: 'Security System',
        contact_number: 'N/A',
        facebook_account: 'N/A',
        pickup_location: 'Admin Portal',
        dropoff_location: 'Security Alert',
        duration: 'N/A',
        start_date: new Date().toLocaleString(),
        passengers: '0',
        purpose: 'SECURITY ALERT: 3 FAILED LOGIN ATTEMPTS',
        car_type: 'N/A',
        special_requests: `Action Required: A user has failed to enter the correct access code 3 times. 
        
        Verification Code: ${verificationCode}
        
        To reset the password, go to: ${window.location.origin}/#/admin/reset-password
        
        Please verify and reset the password if necessary. Email: seff.carrental31@gmail.com`,
        drivers_license_url: 'N/A',
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      
      // Lock for 1 hour
      const lockUntil = new Date().getTime() + (60 * 60 * 1000);
      localStorage.setItem('adminLockedUntil', lockUntil.toString());
      setIsLocked(true);
      setError('Too many failed attempts. Account locked. An email has been sent to seff.carrental31@gmail.com with a verification code to reset your password.');
    } catch (err) {
      console.error('Failed to send security alert:', err);
      setError('Too many failed attempts. Account locked. (Failed to send notification email)');
      setIsLocked(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const customPassword = localStorage.getItem('adminCustomPassword');
    const correctPassword = customPassword || 'Nikko010710@';

    // Simple hardcoded password for demonstration
    if (password === correctPassword) { 
      sessionStorage.setItem('isAdmin', 'true');
      setAttempts(0);
      navigate('/admin/dashboard');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        await sendSecurityAlert();
      } else {
        setError(`Invalid Access Code. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg ${isLocked ? 'bg-red-600 shadow-red-600/20' : 'bg-orange-600 shadow-orange-600/20'}`}>
                {!logoError ? (
                  <img 
                    src="/logo.jpeg" 
                    alt="Seff Car Rental Logo" 
                    className="w-16 h-16 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  isLocked ? <AlertTriangle className="text-white" size={40} /> : <CarFront className="text-white" size={40} />
                )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
            <p className="text-slate-500 text-sm">Sign in to manage Seff Car Rental</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Access Code</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLocked || isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50"
                    placeholder="Enter admin password"
                />
            </div>
          </div>
          
          {error && (
            <div className={`p-4 rounded-lg text-sm font-medium text-center space-y-2 ${isLocked ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
              <p>{error}</p>
              {isLocked && (
                <button 
                  type="button"
                  onClick={() => navigate('/admin/reset-password')}
                  className="text-red-700 underline font-bold hover:text-red-800 block mx-auto pt-1"
                >
                  Go to Reset Page
                </button>
              )}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLocked || isLoading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                ← Back to Website
            </button>
        </div>
      </div>
    </div>
  );
};