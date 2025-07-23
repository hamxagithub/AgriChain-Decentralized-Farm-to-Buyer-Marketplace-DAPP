import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { CropListing } from '../../contracts/types';
import CropCard from '../../components/CropCard';
import { Section, ErrorMessage } from '../../components/UI';
import Ionicons from 'react-native-vector-icons/Ionicons';

type MarketplaceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation<MarketplaceScreenNavigationProp>();
  const { colors } = useTheme();
  const { isLoading, error } = useBlockchain();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [crops, setCrops] = useState<CropListing[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<CropListing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for development
  useEffect(() => {
    // This would be replaced with actual blockchain data
    const mockCrops: CropListing[] = [
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
        id: 2,
        farmer: '0x0987654321098765432109876543210987654321',
        cropType: 'Rice',
        quantity: 1000,
        pricePerUnit: 0.001,
        location: 'Punjab, India',
        harvestDate: Math.floor(Date.now() / 1000) + 86400 * 14, // 14 days from now
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
    
    setCrops(mockCrops);
    setFilteredCrops(mockCrops);
  }, []);
  
  // Filter crops based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCrops(crops);
      return;
    }
    
    const filtered = crops.filter(crop => 
      crop.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredCrops(filtered);
  }, [searchQuery, crops]);
  
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
  const handleCropPress = (listingId: number) => {
    navigation.navigate('CropDetail', { listingId });
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search crops or location..."
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <ErrorMessage message={error} />}
      
      <Section title="Available Crops">
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={filteredCrops}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <CropCard 
                listing={item} 
                onPress={() => handleCropPress(item.id)} 
                showFarmerDetails
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={(
              <View style={styles.emptyContainer}>
                <Ionicons name="leaf" size={48} color={colors.gray} />
                <Text style={[styles.emptyText, { color: colors.gray }]}>
                  No crops available at the moment
                </Text>
              </View>
            )}
          />
        )}
      </Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MarketplaceScreen;
