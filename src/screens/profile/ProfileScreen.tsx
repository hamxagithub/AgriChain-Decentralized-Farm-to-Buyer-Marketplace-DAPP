import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { Card, Header, Section, Button, Divider, ErrorMessage } from '../../components/UI';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileScreen: React.FC = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { account, isConnected, connectWallet, isLoading, error } = useBlockchain();
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for development
  const [farmerStats] = useState({
    totalListings: 5,
    activeSales: 2,
    completedSales: 12,
    totalRevenue: '0.125 ETH',
    rating: 4.8,
    reviewCount: 15
  });
  
  const [buyerStats] = useState({
    totalPurchases: 8,
    activePurchases: 1,
    completedPurchases: 7,
    totalSpent: '0.078 ETH',
    paymentSuccess: '100%'
  });
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Here you would fetch fresh data from the blockchain
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Disconnect wallet (mock function)
  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive', 
          onPress: () => {
            // In a real app, you would disconnect the wallet here
            Alert.alert('Wallet disconnected');
          }
        }
      ]
    );
  };
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <Header 
        title="My Profile"
        rightComponent={
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <Ionicons 
              name={isDarkMode ? 'sunny-outline' : 'moon-outline'} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
        }
      />
      
      {error && <ErrorMessage message={error} />}
      
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '30' }]}>
            <Text style={[styles.avatarLetter, { color: colors.primary }]}>
              {account ? account.substring(2, 3).toUpperCase() : 'A'}
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {account ? formatAddress(account) : 'Not Connected'}
            </Text>
            <View style={styles.walletTag}>
              <Ionicons name="wallet-outline" size={14} color={colors.primary} />
              <Text style={[styles.walletText, { color: colors.primary }]}>
                Ethereum Wallet
              </Text>
            </View>
          </View>
        </View>
        
        <Divider />
        
        <View style={styles.profileActions}>
          {isConnected ? (
            <Button
              title="Disconnect Wallet"
              onPress={handleDisconnect}
              type="outline"
              style={{ flex: 1 }}
            />
          ) : (
            <Button
              title="Connect Wallet"
              onPress={connectWallet}
              loading={isLoading}
              style={{ flex: 1 }}
            />
          )}
          
          <TouchableOpacity style={[styles.copyButton, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="copy-outline" size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </Card>
      
      <Section title="Farmer Stats">
        <Card>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {farmerStats.totalListings}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray }]}>
                Total Listings
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {farmerStats.activeSales}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray }]}>
                Active Sales
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {farmerStats.completedSales}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray }]}>
                Completed Sales
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {farmerStats.totalRevenue}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray }]}>
                Total Revenue
              </Text>
            </View>
          </View>
          
          <Divider />
          
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map(i => (
                <Ionicons 
                  key={i}
                  name={i <= Math.round(farmerStats.rating) ? 'star' : 'star-outline'} 
                  size={20} 
                  color={colors.warning} 
                  style={{ marginRight: 4 }}
                />
              ))}
            </View>
            <Text style={[styles.ratingText, { color: colors.text }]}>
              {farmerStats.rating} ({farmerStats.reviewCount} reviews)
            </Text>
          </View>
        </Card>
      </Section>
      
      <Section title="Buyer Stats">
        <Card>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {buyerStats.totalPurchases}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray }]}>
                Total Purchases
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {buyerStats.activePurchases}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray }]}>
                Active Purchases
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {buyerStats.completedPurchases}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray }]}>
                Completed Purchases
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {buyerStats.totalSpent}
              </Text>
              <Text style={[styles.statLabel, { color: colors.gray }]}>
                Total Spent
              </Text>
            </View>
          </View>
          
          <Divider />
          
          <View style={styles.paymentContainer}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.success} />
            <Text style={[styles.paymentText, { color: colors.success }]}>
              {buyerStats.paymentSuccess} Payment Success Rate
            </Text>
          </View>
        </Card>
      </Section>
      
      <Section title="Settings">
        <Card>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="language-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Language</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="shield-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="information-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>About</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>
        </Card>
      </Section>
      
      <Text style={[styles.version, { color: colors.gray }]}>
        AgriChain v1.0.0
      </Text>
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
  themeToggle: {
    padding: 4,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  walletTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletText: {
    marginLeft: 4,
    fontSize: 14,
  },
  profileActions: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '45%',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  paymentText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  version: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ProfileScreen;
