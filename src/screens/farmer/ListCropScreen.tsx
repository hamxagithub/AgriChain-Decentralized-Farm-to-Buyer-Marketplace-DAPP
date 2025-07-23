import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { Button, ErrorMessage } from '../../components/UI';
import ipfsService from '../../services/IPFSService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

type ListCropScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ListCropScreen: React.FC = () => {
  const navigation = useNavigation<ListCropScreenNavigationProp>();
  const { colors } = useTheme();
  const { listCrop, isLoading, error } = useBlockchain();
  
  // Form state
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [location, setLocation] = useState('');
  const [harvestDate, setHarvestDate] = useState(new Date());
  const [image, setImage] = useState<{ uri: string } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Handle image selection
  const handleSelectImage = () => {
    // In a real app, implement image picker functionality here
    // For now, we'll just set a placeholder
    setImage({ uri: 'https://via.placeholder.com/300x200?text=Crop+Image' });
  };
  
  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setHarvestDate(selectedDate);
    }
  };
  
  // Validate form
  const validateForm = () => {
    if (!cropType.trim()) {
      setFormError('Crop type is required');
      return false;
    }
    
    if (!quantity.trim() || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      setFormError('Please enter a valid quantity');
      return false;
    }
    
    if (!pricePerUnit.trim() || isNaN(parseFloat(pricePerUnit)) || parseFloat(pricePerUnit) <= 0) {
      setFormError('Please enter a valid price');
      return false;
    }
    
    if (!location.trim()) {
      setFormError('Location is required');
      return false;
    }
    
    if (harvestDate.getTime() < Date.now()) {
      setFormError('Harvest date must be in the future');
      return false;
    }
    
    setFormError(null);
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // Convert values to proper format
    const quantityVal = parseFloat(quantity);
    const priceVal = parseFloat(pricePerUnit);
    const harvestDateTimestamp = Math.floor(harvestDate.getTime() / 1000);
    
    // Upload image to IPFS (in a real app)
    // For now, we'll just use an empty string
    const ipfsHash = '';
    
    try {
      const listingId = await listCrop(
        cropType,
        quantityVal,
        priceVal,
        location,
        harvestDateTimestamp,
        ipfsHash
      );
      
      if (listingId) {
        Alert.alert(
          'Success',
          'Your crop has been listed successfully!',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      }
    } catch (err) {
      console.error('Error listing crop:', err);
      setFormError('Failed to list crop. Please try again.');
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.text }]}>List Your Crop</Text>
        
        {(error || formError) && (
          <ErrorMessage message={error || formError} />
        )}
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Crop Type</Text>
          <TextInput
            style={[
              styles.input, 
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }
            ]}
            placeholder="e.g., Organic Tomatoes"
            placeholderTextColor={colors.gray}
            value={cropType}
            onChangeText={setCropType}
          />
        </View>
        
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Quantity (kg)</Text>
            <TextInput
              style={[
                styles.input, 
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }
              ]}
              placeholder="500"
              placeholderTextColor={colors.gray}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Price per kg (ETH)</Text>
            <TextInput
              style={[
                styles.input, 
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }
              ]}
              placeholder="0.001"
              placeholderTextColor={colors.gray}
              value={pricePerUnit}
              onChangeText={setPricePerUnit}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Location</Text>
          <TextInput
            style={[
              styles.input, 
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }
            ]}
            placeholder="e.g., California, USA"
            placeholderTextColor={colors.gray}
            value={location}
            onChangeText={setLocation}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Expected Harvest Date</Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dateInput,
              { borderColor: colors.border, backgroundColor: colors.card }
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: colors.text }}>
              {harvestDate.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={harvestDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Crop Image (Optional)</Text>
          <TouchableOpacity
            style={[
              styles.imageUploadContainer,
              { borderColor: colors.border, backgroundColor: colors.card }
            ]}
            onPress={handleSelectImage}
          >
            {image ? (
              <Image
                source={{ uri: image.uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 8 }}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <Button
          title="List Crop"
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
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
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
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  imageUploadContainer: {
    height: 200,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});

export default ListCropScreen;
