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
import { Card, Header, Button, Section, ErrorMessage } from '../../components/UI';
import CropCard from '../../components/CropCard';
import OrderStatus from '../../components/OrderStatus';
import Ionicons from 'react-native-vector-icons/Ionicons';

type FarmerHomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FarmerHomeScreen: React.FC = () => {
  const navigation = useNavigation<FarmerHomeScreenNavigationProp>();
  const { colors } = useTheme();
  const { account, isConnected, isLoading, error } = useBlockchain();
  
  const [myListings, setMyListings] = useState<CropListing[]>([]);
  const [pendingOffers, setPendingOffers] = useState<Array<{ offer: Offer, cropName: string }>>([]);
  const [activeOrders, setActiveOrders] = useState<Array<{ offer: Offer, cropName: string }>>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for development
  useEffect(() => {
    // This would be replaced with actual blockchain data
    const mockListings: CropListing[] = [
      {
        id: 1,
        farmer: account || '0x0',
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
        id: 2,
        farmer: account || '0x0',
        cropType: 'Rice',
        quantity: 1000,
        pricePerUnit: 0.001,
        location: 'Punjab, India',
        harvestDate: Math.floor(Date.now() / 1000) + 86400 * 14, // 14 days from now
        ipfsHash: '',
        isActive: true,
        timestamp: Math.floor(Date.now() / 1000)
      }
    ];
    
    const mockOffers: Array<{ offer: Offer, cropName: string }> = [
      {
        offer: {
          id: 1,
          listingId: 1,
          buyer: '0x9876543210987654321098765432109876543210',
          quantity: 200,
          pricePerUnit: 0.0025,
          status: Status.Offered,
          timestamp: Math.floor(Date.now() / 1000) - 86400 // 1 day ago
        },
        cropName: 'Organic Tomatoes'
      },
      {
        offer: {
          id: 2,
          listingId: 2,
          buyer: '0x8765432109876543210987654321098765432109',
          quantity: 500,
          pricePerUnit: 0.001,
          status: Status.Offered,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 2 // 2 days ago
        },
        cropName: 'Rice'
      }
    ];
    
    const mockActiveOrders: Array<{ offer: Offer, cropName: string }> = [
      {
        offer: {
          id: 3,
          listingId: 1,
          buyer: '0x7654321098765432109876543210987654321098',
          quantity: 100,
          pricePerUnit: 0.0025,
          status: Status.InTransit,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 3 // 3 days ago
        },
        cropName: 'Organic Tomatoes'
      }
    ];
    
    setMyListings(mockListings);
    setPendingOffers(mockOffers);
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
  
  // Navigate to list crop screen
  const handleListCrop = () => {
    navigation.navigate('ListCrop');
  };
  
  // Navigate to crop detail
  const handleViewListing = (listingId: number) => {
    navigation.navigate('CropDetail', { listingId });
  };
  
  // Navigate to order tracking
  const handleViewOrder = (offerId: number) => {
    navigation.navigate('TrackOrder', { orderId: offerId });
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
        title="Farmer Dashboard"
        subtitle={account ? `Wallet: ${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect your wallet'}
      />
      
      {error && <ErrorMessage message={error} />}
      
      <Button
        title="List New Crop"
        onPress={handleListCrop}
        style={styles.listButton}
      />
      
      <Section 
        title="My Active Listings"
        action={
          <TouchableOpacity>
            <Text style={{ color: colors.primary }}>See All</Text>
          </TouchableOpacity>
        }
      >
        {myListings.length > 0 ? (
          myListings.map(listing => (
            <CropCard
              key={listing.id}
              listing={listing}
              onPress={() => handleViewListing(listing.id)}
            />
          ))
        ) : (
          <Card>
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={32} color={colors.gray} />
              <Text style={[styles.emptyText, { color: colors.gray }]}>
                No active listings yet
              </Text>
            </View>
          </Card>
        )}
      </Section>
      
      <Section 
        title="Pending Offers"
        action={
          <TouchableOpacity>
            <Text style={{ color: colors.primary }}>See All</Text>
          </TouchableOpacity>
        }
      >
        {pendingOffers.length > 0 ? (
          pendingOffers.map(item => (
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
                No pending offers
              </Text>
            </View>
          </Card>
        )}
      </Section>
      
      <Section 
        title="Active Orders"
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
                No active orders
              </Text>
            </View>
          </Card>
        )}
      </Section>
      
      <Section title="Statistics">
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>2</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Active Listings</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>2</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Pending Offers</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>1</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Active Orders</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>0.01 ETH</Text>
            <Text style={[styles.statLabel, { color: colors.gray }]}>Total Revenue</Text>
          </Card>
        </View>
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
  },
  listButton: {
    marginBottom: 16,
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
});

export default FarmerHomeScreen;
