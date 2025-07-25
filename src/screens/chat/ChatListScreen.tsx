import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { useChat } from '../../context/ChatContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
// Removed date-fns dependency
import { ChatThread, ChatMessage } from '../../services/ChatService';

type ChatListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Helper function to format timestamp since we removed date-fns dependency
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
};

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const { colors } = useTheme();
  const { account, userProfile } = useBlockchain();
  const { 
    threads, 
    loadThreads, 
    loadingThreads,
    error: chatError,
    deleteThread
  } = useChat();
  
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load threads on mount and when account changes
  useEffect(() => {
    if (account) {
      loadThreads();
    }
  }, [account]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadThreads();
    setRefreshing(false);
  };

  // Navigate to chat screen
  const navigateToChat = (recipientId: string, recipientName: string, listingId?: number) => {
    navigation.navigate('Chat', { recipientId, recipientName, listingId });
  };

  // Handle delete thread
  const handleDeleteThread = (threadId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const success = await deleteThread(threadId);
            if (!success) {
              Alert.alert('Error', 'Failed to delete conversation. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Get other participant in thread
  const getOtherParticipant = (participants: string[]) => {
    if (!account) return { id: '', name: 'Unknown' };
    
    const otherId = participants.find(id => id !== account) || '';
    
    // Mock user info - in a real app, would be fetched from a user service
    const mockUserInfo: Record<string, {name: string, avatar: string}> = {
      '0xabc123': { name: 'Farmer John', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
      '0xdef456': { name: 'Buyer Alice', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
      '0xghi789': { name: 'Farmer Maria', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' }
    };
    
    return { 
      id: otherId, 
      name: mockUserInfo[otherId]?.name || `User ${otherId.substring(0, 6)}`,
      avatar: mockUserInfo[otherId]?.avatar
    };
  };

  // Render thread item
  const renderThreadItem = ({ item }: { item: ChatThread }) => {
    const otherUser = getOtherParticipant(item.participants);
    
    return (
      <TouchableOpacity
        style={[styles.threadItem, { backgroundColor: colors.card }]}
        onPress={() => navigateToChat(otherUser.id, otherUser.name, item.listingId)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {otherUser.avatar ? (
            <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.primary + '40' }]}>
              <Text style={[styles.avatarFallbackText, { color: colors.primary }]}>
                {otherUser.name.charAt(0)}
              </Text>
            </View>
          )}
          {item.unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.notification }]}>
              <Text style={styles.badgeText}>
                {item.unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <Text style={[styles.threadName, { color: colors.text }]} numberOfLines={1}>
              {otherUser.name}
            </Text>
            <Text style={[styles.threadTime, { color: colors.gray }]}>
              {item.lastMessage ? 
                formatTimeAgo(item.lastMessage.timestamp) : 
                'New conversation'
              }
            </Text>
          </View>
          
          {item.lastMessage && (
            <Text 
              style={[
                styles.lastMessage, 
                { color: item.unreadCount > 0 ? colors.text : colors.gray },
                item.unreadCount > 0 && styles.unreadMessage
              ]} 
              numberOfLines={1}
            >
              {item.lastMessage.senderId === account ? 'You: ' : ''}
              {item.lastMessage.content}
            </Text>
          )}
          
          {item.listingId && (
            <View style={[styles.listingTag, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="pricetag-outline" size={12} color={colors.primary} />
              <Text style={[styles.listingTagText, { color: colors.primary }]}>
                Listing #{item.listingId}
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteThread(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={loadingThreads || refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={22} 
            color={colors.primary} 
            style={[refreshing && styles.spinning]}
          />
        </TouchableOpacity>
      </View>
      
      {loadingThreads && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading conversations...
          </Text>
        </View>
      ) : threads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.gray} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No conversations yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.gray }]}>
            Your message threads with other users will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          renderItem={renderThreadItem}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      
      {chatError && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{chatError}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 4,
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  threadContent: {
    flex: 1,
    marginRight: 8,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  threadName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  threadTime: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  listingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  listingTagText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  errorContainer: {
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
  }
});

export default ChatListScreen;
