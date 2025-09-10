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
  dietary_restrictions: string[];
  favorite_dining_halls: string[];
  preferred_cuisines: string[];
  campus_location: string;
}

export interface Recommendation {
  eatery_name: string;
  eatery_id: string;
  recommended_items: MenuItem[]; // All items for detail view
  top_items?: MenuItem[]; // Top recommended items for card preview
  score: number;
  distance_score: number;
  preference_score: number;
  meal_type: string;
  menu_date?: string;
  campus_area?: string;
  location?: string;
  operating_hours?: {
    start: string;
    end: string;
    startTimestamp: number;
    endTimestamp: number;
  };
}
