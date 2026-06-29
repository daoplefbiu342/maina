export interface Product {
  id: string;
  player_name: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  venue: string;
  event_date: string;
  slot_type: string;
  available_slots: number;
  features: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Booking {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  quantity: number;
  total_price: number;
  booking_date: string;
  status: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
  products?: Product;
}

export interface ShippingForm {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  location: string;
  player_name: string;
  slot_type: string;
  rating: number;
  review_text: string;
  avatar_color: string;
}

export interface LivePurchase {
  id: string;
  customer_name: string;
  city: string;
  product_title: string;
  player_name: string;
  slot_type: string;
  created_at: string;
}

export const PLAYER_CONFIG: Record<string, {
  flag: string; country: string; code: string; dob: string;
  height: string; weight: string; club: string; cardId: string;
}> = {
  'Cristiano Ronaldo': {
    flag: '🇵🇹', country: 'Portugal', code: 'POR',
    dob: '5-2-1985', height: '1.87 m', weight: '83 kg',
    club: 'AL-NASSR FC (KSA)', cardId: 'CR7-2026',
  },
  'Lionel Messi': {
    flag: '🇦🇷', country: 'Argentina', code: 'ARG',
    dob: '24-6-1987', height: '1.70 m', weight: '72 kg',
    club: 'INTER MIAMI CF (USA)', cardId: 'LM10-2026',
  },
};
