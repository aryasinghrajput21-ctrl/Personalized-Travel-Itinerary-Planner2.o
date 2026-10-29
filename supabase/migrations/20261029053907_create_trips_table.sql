/*
# Create trips table for TripWise AI

1. New Tables
- `trips`
- `id` (uuid, primary key)
- `user_id` (uuid, owner, defaults to auth.uid())
- `destination` (text, not null)
- `country` (text, nullable)
- `start_date` (date, not null)
- `end_date` (date, not null)
- `travelers` (int, not null, min 1)
- `budget` (numeric, not null, INR)
- `travel_style` (text: relaxed/balanced/packed)
- `interests` (text[], array of interest tags)
- `food_preference` (text, nullable)
- `accommodation_preference` (text, nullable)
- `additional_instructions` (text, nullable)
- `itinerary` (jsonb, AI-generated structured itinerary, nullable until generated)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `trips`.
- Grant CRUD to `authenticated` only (sign-in required app).
- Owner-scoped CRUD: each authenticated user can only access their own trips.
- user_id defaults to auth.uid() so inserts omitting it still satisfy WITH CHECK.
*/

CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  destination text NOT NULL,
  country text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  travelers int NOT NULL DEFAULT 1,
  budget numeric NOT NULL,
  travel_style text NOT NULL DEFAULT 'balanced',
  interests text[] NOT NULL DEFAULT '{}',
  food_preference text,
  accommodation_preference text,
  additional_instructions text,
  itinerary jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON trips TO authenticated;

DROP POLICY IF EXISTS "select_own_trips" ON trips;
CREATE POLICY "select_own_trips" ON trips FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_trips" ON trips;
CREATE POLICY "insert_own_trips" ON trips FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_trips" ON trips;
CREATE POLICY "update_own_trips" ON trips FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_trips" ON trips;
CREATE POLICY "delete_own_trips" ON trips FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
