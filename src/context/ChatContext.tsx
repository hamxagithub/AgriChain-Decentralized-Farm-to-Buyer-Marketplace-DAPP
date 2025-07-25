import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import chatService, { ChatMessage, ChatThread } from '../services/ChatService';
import { useBlockchain } from './BlockchainContext';

interface ChatContextProps {
  threads: ChatThread[];
  loadingThreads: boolean;
  unreadCount: number;
  currentThread: ChatThread | null;
  messages: ChatMessage[];
  loadingMessages: boolean;
  sendMessage: (recipientId: string, content: string, listingId?: number) => Promise<ChatMessage | null>;
  markThreadAsRead: (threadId: string) => Promise<void>;
  loadThreads: () => Promise<void>;
  loadMessages: (threadId: string) => Promise<void>;
  setCurrentThread: (thread: ChatThread | null) => void;
  deleteMessage: (messageId: string, threadId: string) => Promise<boolean>;
  deleteThread: (threadId: string) => Promise<boolean>;
  error: string | null;
}

// Create context
const ChatContext = createContext<ChatContextProps | undefined>(undefined);

// Context provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { account, isConnected } = useBlockchain();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState<boolean>(false);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load threads when account changes
  useEffect(() => {
    if (isConnected && account) {
      loadThreads();
      updateUnreadCount();
      
      // Set user as online
      chatService.setUserStatus(account, true);
      
      return () => {
        // Set user as offline when component unmounts
        if (account) {
          chatService.setUserStatus(account, false);
        }
      };
    }
  }, [isConnected, account]);

  // Load threads
  const loadThreads = async (): Promise<void> => {
    if (!isConnected || !account) return;
    
    setLoadingThreads(true);
    setError(null);
    
    try {
      // Initialize with mock data if no threads exist
      await chatService.initWithMockData(account);
      
      // Get threads
      const userThreads = await chatService.getThreadsForUser(account);
      setThreads(userThreads);
    } catch (err) {
      console.error('Error loading chat threads:', err);
      setError('Failed to load chat threads');
    } finally {
      setLoadingThreads(false);
    }
  };

  // Load messages for a thread
  const loadMessages = async (threadId: string): Promise<void> => {
    if (!isConnected || !account) return;
    
    setLoadingMessages(true);
    setError(null);
    
    try {
      const threadMessages = await chatService.getMessages(threadId);
      setMessages(threadMessages);
      
      // Mark thread as read
      await chatService.markAsRead(threadId, account);
      
      // Update unread count
      updateUnreadCount();
    } catch (err) {
      console.error('Error loading chat messages:', err);
      setError('Failed to load chat messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send a message
  const sendMessage = async (recipientId: string, content: string, listingId?: number): Promise<ChatMessage | null> => {
    if (!isConnected || !account) {
      setError('Please connect your wallet to send messages');
      return null;
    }
    
    setError(null);
    
    try {
      const message = await chatService.sendMessage(account, recipientId, content, listingId);
      
      // Reload messages if this is for the current thread
      if (currentThread && currentThread.id === chatService.generateThreadId(account, recipientId, listingId)) {
        setMessages(prev => [...prev, message]);
      }
      
      // Reload threads
      loadThreads();
      
      return message;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return null;
    }
  };

  // Mark a thread as read
  const markThreadAsRead = async (threadId: string): Promise<void> => {
    if (!isConnected || !account) return;
    
    try {
      await chatService.markAsRead(threadId, account);
      
      // Update unread count
      updateUnreadCount();
      
      // Update threads
      setThreads(prev => 
        prev.map(thread => 
          thread.id === threadId ? { ...thread, unreadCount: 0 } : thread
        )
      );
    } catch (err) {
      console.error('Error marking thread as read:', err);
      setError('Failed to mark thread as read');
    }
  };

  // Update unread count
  const updateUnreadCount = async (): Promise<void> => {
    if (!isConnected || !account) return;
    
    try {
      const count = await chatService.getUnreadCount(account);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error updating unread count:', err);
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string, threadId: string): Promise<boolean> => {
    if (!isConnected || !account) return false;
    
    try {
      const success = await chatService.deleteMessage(messageId, threadId);
      
      if (success) {
        // Update messages if this is the current thread
        if (currentThread && currentThread.id === threadId) {
          setMessages(prev => prev.filter(msg => msg.id !== messageId));
        }
        
        // Reload threads
        loadThreads();
      }
      
      return success;
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
      return false;
    }
  };

  // Delete a thread
  const deleteThread = async (threadId: string): Promise<boolean> => {
    if (!isConnected || !account) return false;
    
    try {
      const success = await chatService.deleteThread(threadId);
      
      if (success) {
        // Clear current thread if it's the deleted one
        if (currentThread && currentThread.id === threadId) {
          setCurrentThread(null);
          setMessages([]);
        }
        
        // Update threads list
        setThreads(prev => prev.filter(thread => thread.id !== threadId));
        
        // Update unread count
        updateUnreadCount();
      }
      
      return success;
    } catch (err) {
      console.error('Error deleting thread:', err);
      setError('Failed to delete thread');
      return false;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        threads,
        loadingThreads,
        unreadCount,
        currentThread,
        messages,
        loadingMessages,
        sendMessage,
        markThreadAsRead,
        loadThreads,
        loadMessages,
        setCurrentThread,
        deleteMessage,
        deleteThread,
        error
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
