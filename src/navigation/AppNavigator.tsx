import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ListCropScreen from '../screens/farmer/ListCropScreen';
import CropDetailScreen from '../screens/marketplace/CropDetailScreen';
import MakeOfferScreen from '../screens/buyer/MakeOfferScreen';
import TrackOrderScreen from '../screens/shared/TrackOrderScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import FarmerOrdersScreen from '../screens/farmer/FarmerOrdersScreen';
import BuyerOrdersScreen from '../screens/buyer/BuyerOrdersScreen';
import ChatScreen from '../screens/chat/ChatScreen';

// Define navigation types
export type RootStackParamList = {
  Welcome: undefined;
  FarmerTab: undefined | { screen: keyof FarmerTabParamList };
  BuyerTab: undefined | { screen: keyof BuyerTabParamList };
  ListCrop: undefined;
  CropDetail: { listingId: number };
  MakeOffer: { listingId: number };
  TrackOrder: { orderId: number | string };
  Chat: { recipientId: string; recipientName: string; listingId?: number };
};

export type FarmerTabParamList = {
  FarmerHome: undefined;
  Marketplace: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type BuyerTabParamList = {
  BuyerHome: undefined;
  Marketplace: undefined;
  Orders: undefined;
  Profile: undefined;
};

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const FarmerTab = createBottomTabNavigator<FarmerTabParamList>();
const BuyerTab = createBottomTabNavigator<BuyerTabParamList>();

// Farmer tab navigator
const FarmerTabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <FarmerTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          
          if (route.name === 'FarmerHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: { backgroundColor: colors.card },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
      })}
    >
      <FarmerTab.Screen 
        name="FarmerHome" 
        component={FarmerHomeScreen}
        options={{ title: 'Home' }}
      />
      <FarmerTab.Screen 
        name="Marketplace" 
        component={MarketplaceScreen} 
      />
      <FarmerTab.Screen 
        name="Orders" 
        component={FarmerOrdersScreen} 
      />
      <FarmerTab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </FarmerTab.Navigator>
  );
};

// Buyer tab navigator
const BuyerTabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <BuyerTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          
          if (route.name === 'BuyerHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: { backgroundColor: colors.card },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
      })}
    >
      <BuyerTab.Screen 
        name="BuyerHome" 
        component={BuyerHomeScreen}
        options={{ title: 'Home' }}
      />
      <BuyerTab.Screen 
        name="Marketplace" 
        component={MarketplaceScreen} 
      />
      <BuyerTab.Screen 
        name="Orders" 
        component={BuyerOrdersScreen} 
      />
      <BuyerTab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </BuyerTab.Navigator>
  );
};

// Main app navigator
const AppNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="FarmerTab" 
          component={FarmerTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="BuyerTab" 
          component={BuyerTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ListCrop" 
          component={ListCropScreen}
          options={{ title: 'List New Crop' }}
        />
        <Stack.Screen 
          name="CropDetail" 
          component={CropDetailScreen}
          options={{ title: 'Crop Details' }}
        />
        <Stack.Screen 
          name="MakeOffer" 
          component={MakeOfferScreen}
          options={{ title: 'Make an Offer' }}
        />
        <Stack.Screen 
          name="TrackOrder" 
          component={TrackOrderScreen}
          options={{ title: 'Track Order' }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ title: 'Chat' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
