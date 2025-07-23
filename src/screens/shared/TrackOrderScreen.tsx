import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { Button, Card } from '../../components/UI';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Mock order data type
type Order = {
  id: string | number;
  cropId: number;
  cropType: string;
  quantity: number;
  totalPrice: number;
  pricePerUnit: number;
  farmer: {
    address: string;
    name: string;
    location: string;
  };
  buyer: {
    address: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  dateCreated: number;
  expectedDelivery?: number;
  actualDelivery?: number;
  transaction: {
    hash: string;
    escrowAmount: number;
  };
  dispute?: {
    reason: string;
    dateCreated: number;
    resolution?: string;
    dateResolved?: number;
  };
};

type TrackOrderScreenRouteProp = RouteProp<RootStackParamList, 'TrackOrder'>;
type TrackOrderScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TrackOrderScreen: React.FC = () => {
  const route = useRoute<TrackOrderScreenRouteProp>();
  const navigation = useNavigation<TrackOrderScreenNavigationProp>();
  const { colors } = useTheme();
  const { isLoading, error } = useBlockchain();
  
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBuyer, setIsBuyer] = useState(true); // In real app, determine based on wallet address

  // Mock function to get the order
  useEffect(() => {
    const fetchOrder = async () => {
      // In a real app, this would fetch from blockchain
      // For now, we'll use a mock
      const orderIdNum = typeof orderId === 'string' ? parseInt(orderId) : orderId;
      const mockOrder: Order = {
        id: orderId,
        cropId: 1,
        cropType: 'Organic Tomatoes',
        quantity: 50,
        totalPrice: 0.125,
        pricePerUnit: 0.0025,
        farmer: {
          address: '0x1234567890123456789012345678901234567890',
          name: 'John Smith',
          location: 'California, USA'
        },
        buyer: {
          address: '0x0987654321098765432109876543210987654321'
        },
        status: orderIdNum % 5 === 0 ? 'PENDING' : 
                orderIdNum % 5 === 1 ? 'ACCEPTED' : 
                orderIdNum % 5 === 2 ? 'SHIPPING' : 
                orderIdNum % 5 === 3 ? 'DELIVERED' : 'COMPLETED',
        dateCreated: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago
        expectedDelivery: Math.floor(Date.now() / 1000) + 86400 * 5, // 5 days from now
        transaction: {
          hash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          escrowAmount: 0.125
        }
      };

      setOrder(mockOrder);
    };

    fetchOrder();
  }, [orderId]);

  const OrderStatusTimeline: React.FC<{
    currentStatus: Order['status'];
  }> = ({ currentStatus }) => {
    // Define the order status steps
    const statusSteps = [
      { key: 'PENDING', label: 'Pending', icon: 'time-outline' },
      { key: 'ACCEPTED', label: 'Accepted', icon: 'checkmark-circle-outline' },
      { key: 'PREPARING', label: 'Preparing', icon: 'construct-outline' },
      { key: 'SHIPPING', label: 'Shipping', icon: 'car-outline' },
      { key: 'DELIVERED', label: 'Delivered', icon: 'cube-outline' },
      { key: 'COMPLETED', label: 'Completed', icon: 'checkmark-done-circle-outline' },
    ];

    const currentIndex = statusSteps.findIndex(step => step.key === currentStatus);

    return (
      <View style={styles.statusTimeline}>
        {statusSteps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isLast = index === statusSteps.length - 1;
          
          return (
            <React.Fragment key={step.key}>
              <View style={styles.stepContainer}>
                <View 
                  style={[
                    styles.iconContainer,
                    isActive 
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : { backgroundColor: colors.card, borderColor: colors.border }
                  ]}
                >
                  <Ionicons 
                    name={step.icon} 
                    size={16} 
                    color={isActive ? '#FFFFFF' : colors.gray} 
                  />
                </View>
                <Text 
                  style={[
                    styles.stepLabel, 
                    { color: isActive ? colors.primary : colors.gray }
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              {!isLast && (
                <View 
                  style={[
                    styles.connector,
                    { backgroundColor: index < currentIndex ? colors.primary : colors.border }
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const handleUpdateStatus = (newStatus: Order['status']) => {
    if (!order) return;

    Alert.alert(
      'Update Order Status',
      `Are you sure you want to update the order status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            setIsUpdating(true);
            try {
              // In a real app, this would call the contract
              // For now, we'll just simulate
              setTimeout(() => {
                setOrder(prev => prev ? {...prev, status: newStatus} : null);
                setIsUpdating(false);
                Alert.alert('Success', 'Order status updated successfully!');
              }, 1000);
            } catch (err) {
              console.error('Error updating status:', err);
              setIsUpdating(false);
              Alert.alert('Error', 'Failed to update order status');
            }
          }
        }
      ]
    );
  };

  const handleRaiseDispute = () => {
    Alert.prompt(
      'Raise Dispute',
      'Please describe the issue with this order:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: (reason?: string) => {
            if (!reason) {
              Alert.alert('Error', 'Please provide a reason for the dispute');
              return;
            }
            
            setIsUpdating(true);
            // In a real app, this would call the contract
            setTimeout(() => {
              setOrder(prev => prev ? {
                ...prev, 
                status: 'DISPUTED',
                dispute: {
                  reason: reason,
                  dateCreated: Math.floor(Date.now() / 1000)
                }
              } : null);
              setIsUpdating(false);
              Alert.alert('Success', 'Dispute raised successfully!');
            }, 1000);
          }
        }
      ],
      'plain-text'
    );
  };

  const handleConfirmDelivery = () => {
    handleUpdateStatus('COMPLETED');
  };

  const renderStatusActions = () => {
    if (!order) return null;

    if (isBuyer) {
      switch (order.status) {
        case 'DELIVERED':
          return (
            <Button 
              title="Confirm Receipt & Release Payment" 
              onPress={handleConfirmDelivery} 
              style={styles.actionButton}
              disabled={isUpdating}
            />
          );
        case 'COMPLETED':
          return (
            <View style={styles.completedMessage}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={[styles.completedText, { color: colors.success }]}>
                Order completed successfully
              </Text>
            </View>
          );
        case 'DISPUTED':
          return (
            <View style={styles.disputeInfo}>
              <Text style={[styles.disputeText, { color: colors.error }]}>
                Dispute in progress
              </Text>
              <Text style={[styles.disputeReason, { color: colors.text }]}>
                Reason: {order.dispute?.reason}
              </Text>
            </View>
          );
        default:
          return (
            <Button 
              title="Report Issue" 
              onPress={handleRaiseDispute}
              type="outline"
              style={styles.actionButton}
              disabled={isUpdating}
            />
          );
      }
    } else { // Farmer view
      switch (order.status) {
        case 'PENDING':
          return (
            <View style={styles.actionRow}>
              <Button 
                title="Accept" 
                onPress={() => handleUpdateStatus('ACCEPTED')}
                style={[styles.actionButton, { flex: 1, marginRight: 8 }]}
                disabled={isUpdating}
              />
              <Button 
                title="Decline" 
                onPress={() => handleUpdateStatus('CANCELLED')}
                type="outline"
                style={[styles.actionButton, { flex: 1, marginLeft: 8 }]}
                disabled={isUpdating}
              />
            </View>
          );
        case 'ACCEPTED':
          return (
            <Button 
              title="Mark as Preparing" 
              onPress={() => handleUpdateStatus('PREPARING')}
              style={styles.actionButton}
              disabled={isUpdating}
            />
          );
        case 'PREPARING':
          return (
            <Button 
              title="Mark as Shipped" 
              onPress={() => handleUpdateStatus('SHIPPING')}
              style={styles.actionButton}
              disabled={isUpdating}
            />
          );
        case 'SHIPPING':
          return (
            <Button 
              title="Mark as Delivered" 
              onPress={() => handleUpdateStatus('DELIVERED')}
              style={styles.actionButton}
              disabled={isUpdating}
            />
          );
        case 'COMPLETED':
          return (
            <View style={styles.completedMessage}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={[styles.completedText, { color: colors.success }]}>
                Order completed successfully
              </Text>
            </View>
          );
        case 'DISPUTED':
          return (
            <View style={styles.disputeInfo}>
              <Text style={[styles.disputeText, { color: colors.error }]}>
                Dispute in progress
              </Text>
              <Text style={[styles.disputeReason, { color: colors.text }]}>
                Reason: {order.dispute?.reason}
              </Text>
              <Button 
                title="Resolve Dispute" 
                onPress={() => handleUpdateStatus('COMPLETED')}
                style={[styles.actionButton, { marginTop: 16 }]}
                disabled={isUpdating}
              />
            </View>
          );
        default:
          return null;
      }
    }
  };

  if (!order) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: colors.text }]}>Order #{order.id}</Text>
      
      {/* Status Timeline */}
      <Card style={styles.statusCard}>
        <OrderStatusTimeline currentStatus={order.status} />
        
        <View style={styles.statusActions}>
          {renderStatusActions()}
        </View>
      </Card>
      
      {/* Order Details */}
      <Card style={styles.orderDetailsCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Order Details
        </Text>
        
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: colors.gray }]}>Crop:</Text>
          <Text style={[styles.orderValue, { color: colors.text }]}>
            {order.cropType}
          </Text>
        </View>
        
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: colors.gray }]}>Quantity:</Text>
          <Text style={[styles.orderValue, { color: colors.text }]}>
            {order.quantity} kg
          </Text>
        </View>
        
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: colors.gray }]}>Price per kg:</Text>
          <Text style={[styles.orderValue, { color: colors.text }]}>
            {order.pricePerUnit.toFixed(4)} ETH
          </Text>
        </View>
        
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: colors.gray }]}>Total Price:</Text>
          <Text style={[styles.orderValue, { color: colors.primary, fontWeight: 'bold' }]}>
            {order.totalPrice.toFixed(4)} ETH
          </Text>
        </View>
        
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: colors.gray }]}>Order Date:</Text>
          <Text style={[styles.orderValue, { color: colors.text }]}>
            {new Date(order.dateCreated * 1000).toLocaleDateString()}
          </Text>
        </View>
        
        {order.expectedDelivery && (
          <View style={styles.orderRow}>
            <Text style={[styles.orderLabel, { color: colors.gray }]}>Expected Delivery:</Text>
            <Text style={[styles.orderValue, { color: colors.text }]}>
              {new Date(order.expectedDelivery * 1000).toLocaleDateString()}
            </Text>
          </View>
        )}
      </Card>
      
      {/* Escrow Information */}
      <Card style={styles.escrowCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Escrow Information
        </Text>
        
        <View style={styles.escrowRow}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.primary} />
          <Text style={[styles.escrowText, { color: colors.text }]}>
            {order.totalPrice.toFixed(4)} ETH in escrow
          </Text>
        </View>
        
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: colors.gray }]}>Transaction:</Text>
          <TouchableOpacity>
            <Text style={[styles.hashText, { color: colors.primary }]} numberOfLines={1}>
              {`${order.transaction.hash.substring(0, 10)}...${order.transaction.hash.substring(56)}`}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.escrowNote, { color: colors.gray }]}>
          {order.status === 'COMPLETED'
            ? 'Payment has been released to the farmer'
            : 'Payment will be released to the farmer upon confirmation of delivery'}
        </Text>
      </Card>
      
      {/* Contact Information */}
      <Card style={styles.contactCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {isBuyer ? 'Farmer Information' : 'Buyer Information'}
        </Text>
        
        {isBuyer ? (
          <>
            <View style={styles.orderRow}>
              <Text style={[styles.orderLabel, { color: colors.gray }]}>Name:</Text>
              <Text style={[styles.orderValue, { color: colors.text }]}>
                {order.farmer.name}
              </Text>
            </View>
            
            <View style={styles.orderRow}>
              <Text style={[styles.orderLabel, { color: colors.gray }]}>Location:</Text>
              <Text style={[styles.orderValue, { color: colors.text }]}>
                {order.farmer.location}
              </Text>
            </View>
            
            <View style={styles.orderRow}>
              <Text style={[styles.orderLabel, { color: colors.gray }]}>Address:</Text>
              <TouchableOpacity>
                <Text style={[styles.hashText, { color: colors.primary }]} numberOfLines={1}>
                  {`${order.farmer.address.substring(0, 10)}...${order.farmer.address.substring(36)}`}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.orderRow}>
            <Text style={[styles.orderLabel, { color: colors.gray }]}>Address:</Text>
            <TouchableOpacity>
              <Text style={[styles.hashText, { color: colors.primary }]} numberOfLines={1}>
                {`${order.buyer.address.substring(0, 10)}...${order.buyer.address.substring(36)}`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Button 
          title={`Contact ${isBuyer ? 'Farmer' : 'Buyer'}`}
          type="outline"
          style={styles.contactButton}
          onPress={() => {
            // In a real app, this would open a messaging screen
            Alert.alert('Feature coming soon', 'Messaging functionality will be available in the next version.');
          }}
        />
      </Card>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusCard: {
    marginBottom: 16,
  },
  statusTimeline: {
    paddingVertical: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 12,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  connector: {
    height: 20,
    width: 2,
    marginLeft: 31, // Half of icon width + margin
  },
  orderStatus: {
    marginVertical: 12,
  },
  statusActions: {
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    marginVertical: 8,
  },
  orderDetailsCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDDDDD',
  },
  orderLabel: {
    fontSize: 14,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  escrowCard: {
    marginBottom: 16,
  },
  escrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDDDDD',
  },
  escrowText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  escrowNote: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
  },
  hashText: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 200,
  },
  contactCard: {
    marginBottom: 16,
  },
  contactButton: {
    marginTop: 16,
  },
  completedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disputeInfo: {
    padding: 12,
  },
  disputeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  disputeReason: {
    fontSize: 14,
    fontStyle: 'italic',
  }
});

export default TrackOrderScreen;
