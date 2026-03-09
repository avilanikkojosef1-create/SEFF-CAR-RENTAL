import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIChat } from './components/AIChat';
import { Home } from './pages/Home';
import { Fleet } from './pages/Fleet';
import { Booking } from './pages/Booking';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { FAQ } from './pages/FAQ';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminResetPassword } from './pages/AdminResetPassword';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Hide Navbar on Admin pages if preferred, but keeping simple for now. 
            Ideally, check location and hide Nav/Footer for admin. */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />

            <Route path="/requirements" element={
              <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Rental Requirements</h1>
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl text-left">
                  <ul className="list-disc space-y-3 text-slate-700 pl-5">
                    <li>Valid Driver's License</li>
                    <li>Government-issued ID for Deposit</li>
                    <li>Reservation fee of ₱500 (Non-refundable)</li>
                  </ul>
                </div>
              </div>
            } />
            <Route path="/about" element={
               <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                  <h1 className="text-4xl font-bold text-slate-900 mb-4">About Seff Car Rental</h1>
                  <p className="max-w-2xl text-slate-600">The premier car rental service in Tacloban City, dedicated to providing safe, reliable, and affordable vehicles for all your travel needs in Leyte and Samar.</p>
               </div>
            } />
            <Route path="/contact" element={
              <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <p className="text-xl font-bold text-orange-600 mb-2">0921 421 4729</p>
                  <p className="text-slate-600">seff.carrental31@gmail.com</p>
                  <p className="text-slate-500 mt-4 text-sm">Brgy. 74 Lower Nula Tula Ricsol Compound,<br/>Tacloban City</p>
                </div>
              </div>
            } />
             {/* Backward compatibility route */}
            <Route path="/locations" element={<div className="h-96 flex items-center justify-center text-2xl text-slate-400">See Contact Page for Location</div>} />
          </Routes>
        </main>
        
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
        <AIChat />
      </div>
    </Router>
  );
};

export default App;