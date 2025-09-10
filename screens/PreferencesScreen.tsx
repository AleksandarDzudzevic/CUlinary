import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { RecommendationService } from '../services/recommendations';
import { UserPreferences } from '../types/database';

interface PreferencesScreenProps {
  navigation: any;
  route?: any;
}

const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
];

const DINING_HALLS = [
  'North Star Dining Room',
  'Okenshields',
  'Morison Dining',
  'Risley Dining',
  'Becker House Dining',
  'Cook House Dining',
  'Keeton House Dining',
  'Rose House Dining',
  'Flora Rose House',
];

const CUISINES = [
  'American',
  'Asian',
  'Italian',
  'Mexican',
  'Mediterranean',
  'Indian',
  'Chinese',
  'Japanese',
  'Thai',
  'Pizza',
  'Salads',
  'Sandwiches',
];

const CAMPUS_LOCATIONS = [
  'North Campus',
  'Central Campus',
  'West Campus',
  'Collegetown',
];

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietary_restrictions: [],
    favorite_dining_halls: [],
    preferred_cuisines: [],
    campus_location: 'Central Campus',
  });

  const isInitialSetup = route?.params?.initialSetup || false;

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    if (!user) return;
    
    const userPrefs = await RecommendationService.getUserPreferences(user.id);
    if (userPrefs) {
      setPreferences(userPrefs);
    }
  };

  const toggleArrayItem = (array: string[], item: string): string[] => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handleSave = async () => {
    if (!user) return;

    if (preferences.campus_location === '') {
      Alert.alert('Error', 'Please select your campus location');
      return;
    }

    setLoading(true);
    try {
      const success = await RecommendationService.saveUserPreferences(user.id, preferences);
      if (success) {
        Alert.alert('Success', 'Preferences saved!', [
          {
            text: 'OK',
            onPress: () => {
              if (isInitialSetup) {
                // Navigate to main app
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainApp' }],
                });
              } else {
                navigation.goBack();
              }
            }
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to save preferences');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderToggleSection = (
    title: string,
    items: string[],
    selectedItems: string[],
    onToggle: (item: string) => void
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsGrid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.option,
              selectedItems.includes(item) && styles.optionSelected
            ]}
            onPress={() => onToggle(item)}
          >
            <Text style={[
              styles.optionText,
              selectedItems.includes(item) && styles.optionTextSelected
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isInitialSetup ? 'Set Up Your Preferences' : 'Edit Preferences'}
        </Text>
        <Text style={styles.subtitle}>
          Help us recommend the best dining options for you
        </Text>

        {/* Campus Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campus Location *</Text>
          <View style={styles.optionsGrid}>
            {CAMPUS_LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.option,
                  preferences.campus_location === location && styles.optionSelected
                ]}
                onPress={() => setPreferences(prev => ({ ...prev, campus_location: location }))}
              >
                <Text style={[
                  styles.optionText,
                  preferences.campus_location === location && styles.optionTextSelected
                ]}>
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Restrictions */}
        {renderToggleSection(
          'Dietary Restrictions',
          DIETARY_RESTRICTIONS,
          preferences.dietary_restrictions,
          (item) => setPreferences(prev => ({
            ...prev,
            dietary_restrictions: toggleArrayItem(prev.dietary_restrictions, item)
          }))
        )}

        {/* Favorite Dining Halls */}
        {renderToggleSection(
          'Favorite Dining Halls',
          DINING_HALLS,
          preferences.favorite_dining_halls,
          (item) => setPreferences(prev => ({
            ...prev,
            favorite_dining_halls: toggleArrayItem(prev.favorite_dining_halls, item)
          }))
        )}

        {/* Preferred Cuisines */}
        {renderToggleSection(
          'Preferred Cuisines',
          CUISINES,
          preferences.preferred_cuisines,
          (item) => setPreferences(prev => ({
            ...prev,
            preferred_cuisines: toggleArrayItem(prev.preferred_cuisines, item)
          }))
        )}

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B31B1B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  optionSelected: {
    backgroundColor: '#B31B1B',
    borderColor: '#B31B1B',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#B31B1B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
