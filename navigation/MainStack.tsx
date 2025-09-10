import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PreferencesScreen } from '../screens/PreferencesScreen';
import { MenuDetailScreen } from '../screens/MenuDetailScreen';

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
      component={PreferencesScreen}
      options={{ title: 'Preferences' }}
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
      component={PreferencesScreen}
      options={{ title: 'Edit Preferences' }}
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
        name="Home" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            // Using a simple text icon for lightweight approach
            <Text style={{ color, fontSize: size - 4, fontWeight: 'bold' }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            // Using a simple text icon for lightweight approach
            <Text style={{ color, fontSize: size - 4, fontWeight: 'bold' }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
