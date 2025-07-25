import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { useChat } from '../../context/ChatContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { useTheme } from '../../context/ThemeContext';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ChatMessage } from '../../services/ChatService';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Helper function to format timestamp
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

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { colors } = useTheme();
  const { account } = useBlockchain();
  const { 
    loadMessages, 
    sendMessage, 
    markThreadAsRead, 
    messages, 
    loadingMessages,
    setCurrentThread,
    error: chatError
  } = useChat();
  
  const [messageText, setMessageText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  
  const { recipientId, recipientName, listingId } = route.params;
  
  useEffect(() => {
    // Set title in navigation header
    navigation.setOptions({
      title: recipientName || 'Chat'
    });
    
    // Generate thread ID and load messages
    const loadChatThread = async () => {
      if (account && recipientId) {
        // Load messages for this thread
        await loadMessages(`${[account, recipientId].sort().join('-')}${listingId ? `-${listingId}` : ''}`);
        
        // Mark thread as read
        await markThreadAsRead(`${[account, recipientId].sort().join('-')}${listingId ? `-${listingId}` : ''}`);
      }
    };
    
    loadChatThread();
    
    // Cleanup
    return () => {
      setCurrentThread(null);
    };
  }, [account, recipientId, listingId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !account || !recipientId) return;
    
    setSending(true);
    try {
      await sendMessage(recipientId, messageText.trim(), listingId);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isFromMe = item.senderId === account;
    
    return (
      <View 
        style={[
          styles.messageContainer,
          isFromMe ? styles.myMessage : styles.theirMessage,
          isFromMe ? { backgroundColor: colors.primary + '22' } : { backgroundColor: colors.card }
        ]}
      >
        <Text style={[styles.messageText, { color: colors.text }]}>
          {item.content}
        </Text>
        <Text style={[styles.timestampText, { color: colors.gray }]}>
          {formatTimeAgo(item.timestamp)}
        </Text>
      </View>
    );
  };

  const renderDateSeparator = (date: string) => {
    return (
      <View style={styles.dateSeparator}>
        <Text style={[styles.dateSeparatorText, { color: colors.gray }]}>
          {new Date(date).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  interface MessageGroup {
    [date: string]: ChatMessage[];
  }

  interface GroupedItem {
    type: 'date' | 'message';
    date?: string;
    id?: string;
    senderId?: string;
    recipientId?: string;
    content?: string;
    timestamp?: number;
    read?: boolean;
    listingId?: number;
  }

  // Group messages by date for rendering date separators
  const groupedMessages = (): GroupedItem[] => {
    const groups: MessageGroup = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    const result: GroupedItem[] = [];
    Object.keys(groups).forEach(date => {
      result.push({ type: 'date', date });
      groups[date].forEach(message => {
        result.push({ type: 'message', ...message });
      });
    });
    
    return result;
  };

  const renderItem = ({ item }: { item: GroupedItem }) => {
    if (item.type === 'date' && item.date) {
      return renderDateSeparator(item.date);
    }
    return renderMessage({ item } as { item: ChatMessage });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loadingMessages ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading messages...
          </Text>
        </View>
      ) : (
        <>
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color={colors.gray} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={groupedMessages()}
              keyExtractor={(item) => 
                item.type === 'date' ? `date-${item.date}` : item.id || `msg-${Math.random()}`
              }
              renderItem={renderItem}
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          {chatError && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '22' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {chatError}
              </Text>
            </View>
          )}

          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[
                styles.input, 
                { 
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border
                }
              ]}
              placeholder="Type a message..."
              placeholderTextColor={colors.gray}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: colors.primary },
                (sending || !messageText.trim()) && { opacity: 0.5 }
              ]}
              onPress={handleSendMessage}
              disabled={sending || !messageText.trim()}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
    fontSize: 16,
    textAlign: 'center',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginVertical: 4,
  },
  myMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  timestampText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
  }
});

export default ChatScreen;
