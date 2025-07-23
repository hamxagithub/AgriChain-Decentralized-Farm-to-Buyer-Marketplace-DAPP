import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gray: string;
}

// Light theme colors
const lightColors: ThemeColors = {
  primary: '#34A853', // Green for agriculture
  secondary: '#4285F4', // Blue for tech/blockchain
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#202124',
  border: '#E1E3E6',
  notification: '#EA4335',
  success: '#34A853',
  warning: '#FBBC04',
  error: '#EA4335',
  info: '#4285F4',
  gray: '#70757A'
};

// Dark theme colors
const darkColors: ThemeColors = {
  primary: '#34A853', // Keep the same green
  secondary: '#4285F4', // Keep the same blue
  background: '#202124',
  card: '#303134',
  text: '#E8EAED',
  border: '#5F6368',
  notification: '#EA4335',
  success: '#34A853',
  warning: '#FBBC04',
  error: '#EA4335',
  info: '#4285F4',
  gray: '#9AA0A6'
};

// Theme context type
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(deviceColorScheme === 'dark');
  
  // Update theme when device theme changes
  useEffect(() => {
    setIsDarkMode(deviceColorScheme === 'dark');
  }, [deviceColorScheme]);
  
  // Function to toggle between light and dark theme
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  // Get current theme colors
  const colors = isDarkMode ? darkColors : lightColors;
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
