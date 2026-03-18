import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, CarFront } from 'lucide-react';
import { APP_NAME } from '../constants';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <Link
      to={to}
      className={`font-medium text-sm uppercase tracking-wide transition-colors ${
        isActive(to) ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-600'
      }`}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-orange-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 flex items-center justify-center">
              {!logoError ? (
                <img 
                  src="/logo.jpeg" 
                  alt="Seff Car Rental Logo" 
                  className="w-full h-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <CarFront className="text-orange-600 group-hover:text-black transition-colors" size={40} />
              )}
            </div>
            <span className="font-bold text-xl tracking-tight">{APP_NAME}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/fleet">Our Fleet</NavLink>
            <NavLink to="/requirements">Requirements</NavLink>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <Link to="/booking" className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-black transition-colors shadow-lg shadow-orange-600/20 text-sm uppercase">
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-900 hover:text-orange-600 p-2"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-orange-100 absolute w-full left-0 shadow-xl z-50">
          <div className="px-6 pt-4 pb-8 space-y-4 flex flex-col">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/fleet">Our Fleet</NavLink>
            <NavLink to="/requirements">Requirements</NavLink>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="w-full bg-orange-600 text-white px-5 py-4 rounded-lg font-bold text-center uppercase tracking-wide hover:bg-black transition-colors">
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};