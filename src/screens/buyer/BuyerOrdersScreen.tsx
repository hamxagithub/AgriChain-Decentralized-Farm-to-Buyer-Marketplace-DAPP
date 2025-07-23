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
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  dateCreated: number;
  expectedDelivery?: number;
};

const BuyerOrdersScreen: React.FC = () => {
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
      const mockOrders: Order[] = Array(8).fill(0).map((_, index) => ({
        id: index + 1,
        cropId: Math.floor(Math.random() * 5) + 1,
        cropType: ['Organic Tomatoes', 'Rice', 'Coffee Beans', 'Wheat', 'Mangoes'][Math.floor(Math.random() * 5)],
        quantity: Math.floor(Math.random() * 100) + 10,
        totalPrice: parseFloat((Math.random() * 0.5).toFixed(4)),
        status: ['PENDING', 'ACCEPTED', 'SHIPPING', 'DELIVERED', 'COMPLETED'][Math.floor(Math.random() * 5)] as Order['status'],
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
            {item.cropType}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color="#FFFFFF" style={styles.statusIcon} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.gray }]}>Order ID:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>#{item.id}</Text>
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
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={[styles.viewOrder, { color: colors.primary }]}>
            Track Order
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
              icon="cart-outline"
              title="No Orders Yet"
              message="Your purchase history will appear here"
              action={{
                label: 'Browse Marketplace',
                onPress: () => navigation.navigate('BuyerTab', { screen: 'Marketplace' })
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

export default BuyerOrdersScreen;
