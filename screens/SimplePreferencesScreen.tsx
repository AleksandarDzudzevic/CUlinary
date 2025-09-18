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

const CAMPUS_LOCATIONS = [
  'North Campus',
  'Central Campus', 
  'West Campus',
  'Collegetown'
];

const DINING_HALLS = [
  'Becker House Dining',
  'Cook House Dining',
  'Rose House Dining',
  'Keeton House Dining',
  'Flora Rose House',
  'Carl Becker House',
  'Hans Bethe House',
  'Morrison Dining',
  'Risley Dining Room',
  'North Star Dining Room',
  'Okenshields'
];

interface SimplePreferencesScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialSetup?: boolean;
    };
  };
}

export const SimplePreferencesScreen: React.FC<SimplePreferencesScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietary_restrictions: [],
    favorite_dining_halls: [],
    preferred_cuisines: [],
    campus_location: '',
  });
  const [loading, setLoading] = useState(false);
  const isInitialSetup = route?.params?.initialSetup || false;

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const userPrefs = await RecommendationService.getUserPreferences(user.id);
      if (userPrefs) {
        setPreferences(userPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const selectCampusLocation = (location: string) => {
    setPreferences(prev => ({
      ...prev,
      campus_location: location
    }));
  };

  const toggleDiningHall = (hall: string) => {
    setPreferences(prev => ({
      ...prev,
      favorite_dining_halls: prev.favorite_dining_halls.includes(hall)
        ? prev.favorite_dining_halls.filter(h => h !== hall)
        : [...prev.favorite_dining_halls, hall]
    }));
  };

  const savePreferences = async () => {
    if (!user) return;

    if (!preferences.campus_location) {
      Alert.alert('Required Field', 'Please select your campus location.');
      return;
    }

    if (preferences.favorite_dining_halls.length === 0) {
      Alert.alert('Required Field', 'Please select at least one dining hall.');
      return;
    }

    setLoading(true);
    try {
      const success = await RecommendationService.saveUserPreferences(user.id, preferences);
      if (success) {
        if (isInitialSetup) {
          Alert.alert('Welcome!', 'Your basic preferences have been saved. You can set detailed food preferences in the ML Recommendations section.');
        } else {
          Alert.alert('Success', 'Your preferences have been updated!');
        }
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to save preferences. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Basic Preferences</Text>
          <Text style={styles.subtitle}>
            Set your campus location and favorite dining halls
          </Text>
        </View>

        {/* Campus Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campus Location</Text>
          <Text style={styles.sectionSubtitle}>Where do you primarily live/study?</Text>
          {CAMPUS_LOCATIONS.map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.optionRow,
                preferences.campus_location === location && styles.optionRowSelected
              ]}
              onPress={() => selectCampusLocation(location)}
            >
              <View style={[
                styles.radio,
                preferences.campus_location === location && styles.radioSelected
              ]}>
                {preferences.campus_location === location && (
                  <View style={styles.radioDot} />
                )}
              </View>
              <Text style={[
                styles.optionLabel,
                preferences.campus_location === location && styles.optionLabelSelected
              ]}>
                {location}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Favorite Dining Halls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Dining Halls</Text>
          <Text style={styles.sectionSubtitle}>Select your preferred dining locations</Text>
          {DINING_HALLS.map((hall) => (
            <TouchableOpacity
              key={hall}
              style={[
                styles.optionRow,
                preferences.favorite_dining_halls.includes(hall) && styles.optionRowSelected
              ]}
              onPress={() => toggleDiningHall(hall)}
            >
              <View style={[
                styles.checkbox,
                preferences.favorite_dining_halls.includes(hall) && styles.checkboxChecked
              ]}>
                {preferences.favorite_dining_halls.includes(hall) && (
                  <Text style={styles.checkboxText}>✓</Text>
                )}
              </View>
              <Text style={[
                styles.optionLabel,
                preferences.favorite_dining_halls.includes(hall) && styles.optionLabelSelected
              ]}>
                {hall}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={savePreferences}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : isInitialSetup ? 'Get Started' : 'Save Preferences'}
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
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B31B1B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  optionRowSelected: {
    backgroundColor: '#f0f8ff',
    borderColor: '#B31B1B',
    borderWidth: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#B31B1B',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B31B1B',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#B31B1B',
    borderColor: '#B31B1B',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  optionLabelSelected: {
    color: '#B31B1B',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#B31B1B',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
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
