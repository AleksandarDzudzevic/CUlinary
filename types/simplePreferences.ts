export interface SimplePreferences {
  // Protein types
  proteins: {
    chicken: boolean;
    beef: boolean;
    pork: boolean;
    seafood: boolean;
    vegetarian: boolean;
    vegan: boolean;
  };
  
  // Main meal types
  mainMeals: {
    pizza: boolean;
    pasta: boolean;
    burgers: boolean;
    sandwiches: boolean;
    salads: boolean;
    stir_fry: boolean;
    soup: boolean;
    rice_bowls: boolean;
    desserts: boolean;
  };
  
  // Side dishes
  sides: {
    fries: boolean;
    vegetables: boolean;
    rice: boolean;
    bread: boolean;
    fruit: boolean;
    chips: boolean;
  };
  
  // Meal focus
  focus: {
    protein_heavy: boolean;
    low_carb: boolean;
    vegan: boolean;
    vegetarian: boolean;
    cheat_meal: boolean;
    healthy: boolean;
    comfort_food: boolean;
    pre_workout: boolean;
    post_workout: boolean;
  };
  
  // User settings
  favorite_dining_halls: string[];
  campus_location: string;
}

export interface AIRecommendation {
  dining_hall: string;
  main_dish: string;
  side_dish?: string;
  message: string;
  meal_type: string;
  date: string;
}
