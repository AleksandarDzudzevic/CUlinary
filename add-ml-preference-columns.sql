-- Add ML preference columns to user_preferences table
-- Run this in your Supabase SQL editor

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS food_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS nutritional_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cuisine_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS meal_preferences JSONB DEFAULT '{}';

-- Update existing rows to have empty objects for the new columns
UPDATE user_preferences 
SET 
  food_preferences = '{}',
  nutritional_preferences = '{}', 
  cuisine_preferences = '{}',
  meal_preferences = '{}'
WHERE 
  food_preferences IS NULL 
  OR nutritional_preferences IS NULL 
  OR cuisine_preferences IS NULL 
  OR meal_preferences IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
ORDER BY ordinal_position;
