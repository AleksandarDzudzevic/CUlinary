import { supabase } from '../lib/supabase';
import { SimplePreferences, AIRecommendation } from '../types/simplePreferences';
import { GeminiAIService } from './geminiAI';

export class AIRecommendationService {
  
  // Get default preferences
  static getDefaultPreferences(): SimplePreferences {
    return {
      proteins: {
        chicken: false,
        beef: false,
        pork: false,
        seafood: false,
        vegetarian: false,
        vegan: false,
      },
      mainMeals: {
        pizza: false,
        pasta: false,
        burgers: false,
        sandwiches: false,
        salads: false,
        stir_fry: false,
        soup: false,
        rice_bowls: false,
        desserts: false,
      },
      sides: {
        fries: false,
        vegetables: false,
        rice: false,
        bread: false,
        fruit: false,
        chips: false,
      },
      focus: {
        protein_heavy: false,
        low_carb: false,
        vegan: false,
        vegetarian: false,
        cheat_meal: false,
        healthy: false,
        comfort_food: false,
        pre_workout: false,
        post_workout: false,
      },
      favorite_dining_halls: [],
      campus_location: '',
    };
  }

  // Save user preferences to database
  static async savePreferences(userId: string, preferences: SimplePreferences): Promise<boolean> {
    try {
      console.log('💾 Saving simple preferences...', preferences);
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          // Store as JSONB
          simple_preferences: preferences,
          favorite_dining_halls: preferences.favorite_dining_halls,
          campus_location: preferences.campus_location,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ Error saving preferences:', error);
        return false;
      }

      console.log('✅ Preferences saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in savePreferences:', error);
      return false;
    }
  }

  // Load user preferences from database
  static async loadPreferences(userId: string): Promise<SimplePreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('simple_preferences, favorite_dining_halls, campus_location')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.log('🔄 No preferences found, returning defaults');
        return this.getDefaultPreferences();
      }

      // Merge saved preferences with defaults
      const defaults = this.getDefaultPreferences();
      return {
        ...defaults,
        ...data.simple_preferences,
        favorite_dining_halls: data.favorite_dining_halls || [],
        campus_location: data.campus_location || '',
      };
    } catch (error) {
      console.error('❌ Error loading preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  // Generate AI recommendations based on preferences
  static async generateAIRecommendations(
    userId: string,
    mealType: string,
    selectedDate: string
  ): Promise<AIRecommendation[]> {
    try {
      console.log('🤖 Starting AI recommendation generation...');
      
      const preferences = await this.loadPreferences(userId);
      
      // Check if user has any preferences selected
      const hasPreferences = this.hasSelectedPreferences(preferences);
      if (!hasPreferences) {
        console.log('❌ No preferences selected');
        return [];
      }

      // Debug: Show what we're looking for
      console.log('🔍 Looking for menus with:');
      console.log('📅 Date:', selectedDate);
      console.log('🍽️ Meal type:', mealType);
      console.log('🏢 Favorite dining halls:', preferences.favorite_dining_halls);

      // Map user preference names to actual database names
      const mappedDiningHalls = this.mapDiningHallNames(preferences.favorite_dining_halls);
      console.log('🔄 Mapped dining halls:', mappedDiningHalls);

      // Get menus from favorite dining halls only
      const { data: menus, error } = await supabase
        .from('menus')
        .select('*')
        .eq('menu_date', selectedDate)
        .eq('meal_type', mealType)
        .in('eatery_name', mappedDiningHalls);

      if (error) {
        console.error('❌ Error fetching menus:', error);
        return [];
      }

      // Debug: Check what dining halls actually exist for this date/meal
      const { data: allMenus } = await supabase
        .from('menus')
        .select('eatery_name')
        .eq('menu_date', selectedDate)
        .eq('meal_type', mealType);
      
      const availableHalls = [...new Set(allMenus?.map(m => m.eatery_name) || [])];
      console.log('🏢 Available dining halls for this date/meal:', availableHalls);

      if (!menus || menus.length === 0) {
        console.log('📋 No menus found for favorite dining halls');
        console.log('❌ Possible name mismatch between preferences and database');
        return [];
      }

      console.log(`📋 Processing ${menus.length} favorite dining halls...`);

      const recommendations: AIRecommendation[] = [];

      for (const menu of menus) {
        if (!menu.items || menu.items.length === 0) continue;

        const recommendation = await this.generateAIRecommendationForHall(
          menu,
          preferences,
          mealType,
          selectedDate
        );

        if (recommendation) {
          recommendations.push(recommendation);
        }
      }

      console.log(`✅ Generated ${recommendations.length} AI recommendations`);
      return recommendations;

    } catch (error) {
      console.error('❌ Error generating AI recommendations:', error);
      return [];
    }
  }

  // Check if user has selected any preferences
  private static hasSelectedPreferences(preferences: SimplePreferences): boolean {
    const allPrefs = [
      ...Object.values(preferences.proteins),
      ...Object.values(preferences.mainMeals),
      ...Object.values(preferences.sides),
      ...Object.values(preferences.focus),
    ];
    return allPrefs.some(pref => pref === true);
  }

  // Map dining hall names from preferences to actual database names
  private static mapDiningHallNames(preferenceNames: string[]): string[] {
    const nameMapping: { [key: string]: string } = {
      // Map preference names to database names
      'Becker House Dining': 'Becker House Dining Room',
      'Cook House Dining': 'Cook House Dining Room', 
      'Rose House Dining': 'Rose House Dining Room',
      'Keeton House Dining': 'Keeton House Dining Room',
      'Flora Rose House': 'Flora Rose House Dining Room',
      'Carl Becker House': 'Carl Becker House Dining Room',
      'Hans Bethe House': "Jansen's Dining Room at Bethe House",
      'Morrison Dining': 'Morrison Dining',
      'Risley Dining Room': 'Risley Dining Room',
      'North Star Dining Room': 'North Star Dining Room',
      'Okenshields': 'Okenshields',
      'Morison Dining': 'Morrison Dining', // Handle typo
    };

    return preferenceNames.map(name => nameMapping[name] || name);
  }

  // Generate AI recommendation for a specific dining hall using real AI
  private static async generateAIRecommendationForHall(
    menu: any,
    preferences: SimplePreferences,
    mealType: string,
    selectedDate: string
  ): Promise<AIRecommendation | null> {
    try {
      console.log(`🤖 Analyzing ${menu.eatery_name} with AI...`);

      // Use Gemini AI to analyze menu items and generate recommendation
      const aiResult = await GeminiAIService.analyzeMenuItems(
        menu.items,
        preferences,
        menu.eatery_name,
        mealType
      );

      if (!aiResult) {
        console.log(`❌ No AI recommendation for ${menu.eatery_name}`);
        return null;
      }

      return {
        dining_hall: menu.eatery_name,
        main_dish: aiResult.mainDish.name,
        side_dish: aiResult.sideDish?.name,
        message: aiResult.message,
        meal_type: mealType,
        date: selectedDate,
      };

    } catch (error) {
      console.error(`❌ Error generating AI recommendation for ${menu.eatery_name}:`, error);
      return null;
    }
  }

  // Check if item matches user preferences
  private static itemMatchesPreferences(item: any, preferences: SimplePreferences): boolean {
    const name = item.name?.toLowerCase() || '';
    const category = item.category?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const fullText = `${name} ${category} ${description}`;

    // Check proteins
    if (preferences.proteins.chicken && /chicken|poultry/i.test(fullText)) return true;
    if (preferences.proteins.beef && /beef|steak/i.test(fullText)) return true;
    if (preferences.proteins.pork && /pork|bacon|ham|sausage/i.test(fullText)) return true;
    if (preferences.proteins.seafood && /fish|salmon|tuna|shrimp|seafood|crab/i.test(fullText)) return true;
    if (preferences.proteins.vegetarian && /vegetarian|veggie/i.test(fullText)) return true;
    if (preferences.proteins.vegan && /vegan/i.test(fullText)) return true;

    // Check main meals
    if (preferences.mainMeals.pizza && /pizza/i.test(fullText)) return true;
    if (preferences.mainMeals.pasta && /pasta|spaghetti|penne|ravioli/i.test(fullText)) return true;
    if (preferences.mainMeals.burgers && /burger|sandwich/i.test(fullText)) return true;
    if (preferences.mainMeals.sandwiches && /sandwich|wrap|sub/i.test(fullText)) return true;
    if (preferences.mainMeals.salads && /salad/i.test(fullText)) return true;
    if (preferences.mainMeals.stir_fry && /stir.?fry|wok/i.test(fullText)) return true;
    if (preferences.mainMeals.soup && /soup|broth|chowder/i.test(fullText)) return true;
    if (preferences.mainMeals.rice_bowls && /rice.*bowl|bowl.*rice/i.test(fullText)) return true;
    if (preferences.mainMeals.desserts && /dessert|cake|cookie|ice.*cream|chocolate|brownie|pie|pudding|pastry/i.test(fullText)) return true;

    // Check sides
    if (preferences.sides.fries && /fries|chips/i.test(fullText)) return true;
    if (preferences.sides.vegetables && /vegetable|broccoli|carrot|green/i.test(fullText)) return true;
    if (preferences.sides.rice && /rice/i.test(fullText)) return true;
    if (preferences.sides.bread && /bread|roll|biscuit/i.test(fullText)) return true;
    if (preferences.sides.fruit && /fruit|apple|banana|berry/i.test(fullText)) return true;

    // Check focus
    if (preferences.focus.healthy && /healthy|fresh|grilled|steamed/i.test(fullText)) return true;
    if (preferences.focus.cheat_meal && /fried|cheese|bacon|creamy/i.test(fullText)) return true;
    if (preferences.focus.comfort_food && /comfort|hearty|home.?style/i.test(fullText)) return true;
    if (preferences.focus.pre_workout && /protein|energy|banana|oats|smoothie|light/i.test(fullText)) return true;
    if (preferences.focus.post_workout && /protein|recovery|chicken|quinoa|sweet.*potato/i.test(fullText)) return true;

    return false;
  }

  // Select best main dish based on preferences
  private static selectBestMainDish(items: any[], preferences: SimplePreferences): any {
    // Prioritize based on main meal preferences
    for (const [key, selected] of Object.entries(preferences.mainMeals)) {
      if (!selected) continue;
      
      const matchingItem = items.find(item => {
        const fullText = `${item.name} ${item.category} ${item.description}`.toLowerCase();
        switch (key) {
          case 'pizza': return /pizza/i.test(fullText);
          case 'pasta': return /pasta|spaghetti|penne/i.test(fullText);
          case 'burgers': return /burger/i.test(fullText);
          case 'sandwiches': return /sandwich|wrap/i.test(fullText);
          case 'salads': return /salad/i.test(fullText);
          case 'stir_fry': return /stir.?fry/i.test(fullText);
          case 'soup': return /soup/i.test(fullText);
          case 'rice_bowls': return /rice.*bowl/i.test(fullText);
          default: return false;
        }
      });
      
      if (matchingItem) return matchingItem;
    }

    // Fallback to first matching item
    return items[0];
  }

  // Select best side dish
  private static selectBestSideDish(items: any[], preferences: SimplePreferences, mainDish: any): any | null {
    // Filter out the main dish
    const sideItems = items.filter(item => item.name !== mainDish.name);
    
    // Look for side preferences
    for (const [key, selected] of Object.entries(preferences.sides)) {
      if (!selected) continue;
      
      const matchingSide = sideItems.find(item => {
        const fullText = `${item.name} ${item.category} ${item.description}`.toLowerCase();
        switch (key) {
          case 'fries': return /fries|chips/i.test(fullText);
          case 'vegetables': return /vegetable|broccoli|carrot/i.test(fullText);
          case 'rice': return /rice/i.test(fullText);
          case 'bread': return /bread|roll/i.test(fullText);
          case 'fruit': return /fruit|apple|banana/i.test(fullText);
          default: return false;
        }
      });
      
      if (matchingSide) return matchingSide;
    }

    return sideItems.length > 0 ? sideItems[0] : null;
  }

  // Generate AI message
  private static generateAIMessage(mainDish: any, sideDish: any, preferences: SimplePreferences): string {
    const focusMessages = [];
    
    if (preferences.focus.protein_heavy) focusMessages.push("high in protein");
    if (preferences.focus.healthy) focusMessages.push("nutritious");
    if (preferences.focus.cheat_meal) focusMessages.push("indulgent");
    if (preferences.focus.comfort_food) focusMessages.push("comforting");
    if (preferences.focus.low_carb) focusMessages.push("low-carb");

    const focusText = focusMessages.length > 0 ? ` This combo is ${focusMessages.join(" and ")}.` : "";
    
    if (sideDish) {
      return `Perfect match! Try the ${mainDish.name} with ${sideDish.name}.${focusText} Enjoy your meal! 🍽️`;
    } else {
      return `Great choice! The ${mainDish.name} looks delicious.${focusText} Perfect for your preferences! 😋`;
    }
  }
}
