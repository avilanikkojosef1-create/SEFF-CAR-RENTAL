import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Car as CarIcon, Users, Clock, User, FileText, MessageSquare, CheckCircle, Loader2, Facebook, Upload, FileCheck, Info } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { supabase } from '../lib/supabase';
import { Car } from '../types';

export const Booking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const car = location.state?.car as Car | undefined;

  // Redirect if no car selected
  useEffect(() => {
    if (!car) {
      navigate('/fleet');
    }
  }, [car, navigate]);

  const [widgetData, setWidgetData] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('bookingWidgetData');
    if (data) {
      setWidgetData(JSON.parse(data));
    }
  }, []);

  const form = useRef<HTMLFormElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);

  // Calculate duration in days and extra hours if dates are available
  let durationDays = 1;
  let extraHours = 0;
  let hourlyRate = 300; // Default for Van, SUV, MPV, Pickup, L300
  
  if (car?.category === 'Hatchback' || car?.category === 'Sedan') {
    hourlyRate = 200;
  }

  if (widgetData?.pickupDateTime && widgetData?.destinationDateTime) {
    const start = new Date(widgetData.pickupDateTime);
    const end = new Date(widgetData.destinationDateTime);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime > 0) {
      const totalHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (totalHours <= 24) {
        durationDays = 1;
        extraHours = 0;
      } else {
        durationDays = Math.floor(totalHours / 24);
        extraHours = totalHours % 24;
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLicenseFile(file);
      setLicensePreview(URL.createObjectURL(file));
    }
  };

  // EmailJS Configuration
  const SERVICE_ID = 'service_v7na3aq';
  const TEMPLATE_ID = 'template_iwg5rh6';
  const PUBLIC_KEY = 'fI-S_OmFDBeHwzWkM';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!form.current) return;

    try {
      const formData = new FormData(form.current);
      const userName = formData.get('user_name') as string;
      const contactNumber = formData.get('contact_number') as string;
      const facebookAccount = formData.get('facebook_account') as string;
      const passengers = formData.get('passengers') as string;
      const purpose = formData.get('purpose') as string;

      const pickupLoc = widgetData?.pickupLocation || 'Not specified';
      const dropoffLoc = 'Not specified'; // Removed from widget
      const deliveryMethod = formData.get('delivery_method') as string;
      const startDate = widgetData?.pickupDateTime || new Date().toISOString();
      const duration = extraHours > 0 ? `${durationDays} day(s) and ${extraHours} hour(s)` : `${durationDays} day(s)`;
      const carType = car?.name || 'Unknown';
      const specialRequests = `Delivery Method: ${deliveryMethod}, Passengers: ${passengers}, Purpose: ${purpose}`;

      let driversLicenseUrl = '';

      // 0. Upload Driver's License if provided
      if (licenseFile) {
        const fileExt = licenseFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `licenses/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('car-images') // Reusing existing bucket for simplicity
          .upload(filePath, licenseFile);

        if (uploadError) {
          console.error("License upload error:", uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);
          driversLicenseUrl = publicUrl;
        }
      }

      // 1. Save to Supabase
      const { error: dbError } = await supabase.from('bookings').insert([{
        user_name: userName,
        user_email: '', // Required by DB schema but removed from form
        contact_number: contactNumber,
        facebook_account: facebookAccount,
        pickup_location: pickupLoc,
        dropoff_location: dropoffLoc,
        start_date: startDate,
        duration: duration,
        car_type: carType,
        special_requests: specialRequests,
        drivers_license_url: driversLicenseUrl,
        status: 'Pending'
      }]);

      if (dbError) {
        console.error("DB Error:", dbError);
      }

      // 2. Send Email Notification with timeout to prevent hanging
      const templateParams = {
        user_name: userName,
        contact_number: contactNumber,
        facebook_account: facebookAccount,
        pickup_location: pickupLoc,
        dropoff_location: dropoffLoc,
        duration: duration,
        start_date: startDate,
        passengers: passengers,
        purpose: purpose,
        car_type: carType,
        special_requests: specialRequests || 'None',
        drivers_license_url: driversLicenseUrl || 'Not provided',
      };

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email request timed out')), 10000)
      );

      try {
        await Promise.race([
          emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY),
          timeoutPromise
        ]);
      } catch (emailError) {
        console.warn("Email notification failed or timed out, but proceeding since data was sent to DB:", emailError);
      }
      
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('FAILED...', error);
      alert("Something went wrong with the request. Please check your internet connection or call us directly at 0921 421 4729.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Request Received!</h2>
          <p className="text-slate-600 mb-8 text-lg">
            Thank you for your interest in Seff Car Rental. We have sent the details to our team and will contact you shortly with a quote.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-colors uppercase tracking-wide shadow-lg shadow-orange-600/30"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Book Your Ride</h1>
          <p className="text-lg text-slate-600">Complete the form below to request a reservation.</p>
        </div>

        {/* Selected Vehicle & Fee Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8">
          <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-700 w-full"></div>
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3">
              <img src={car.imageUrl} alt={car.name} className="w-full h-auto object-cover rounded-xl shadow-md" />
            </div>
            <div className="w-full md:w-2/3">
              <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{car.name}</h2>
                  <span className="inline-block bg-slate-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mt-2">
                    {car.category}
                  </span>
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Estimated Fee Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Daily Rate</span>
                  <span className="font-medium">₱{car.pricePerDay.toLocaleString()}</span>
                </div>
                {widgetData?.pickupDateTime && widgetData?.destinationDateTime && (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Duration</span>
                      <span className="font-medium">{durationDays} day(s)</span>
                    </div>
                    {extraHours > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Extra Hours ({extraHours}h @ ₱{hourlyRate}/h)</span>
                        <span className="font-medium">₱{(extraHours * hourlyRate).toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
                {car.carWashFee ? (
                  <div className="flex justify-between text-slate-600">
                    <span>Car Wash Fee</span>
                    <span className="font-medium">₱{car.carWashFee.toLocaleString()}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t border-slate-100 mt-2">
                  <span>Estimated Total</span>
                  <span className="text-orange-600">
                    ₱{((car.pricePerDay * durationDays) + (extraHours * hourlyRate) + (car.carWashFee || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4 flex items-start gap-1">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                This is an estimated total. Final pricing may vary based on actual rental duration and additional services.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <form ref={form} onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            
            {/* Section 1: Personal Details */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="text-orange-600" size={24} /> 
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="user_name"
                    required
                    placeholder="Juan Dela Cruz"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
                
                {/* Contact Number */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contact Number</label>
                  <input 
                    type="tel" 
                    name="contact_number"
                    required
                    placeholder="0912 345 6789"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>

                {/* Facebook Account */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Facebook Account (Link or Name)</label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="facebook_account"
                      required
                      placeholder="facebook.com/juan.delacruz"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                {/* Driver's License Upload */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Driver's License (Photo/Scan)</label>
                  <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-orange-500 transition-all text-center bg-slate-50">
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {licensePreview ? (
                      <div className="flex flex-col items-center">
                        {licenseFile?.type.includes('image') ? (
                          <img src={licensePreview} alt="License Preview" className="h-32 w-auto object-contain rounded-lg mb-2" />
                        ) : (
                          <div className="bg-orange-100 p-4 rounded-full text-orange-600 mb-2">
                            <FileCheck size={32} />
                          </div>
                        )}
                        <p className="text-sm font-bold text-slate-900">{licenseFile?.name}</p>
                        <p className="text-xs text-slate-500 mt-1">Click or drag to replace</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="mx-auto text-slate-400 mb-2 group-hover:text-orange-500 transition-colors" size={32} />
                        <p className="text-sm font-bold text-slate-700">Upload Driver's License</p>
                        <p className="text-xs text-slate-500 mt-1">Required for verification (JPG, PNG, or PDF)</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Section 2: Trip Details */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="text-orange-600" size={24} /> 
                Trip Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                 {/* Passengers */}
                 <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">No. of Passengers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      name="passengers"
                      min="1"
                      required
                      placeholder="e.g., 4"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                 {/* Purpose */}
                 <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Purpose of Trip</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="purpose"
                      required
                      placeholder="Business, vacation, etc."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                 {/* Delivery Method */}
                 <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-orange-500 transition-all bg-slate-50 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                      <input 
                        type="radio" 
                        name="delivery_method" 
                        value="Pick Up" 
                        defaultChecked
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="font-medium text-slate-700">Pick Up</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-orange-500 transition-all bg-slate-50 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                      <input 
                        type="radio" 
                        name="delivery_method" 
                        value="Delivery" 
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="font-medium text-slate-700">Delivery</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1 flex-shrink-0">
                <MessageSquare size={16} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm mb-1">What happens next?</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  We'll contact you with available options and the estimated quote. No payment needed at this stage.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wide disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="flex-1 px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-orange-600/30 uppercase tracking-wide disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};