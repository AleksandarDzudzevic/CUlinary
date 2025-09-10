import { supabase } from '../lib/supabase';
import { DatabaseManager } from './databaseManager';
import { MenuItem } from '../types/database';

const CORNELL_DINING_API = 'https://now.dining.cornell.edu/api/1.0/dining/eateries.json';

interface CornellEatery {
  id: number;
  name: string;
  operatingHours: CornellOperatingHour[];
  campusArea: {
    descr: string;
    descrshort: string;
  };
  latitude: number;
  longitude: number;
  location: string;
  eateryTypes: {
    descr: string;
    descrshort: string;
  }[];
}

interface CornellOperatingHour {
  date: string;
  status: string;
  events: CornellEvent[];
}

interface CornellEvent {
  descr: string;
  startTimestamp: number;
  endTimestamp: number;
  start: string;
  end: string;
  menu: CornellMenuCategory[];
  calSummary: string;
}

interface CornellMenuCategory {
  category: string;
  sortIdx: number;
  items: CornellMenuItem[];
}

interface CornellMenuItem {
  item: string;
  healthy: boolean;
  sortIdx: number;
}

export class CornellDiningService {
  static async fetchEateries(): Promise<CornellEatery[]> {
    try {
      const response = await fetch(CORNELL_DINING_API);
      const data = await response.json();
      return data.data.eateries || [];
    } catch (error) {
      console.error('Error fetching Cornell eateries:', error);
      return [];
    }
  }

  static async fetchAndStoreMenus(): Promise<void> {
    try {
      // Initialize database maintenance (cleanup old data)
      await DatabaseManager.initializeMaintenance();
      
      // Check if we need to fetch from API
      const shouldFetch = await DatabaseManager.shouldFetchFromAPI();
      if (!shouldFetch) {
        console.log('⚡ Using cached menu data, skipping API fetch');
        return;
      }
      
      console.log('🌐 Fetching fresh menu data from Cornell API...');
      const eateries = await this.fetchEateries();
      console.log(`🏢 Found ${eateries.length} eateries from Cornell API`);

      // Filter for dining halls only - exclude cafes
      const diningHalls = eateries.filter(eatery => {
        const eateryTypes = eatery.eateryTypes || [];
        const isDiningHall = eateryTypes.some(type => 
          type.descr.toLowerCase().includes('dining') ||
          type.descr.toLowerCase().includes('marketplace') ||
          type.descr.toLowerCase().includes('all you care to eat')
        );
        
        // Also filter by name patterns for dining halls
        const isDiningHallByName = eatery.name.toLowerCase().includes('dining') ||
                                  eatery.name.toLowerCase().includes('marketplace') ||
                                  eatery.name.toLowerCase().includes('house') ||
                                  eatery.name.toLowerCase().includes('104west') ||
                                  eatery.name.toLowerCase().includes('okenshields');
        
        return isDiningHall || isDiningHallByName;
      });

      console.log(`🍽️ Found ${diningHalls.length} dining halls (filtered out cafes)`);
      
      let totalMenusStored = 0;
      const today = new Date().toISOString().split('T')[0];
      
      for (const eatery of diningHalls) {
        console.log(`\n📋 Processing ${eatery.name}...`);
        let eateryHasMenus = false;
        
        // Process ALL available dates, not just today
        for (const hours of eatery.operatingHours) {
          if (hours.events && hours.events.length > 0) {
            eateryHasMenus = true;
            console.log(`📅 ${eatery.name} - ${hours.date}: ${hours.events.length} events`);
            
            for (const event of hours.events) {
              if (event.menu && event.menu.length > 0) {
                console.log(`🍽️ ${eatery.name} - ${event.descr} (${hours.date}): ${event.menu.length} categories`);
                
                const menuItems: MenuItem[] = [];
                
                // Process menu categories
                for (const category of event.menu) {
                  if (category.items && category.items.length > 0) {
                    for (const item of category.items) {
                      menuItems.push({
                        id: `${eatery.id}-${item.item}-${hours.date}-${Date.now()}`,
                        name: item.item,
                        category: category.category || 'Unknown',
                        ingredients: [], // API doesn't provide ingredients
                        allergens: [], // API doesn't provide allergens
                        healthy: item.healthy || false,
                        sortIdx: item.sortIdx || 0,
                      });
                    }
                  }
                }

                // Store in Supabase
                if (menuItems.length > 0) {
                  console.log(`💾 Storing ${menuItems.length} items for ${eatery.name} - ${event.descr} (${hours.date})`);
                  
                  const { error } = await supabase
                    .from('menus')
                    .upsert({
                      eatery_id: eatery.id.toString(),
                      eatery_name: eatery.name,
                      menu_date: hours.date,
                      meal_type: event.descr || 'Unknown',
                      items: menuItems,
                      campus_area: eatery.campusArea?.descr || 'Unknown',
                      location: eatery.location || '',
                      operating_hours: {
                        start: event.start,
                        end: event.end,
                        startTimestamp: event.startTimestamp,
                        endTimestamp: event.endTimestamp
                      }
                    }, {
                      onConflict: 'eatery_id,menu_date,meal_type'
                    });
                    
                  if (error) {
                    console.error(`❌ Error storing menu for ${eatery.name} (${hours.date}):`, error);
                  } else {
                    totalMenusStored++;
                  }
                } else {
                  console.log(`⚠️ No menu items found for ${eatery.name} - ${event.descr} (${hours.date})`);
                }
              } else {
                console.log(`⚠️ ${eatery.name} - ${event.descr} (${hours.date}): No menu data`);
              }
            }
          }
        }
        
        if (!eateryHasMenus) {
          console.log(`⚠️ ${eatery.name}: No menu events found in operating hours`);
        }
      }
      
      console.log(`\n✅ Stored ${totalMenusStored} menus total from ${diningHalls.length} dining halls`);
    } catch (error) {
      console.error('❌ Error fetching and storing menus:', error);
    }
  }

  static async getTodaysMenus(): Promise<any[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('menu_date', today);

      if (error) {
        console.error('Error fetching menus from database:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting today\'s menus:', error);
      return [];
    }
  }
}
