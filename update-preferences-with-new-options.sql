-- Update simple_preferences to include new desserts and workout options
-- This updates the JSONB structure for existing users

-- For users who already have simple_preferences, we need to add the new fields
UPDATE user_preferences 
SET simple_preferences = jsonb_set(
  jsonb_set(
    jsonb_set(
      simple_preferences,
      '{mainMeals,desserts}',
      'false'
    ),
    '{focus,pre_workout}',
    'false'
  ),
  '{focus,post_workout}',
  'false'
)
WHERE simple_preferences IS NOT NULL 
  AND simple_preferences != '{}';

-- For users with empty simple_preferences, set full default structure
UPDATE user_preferences 
SET simple_preferences = '{
  "proteins": {
    "chicken": false,
    "beef": false,
    "pork": false,
    "seafood": false,
    "vegetarian": false,
    "vegan": false
  },
  "mainMeals": {
    "pizza": false,
    "pasta": false,
    "burgers": false,
    "sandwiches": false,
    "salads": false,
    "stir_fry": false,
    "soup": false,
    "rice_bowls": false,
    "desserts": false
  },
  "sides": {
    "fries": false,
    "vegetables": false,
    "rice": false,
    "bread": false,
    "fruit": false,
    "chips": false
  },
  "focus": {
    "protein_heavy": false,
    "low_carb": false,
    "vegan": false,
    "vegetarian": false,
    "cheat_meal": false,
    "healthy": false,
    "comfort_food": false,
    "pre_workout": false,
    "post_workout": false
  }
}'::jsonb
WHERE simple_preferences IS NULL 
   OR simple_preferences = '{}';
