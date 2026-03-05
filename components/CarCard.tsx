import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from '../types';
import { Fuel, Settings, Users, Check } from 'lucide-react';

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-2xl hover:shadow-orange-900/10 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-slate-200">
        <img 
          src={car.imageUrl} 
          alt={car.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback image if the user's custom link is broken
            e.currentTarget.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800';
          }}
        />
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-orange-500 border border-orange-500/20">
          {car.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{car.name}</h3>
          <div className="text-right flex flex-col items-end">
            <div>
                <span className="text-xl font-bold text-orange-600">₱{car.pricePerDay.toLocaleString()}</span>
                <span className="text-sm text-slate-500">/day</span>
            </div>
            {car.carWashFee && (
                <span className="text-xs text-slate-400 font-medium">+ ₱{car.carWashFee} Car Wash</span>
            )}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-4 gap-2 py-4 border-b border-slate-100 mb-4">
          <div className="flex flex-col items-center text-center">
            <Settings size={18} className="text-slate-400 mb-1 group-hover:text-orange-500 transition-colors" />
            <span className="text-xs text-slate-600">{car.transmission}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Fuel size={18} className="text-slate-400 mb-1 group-hover:text-orange-500 transition-colors" />
            <span className="text-xs text-slate-600">{car.fuelType}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users size={18} className="text-slate-400 mb-1 group-hover:text-orange-500 transition-colors" />
            <span className="text-xs text-slate-600">{car.seats} Seats</span>
          </div>
          {car.engineSize && (
            <div className="flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-1 group-hover:text-orange-500 transition-colors lucide lucide-gauge"><path d="m12 14 4-4"/><path d="M3.34 16.998A10 10 0 1 1 20.66 17"/><path d="M8.5 8.5l7 7"/></svg>
              <span className="text-xs text-slate-600">{car.engineSize}</span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex-1">
            <ul className="space-y-1 mb-4">
            {car.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-center text-sm text-slate-500">
                <Check size={14} className="text-orange-500 mr-2 flex-shrink-0" />
                <span className="truncate">{feature}</span>
                </li>
            ))}
            </ul>
        </div>

        {/* Action Button */}
        <Link to="/booking" state={{ car }} className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors mt-auto border border-black hover:border-orange-600 text-center block">
          Book Now
        </Link>
      </div>
    </div>
  );
};
