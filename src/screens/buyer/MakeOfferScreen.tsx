import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { CropListing } from '../../contracts/types';
import { Button, Card, ErrorMessage } from '../../components/UI';
import Ionicons from 'react-native-vector-icons/Ionicons';

type MakeOfferScreenRouteProp = RouteProp<RootStackParamList, 'MakeOffer'>;
type MakeOfferScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MakeOfferScreen: React.FC = () => {
  const route = useRoute<MakeOfferScreenRouteProp>();
  const navigation = useNavigation<MakeOfferScreenNavigationProp>();
  const { colors } = useTheme();
  const { makeOffer, getCropListing, isLoading, error } = useBlockchain();
  
  const { listingId } = route.params;
  const [crop, setCrop] = useState<CropListing | null>(null);
  
  // Form state
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Load crop details
  useEffect(() => {
    const loadCropDetails = async () => {
      // In a real app, this would fetch from blockchain
      // For now, we'll use a mock
      const mockCrop: CropListing = {
        id: listingId,
        farmer: listingId === 1 ? '0x1234567890123456789012345678901234567890' : 
                  listingId === 2 ? '0x0987654321098765432109876543210987654321' : 
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
      setPricePerUnit(mockCrop.pricePerUnit.toString());
    };
    
    loadCropDetails();
  }, [listingId]);
  
  // Calculate total price when quantity or price changes
  useEffect(() => {
    if (quantity && pricePerUnit) {
      const total = parseFloat(quantity) * parseFloat(pricePerUnit);
      setTotalPrice(total);
    } else {
      setTotalPrice(0);
    }
  }, [quantity, pricePerUnit]);
  
  // Validate form
  const validateForm = () => {
    if (!quantity.trim() || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      setFormError('Please enter a valid quantity');
      return false;
    }
    
    if (!crop) {
      setFormError('Crop information not loaded');
      return false;
    }
    
    if (parseFloat(quantity) > crop.quantity) {
      setFormError(`Quantity cannot exceed the available amount (${crop.quantity} kg)`);
      return false;
    }
    
    if (!pricePerUnit.trim() || isNaN(parseFloat(pricePerUnit)) || parseFloat(pricePerUnit) <= 0) {
      setFormError('Please enter a valid price per unit');
      return false;
    }
    
    setFormError(null);
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || !crop) return;
    
    // Convert values to proper format
    const quantityVal = parseFloat(quantity);
    const priceVal = parseFloat(pricePerUnit);
    
    try {
      // In a real app, this would call the contract
      // For now, we'll just simulate success
      
      Alert.alert(
        'Confirm Offer',
        `Are you sure you want to make an offer of ${totalPrice.toFixed(4)} ETH for ${quantity} kg of ${crop.cropType}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: async () => {
              // Simulate offer being made
              setTimeout(() => {
                Alert.alert(
                  'Success',
                  'Your offer has been submitted successfully!',
                  [
                    { 
                      text: 'OK', 
                      onPress: () => navigation.navigate('BuyerTab', { screen: 'Orders' }) 
                    }
                  ]
                );
              }, 1000);
            }
          }
        ]
      );
    } catch (err) {
      console.error('Error making offer:', err);
      setFormError('Failed to make offer. Please try again.');
    }
  };
  
  if (!crop) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.text }]}>Make an Offer</Text>
        
        <Card style={styles.cropCard}>
          <Text style={[styles.cropType, { color: colors.text }]}>{crop.cropType}</Text>
          <View style={styles.cropDetails}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.gray }]}>
                Farmer's Price:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {parseFloat(crop.pricePerUnit.toString()).toFixed(4)} ETH/kg
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.gray }]}>
                Available Quantity:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {crop.quantity} kg
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.gray }]}>
                Location:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {crop.location}
              </Text>
            </View>
          </View>
        </Card>
        
        {(error || formError) && (
          <ErrorMessage message={error || formError} />
        )}
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Quantity (kg)</Text>
          <TextInput
            style={[
              styles.input, 
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }
            ]}
            placeholder="Enter quantity"
            placeholderTextColor={colors.gray}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Price per kg (ETH)</Text>
          <TextInput
            style={[
              styles.input, 
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }
            ]}
            placeholder="Enter price per unit"
            placeholderTextColor={colors.gray}
            value={pricePerUnit}
            onChangeText={setPricePerUnit}
            keyboardType="numeric"
          />
        </View>
        
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.gray }]}>
              {crop.cropType}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {quantity || 0} kg
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.gray }]}>
              Price per kg
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {parseFloat(pricePerUnit || '0').toFixed(4)} ETH
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total Payment
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {totalPrice.toFixed(4)} ETH
            </Text>
          </View>
          
          <View style={styles.walletInfo}>
            <Ionicons name="wallet-outline" size={16} color={colors.secondary} />
            <Text style={[styles.walletText, { color: colors.secondary }]}>
              Payment will be held in escrow until delivery
            </Text>
          </View>
        </Card>
        
        <Button
          title="Submit Offer"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cropCard: {
    marginBottom: 16,
  },
  cropType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cropDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  summaryCard: {
    marginVertical: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDDDDD',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    borderBottomWidth: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  walletText: {
    fontSize: 12,
    marginLeft: 6,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 40,
  },
});

export default MakeOfferScreen;
