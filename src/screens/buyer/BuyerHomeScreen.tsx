import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { CropListing, Offer, Status } from '../../contracts/types';
import { Card, Header, Section, ErrorMessage } from '../../components/UI';
import CropCard from '../../components/CropCard';
import OrderStatus from '../../components/OrderStatus';
import Ionicons from 'react-native-vector-icons/Ionicons';

type BuyerHomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BuyerHomeScreen: React.FC = () => {
  const navigation = useNavigation<BuyerHomeScreenNavigationProp>();
  const { colors } = useTheme();
  const { account, isLoading, error } = useBlockchain();
  
  const [featuredListings, setFeaturedListings] = useState<CropListing[]>([]);
  const [myOffers, setMyOffers] = useState<Array<{ offer: Offer, cropName: string }>>([]);
  const [activeOrders, setActiveOrders] = useState<Array<{ offer: Offer, cropName: string }>>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for development
  useEffect(() => {
    // This would be replaced with actual blockchain data
    const mockListings: CropListing[] = [
      {
        id: 1,
        farmer: '0x1234567890123456789012345678901234567890',
        cropType: 'Organic Tomatoes',
        quantity: 500,
        pricePerUnit: 0.0025,
        location: 'California, USA',
        harvestDate: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days from now
        ipfsHash: '',
        isActive: true,
        timestamp: Math.floor(Date.now() / 1000)
      },
      {
        id: 3,
        farmer: '0x1111111111111111111111111111111111111111',
        cropType: 'Coffee Beans',
        quantity: 300,
        pricePerUnit: 0.005,
        location: 'Colombia',
        harvestDate: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
        ipfsHash: '',
        isActive: true,
        timestamp: Math.floor(Date.now() / 1000)
      }
    ];
    
    const mockOffers: Array<{ offer: Offer, cropName: string }> = [
      {
        offer: {
          id: 1,
          listingId: 2,
          buyer: account || '0x0',
          quantity: 200,
          pricePerUnit: 0.001,
          status: Status.Offered,
          timestamp: Math.floor(Date.now() / 1000) - 86400 // 1 day ago
        },
        cropName: 'Rice'
      }
    ];
    
    const mockActiveOrders: Array<{ offer: Offer, cropName: string }> = [
      {
        offer: {
          id: 2,
          listingId: 1,
          buyer: account || '0x0',
          quantity: 50,
          pricePerUnit: 0.0025,
          status: Status.Accepted,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 2 // 2 days ago
        },
        cropName: 'Organic Tomatoes'
      }
    ];
    
    setFeaturedListings(mockListings);
    setMyOffers(mockOffers);
    setActiveOrders(mockActiveOrders);
  }, [account]);
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Here you would fetch fresh data from the blockchain
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Navigate to crop detail
  const handleViewListing = (listingId: number) => {
    navigation.navigate('CropDetail', { listingId });
  };
  
  // Navigate to order tracking
  const handleViewOrder = (offerId: number) => {
    navigation.navigate('TrackOrder', { orderId: offerId });
  };
  
  // Navigate to marketplace
  const handleViewMarketplace = () => {
    navigation.navigate('BuyerTab', { screen: 'Marketplace' });
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
        title="Welcome, Buyer"
        subtitle={account ? `Wallet: ${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect your wallet'}
      />
      
      {error && <ErrorMessage message={error} />}
      
      <Section 
        title="Featured Crops"
        action={
          <TouchableOpacity onPress={handleViewMarketplace}>
            <Text style={{ color: colors.primary }}>View All</Text>
          </TouchableOpacity>
        }
      >
        {featuredListings.length > 0 ? (
          featuredListings.map(listing => (
            <CropCard
              key={listing.id}
              listing={listing}
              onPress={() => handleViewListing(listing.id)}
              showFarmerDetails
            />
          ))
        ) : (
          <Card>
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={32} color={colors.gray} />
              <Text style={[styles.emptyText, { color: colors.gray }]}>
                No featured crops available
              </Text>
            </View>
          </Card>
        )}
      </Section>
      
      <Section 
        title="My Pending Offers"
        action={
          <TouchableOpacity>
            <Text style={{ color: colors.primary }}>See All</Text>
          </TouchableOpacity>
        }
      >
        {myOffers.length > 0 ? (
          myOffers.map(item => (
            <TouchableOpacity 
              key={item.offer.id} 
              onPress={() => handleViewOrder(item.offer.id)}
              activeOpacity={0.8}
            >
              <OrderStatus 
                offer={item.offer} 
                cropName={item.cropName}
              />
            </TouchableOpacity>
          ))
        ) : (
          <Card>
            <View style={styles.emptyContainer}>
              <Ionicons name="cash-outline" size={32} color={colors.gray} />
              <Text style={[styles.emptyText, { color: colors.gray }]}>
                You don't have any pending offers
              </Text>
            </View>
          </Card>
        )}
      </Section>
      
      <Section 
        title="Active Purchases"
        action={
          <TouchableOpacity>
            <Text style={{ color: colors.primary }}>See All</Text>
          </TouchableOpacity>
        }
      >
        {activeOrders.length > 0 ? (
          activeOrders.map(item => (
            <TouchableOpacity 
              key={item.offer.id} 
              onPress={() => handleViewOrder(item.offer.id)}
              activeOpacity={0.8}
            >
              <OrderStatus 
                offer={item.offer} 
                cropName={item.cropName}
              />
            </TouchableOpacity>
          ))
        ) : (
          <Card>
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={32} color={colors.gray} />
              <Text style={[styles.emptyText, { color: colors.gray }]}>
                No active purchases
              </Text>
            </View>
          </Card>
        )}
      </Section>
      
      <Section title="Tips for Buyers">
        <Card>
          <View style={styles.tipContainer}>
            <Ionicons name="information-circle-outline" size={24} color={colors.info} />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.text }]}>
                Secure Transactions
              </Text>
              <Text style={[styles.tipText, { color: colors.gray }]}>
                All payments are secured in smart contracts until you confirm delivery.
              </Text>
            </View>
          </View>
        </Card>
        
        <Card>
          <View style={styles.tipContainer}>
            <Ionicons name="chatbubble-outline" size={24} color={colors.info} />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.text }]}>
                Direct Communication
              </Text>
              <Text style={[styles.tipText, { color: colors.gray }]}>
                You can message farmers directly to discuss order details.
              </Text>
            </View>
          </View>
        </Card>
        
        <Card>
          <View style={styles.tipContainer}>
            <Ionicons name="shield-outline" size={24} color={colors.info} />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.text }]}>
                Quality Guarantee
              </Text>
              <Text style={[styles.tipText, { color: colors.gray }]}>
                Dispute resolution is available if crops don't match descriptions.
              </Text>
            </View>
          </View>
        </Card>
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default BuyerHomeScreen;
