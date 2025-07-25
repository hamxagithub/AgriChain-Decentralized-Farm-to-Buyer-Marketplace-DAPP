import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button, ErrorMessage } from '../components/UI';
import { useTheme } from '../context/ThemeContext';
import { useBlockchain } from '../context/BlockchainContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { colors } = useTheme();
  const { connectWallet, isConnected, isLoading, error, userProfile } = useBlockchain();
  const [userType, setUserType] = useState<'farmer' | 'buyer' | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
  
  // Check if user is already connected
  useEffect(() => {
    if (isConnected && userProfile) {
      // If user has a role set, navigate to appropriate screen
      if (userProfile.name && userProfile.name.includes('Farmer')) {
        setUserType('farmer');
      } else if (userProfile.name && userProfile.name.includes('Buyer')) {
        setUserType('buyer');
      }
    }
  }, [isConnected, userProfile]);
  
  const handleConnectWallet = async () => {
    if (!userType) {
      Alert.alert('Please select', 'Are you a farmer or buyer?');
      return;
    }
    
    setConnectingWallet(true);
    try {
      const success = await connectWallet();
      if (success) {
        // Navigate based on selected user type
        if (userType === 'farmer') {
          navigation.navigate('FarmerTab');
        } else if (userType === 'buyer') {
          navigation.navigate('BuyerTab');
        }
      } else {
        Alert.alert('Connection Failed', 'Failed to connect to AppKitWallet. Please try again.');
      }
    } catch (err) {
      console.error('Error during wallet connection:', err);
      Alert.alert('Connection Error', 'An unexpected error occurred while connecting to AppKitWallet.');
    } finally {
      setConnectingWallet(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>AgriChain</Text>
          <Text style={[styles.subtitle, { color: colors.gray }]}>
            Decentralized Farm-to-Buyer Marketplace
          </Text>
        </View>
        
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="leaf" size={48} color="#FFFFFF" />
          </View>
          <Text style={[styles.logoText, { color: colors.primary }]}>
            AgriChain
          </Text>
        </View>
        
        <View style={styles.featureContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark-outline" size={32} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Secure payments through smart contracts with escrow
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="people-outline" size={32} color={colors.secondary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Connect directly with buyers or farmers via secure chat
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="cash-outline" size={32} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Fair prices without middlemen using blockchain
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="wallet-outline" size={32} color={colors.warning} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Secure AppKitWallet integration for transactions
            </Text>
          </View>
        </View>
        
        <View style={styles.typeSelection}>
          <Text style={[styles.selectionTitle, { color: colors.text }]}>
            I am a:
          </Text>
          
          <View style={styles.typeButtons}>
            <TouchableOpacity 
              style={[
                styles.typeButton, 
                userType === 'farmer' && { backgroundColor: colors.primary + '20' },
                { borderColor: colors.primary }
              ]}
              onPress={() => setUserType('farmer')}
            >
              <Ionicons 
                name="leaf-outline" 
                size={32} 
                color={colors.primary} 
              />
              <Text style={[styles.typeButtonText, { color: colors.text }]}>
                Farmer
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.typeButton, 
                userType === 'buyer' && { backgroundColor: colors.secondary + '20' },
                { borderColor: colors.secondary }
              ]}
              onPress={() => setUserType('buyer')}
            >
              <Ionicons 
                name="cart-outline" 
                size={32} 
                color={colors.secondary} 
              />
              <Text style={[styles.typeButtonText, { color: colors.text }]}>
                Buyer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {error && <ErrorMessage message={error} />}
        
        <Button
          title={isConnected ? "Continue" : "Connect AppKitWallet"}
          onPress={handleConnectWallet}
          disabled={!userType || isLoading || connectingWallet}
          loading={isLoading || connectingWallet}
          style={styles.connectButton}
        />
        
        <Text style={[styles.disclaimer, { color: colors.gray }]}>
          By connecting, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  featureContainer: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  typeSelection: {
    marginBottom: 24,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  typeButton: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  typeButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  connectButton: {
    marginTop: 16,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default WelcomeScreen;
