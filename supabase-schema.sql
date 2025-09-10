-- CUlinary Database Schema
-- Run this in your Supabase SQL Editor FIRST

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dietary_restrictions TEXT[] DEFAULT '{}',
    favorite_dining_halls TEXT[] DEFAULT '{}',
    preferred_cuisines TEXT[] DEFAULT '{}',
    campus_location TEXT NOT NULL DEFAULT 'Central Campus',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Menus Table (with updated schema)
CREATE TABLE IF NOT EXISTS menus (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    eatery_id TEXT NOT NULL,
    eatery_name TEXT NOT NULL,
    menu_date DATE NOT NULL,
    meal_type TEXT NOT NULL,
    items JSONB DEFAULT '[]',
    campus_area TEXT,
    location TEXT,
    operating_hours JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(eatery_id, menu_date, meal_type)
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- User Preferences Policies
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- Menus Policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view menus"
    ON menus FOR SELECT
    TO authenticated
    USING (true);

-- Only allow system/admin to insert/update menus
CREATE POLICY "Only service role can modify menus"
    ON menus FOR ALL
    TO service_role
    USING (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_date_meal ON menus(menu_date, meal_type);
CREATE INDEX IF NOT EXISTS idx_menus_eatery_date ON menus(eatery_id, menu_date);
CREATE INDEX IF NOT EXISTS idx_menus_campus_area ON menus(campus_area);
CREATE INDEX IF NOT EXISTS idx_menus_location ON menus(location);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON COLUMN menus.campus_area IS 'Campus area where the eatery is located (e.g., Central Campus, West Campus)';
COMMENT ON COLUMN menus.location IS 'Specific building/location of the eatery';
COMMENT ON COLUMN menus.operating_hours IS 'JSON object containing start/end times and timestamps for the meal period';
