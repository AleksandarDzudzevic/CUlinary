import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AIRecommendationService } from '../services/aiRecommendations';
import { SimplePreferences, AIRecommendation } from '../types/simplePreferences';

type RootStackParamList = {
  MenuDetail: {
    eateryName: string;
    mealType: string;
    menuDate: string;
    items: any[];
    campusArea: string;
    location: string;
    operatingHours: any;
  };
};

const SimpleMLScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [preferences, setPreferences] = useState<SimplePreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Date and meal selection - with debug logging
  const currentDate = new Date().toISOString().split('T')[0];
  console.log('📅 SimpleMLScreen - Current date:', currentDate);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedMealType, setSelectedMealType] = useState('Lunch');
  
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const prefs = await AIRecommendationService.loadPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setPreferences(AIRecommendationService.getDefaultPreferences());
    }
  };

  const savePreferences = async () => {
    if (!user || !preferences) return;
    
    setLoading(true);
    try {
      const success = await AIRecommendationService.savePreferences(user.id, preferences);
      if (success) {
        Alert.alert('Success', 'Preferences saved successfully!');
      } else {
        Alert.alert('Error', 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!user || !preferences) return;
    
    setLoading(true);
    try {
      const recs = await AIRecommendationService.generateAIRecommendations(
        user.id,
        selectedMealType,
        selectedDate
      );
      
      setRecommendations(recs);
      setShowRecommendations(true);
      
      if (recs.length === 0) {
        if (preferences.favorite_dining_halls.length === 0) {
          Alert.alert(
            'Set Favorite Dining Halls First!', 
            'You need to select your favorite dining halls before getting recommendations. Go to Profile → Preferences to set them up.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Go to Profile', 
                onPress: () => navigation.navigate('Profile' as never)
              }
            ]
          );
        } else {
          Alert.alert(
            'No Recommendations', 
            'No recommendations found for your selected preferences and date/meal. Try different preferences or date/meal combinations.'
          );
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      Alert.alert('Error', 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (category: keyof SimplePreferences, key: string) => {
    if (!preferences) return;
    
    setPreferences(prev => {
      if (!prev) return prev;
      
      const categoryData = prev[category];
      if (typeof categoryData === 'object' && categoryData !== null && !Array.isArray(categoryData)) {
        return {
          ...prev,
          [category]: {
            ...categoryData,
            [key]: !(categoryData as any)[key]
          }
        };
      }
      return prev;
    });
  };

  const renderCheckboxSection = (title: string, category: keyof SimplePreferences, items: Record<string, string>) => {
    if (!preferences) return null;
    
    const categoryData = preferences[category];
    if (typeof categoryData !== 'object' || categoryData === null || Array.isArray(categoryData)) {
      return null;
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.checkboxGrid}>
          {Object.entries(items).map(([key, label]) => {
            const isSelected = (categoryData as any)[key] === true;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected
                ]}
                onPress={() => togglePreference(category, key)}
              >
                <Text style={[
                  styles.checkboxText,
                  isSelected && styles.checkboxTextSelected
                ]}>
                  {isSelected ? '✓ ' : ''}{label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderRecommendation = ({ item }: { item: AIRecommendation }) => (
    <View style={styles.recommendationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.diningHallName}>{item.dining_hall}</Text>
        <Text style={styles.mealInfo}>{item.meal_type}</Text>
      </View>
      
      <View style={styles.recommendationContent}>
        <Text style={styles.mainDish}>🍽️ {item.main_dish}</Text>
        {item.side_dish && (
          <Text style={styles.sideDish}>🥗 {item.side_dish}</Text>
        )}
        <Text style={styles.aiMessage}>{item.message}</Text>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to use recommendations.</Text>
      </View>
    );
  }

  if (!preferences) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  if (showRecommendations) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../assets/CUlinary_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>AI Recommendations</Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowRecommendations(false)}
        >
          <Text style={styles.backButtonText}>← Back to Preferences</Text>
        </TouchableOpacity>

        {/* Current Selection */}
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {selectedMealType} on {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        {/* Recommendations */}
        <FlatList
          data={recommendations}
          renderItem={renderRecommendation}
          keyExtractor={(item, index) => `${item.dining_hall}-${index}`}
          contentContainerStyle={styles.recommendationsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recommendations found</Text>
              <Text style={styles.emptySubtext}>
                Make sure you have selected preferences and favorite dining halls
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/CUlinary_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Food Preferences</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Select what you're in the mood for, and get AI-powered meal recommendations!
        </Text>

        {/* Warning if no favorite dining halls */}
        {preferences.favorite_dining_halls.length === 0 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Setup Required</Text>
            <Text style={styles.warningText}>
              You need to select your favorite dining halls first. Go to Profile → Preferences to set them up.
            </Text>
            <TouchableOpacity
              style={styles.warningButton}
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <Text style={styles.warningButtonText}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Protein Types */}
        {renderCheckboxSection('Protein Types', 'proteins', {
          chicken: 'Chicken',
          beef: 'Beef',
          pork: 'Pork',
          seafood: 'Seafood',
          vegetarian: 'Vegetarian',
          vegan: 'Vegan',
        })}

        {/* Main Meals */}
        {renderCheckboxSection('Main Meals', 'mainMeals', {
          pizza: 'Pizza',
          pasta: 'Pasta',
          burgers: 'Burgers',
          sandwiches: 'Sandwiches',
          salads: 'Salads',
          stir_fry: 'Stir Fry',
          soup: 'Soup',
          rice_bowls: 'Rice Bowls',
          desserts: 'Desserts',
        })}

        {/* Side Dishes */}
        {renderCheckboxSection('Side Dishes', 'sides', {
          fries: 'Fries',
          vegetables: 'Vegetables',
          rice: 'Rice',
          bread: 'Bread',
          fruit: 'Fruit',
          chips: 'Chips',
        })}

        {/* Meal Focus */}
        {renderCheckboxSection('Meal Focus', 'focus', {
          protein_heavy: 'Protein Heavy',
          low_carb: 'Low Carb',
          healthy: 'Healthy',
          cheat_meal: 'Cheat Meal',
          comfort_food: 'Comfort Food',
          pre_workout: 'Pre-Workout',
          post_workout: 'Post-Workout',
        })}

        {/* Date and Meal Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date & Meal</Text>
          
          {/* Date Selector */}
          <Text style={styles.filterLabel}>Date:</Text>
          <FlatList
            horizontal
            data={dates}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterButton, selectedDate === item && styles.filterButtonActive]}
                onPress={() => setSelectedDate(item)}
              >
                <Text style={[styles.filterButtonText, selectedDate === item && styles.filterButtonTextActive]}>
                  {new Date(item + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />

          {/* Meal Type Selector */}
          <Text style={styles.filterLabel}>Meal:</Text>
          <FlatList
            horizontal
            data={mealTypes}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterButton, selectedMealType === item && styles.filterButtonActive]}
                onPress={() => setSelectedMealType(item)}
              >
                <Text style={[styles.filterButtonText, selectedMealType === item && styles.filterButtonTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={savePreferences}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : '💾 Save Preferences'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recommendButton}
            onPress={generateRecommendations}
            disabled={loading}
          >
            <Text style={styles.recommendButtonText}>
              {loading ? 'Generating...' : '🤖 Get AI Recommendations'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
  },
  warningButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  warningButtonText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  checkbox: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
    minWidth: 100,
  },
  checkboxSelected: {
    borderColor: '#007bff',
    backgroundColor: '#007bff',
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    textAlign: 'center',
  },
  checkboxTextSelected: {
    color: '#fff',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
    marginTop: 15,
  },
  horizontalList: {
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
  buttonContainer: {
    marginTop: 30,
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  recommendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  selectionInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectionText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
    textAlign: 'center',
  },
  recommendationsList: {
    padding: 15,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  diningHallName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  mealInfo: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  recommendationContent: {
    gap: 8,
  },
  mainDish: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  sideDish: {
    fontSize: 14,
    color: '#6c757d',
  },
  aiMessage: {
    fontSize: 14,
    color: '#007bff',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default SimpleMLScreen;
