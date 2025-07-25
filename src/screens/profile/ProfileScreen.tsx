import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  Image,
  TextInput,
  Switch,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { useChat } from '../../context/ChatContext';
import { Card, Header, Section, Button, Divider, ErrorMessage } from '../../components/UI';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { 
    account, 
    isConnected, 
    connectWallet, 
    disconnectWallet,
    userProfile,
    tokenBalances,
    updateUserProfile,
    isLoading, 
    error 
  } = useBlockchain();
  const { unreadCount } = useChat();
  
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<any>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isFarmer, setIsFarmer] = useState(true);
  
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
  
  // Initialize editable profile when user profile changes
  useEffect(() => {
    if (userProfile) {
      setEditableProfile({
        name: userProfile.name || '',
        email: userProfile.email || '',
        avatar: userProfile.avatar || ''
      });
    }
  }, [userProfile]);
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh token balances and profile info
    try {
      // In a real implementation, we would fetch updated data here
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle profile edit
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  // Handle profile save
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateUserProfile(editableProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };
  
  // Cancel profile editing
  const handleCancelEdit = () => {
    if (userProfile) {
      setEditableProfile({
        name: userProfile.name || '',
        email: userProfile.email || '',
        avatar: userProfile.avatar || ''
      });
    }
    setIsEditing(false);
  };
  
  // Disconnect wallet
  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect AppKitWallet',
      'Are you sure you want to disconnect your wallet? You will need to reconnect to access the marketplace.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await disconnectWallet();
              navigation.navigate('Welcome' as never);
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect wallet. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  // Toggle between farmer and buyer roles
  const toggleRole = () => {
    setIsFarmer(!isFarmer);
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
                AppKitWallet
              </Text>
            </View>
          </View>
        </View>
        
        <Divider />
        
        {isConnected && tokenBalances && (
          <>
            <Divider />
            <View style={styles.balanceContainer}>
              <Text style={[styles.balanceLabel, { color: colors.gray }]}>Wallet Balance:</Text>
              <View style={styles.balanceRow}>
                {tokenBalances.map((token, index) => (
                  <View key={index} style={styles.tokenBalance}>
                    <Text style={[styles.tokenAmount, { color: colors.text }]}>
                      {token.balance}
                    </Text>
                    <Text style={[styles.tokenSymbol, { color: colors.primary }]}>
                      {token.symbol}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
        
        <View style={styles.profileActions}>
          {isConnected ? (
            <Button
              title="Disconnect AppKitWallet"
              onPress={handleDisconnect}
              type="outline"
              style={{ flex: 1 }}
            />
          ) : (
            <Button
              title="Connect AppKitWallet"
              onPress={connectWallet}
              loading={isLoading}
              style={{ flex: 1 }}
            />
          )}
          
          <TouchableOpacity 
            style={[styles.copyButton, { backgroundColor: colors.secondary + '20' }]}
            onPress={() => {
              if (account) {
                // In a real app, you would copy the address to clipboard
                Alert.alert('Copied', 'Wallet address copied to clipboard');
              }
            }}
          >
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
      
      <Section title="Profile Information">
        {isConnected && !isEditing && (
          <TouchableOpacity 
            onPress={handleEditProfile} 
            style={{ position: 'absolute', right: 16, top: 16 }}
          >
            <Ionicons name="pencil-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
        <Card>
          {isEditing ? (
            <View style={styles.editFormContainer}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.gray }]}>Name</Text>
                <TextInput 
                  style={[
                    styles.formInput, 
                    { 
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.card 
                    }
                  ]}
                  value={editableProfile?.name}
                  onChangeText={(text) => setEditableProfile({...editableProfile, name: text})}
                  placeholder="Your name"
                  placeholderTextColor={colors.gray}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.gray }]}>Email</Text>
                <TextInput 
                  style={[
                    styles.formInput, 
                    { 
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.card 
                    }
                  ]}
                  value={editableProfile?.email}
                  onChangeText={(text) => setEditableProfile({...editableProfile, email: text})}
                  placeholder="Your email"
                  placeholderTextColor={colors.gray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.editActions}>
                <Button 
                  title="Cancel" 
                  onPress={handleCancelEdit}
                  type="outline"
                  style={{ flex: 1, marginRight: 8 }} 
                />
                <Button 
                  title="Save" 
                  onPress={handleSaveProfile}
                  loading={savingProfile}
                  style={{ flex: 1 }} 
                />
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.profileDetailItem}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
                <Text style={[styles.profileDetailLabel, { color: colors.gray }]}>Name:</Text>
                <Text style={[styles.profileDetailValue, { color: colors.text }]}>
                  {userProfile?.name || 'Not set'}
                </Text>
              </View>
              
              <Divider />
              
              <View style={styles.profileDetailItem}>
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
                <Text style={[styles.profileDetailLabel, { color: colors.gray }]}>Email:</Text>
                <Text style={[styles.profileDetailValue, { color: colors.text }]}>
                  {userProfile?.email || 'Not set'}
                </Text>
              </View>
              
              <Divider />
              
              <View style={styles.profileDetailItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={[styles.profileDetailLabel, { color: colors.gray }]}>Member Since:</Text>
                <Text style={[styles.profileDetailValue, { color: colors.text }]}>
                  {/* Use a placeholder date for now */}
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </Card>
      </Section>
      
      <Section title="Account Type">
        <Card>
          <View style={styles.roleToggleContainer}>
            <Text style={[styles.roleLabel, { color: colors.text }]}>
              I am a {isFarmer ? 'Farmer' : 'Buyer'}
            </Text>
            <View style={styles.roleToggleRow}>
              <Text style={[styles.roleText, { color: isFarmer ? colors.primary : colors.gray }]}>Farmer</Text>
              <Switch
                value={!isFarmer}
                onValueChange={toggleRole}
                trackColor={{ false: colors.primary + '50', true: colors.secondary + '50' }}
                thumbColor={isFarmer ? colors.primary : colors.secondary}
              />
              <Text style={[styles.roleText, { color: !isFarmer ? colors.secondary : colors.gray }]}>Buyer</Text>
            </View>
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
  balanceContainer: {
    padding: 16,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tokenBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  tokenAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Profile details styles
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  profileDetailLabel: {
    fontSize: 14,
    marginLeft: 12,
    width: 100,
  },
  profileDetailValue: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  // Form styles for profile editing
  editFormContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  // Role toggle styles
  roleToggleContainer: {
    padding: 16,
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  roleToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 16,
    marginHorizontal: 12,
  },
});

export default ProfileScreen;
