import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts/AppContext';
import AppNavigation from './src/navigation/AppNavigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppNavigation />
        <StatusBar style="light" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
