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

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    if (!user) return;
    
    try {
      const userPrefs = await RecommendationService.getUserPreferences(user.id);
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const renderPreferenceSection = (title: string, items: string[]) => (
    <View style={styles.preferenceSection}>
      <Text style={styles.preferenceSectionTitle}>{title}</Text>
      {items.length > 0 ? (
        <View style={styles.preferenceTags}>
          {items.map((item, index) => (
            <View key={index} style={styles.preferenceTag}>
              <Text style={styles.preferenceTagText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noPreferences}>None selected</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.userInfo}>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.joinDate}>
              Joined {new Date(user?.created_at || '').toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Preferences Summary */}
        <View style={styles.preferencesContainer}>
          <View style={styles.preferencesHeader}>
            <Text style={styles.preferencesTitle}>Your Preferences</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('Preferences')}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {preferences ? (
            <>
              <View style={styles.campusLocationContainer}>
                <Text style={styles.campusLocationLabel}>Campus Location:</Text>
                <Text style={styles.campusLocationValue}>{preferences.campus_location}</Text>
              </View>

              {renderPreferenceSection('Dietary Restrictions', preferences.dietary_restrictions)}
              {renderPreferenceSection('Favorite Dining Halls', preferences.favorite_dining_halls)}
            </>
          ) : (
            <View style={styles.noPreferencesContainer}>
              <Text style={styles.noPreferencesText}>No preferences set</Text>
              <TouchableOpacity
                style={styles.setupButton}
                onPress={() => navigation.navigate('Preferences', { initialSetup: true })}
              >
                <Text style={styles.setupButtonText}>Set Up Preferences</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* App Information */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appInfoTitle}>About CUlinary</Text>
          <Text style={styles.appInfoText}>
            CUlinary helps Cornell students discover personalized dining recommendations 
            based on their preferences, dietary restrictions, and campus location.
          </Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Preferences')}
          >
            <Text style={styles.actionButtonText}>Edit Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={[styles.actionButtonText, styles.signOutButtonText]}>
              Sign Out
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
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B31B1B',
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  email: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#666',
  },
  preferencesContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  preferencesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferencesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#B31B1B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  campusLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  campusLocationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  campusLocationValue: {
    fontSize: 16,
    color: '#B31B1B',
    fontWeight: '500',
  },
  preferenceSection: {
    marginBottom: 16,
  },
  preferenceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  preferenceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: '#B31B1B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  preferenceTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  noPreferences: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  noPreferencesContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noPreferencesText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  setupButton: {
    backgroundColor: '#B31B1B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfoContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#B31B1B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
  },
  signOutButtonText: {
    color: '#fff',
  },
});
