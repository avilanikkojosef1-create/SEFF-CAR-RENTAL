import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CAR_FLEET } from '../constants';
import { CarCard } from '../components/CarCard';
import { ShieldCheck, UserCheck, ArrowRight, Search, ThumbsUp, Wallet, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Car } from '../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState<Car[]>(CAR_FLEET.slice(0, 3));
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [destinationDate, setDestinationDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
       // Fetch top 3 cars
       const { data } = await supabase.from('cars').select('*').limit(3).order('created_at', { ascending: false });
       if (data && data.length > 0) {
          const mappedCars: Car[] = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            pricePerDay: c.price_per_day,
            seats: c.seats,
            transmission: c.transmission,
            fuelType: c.fuel_type,
            imageUrl: c.image_url,
            features: c.features || [],
            carWashFee: c.car_wash_fee
          }));
          setFeaturedCars(mappedCars);
       }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-slate-900">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://lh3.googleusercontent.com/d/16S_vMNfQ9SjeCfrhx8j8G8rfvA2O4JcY" 
            alt="Seff Car Rental Background" 
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          
          {/* Enhanced Dark Overlay for Text Visibility */}
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full pt-16 pb-12">
          
          {/* Booking Widget */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-2xl max-w-5xl mx-auto mb-12 mt-4 text-left animate-fade-in-up relative z-50">
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget);
              const bookingData = {
                pickupLocation: formData.get('pickupLocation'),
                pickupDateTime: pickupDate ? pickupDate.toISOString() : null,
                destinationDateTime: destinationDate ? destinationDate.toISOString() : null
              };
              sessionStorage.setItem('bookingWidgetData', JSON.stringify(bookingData));
              navigate('/fleet'); 
            }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="relative z-40">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pick Up Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input name="pickupLocation" type="text" placeholder="City, Airport, or Address" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-medium" required />
                </div>
              </div>
              <div className="relative z-[60]">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pick-Up Date & Time</label>
                <div className="relative">
                  <DatePicker
                    selected={pickupDate}
                    onChange={(date) => setPickupDate(date)}
                    showTimeSelect
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="MMM d, yyyy h:mm aa"
                    placeholderText="Select Date & Time"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-medium"
                    wrapperClassName="w-full"
                    required
                  />
                </div>
              </div>
              <div className="relative z-50">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Destination Date & Time</label>
                <div className="relative">
                  <DatePicker
                    selected={destinationDate}
                    onChange={(date) => setDestinationDate(date)}
                    showTimeSelect
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="MMM d, yyyy h:mm aa"
                    placeholderText="Select Date & Time"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-medium"
                    wrapperClassName="w-full"
                    required
                  />
                </div>
              </div>
              <div className="relative z-40">
                <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-700 transition-colors uppercase tracking-wide shadow-lg shadow-orange-600/30 h-[50px]">
                  Find a Car
                </button>
              </div>
            </form>
          </div>

          <h2 className="text-orange-500 font-bold tracking-[0.2em] uppercase mb-6 animate-fade-in-up text-sm md:text-base bg-black/80 inline-block px-6 py-2 rounded-full border border-orange-500/50 shadow-lg backdrop-blur-md">
            Seff Car Rental
          </h2>
          
          <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            THE WHEELS THAT <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              TAKE YOU THERE
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-white mb-12 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Affordable rates starting at <span className="text-orange-400 font-bold">₱1,488</span>. <br/> 
            24/7 support, and no hidden fees across Tacloban, Leyte, & Samar.
          </p>
          
          {/* Main CTA Button */}
          <div className="flex justify-center">
            <Link to="/fleet" className="bg-orange-600 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-orange-600 transition-all shadow-[0_0_20px_rgba(234,88,12,0.5)] hover:shadow-[0_0_30px_rgba(234,88,12,0.8)] uppercase tracking-wider flex items-center gap-3 transform hover:-translate-y-1">
              Book Now <ArrowRight size={24} />
            </Link>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-16">Simple steps to get you on the road in minutes.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10"></div>

                {/* Step 1 */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-white border-4 border-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6 shadow-xl">
                        <Search size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">1. Choose Your Car</h3>
                    <p className="text-slate-600 px-8">Browse our fleet of hatchbacks, sedans, SUVs, and vans.</p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-white border-4 border-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6 shadow-xl">
                        <UserCheck size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">2. Book & Confirm</h3>
                    <p className="text-slate-600 px-8">Select your dates and provide your requirements.</p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-white border-4 border-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6 shadow-xl">
                        <ShieldCheck size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">3. Drive Away</h3>
                    <p className="text-slate-600 px-8">Pick up your car or have it delivered to you in Tacloban.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-slate-900 py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 text-slate-300">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-orange-500" size={32} />
                    <span className="font-bold text-lg">Verified Insurance</span>
                </div>
                <div className="flex items-center gap-3">
                    <Wallet className="text-orange-500" size={32} />
                    <span className="font-bold text-lg">Best Price Guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                    <ThumbsUp className="text-orange-500" size={32} />
                    <span className="font-bold text-lg">24/7 Roadside Assistance</span>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Fleet */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-orange-600 font-bold tracking-wide uppercase text-sm">Our Premium Fleet</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">Find the Perfect Ride</h2>
            </div>
            <Link to="/fleet" className="flex items-center text-orange-600 font-bold hover:text-black transition-colors bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md border border-slate-100">
              View All Cars <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-12 text-center">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {name: "Charles Yu", role: "Tourist", quote: "Excellent service! We rented an Innova for our family trip to Samar. The car was clean and the staff was very professional."},
                    {name: "Maria Santos", role: "Business Traveler", quote: "Seff Car Rental is my go-to in Tacloban. The rates are transparent and the Wigo I rented was perfect for city driving."},
                    {name: "David Smith", role: "Adventure Seeker", quote: "Rented a Montero for a week. Handled the roads perfectly. Highly recommend their 24/7 support!"}
                ].map((testimonial, idx) => (
                    <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative">
                        <div className="text-orange-500 text-6xl font-serif absolute top-4 left-6 opacity-20">"</div>
                        <p className="text-slate-700 italic mb-6 relative z-10">{testimonial.quote}</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold">
                                {testimonial.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{testimonial.name}</h4>
                                <span className="text-xs text-slate-500">{testimonial.role}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-orange-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-orange-800 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to drive?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust Seff Car for their travel needs in Tacloban. 
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/fleet" className="bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-orange-600 transition-colors uppercase tracking-wide">
                    Book Your Ride
                </Link>
                <Link to="/contact" className="border border-slate-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-900/30 hover:border-orange-600 transition-colors uppercase tracking-wide">
                    Contact Us
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
};