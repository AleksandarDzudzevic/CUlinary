import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SimplePreferencesScreen } from '../screens/SimplePreferencesScreen';
import SimpleMLScreen from '../screens/SimpleMLScreen';
import MenuDetailScreen from '../screens/MenuDetailScreen';
import MenuBrowserScreen from '../screens/MenuBrowserScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ title: 'CUlinary' }}
    />
    <Stack.Screen 
      name="Preferences" 
      component={SimplePreferencesScreen}
      options={{ title: 'Basic Preferences' }}
    />
    <Stack.Screen 
      name="MLPreferences" 
      component={SimpleMLScreen}
      options={{ title: 'ML Recommendations' }}
    />
    <Stack.Screen 
      name="MenuDetail" 
      component={MenuDetailScreen}
      options={{ title: 'Menu Details', headerShown: false }}
    />
  </Stack.Navigator>
);

const MLRecommendationsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MLPreferencesMain" 
      component={SimpleMLScreen}
      options={{ title: 'AI Recommendations' }}
    />
    <Stack.Screen 
      name="MenuDetail" 
      component={MenuDetailScreen}
      options={{ title: 'Menu Details', headerShown: false }}
    />
  </Stack.Navigator>
);

const MenuBrowserStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MenuBrowserMain" 
      component={MenuBrowserScreen}
      options={{ title: 'All Menus' }}
    />
    <Stack.Screen 
      name="MenuDetail" 
      component={MenuDetailScreen}
      options={{ title: 'Menu Details', headerShown: false }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Stack.Screen 
      name="Preferences" 
      component={SimplePreferencesScreen}
      options={{ title: 'Edit Basic Preferences' }}
    />
    <Stack.Screen 
      name="MLPreferences" 
      component={SimpleMLScreen}
      options={{ title: 'ML Recommendations' }}
    />
    <Stack.Screen 
      name="MenuDetail" 
      component={MenuDetailScreen}
      options={{ title: 'Menu Details', headerShown: false }}
    />
  </Stack.Navigator>
);

export const MainStack: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#B31B1B',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
      }}
    >
      <Tab.Screen 
        name="MenuBrowser" 
        component={MenuBrowserStack}
        options={{
          tabBarLabel: 'All Menus',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4, fontWeight: 'bold' }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="MLRecommendations" 
        component={MLRecommendationsStack}
        options={{
          tabBarLabel: 'Recommendations',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4, fontWeight: 'bold' }}>🍽️</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4, fontWeight: 'bold' }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
