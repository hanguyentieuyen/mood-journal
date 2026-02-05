import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { RootStackParamList } from './src/types';
import { theme } from './src/constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.light.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="AddEntry"
          component={AddEntryScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
        <Stack.Screen name="Stats" component={AnalyticsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
