import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  type = 'primary',
  disabled = false,
  loading = false,
  style
}) => {
  const { colors, isDarkMode } = useTheme();
  
  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
    }
  };
  
  const getTextStyle = () => {
    switch (type) {
      case 'primary':
      case 'secondary':
        return {
          color: '#FFFFFF',
        };
      case 'outline':
      case 'text':
        return {
          color: colors.primary,
        };
      default:
        return {
          color: '#FFFFFF',
        };
    }
  };
  
  const buttonStyles = [
    styles.button,
    getButtonStyle(),
    disabled && { opacity: 0.6 },
    style
  ];
  
  const textStyles = [
    styles.text,
    getTextStyle(),
    disabled && { opacity: 0.6 }
  ];
  
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={type === 'outline' || type === 'text' ? colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

interface CardProps {
  children: React.ReactNode;
  style?: any;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
};

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, rightComponent }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.headerSubtitle, { color: colors.gray }]}>{subtitle}</Text>
        )}
      </View>
      {rightComponent}
    </View>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children, action }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
};

interface DividerProps {
  style?: any;
}

export const Divider: React.FC<DividerProps> = ({ style }) => {
  const { colors } = useTheme();
  
  return <View style={[styles.divider, { backgroundColor: colors.border }, style]} />;
};

interface ErrorMessageProps {
  message: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  
  const { colors } = useTheme();
  
  return (
    <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
      <Text style={[styles.errorText, { color: colors.error }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

// EmptyState Component
interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  message, 
  action 
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[emptyStateStyles.container, { backgroundColor: colors.background }]}>
      <Text style={[emptyStateStyles.icon, { color: colors.gray }]}>
        📱
      </Text>
      <Text style={[emptyStateStyles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[emptyStateStyles.message, { color: colors.gray }]}>{message}</Text>
      {action && (
        <Button 
          title={action.label}
          onPress={action.onPress}
          style={emptyStateStyles.action}
        />
      )}
    </View>
  );
};

const emptyStateStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  action: {
    marginTop: 16,
  },
});
