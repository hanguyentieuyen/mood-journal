import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import DayEntriesScreen from './src/screens/DayEntriesScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import WeeklyReviewScreen from './src/screens/WeeklyReviewScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ManageMoodsScreen from './src/screens/ManageMoodsScreen';
import { RootStackParamList } from './src/types';
import { theme } from './src/constants/theme';

import { ThemeProvider, useTheme } from './src/constants/ThemeContext';

import { View } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { colors, themeType } = useTheme();

  const navigationTheme = {
    ...(themeType === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(themeType === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="AddEntry"
            component={AddEntryScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="DayEntries" component={DayEntriesScreen} />
          <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
          <Stack.Screen name="Stats" component={AnalyticsScreen} />
          <Stack.Screen name="WeeklyReview" component={WeeklyReviewScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen 
            name="ManageMoods" 
            component={ManageMoodsScreen} 
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
        <StatusBar style={themeType === 'dark' ? 'light' : 'dark'} />
      </NavigationContainer>
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
