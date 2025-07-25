/**
 * AgriChain - Decentralized Farm-to-Buyer Marketplace
 * A React Native app connecting farmers directly to buyers using blockchain technology
 */

/**
 * AgriChain Farm-to-Buyer Marketplace
 * A decentralized marketplace for agricultural products
 */

import React from 'react';
import {SafeAreaView, StatusBar, useColorScheme} from 'react-native';

// Define our own Colors object instead of importing from NewAppScreen
const Colors = {
  lighter: '#F3F3F3',
  light: '#DAE1E7',
  dark: '#444444',
  darker: '#222222',
};

import AppNavigator from './src/navigation/AppNavigator';
import {ThemeProvider} from './src/context/ThemeContext';
import {BlockchainProvider} from './src/context/BlockchainContext';
import {ChatProvider} from './src/context/ChatContext';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <ThemeProvider>
      <BlockchainProvider>
        <ChatProvider>
          <SafeAreaView style={backgroundStyle}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={backgroundStyle.backgroundColor}
            />
            <AppNavigator />
          </SafeAreaView>
        </ChatProvider>
      </BlockchainProvider>
    </ThemeProvider>
  );
}
