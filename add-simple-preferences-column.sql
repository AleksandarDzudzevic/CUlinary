-- Add simple_preferences column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS simple_preferences JSONB DEFAULT '{}';

-- Update existing rows to have empty object for the new column
UPDATE user_preferences 
SET simple_preferences = '{}'
WHERE simple_preferences IS NULL;
