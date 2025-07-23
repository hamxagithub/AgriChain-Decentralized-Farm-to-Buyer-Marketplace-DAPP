import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../context/ThemeContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { Card, EmptyState } from '../../components/UI';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Mock order data type
type Order = {
  id: string | number;
  cropId: number;
  cropType: string;
  quantity: number;
  totalPrice: number;
  buyerAddress: string;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  dateCreated: number;
  expectedDelivery?: number;
};

const FarmerOrdersScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { isLoading } = useBlockchain();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setRefreshing(true);
    
    try {
      // In a real app, this would fetch from blockchain
      // For now, we'll use mocks
      const mockOrders: Order[] = Array(10).fill(0).map((_, index) => ({
        id: index + 1,
        cropId: Math.floor(Math.random() * 5) + 1,
        cropType: ['Organic Tomatoes', 'Rice', 'Coffee Beans', 'Wheat', 'Mangoes'][Math.floor(Math.random() * 5)],
        quantity: Math.floor(Math.random() * 100) + 10,
        totalPrice: parseFloat((Math.random() * 0.5).toFixed(4)),
        buyerAddress: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        status: ['PENDING', 'ACCEPTED', 'PREPARING', 'SHIPPING', 'DELIVERED', 'COMPLETED'][Math.floor(Math.random() * 6)] as Order['status'],
        dateCreated: Math.floor(Date.now() / 1000) - 86400 * (Math.floor(Math.random() * 10) + 1),
        expectedDelivery: Math.floor(Date.now() / 1000) + 86400 * (Math.floor(Math.random() * 14) + 1)
      }));
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return colors.warning;
      case 'ACCEPTED':
      case 'PREPARING':
      case 'SHIPPING':
        return colors.info;
      case 'DELIVERED':
        return colors.secondary;
      case 'COMPLETED':
        return colors.success;
      case 'CANCELLED':
      case 'DISPUTED':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'time-outline';
      case 'ACCEPTED':
        return 'checkmark-circle-outline';
      case 'PREPARING':
        return 'construct-outline';
      case 'SHIPPING':
        return 'car-outline';
      case 'DELIVERED':
        return 'cube-outline';
      case 'COMPLETED':
        return 'checkmark-done-circle-outline';
      case 'CANCELLED':
        return 'close-circle-outline';
      case 'DISPUTED':
        return 'alert-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusActionText = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Accept/Decline';
      case 'ACCEPTED':
        return 'Prepare Order';
      case 'PREPARING':
        return 'Ship Order';
      case 'SHIPPING':
        return 'Mark Delivered';
      case 'DELIVERED':
        return 'View Status';
      case 'COMPLETED':
        return 'View Details';
      case 'CANCELLED':
        return 'View Details';
      case 'DISPUTED':
        return 'Resolve Dispute';
      default:
        return 'Track Order';
    }
  };

  const handleOrderPress = (orderId: string | number) => {
    navigation.navigate('TrackOrder', { orderId });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItemContainer}
      onPress={() => handleOrderPress(item.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={[styles.orderTitle, { color: colors.text }]}>
            Order #{item.id}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color="#FFFFFF" style={styles.statusIcon} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.gray }]}>Crop:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{item.cropType}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.gray }]}>Quantity:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{item.quantity} kg</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.gray }]}>Price:</Text>
            <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '600' }]}>
              {item.totalPrice.toFixed(4)} ETH
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.gray }]}>Date:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(item.dateCreated * 1000).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.gray }]}>Buyer:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
              {`${item.buyerAddress.substring(0, 6)}...${item.buyerAddress.substring(38)}`}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={[styles.viewOrder, { color: colors.primary }]}>
            {getStatusActionText(item.status)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadOrders}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !refreshing ? (
            <EmptyState
              icon="basket-outline"
              title="No Orders Yet"
              message="Orders from buyers will appear here"
              action={{
                label: 'List a New Crop',
                onPress: () => navigation.navigate('ListCrop')
              }}
            />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  orderItemContainer: {
    marginBottom: 16,
  },
  orderCard: {
    padding: 0,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  orderDetails: {
    padding: 16,
  },
  detailItem: {
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
    maxWidth: '60%',
    textAlign: 'right',
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEEEEE',
  },
  viewOrder: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
});

export default FarmerOrdersScreen;
