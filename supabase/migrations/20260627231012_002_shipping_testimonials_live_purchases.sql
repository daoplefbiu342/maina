/*
# Add Shipping, Testimonials & Live Purchases

## Changes

1. Modified Tables
   - `bookings` — adds full shipping address fields:
     - `address_line1` (text) — street address
     - `address_line2` (text, nullable) — apartment, suite, etc.
     - `city` (text) — city
     - `state_province` (text) — state or province
     - `postal_code` (text) — ZIP / postal code
     - `country` (text, default 'United States') — country

2. New Tables
   - `testimonials` — customer reviews shown on homepage
     - `id` (uuid, primary key)
     - `customer_name` (text) — reviewer name
     - `location` (text) — city, country of reviewer
     - `player_name` (text) — which player experience
     - `slot_type` (text) — VIP / Premium / Standard
     - `rating` (integer 1-5) — star rating
     - `review_text` (text) — the review body
     - `avatar_color` (text) — hex color for avatar initials
     - `created_at` (timestamp)

   - `live_purchases` — social proof feed (lower-third notifications)
     - `id` (uuid, primary key)
     - `customer_name` (text) — display name
     - `city` (text) — location shown
     - `product_title` (text) — experience booked
     - `player_name` (text) — Ronaldo or Messi
     - `slot_type` (text) — VIP / Premium / Standard
     - `created_at` (timestamp)

3. Security
   - All tables: RLS enabled, anon + authenticated CRUD allowed (single-tenant, no login).
*/

-- Add shipping address fields to bookings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='address_line1') THEN
    ALTER TABLE bookings ADD COLUMN address_line1 text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='address_line2') THEN
    ALTER TABLE bookings ADD COLUMN address_line2 text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='city') THEN
    ALTER TABLE bookings ADD COLUMN city text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='state_province') THEN
    ALTER TABLE bookings ADD COLUMN state_province text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='postal_code') THEN
    ALTER TABLE bookings ADD COLUMN postal_code text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='country') THEN
    ALTER TABLE bookings ADD COLUMN country text DEFAULT 'United States';
  END IF;
END $$;

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  location text NOT NULL,
  player_name text NOT NULL,
  slot_type text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  review_text text NOT NULL,
  avatar_color text NOT NULL DEFAULT '#0ea5e9',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_testimonials" ON testimonials;
CREATE POLICY "anon_select_testimonials" ON testimonials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_testimonials" ON testimonials;
CREATE POLICY "anon_insert_testimonials" ON testimonials FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_testimonials" ON testimonials;
CREATE POLICY "anon_update_testimonials" ON testimonials FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_testimonials" ON testimonials;
CREATE POLICY "anon_delete_testimonials" ON testimonials FOR DELETE
  TO anon, authenticated USING (true);

-- Live purchases social proof table
CREATE TABLE IF NOT EXISTS live_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  city text NOT NULL,
  product_title text NOT NULL,
  player_name text NOT NULL,
  slot_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE live_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_live_purchases" ON live_purchases;
CREATE POLICY "anon_select_live_purchases" ON live_purchases FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_live_purchases" ON live_purchases;
CREATE POLICY "anon_insert_live_purchases" ON live_purchases FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_live_purchases" ON live_purchases;
CREATE POLICY "anon_update_live_purchases" ON live_purchases FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_live_purchases" ON live_purchases;
CREATE POLICY "anon_delete_live_purchases" ON live_purchases FOR DELETE
  TO anon, authenticated USING (true);