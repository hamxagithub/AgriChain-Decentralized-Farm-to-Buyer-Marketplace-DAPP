import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { Card } from '../../components/UI';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { account, isConnected } = useBlockchain();

  const handleDisconnectWallet = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would disconnect the wallet
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // Implement cache clearing logic here
            Alert.alert('Success', 'Cache cleared successfully');
          }
        }
      ]
    );
  };

  const SettingItem: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }> = ({ icon, title, subtitle, onPress, rightElement, showArrow = true }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={colors.text} style={styles.settingIcon} />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.gray }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={16} color={colors.gray} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      {/* Account Section */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        
        <SettingItem
          icon="wallet-outline"
          title="Wallet"
          subtitle={account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Not connected'}
          onPress={account ? handleDisconnectWallet : undefined}
          showArrow={!!account}
        />
        
        <SettingItem
          icon="person-outline"
          title="Profile"
          subtitle="Manage your profile information"
          onPress={() => {
            // Navigate to profile edit screen
            Alert.alert('Coming Soon', 'Profile editing will be available in the next version');
          }}
        />
      </Card>

      {/* Appearance Section */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        
        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          subtitle="Toggle dark theme"
          rightElement={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDarkMode ? '#FFFFFF' : colors.gray}
            />
          }
          showArrow={false}
        />
      </Card>

      {/* Data & Privacy Section */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data & Privacy</Text>
        
        <SettingItem
          icon="trash-outline"
          title="Clear Cache"
          subtitle="Clear stored app data"
          onPress={handleClearCache}
        />
        
        <SettingItem
          icon="shield-outline"
          title="Privacy Policy"
          subtitle="View our privacy policy"
          onPress={() => {
            Alert.alert('Coming Soon', 'Privacy policy will be available soon');
          }}
        />
        
        <SettingItem
          icon="document-text-outline"
          title="Terms of Service"
          subtitle="View terms and conditions"
          onPress={() => {
            Alert.alert('Coming Soon', 'Terms of service will be available soon');
          }}
        />
      </Card>

      {/* Support Section */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        
        <SettingItem
          icon="help-circle-outline"
          title="Help & FAQ"
          subtitle="Get help and answers"
          onPress={() => {
            Alert.alert('Coming Soon', 'Help section will be available soon');
          }}
        />
        
        <SettingItem
          icon="mail-outline"
          title="Contact Support"
          subtitle="Get in touch with our team"
          onPress={() => {
            Alert.alert('Contact Support', 'Email us at support@agrichain.com');
          }}
        />
        
        <SettingItem
          icon="star-outline"
          title="Rate App"
          subtitle="Rate us on the app store"
          onPress={() => {
            Alert.alert('Coming Soon', 'App store rating will be available after release');
          }}
        />
      </Card>

      {/* About Section */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        
        <SettingItem
          icon="information-circle-outline"
          title="App Version"
          subtitle="1.0.0"
          showArrow={false}
        />
        
        <SettingItem
          icon="code-outline"
          title="Build Info"
          subtitle="Built with React Native"
          showArrow={false}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    padding: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SettingsScreen;
