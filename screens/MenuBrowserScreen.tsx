import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { CornellDiningService } from '../services/cornellDining';
import { MenuItem } from '../types/database';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  MenuDetail: {
    eatery_name: string;
    meal_type: string;
    menu_date: string;
    location: string;
    campus_area: string;
    operating_hours: string;
    menu_summary: string;
    items: MenuItem[];
  };
};

interface MenuData {
  eatery_id: number;
  eatery_name: string;
  location: string;
  campus_area: string;
  operating_hours: string | { start: string; end: string; startTimestamp: number; endTimestamp: number } | null | undefined;
  meal_type: string;
  menu_date: string;
  menu_summary: string;
  items: MenuItem[];
}

const MenuBrowserScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableMealTypes, setAvailableMealTypes] = useState<string[]>([]);

  // Helper function to get next meal
  const getNextMeal = (): { date: string; mealType: string } => {
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Debug logging for date issues
    console.log('🕐 Current time debug:');
    console.log('📅 Now:', now.toString());
    console.log('🕐 Current hour:', currentHour);
    console.log('📅 Today:', today);
    console.log('📅 Tomorrow:', tomorrow);

    // Determine next meal based on current time
    if (currentHour < 10) {
      console.log('🍳 Next meal: Breakfast today');
      return { date: today, mealType: 'Breakfast' };
    } else if (currentHour < 14) {
      console.log('🥪 Next meal: Lunch today');
      return { date: today, mealType: 'Lunch' };
    } else if (currentHour < 20) {
      console.log('🍽️ Next meal: Dinner today');
      return { date: today, mealType: 'Dinner' };
    } else {
      console.log('🍳 Next meal: Breakfast tomorrow');
      return { date: tomorrow, mealType: 'Breakfast' };
    }
  };

  const loadMenus = async (forceRefresh = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('🍽️ Loading menus for browser...');
      
      // Always load from database first for fast UI
      let allMenus = await CornellDiningService.getStoredMenus();
      console.log(`📋 Found ${allMenus.length} total menus from database`);

      // If we have menus, show them immediately
      if (allMenus.length > 0) {
        // Extract available dates and meal types
        const dates = [...new Set(allMenus.map((m: any) => m.menu_date))].sort();
        const mealTypes = [...new Set(allMenus.map((m: any) => m.meal_type))].sort();
        
        setAvailableDates(dates);
        setAvailableMealTypes(mealTypes);

        // Set default to next meal if not already set
        if (!selectedDate || !selectedMealType) {
          const nextMeal = getNextMeal();
          const defaultDate = dates.includes(nextMeal.date) ? nextMeal.date : (dates[0] || '');
          const defaultMealType = mealTypes.includes(nextMeal.mealType) ? nextMeal.mealType : (mealTypes[0] || '');
          
          setSelectedDate(defaultDate);
          setSelectedMealType(defaultMealType);
          
          // Filter menus for default selection
          const filteredMenus = allMenus.filter((menu: any) => 
            menu.menu_date === defaultDate && menu.meal_type === defaultMealType
          );
          setMenus(filteredMenus);
        } else {
          // Filter menus based on current selection
          const filteredMenus = allMenus.filter((menu: any) => 
            menu.menu_date === selectedDate && menu.meal_type === selectedMealType
          );
          setMenus(filteredMenus);
        }
      }

      // Only fetch from API if forced (pull to refresh) or if we have no menus
      if (forceRefresh || allMenus.length === 0) {
        console.log('🌐 Fetching fresh data from API...');
        await CornellDiningService.fetchAndStoreMenus();
        
        // Reload from database after API fetch
        allMenus = await CornellDiningService.getStoredMenus();
        console.log(`📋 After API fetch: ${allMenus.length} total menus`);

        // Extract available dates and meal types (after API fetch)
        const dates = [...new Set(allMenus.map((m: any) => m.menu_date))].sort();
        const mealTypes = [...new Set(allMenus.map((m: any) => m.meal_type))].sort();
        
        setAvailableDates(dates);
        setAvailableMealTypes(mealTypes);

        // Update filtered menus based on current selection
        const filteredMenus = allMenus.filter((menu: any) => 
          menu.menu_date === selectedDate && menu.meal_type === selectedMealType
        );
        setMenus(filteredMenus);
      }

    } catch (error: any) {
      console.error('❌ Error loading menus:', error);
      Alert.alert('Error', 'Failed to load menus. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    await loadMenus(true); // Force fresh API call
  };

  const handleDateMealChange = async (newDate?: string, newMealType?: string) => {
    const dateToUse = newDate || selectedDate;
    const mealToUse = newMealType || selectedMealType;
    
    setSelectedDate(dateToUse);
    setSelectedMealType(mealToUse);

    // Filter existing menus
    const allMenus = await CornellDiningService.getStoredMenus();
    const filteredMenus = allMenus.filter((menu: any) => 
      menu.menu_date === dateToUse && menu.meal_type === mealToUse
    );
    setMenus(filteredMenus);
  };

  const navigateToMenuDetail = (menu: MenuData) => {
    // Format operating hours for navigation
    const formattedHours = menu.operating_hours && typeof menu.operating_hours === 'object' && 'start' in menu.operating_hours && 'end' in menu.operating_hours && menu.operating_hours.start && menu.operating_hours.end
      ? `${menu.operating_hours.start} - ${menu.operating_hours.end}`
      : menu.operating_hours && typeof menu.operating_hours === 'string' 
      ? menu.operating_hours 
      : 'Hours not available';

    navigation.navigate('MenuDetail', {
      eatery_name: menu.eatery_name,
      meal_type: menu.meal_type,
      menu_date: menu.menu_date,
      location: menu.location,
      campus_area: menu.campus_area,
      operating_hours: formattedHours,
      menu_summary: menu.menu_summary,
      items: menu.items,
    });
  };

  const renderMenuCard = ({ item }: { item: MenuData }) => (
    <TouchableOpacity style={styles.menuCard} onPress={() => navigateToMenuDetail(item)}>
      <View style={styles.menuHeader}>
        <Text style={styles.eateryName}>{item.eatery_name}</Text>
        <Text style={styles.location}>{item.campus_area} • {item.location}</Text>
      </View>
      
      <View style={styles.menuInfo}>
        <Text style={styles.hours}>
          🕒 {item.operating_hours && typeof item.operating_hours === 'object' && 'start' in item.operating_hours && 'end' in item.operating_hours && item.operating_hours.start && item.operating_hours.end
            ? `${item.operating_hours.start} - ${item.operating_hours.end}`
            : item.operating_hours && typeof item.operating_hours === 'string' 
            ? item.operating_hours 
            : 'Hours not available'}
        </Text>
        <Text style={styles.itemCount}>
          {item.items.length} menu items
        </Text>
      </View>
      
      {item.menu_summary && (
        <Text style={styles.summary} numberOfLines={2}>
          {item.menu_summary}
        </Text>
      )}
      
      <View style={styles.menuFooter}>
        <Text style={styles.viewMenuText}>View Full Menu →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDateSelector = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Date:</Text>
      <FlatList
        horizontal
        data={availableDates}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterButton, selectedDate === item && styles.filterButtonActive]}
            onPress={() => handleDateMealChange(item, undefined)}
          >
            <Text style={[styles.filterButtonText, selectedDate === item && styles.filterButtonTextActive]}>
              {new Date(item + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  const renderMealTypeSelector = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Meal:</Text>
      <FlatList
        horizontal
        data={availableMealTypes}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterButton, selectedMealType === item && styles.filterButtonActive]}
            onPress={() => handleDateMealChange(undefined, item)}
          >
            <Text style={[styles.filterButtonText, selectedMealType === item && styles.filterButtonTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  useEffect(() => {
    loadMenus();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to view menus.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require('../assets/CUlinary_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>All Menus</Text>
      </View>

      {/* Date and Meal Type Selectors */}
      {renderDateSelector()}
      {renderMealTypeSelector()}

      {/* Current Selection Info */}
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          Showing {menus.length} dining halls for{' '}
          <Text style={styles.selectionHighlight}>
            {selectedMealType} on {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { 
              weekday: 'long', month: 'long', day: 'numeric' 
            })}
          </Text>
        </Text>
      </View>

      {/* Menus List */}
      <FlatList
        data={menus}
        keyExtractor={(item) => `${item.eatery_id}-${item.meal_type}-${item.menu_date}`}
        renderItem={renderMenuCard}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {menus.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No menus available for {selectedMealType} on{' '}
            {new Date(selectedDate).toLocaleDateString()}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Try selecting a different date or meal type
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  selectionInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectionText: {
    fontSize: 14,
    color: '#6c757d',
  },
  selectionHighlight: {
    fontWeight: '600',
    color: '#495057',
  },
  listContainer: {
    padding: 15,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    marginBottom: 8,
  },
  eateryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6c757d',
  },
  menuInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hours: {
    fontSize: 14,
    color: '#495057',
  },
  itemCount: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  summary: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  menuFooter: {
    alignItems: 'flex-end',
  },
  viewMenuText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default MenuBrowserScreen;
