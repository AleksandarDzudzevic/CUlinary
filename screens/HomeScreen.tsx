import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { RecommendationService } from '../services/recommendations';
import { CornellDiningService } from '../services/cornellDining';
import { Recommendation } from '../types/database';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [menusFetched, setMenusFetched] = useState(false);

  useEffect(() => {
    checkUserPreferences();
    loadRecommendations();
  }, []);

  const checkUserPreferences = async () => {
    if (!user) return;
    
    const preferences = await RecommendationService.getUserPreferences(user.id);
    if (!preferences) {
      // Navigate to preferences setup
      navigation.navigate('Preferences', { initialSetup: true });
    }
  };

  const loadRecommendations = async (skipMenuFetch = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Smart menu fetching - only fetch if needed
      if (!skipMenuFetch) {
        console.log('🍽️ Checking menu data...');
        await CornellDiningService.fetchAndStoreMenus(); // This now handles smart fetching internally
        console.log('✅ Menu data ready');
        setMenusFetched(true);
      } else {
        console.log('⚡ Using existing data for filtering');
      }
      
      console.log('🤖 Generating recommendations...');
      console.log(`📅 Selected date: ${selectedDate || 'All days'}`);
      console.log(`🍽️ Selected meal: ${selectedMealType || 'All meals'}`);
      
      // Generate recommendations with proper filtering
      const recs = await RecommendationService.generateRecommendations(user.id, selectedMealType, selectedDate);
      console.log(`📊 Generated ${recs.length} recommendations`);
      setRecommendations(recs);
    } catch (error: any) {
      console.error('❌ Error loading recommendations:', error);
      Alert.alert('Error', `Failed to load recommendations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setMenusFetched(false); // Reset cache to force fresh menu fetch
    await loadRecommendations();
    setRefreshing(false);
  };

  const getCurrentMealType = (): string => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Breakfast';
    if (hour < 16) return 'Lunch';
    return 'Dinner';
  };

  const mealTypes = ['', 'Breakfast', 'Brunch', 'Lunch', 'Late Lunch', 'Dinner'];

  // Generate available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleCardPress = (recommendation: Recommendation) => {
    // Navigate to detailed menu view
    navigation.navigate('MenuDetail', {
      eateryName: recommendation.eatery_name,
      mealType: recommendation.meal_type,
      menuDate: recommendation.menu_date || selectedDate || new Date().toISOString().split('T')[0],
      items: recommendation.recommended_items,
      campusArea: recommendation.campus_area || 'Campus Area',
      location: recommendation.location || 'Location',
      operatingHours: recommendation.operating_hours || {
        start: '8:00am',
        end: '8:00pm'
      }
    });
  };

  const renderRecommendation = (recommendation: Recommendation, index: number) => (
    <TouchableOpacity 
      key={`${recommendation.eatery_id}-${index}`} 
      style={styles.recommendationCard}
      onPress={() => handleCardPress(recommendation)}
      activeOpacity={0.7}
    >
      <View style={styles.recommendationHeader}>
        <Text style={styles.eateryName}>{recommendation.eatery_name}</Text>
        <Text style={styles.mealType}>{recommendation.meal_type}</Text>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Match Score: {Math.round(recommendation.score)}%</Text>
      </View>

      <Text style={styles.itemsHeader}>Top Recommended Items:</Text>
      {(recommendation.top_items || recommendation.recommended_items).slice(0, 3).map((item, itemIndex) => (
        <View key={`${item.id}-${itemIndex}`} style={styles.menuItem}>
          <View style={styles.menuItemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.healthy && (
              <View style={styles.healthyBadge}>
                <Text style={styles.healthyText}>Healthy</Text>
              </View>
            )}
          </View>
          <Text style={styles.itemCategory}>{item.category}</Text>
        </View>
      ))}
      
      <View style={styles.cardFooter}>
        {(recommendation.top_items || recommendation.recommended_items).length > 3 && (
          <Text style={styles.moreItems}>
            +{(recommendation.top_items || recommendation.recommended_items).length - 3} more items
          </Text>
        )}
        <Text style={styles.tapToView}>Tap to view full menu →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/CUlinary_logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>CUlinary</Text>
          <Text style={styles.greeting}>
            Hello, {user?.email?.split('@')[0]}!
          </Text>
          <Text style={styles.subtitle}>
            Here are your personalized dining recommendations
          </Text>
        </View>

        {/* Date Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Select date:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedDate === '' && styles.filterButtonSelected
                ]}
                  onPress={() => {
                    setSelectedDate('');
                    loadRecommendations(true); // Skip menu fetch, just filter existing data
                  }}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedDate === '' && styles.filterButtonTextSelected
                ]}>
                  All Days
                </Text>
              </TouchableOpacity>
              {availableDates.map((date) => (
                <TouchableOpacity
                  key={date.value}
                  style={[
                    styles.filterButton,
                    selectedDate === date.value && styles.filterButtonSelected
                  ]}
                  onPress={() => {
                    setSelectedDate(date.value);
                    loadRecommendations(true); // Skip menu fetch, just filter existing data
                  }}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedDate === date.value && styles.filterButtonTextSelected
                  ]}>
                    {date.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Meal Type Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by meal:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              {mealTypes.map((mealType) => (
                <TouchableOpacity
                  key={mealType}
                  style={[
                    styles.filterButton,
                    selectedMealType === mealType && styles.filterButtonSelected
                  ]}
                  onPress={() => {
                    setSelectedMealType(mealType);
                    loadRecommendations(true); // Skip menu fetch, just filter existing data
                  }}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedMealType === mealType && styles.filterButtonTextSelected
                  ]}>
                    {mealType || 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Current Meal Suggestion */}
        {!selectedMealType && (
          <View style={styles.currentMealContainer}>
            <Text style={styles.currentMealText}>
              Current meal time: {getCurrentMealType()}
            </Text>
            <TouchableOpacity
              style={styles.currentMealButton}
              onPress={() => {
                setSelectedMealType(getCurrentMealType());
                loadRecommendations();
              }}
            >
              <Text style={styles.currentMealButtonText}>
                Show {getCurrentMealType()} Options
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recommendations */}
        {loading && recommendations.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading recommendations...</Text>
          </View>
        ) : recommendations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recommendations available</Text>
            <Text style={styles.emptySubtext}>
              Try refreshing or check your preferences
            </Text>
            <TouchableOpacity
              style={styles.preferencesButton}
              onPress={() => navigation.navigate('Preferences')}
            >
              <Text style={styles.preferencesButtonText}>Edit Preferences</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>
              Top Recommendations {selectedMealType && `for ${selectedMealType}`}
            </Text>
            {recommendations.map((rec, index) => renderRecommendation(rec, index))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B31B1B',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  filterButtonSelected: {
    backgroundColor: '#B31B1B',
    borderColor: '#B31B1B',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  filterButtonTextSelected: {
    color: '#fff',
  },
  currentMealContainer: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  currentMealText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  currentMealButton: {
    backgroundColor: '#B31B1B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  currentMealButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  preferencesButton: {
    backgroundColor: '#B31B1B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  preferencesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eateryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B31B1B',
    flex: 1,
  },
  mealType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scoreContainer: {
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  itemsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  menuItem: {
    marginBottom: 6,
  },
  itemName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  itemCategory: {
    fontSize: 13,
    color: '#666',
  },
  moreItems: {
    fontSize: 13,
    color: '#B31B1B',
    fontStyle: 'italic',
    flex: 1,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthyBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  healthyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tapToView: {
    fontSize: 12,
    color: '#B31B1B',
    fontWeight: '600',
  },
});
