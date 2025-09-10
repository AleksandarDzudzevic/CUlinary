import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MenuItem } from '../types/database';

export const MenuDetailScreen = ({ navigation, route }: any) => {
  const { eateryName, mealType, menuDate, items, campusArea, location, operatingHours } = route.params;

  // Group items by category
  const itemsByCategory = items.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderMenuItem = (item: MenuItem) => (
    <View key={item.id} style={styles.menuItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.healthy && (
          <View style={styles.healthyBadge}>
            <Text style={styles.healthyText}>Healthy</Text>
          </View>
        )}
      </View>
      
      {item.ingredients && item.ingredients.length > 0 && (
        <Text style={styles.ingredients}>
          Ingredients: {item.ingredients.join(', ')}
        </Text>
      )}
      
      {item.allergens && item.allergens.length > 0 && (
        <Text style={styles.allergens}>
          Allergens: {item.allergens.join(', ')}
        </Text>
      )}
    </View>
  );

  const renderCategory = (category: string, categoryItems: MenuItem[]) => (
    <View key={category} style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <View style={styles.categoryItems}>
        {categoryItems
          .sort((a, b) => (a.sortIdx || 0) - (b.sortIdx || 0))
          .map(renderMenuItem)}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.eateryName}>{eateryName}</Text>
          <Text style={styles.mealInfo}>{mealType} • {formatDate(menuDate)}</Text>
          
          <View style={styles.locationInfo}>
            <Text style={styles.campusArea}>{campusArea}</Text>
            {location && <Text style={styles.location}>{location}</Text>}
            <Text style={styles.hours}>
              {operatingHours.start} - {operatingHours.end}
            </Text>
          </View>
        </View>

        {/* Menu Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Menu Summary</Text>
          <Text style={styles.summaryText}>
            {items.length} items across {Object.keys(itemsByCategory).length} categories
          </Text>
          <Text style={styles.summaryText}>
            {items.filter((item: MenuItem) => item.healthy).length} healthy options available
          </Text>
        </View>

        {/* Menu Categories */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Full Menu</Text>
          {Object.entries(itemsByCategory)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, categoryItems]) => 
              renderCategory(category, categoryItems as MenuItem[])
            )}
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
  header: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#B31B1B',
    fontWeight: '600',
  },
  eateryName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B31B1B',
    marginBottom: 8,
  },
  mealInfo: {
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
  },
  locationInfo: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  campusArea: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  hours: {
    fontSize: 14,
    color: '#B31B1B',
    marginTop: 4,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B31B1B',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#B31B1B',
  },
  categoryItems: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#B31B1B',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  healthyBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  healthyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ingredients: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  allergens: {
    fontSize: 13,
    color: '#dc3545',
    marginTop: 2,
    fontWeight: '500',
  },
});
