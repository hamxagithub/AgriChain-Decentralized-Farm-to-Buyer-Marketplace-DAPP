import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Offer, Status } from '../contracts/types';
import { Card } from './UI';
import { useTheme } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface OrderStatusProps {
  offer: Offer;
  cropName: string;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ offer, cropName }) => {
  const { colors } = useTheme();
  
  const getStatusColor = (status: Status) => {
    switch(status) {
      case Status.Listed:
        return colors.gray;
      case Status.Offered:
        return colors.info;
      case Status.Accepted:
        return colors.info;
      case Status.InTransit:
        return colors.warning;
      case Status.Delivered:
        return colors.success;
      case Status.Disputed:
        return colors.error;
      case Status.Completed:
        return colors.success;
      case Status.Cancelled:
        return colors.error;
      default:
        return colors.gray;
    }
  };
  
  const getStatusText = (status: Status) => {
    switch(status) {
      case Status.Listed:
        return 'Listed';
      case Status.Offered:
        return 'Offer Made';
      case Status.Accepted:
        return 'Offer Accepted';
      case Status.InTransit:
        return 'In Transit';
      case Status.Delivered:
        return 'Delivered';
      case Status.Disputed:
        return 'Disputed';
      case Status.Completed:
        return 'Completed';
      case Status.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };
  
  const getStatusIcon = (status: Status) => {
    switch(status) {
      case Status.Listed:
        return 'list';
      case Status.Offered:
        return 'cash-outline';
      case Status.Accepted:
        return 'checkmark-circle-outline';
      case Status.InTransit:
        return 'car-outline';
      case Status.Delivered:
        return 'archive-outline';
      case Status.Disputed:
        return 'alert-circle-outline';
      case Status.Completed:
        return 'checkmark-done-circle-outline';
      case Status.Cancelled:
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };
  
  // Calculate total amount
  const totalAmount = offer.quantity * parseFloat(offer.pricePerUnit.toString());
  
  // Format date
  const formattedDate = new Date(offer.timestamp * 1000).toLocaleDateString();
  
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.orderTitle, { color: colors.text }]}>
          Order #{offer.id.toString().padStart(4, '0')}
        </Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(offer.status) + '20' }
        ]}>
          <Ionicons 
            name={getStatusIcon(offer.status)} 
            size={16} 
            color={getStatusColor(offer.status)} 
          />
          <Text style={[
            styles.statusText, 
            { color: getStatusColor(offer.status) }
          ]}>
            {getStatusText(offer.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.gray }]}>Crop:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{cropName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.gray }]}>Quantity:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{offer.quantity} kg</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.gray }]}>Price Per Unit:</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {parseFloat(offer.pricePerUnit.toString()).toFixed(4)} ETH
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.gray }]}>Total Amount:</Text>
          <Text style={[styles.value, { color: colors.text, fontWeight: 'bold' }]}>
            {totalAmount.toFixed(4)} ETH
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.gray }]}>Date:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{formattedDate}</Text>
        </View>
      </View>
      
      <View style={styles.statusTracker}>
        <View style={[
          styles.statusLine,
          { backgroundColor: colors.border }
        ]} />
        
        {[Status.Offered, Status.Accepted, Status.InTransit, Status.Delivered, Status.Completed].map((status, index) => (
          <View 
            key={index} 
            style={[
              styles.statusPoint,
              { 
                backgroundColor: offer.status >= status ? getStatusColor(status) : colors.border,
                left: `${index * 25}%`
              }
            ]}
          />
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDDDDD',
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
  },
  statusTracker: {
    position: 'relative',
    height: 30,
    marginTop: 8,
  },
  statusLine: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    height: 2,
  },
  statusPoint: {
    position: 'absolute',
    top: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default OrderStatus;
