import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import CategoryListingScreen from './src/screens/CategoryListingScreen';
import PackageBuilderScreen from './src/screens/PackageBuilderScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#e60000' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: '#fff' }
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'TRAVEL LOUNGE', headerShown: false }}
          />
          <Stack.Screen
            name="CategoryListing"
            component={CategoryListingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Details"
            component={ProductDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PackageBuilder"
            component={PackageBuilderScreen}
            options={{ title: 'Build Your Package', headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
