import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { CropListing } from '../contracts/types';
import { Card } from './UI';
import { useTheme } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ipfsService from '../services/IPFSService';

interface CropCardProps {
  listing: CropListing;
  onPress: () => void;
  showFarmerDetails?: boolean;
}

const CropCard: React.FC<CropCardProps> = ({ 
  listing, 
  onPress,
  showFarmerDetails = false
}) => {
  const { colors } = useTheme();
  const { 
    id, 
    cropType, 
    quantity, 
    pricePerUnit, 
    location, 
    harvestDate, 
    ipfsHash,
    farmer
  } = listing;
  
  // Format price to 4 decimal places
  const formattedPrice = parseFloat(pricePerUnit.toString()).toFixed(4);
  
  // Convert timestamp to date
  const harvestDateFormatted = new Date(harvestDate * 1000).toLocaleDateString();
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Generate image URL from IPFS hash or placeholder
  const imageUrl = ipfsHash ? ipfsService.getIPFSUrl(ipfsHash) : 'https://via.placeholder.com/150?text=No+Image';
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.cropType, { color: colors.text }]}>{cropType}</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {formattedPrice} ETH
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="scale-outline" size={16} color={colors.secondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {quantity} kg
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color={colors.gray} />
              <Text style={[styles.detailText, { color: colors.gray }]} numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.gray} />
              <Text style={[styles.detailText, { color: colors.gray }]}>
                {harvestDateFormatted}
              </Text>
            </View>
          </View>
          
          {showFarmerDetails && (
            <View style={[styles.detailRow, styles.farmerRow]}>
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={16} color={colors.info} />
                <Text style={[styles.detailText, { color: colors.info }]}>
                  {formatAddress(farmer)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = width - 32; // Full width minus padding

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 12,
  },
  cropType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
  },
  farmerRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DDDDDD',
  }
});

export default CropCard;
