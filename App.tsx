/**
 * AgriChain - Decentralized Farm-to-Buyer Marketplace
 * A React Native app connecting farmers directly to buyers using blockchain technology
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from './src/context/ThemeContext';
import { BlockchainProvider } from './src/context/BlockchainContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <BlockchainProvider>
            <StatusBar 
              barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
              backgroundColor="transparent"
              translucent
            />
            <AppNavigator />
          </BlockchainProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
