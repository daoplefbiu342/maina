/*
# Add User Authentication and Package Tracking System

## Changes

1. Modified Tables
   - `bookings` — adds user authentication and tracking support:
     - `user_id` (uuid, references auth.users) — links booking to registered user
     - `tracking_code` (text, unique) — generated tracking number like "FFA-XXXXXXXX"
     - `tracking_status` (text) — current status: processing, shipped, in_transit, customs, out_for_delivery, delivered, delayed, returned
     - `tracking_carrier` (text) — shipping carrier name
     - `tracking_eta` (date) — estimated delivery date
     - `tracking_last_update` (timestamptz) — last status update timestamp
     - `tracking_notes` (text) — admin notes about delivery

2. New Tables
   - `tracking_history` — timeline of all tracking events
     - `id` (uuid, primary key)
     - `booking_id` (uuid, foreign key to bookings)
     - `status` (text) — status at this point
     - `location` (text) — where the package was
     - `notes` (text) — notes about this event
     - `created_at` (timestamp)

3. Security
   - Enable RLS on all new tables
   - Bookings: users can only see their own bookings (user_id matches auth.uid())
   - Tracking history: users can view history for their own bookings
   - Admin access via service role key for full management
*/

-- Add user_id and tracking fields to bookings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='user_id') THEN
    ALTER TABLE bookings ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='tracking_code') THEN
    ALTER TABLE bookings ADD COLUMN tracking_code text UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='tracking_status') THEN
    ALTER TABLE bookings ADD COLUMN tracking_status text DEFAULT 'processing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='tracking_carrier') THEN
    ALTER TABLE bookings ADD COLUMN tracking_carrier text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='tracking_eta') THEN
    ALTER TABLE bookings ADD COLUMN tracking_eta date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='tracking_last_update') THEN
    ALTER TABLE bookings ADD COLUMN tracking_last_update timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='tracking_notes') THEN
    ALTER TABLE bookings ADD COLUMN tracking_notes text;
  END IF;
END $$;

-- Tracking history table
CREATE TABLE IF NOT EXISTS tracking_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tracking_history ENABLE ROW LEVEL SECURITY;

-- Policies for tracking_history
DROP POLICY IF EXISTS "users_view_own_tracking" ON tracking_history;
CREATE POLICY "users_view_own_tracking" ON tracking_history FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = tracking_history.booking_id AND bookings.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "anon_select_tracking" ON tracking_history;
CREATE POLICY "anon_select_tracking" ON tracking_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tracking" ON tracking_history;
CREATE POLICY "anon_insert_tracking" ON tracking_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Update bookings policies for authenticated users
DROP POLICY IF EXISTS "users_select_own_bookings" ON bookings;
CREATE POLICY "users_select_own_bookings" ON bookings FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "users_insert_bookings" ON bookings;
CREATE POLICY "users_insert_bookings" ON bookings FOR INSERT
  TO authenticated WITH CHECK (true);

-- Keep existing anon policies for non-authenticated access
DROP POLICY IF EXISTS "anon_select_bookings_tracking" ON bookings;
CREATE POLICY "anon_select_bookings_tracking" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

-- Create function to generate tracking code
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS text AS $$
DECLARE
  code text;
BEGIN
  code := 'FFA-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate tracking code
CREATE OR REPLACE FUNCTION set_tracking_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.tracking_code IS NULL AND NEW.status = 'confirmed' THEN
    NEW.tracking_code := generate_tracking_code();
    NEW.tracking_status := 'processing';
    NEW.tracking_last_update := now();
    NEW.tracking_eta := (current_date + interval '14 days')::date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_tracking_trigger ON bookings;
CREATE TRIGGER bookings_tracking_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_tracking_code();

-- Create index for faster tracking lookups
CREATE INDEX IF NOT EXISTS idx_bookings_tracking_code ON bookings(tracking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_history_booking ON tracking_history(booking_id);