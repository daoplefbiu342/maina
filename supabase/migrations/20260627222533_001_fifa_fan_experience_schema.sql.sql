/*
# FIFA Fan Experience Schema

1. New Tables
   - `products` - Fan experience packages (Ronaldo, Messi access slots)
     - `id` (uuid, primary key)
     - `player_name` (text) - "Ronaldo" or "Messi"
     - `title` (text) - Experience title
     - `description` (text) - Full description
     - `price` (decimal) - Price in USD
     - `image_url` (text) - Player image
     - `venue` (text) - Stadium/venue name
     - `event_date` (date) - FIFA World Cup date
     - `slot_type` (text) - "VIP", "Premium", "Standard"
     - `available_slots` (integer) - Number of slots remaining
     - `features` (text array) - List of included features
     - `created_at` (timestamp)

   - `bookings` - Fan bookings/orders
     - `id` (uuid, primary key)
     - `product_id` (uuid, references products)
     - `customer_name` (text)
     - `customer_email` (text)
     - `customer_phone` (text)
     - `quantity` (integer)
     - `total_price` (decimal)
     - `booking_date` (text) - Selected slot date
     - `status` (text) - "pending", "confirmed", "cancelled"
     - `created_at` (timestamp)

2. Security
   - Enable RLS on all tables
   - Allow anon + authenticated full CRUD (single-tenant public app)
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  venue text NOT NULL,
  event_date date NOT NULL,
  slot_type text NOT NULL,
  available_slots integer NOT NULL DEFAULT 10,
  features text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  quantity integer NOT NULL DEFAULT 1,
  total_price decimal(10,2) NOT NULL,
  booking_date text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE
  TO anon, authenticated USING (true);