import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { CropListing } from '../../contracts/types';
import { Button, Card, Divider, ErrorMessage } from '../../components/UI';
import ipfsService from '../../services/IPFSService';
import Ionicons from 'react-native-vector-icons/Ionicons';

type CropDetailScreenRouteProp = RouteProp<RootStackParamList, 'CropDetail'>;
type CropDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CropDetailScreen: React.FC = () => {
  const route = useRoute<CropDetailScreenRouteProp>();
  const navigation = useNavigation<CropDetailScreenNavigationProp>();
  const { colors } = useTheme();
  const { account, getCropListing, isLoading, error } = useBlockchain();
  
  const { listingId } = route.params;
  const [crop, setCrop] = useState<CropListing | null>(null);
  const [isFarmer, setIsFarmer] = useState<boolean>(false);
  
  // Load crop details
  useEffect(() => {
    const loadCropDetails = async () => {
      // In a real app, this would fetch from blockchain
      // For now, we'll use a mock
      const mockCrop: CropListing = {
        id: listingId,
        farmer: listingId === 1 || listingId === 2 ? 
          '0x1234567890123456789012345678901234567890' : 
          '0x1111111111111111111111111111111111111111',
        cropType: listingId === 1 ? 'Organic Tomatoes' : 
                  listingId === 2 ? 'Rice' : 'Coffee Beans',
        quantity: listingId === 1 ? 500 : 
                  listingId === 2 ? 1000 : 300,
        pricePerUnit: listingId === 1 ? 0.0025 : 
                     listingId === 2 ? 0.001 : 0.005,
        location: listingId === 1 ? 'California, USA' : 
                 listingId === 2 ? 'Punjab, India' : 'Colombia',
        harvestDate: Math.floor(Date.now() / 1000) + 86400 * (listingId === 1 ? 7 : 
                                                             listingId === 2 ? 14 : 30),
        ipfsHash: '',
        isActive: true,
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 2 // 2 days ago
      };
      
      setCrop(mockCrop);
      
      // Check if current user is the farmer
      if (account && mockCrop.farmer.toLowerCase() === account.toLowerCase()) {
        setIsFarmer(true);
      }
    };
    
    loadCropDetails();
  }, [listingId, account]);
  
  // Handle make offer button
  const handleMakeOffer = () => {
    navigation.navigate('MakeOffer', { listingId });
  };
  
  // Handle edit listing (for farmers)
  const handleEditListing = () => {
    Alert.alert('Edit Listing', 'This feature is coming soon!');
  };
  
  // Handle delete listing (for farmers)
  const handleDeleteListing = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call the contract
            Alert.alert('Success', 'Listing deleted successfully');
            navigation.goBack();
          }
        }
      ]
    );
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  if (!crop) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }
  
// Generate image URL from IPFS hash or placeholder
const [imageUrl, setImageUrl] = useState<string>('https://via.placeholder.com/400x300?text=No+Image');

useEffect(() => {
  const fetchImageUrl = async () => {
    if (crop?.ipfsHash) {
      const url = await ipfsService.getFile(crop.ipfsHash);
      setImageUrl(url ?? 'https://via.placeholder.com/400x300?text=No+Image');
    } else {
      setImageUrl('https://via.placeholder.com/400x300?text=No+Image');
    }
  };
  fetchImageUrl();
}, [crop]);
  
  // Format date
  const harvestDateFormatted = new Date(crop.harvestDate * 1000).toLocaleDateString();
  const listedDateFormatted = new Date(crop.timestamp * 1000).toLocaleDateString();
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.cropType, { color: colors.text }]}>{crop.cropType}</Text>
        
        {error && <ErrorMessage message={error} />}
        
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, { color: colors.gray }]}>Price:</Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            {parseFloat(crop.pricePerUnit.toString()).toFixed(4)} ETH per kg
          </Text>
        </View>
        
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="scale-outline" size={20} color={colors.secondary} />
              <Text style={[styles.infoLabel, { color: colors.gray }]}>Quantity:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {crop.quantity} kg
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.info} />
              <Text style={[styles.infoLabel, { color: colors.gray }]}>Harvest:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {harvestDateFormatted}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color={colors.warning} />
              <Text style={[styles.infoLabel, { color: colors.gray }]}>Location:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {crop.location}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={colors.gray} />
              <Text style={[styles.infoLabel, { color: colors.gray }]}>Listed:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {listedDateFormatted}
              </Text>
            </View>
          </View>
        </Card>
        
        <Card style={styles.farmerCard}>
          <Text style={[styles.farmerTitle, { color: colors.text }]}>Farmer</Text>
          <View style={styles.farmerInfo}>
            <View style={[
              styles.farmerAvatar, 
              { backgroundColor: colors.primary + '30' }
            ]}>
              <Text style={[styles.avatarLetter, { color: colors.primary }]}>
                {crop.farmer.substring(2, 3).toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.farmerDetails}>
              <Text style={[styles.farmerAddress, { color: colors.text }]}>
                {formatAddress(crop.farmer)}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Ionicons name="star" size={16} color={colors.warning} />
                <Ionicons name="star" size={16} color={colors.warning} />
                <Ionicons name="star" size={16} color={colors.warning} />
                <Ionicons name="star-half" size={16} color={colors.warning} />
                <Text style={[styles.ratingText, { color: colors.gray }]}>(4.5)</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.messageButton, { backgroundColor: colors.info + '20' }]}
            >
              <Ionicons name="chatbox-outline" size={20} color={colors.info} />
            </TouchableOpacity>
          </View>
        </Card>
        
        <Card style={styles.descriptionCard}>
          <Text style={[styles.descriptionTitle, { color: colors.text }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.gray }]}>
            Premium quality {crop.cropType.toLowerCase()} grown using sustainable farming practices. 
            No artificial pesticides or fertilizers used. Perfect for organic food lovers.
            
            Harvested at the peak of freshness to ensure maximum flavor and nutritional value.
          </Text>
        </Card>
        
        <View style={styles.buttonContainer}>
          {isFarmer ? (
            // Farmer actions
            <>
              <Button
                title="Edit Listing"
                onPress={handleEditListing}
                type="outline"
                style={styles.editButton}
              />
              <Button
                title="Delete Listing"
                onPress={handleDeleteListing}
                type="secondary"
              />
            </>
          ) : (
            // Buyer actions
            <Button
              title="Make an Offer"
              onPress={handleMakeOffer}
              loading={isLoading}
              disabled={isLoading}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  cropType: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    marginRight: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: 4,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  farmerCard: {
    marginBottom: 16,
  },
  farmerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  farmerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  farmerAddress: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionCard: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  editButton: {
    flex: 1,
    marginRight: 12,
  },
});

export default CropDetailScreen;
