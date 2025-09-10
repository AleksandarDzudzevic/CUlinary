-- Database Migration: Add new columns to menus table
-- Run this in your Supabase SQL Editor after the initial schema

-- Add new columns to the menus table
ALTER TABLE menus 
ADD COLUMN IF NOT EXISTS campus_area TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}';

-- Update the unique constraint to be more specific
ALTER TABLE menus DROP CONSTRAINT IF EXISTS menus_eatery_id_menu_date_meal_type_key;
ALTER TABLE menus ADD CONSTRAINT menus_eatery_id_menu_date_meal_type_key 
UNIQUE(eatery_id, menu_date, meal_type);

-- Add indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_menus_campus_area ON menus(campus_area);
CREATE INDEX IF NOT EXISTS idx_menus_location ON menus(location);

-- Add comment
COMMENT ON COLUMN menus.campus_area IS 'Campus area where the eatery is located (e.g., Central Campus, West Campus)';
COMMENT ON COLUMN menus.location IS 'Specific building/location of the eatery';
COMMENT ON COLUMN menus.operating_hours IS 'JSON object containing start/end times and timestamps for the meal period';
