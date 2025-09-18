export interface Database {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          dietary_restrictions: string[];
          favorite_dining_halls: string[];
          preferred_cuisines: string[];
          campus_location: string;
          food_preferences?: any;
          nutritional_preferences?: any;
          cuisine_preferences?: any;
          meal_preferences?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dietary_restrictions: string[];
          favorite_dining_halls: string[];
          preferred_cuisines: string[];
          campus_location: string;
          food_preferences?: any;
          nutritional_preferences?: any;
          cuisine_preferences?: any;
          meal_preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dietary_restrictions?: string[];
          favorite_dining_halls?: string[];
          preferred_cuisines?: string[];
          campus_location?: string;
          food_preferences?: any;
          nutritional_preferences?: any;
          cuisine_preferences?: any;
          meal_preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      menus: {
        Row: {
          id: string;
          eatery_id: string;
          eatery_name: string;
          menu_date: string;
          meal_type: string;
          items: MenuItem[];
          campus_area: string;
          location: string;
          operating_hours: {
            start: string;
            end: string;
            startTimestamp: number;
            endTimestamp: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          eatery_id: string;
          eatery_name: string;
          menu_date: string;
          meal_type: string;
          items: MenuItem[];
          campus_area?: string;
          location?: string;
          operating_hours?: {
            start: string;
            end: string;
            startTimestamp: number;
            endTimestamp: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          eatery_id?: string;
          eatery_name?: string;
          menu_date?: string;
          meal_type?: string;
          items?: MenuItem[];
          campus_area?: string;
          location?: string;
          operating_hours?: {
            start: string;
            end: string;
            startTimestamp: number;
            endTimestamp: number;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  ingredients?: string[];
  allergens?: string[];
  healthy: boolean;
  sortIdx: number;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export interface UserPreferences {
  // Legacy preferences (keep for backward compatibility)
  dietary_restrictions: string[];
  favorite_dining_halls: string[];
  preferred_cuisines: string[];
  campus_location: string;
  
  // Food type preferences (based on Cornell food data)
  food_preferences?: {
    seafood?: number;
    poultry?: number;
    beef_pork?: number;
    vegetarian?: number;
  };

  // Enhanced ML-based preferences (-1 to 1 scale, 0 = neutral)
  nutritional_preferences?: {
    protein_rich?: number;
    healthy_option?: number;
    fried_food?: number;
  };

  cuisine_preferences?: {
    american?: number;
    italian?: number;
    asian?: number;
    mexican?: number;
    indian?: number;
  };

  meal_preferences?: {
    comfort_food?: number;
    breakfast_food?: number;
  };
}

export interface Recommendation {
  eatery_name: string;
  meal_type: string;
  menu_date: string;
  location: string;
  campus_area: string;
  operating_hours: any;
  menu_summary: string;
  match_percentage: number;
  top_items: MenuItem[];
}
