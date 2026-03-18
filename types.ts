export interface Car {
  id: string;
  name: string;
  category: 'Hatchback' | 'Sedan' | 'MPV' | 'SUV' | 'Compact SUV' | 'Van' | 'L300' | 'Pickup';
  pricePerDay: number;
  seats: number | string;
  transmission: 'Automatic' | 'Manual';
  fuelType: 'Unleaded' | 'Diesel';
  imageUrl: string;
  features: string[];
  carWashFee?: number;
  engineSize?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Booking {
  id: string;
  user_name: string;
  user_email: string;
  contact_number: string;
  facebook_account?: string;
  pickup_location: string;
  start_date: string;
  duration: string;
  car_type: string;
  special_requests?: string;
  drivers_license_url?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string;
  author: string;
  created_at: string;
  updated_at?: string;
}