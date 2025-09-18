import { supabase } from '../lib/supabase';
import { UserPreferences, MenuItem, Recommendation } from '../types/database';

export class RecommendationService {
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        dietary_restrictions: data.dietary_restrictions,
        favorite_dining_halls: data.favorite_dining_halls,
        preferred_cuisines: data.preferred_cuisines,
        campus_location: data.campus_location,
      };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  static async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<boolean> {
    try {
      console.log('💾 Saving user preferences...', preferences);
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            dietary_restrictions: preferences.dietary_restrictions,
            favorite_dining_halls: preferences.favorite_dining_halls,
            preferred_cuisines: preferences.preferred_cuisines,
            campus_location: preferences.campus_location,
            food_preferences: preferences.food_preferences,
            nutritional_preferences: preferences.nutritional_preferences,
            cuisine_preferences: preferences.cuisine_preferences,
            meal_preferences: preferences.meal_preferences,
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
      console.error('❌ Error saving user preferences:', error);
      return false;
    }
  }

  static async generateRecommendations(userId: string, mealType?: string, selectedDate?: string): Promise<Recommendation[]> {
    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences) {
        console.log('⚠️ No user preferences found');
        return [];
      }

      console.log('👤 User preferences:', preferences);

      // Get menus for selected date or next few days
      let dates = [];
      if (selectedDate) {
        dates = [selectedDate];
        console.log(`🔍 Querying menus for selected date: ${selectedDate}`);
      } else {
        const today = new Date();
        for (let i = 0; i < 7; i++) { // Next 7 days
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        console.log(`🔍 Querying menus for dates: ${dates.join(', ')}`);
      }
      
      let query = supabase
        .from('menus')
        .select('*')
        .in('menu_date', dates)
        .order('menu_date', { ascending: true });

      if (mealType) {
        console.log(`🍽️ Filtering by meal type: ${mealType}`);
        // Use exact match for meal type, not partial match
        query = query.eq('meal_type', mealType);
      }

      const { data: menus, error } = await query;

      if (error) {
        console.error('❌ Error querying menus:', error);
        return [];
      }

      if (!menus || menus.length === 0) {
        console.log('⚠️ No menus found in database for today');
        return [];
      }

      console.log(`📋 Found ${menus.length} menus in database`);
      
      // Debug: Show what meal types we actually found
      const foundMealTypes = [...new Set(menus.map(m => m.meal_type))];
      console.log(`🍽️ Found meal types: ${foundMealTypes.join(', ')}`);
      
      if (mealType) {
        const matchingMeals = menus.filter(m => m.meal_type === mealType);
        console.log(`🎯 Exact matches for "${mealType}": ${matchingMeals.length} menus`);
      }

      const recommendations: Recommendation[] = [];

      for (const menu of menus) {
        const score = this.calculateMenuScore(menu, preferences);
        if (score > 0) {
          const filteredItems = this.filterMenuItems(menu.items, preferences);
          
          if (filteredItems.length > 0) {
            recommendations.push({
              eatery_name: menu.eatery_name,
              meal_type: menu.meal_type,
              menu_date: menu.menu_date,
              location: menu.location || '',
              campus_area: menu.campus_area || '',
              operating_hours: menu.operating_hours || {},
              menu_summary: menu.menu_summary || '',
              match_percentage: Math.round(score),
              top_items: filteredItems.slice(0, 5),
            });
          }
        }
      }

      // Sort by total score (higher is better)
      return recommendations.sort((a, b) => b.match_percentage - a.match_percentage);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private static calculateMenuScore(menu: any, preferences: UserPreferences): number {
    let score = 0;

    // Favorite dining halls bonus
    if (preferences.favorite_dining_halls.includes(menu.eatery_name)) {
      score += 30;
    }

    // Distance score based on campus location
    const distanceScore = this.calculateDistanceScore(menu, preferences.campus_location);
    score += distanceScore;

    // Menu items preference score
    const preferenceScore = this.calculatePreferenceScore(menu.items, preferences);
    score += preferenceScore;

    return score;
  }

  private static calculateDistanceScore(menu: any, campusLocation: string): number {
    // Use the actual campus area from the menu data if available
    const menuCampusArea = menu.campus_area;
    
    if (menuCampusArea) {
      // Direct campus area match
      if (menuCampusArea.toLowerCase().includes(campusLocation.toLowerCase()) ||
          campusLocation.toLowerCase().includes(menuCampusArea.toLowerCase())) {
        return 25; // High score for same campus area
      }
    }

    // Fallback to name-based mapping for older data
    const eateryName = menu.eatery_name;
    const locationMap: { [key: string]: string[] } = {
      'North Campus': ['Robert Purcell', 'North Star', 'RPCC', 'Morrison'],
      'Central Campus': ['Okenshields', 'Mattin', 'Ivy Room', 'Trillium', 'Kennedy'],
      'West Campus': ['Becker', 'Cook', 'Keeton', 'Rose', 'Flora Rose', '104West'],
      'Collegetown': ['Collegetown', 'CTB'],
    };

    const nearbyEateries = locationMap[campusLocation] || [];
    if (nearbyEateries.some(name => eateryName.includes(name) || name.includes(eateryName))) {
      return 20; // High score for nearby eateries
    }
    
    return 5; // Lower score for distant eateries
  }

  private static calculatePreferenceScore(items: MenuItem[], preferences: UserPreferences): number {
    if (!items || items.length === 0) return 0;

    let score = 0;
    let validItems = 0;

    for (const item of items) {
      // Skip items with dietary restrictions
      if (this.hasRestrictedIngredients(item, preferences.dietary_restrictions)) {
        continue;
      }

      validItems++;

      // Preferred cuisines bonus
      for (const cuisine of preferences.preferred_cuisines) {
        if (item.name.toLowerCase().includes(cuisine.toLowerCase()) ||
            item.category.toLowerCase().includes(cuisine.toLowerCase())) {
          score += 10;
        }
      }
    }

    // Return average score per valid item
    return validItems > 0 ? score / validItems : 0;
  }

  private static filterMenuItems(items: MenuItem[], preferences: UserPreferences): MenuItem[] {
    if (!items) return [];

    return items.filter(item => {
      // Filter out items with dietary restrictions
      if (this.hasRestrictedIngredients(item, preferences.dietary_restrictions)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by preference relevance
      let scoreA = 0;
      let scoreB = 0;

      for (const cuisine of preferences.preferred_cuisines) {
        if (a.name.toLowerCase().includes(cuisine.toLowerCase()) ||
            a.category.toLowerCase().includes(cuisine.toLowerCase())) {
          scoreA++;
        }
        if (b.name.toLowerCase().includes(cuisine.toLowerCase()) ||
            b.category.toLowerCase().includes(cuisine.toLowerCase())) {
          scoreB++;
        }
      }

      return scoreB - scoreA;
    });
  }

  private static hasRestrictedIngredients(item: MenuItem, restrictions: string[]): boolean {
    if (!restrictions || restrictions.length === 0) return false;

    const itemText = `${item.name} ${item.category} ${(item.ingredients || []).join(' ')} ${(item.allergens || []).join(' ')}`.toLowerCase();

    return restrictions.some(restriction => 
      itemText.includes(restriction.toLowerCase())
    );
  }
}
