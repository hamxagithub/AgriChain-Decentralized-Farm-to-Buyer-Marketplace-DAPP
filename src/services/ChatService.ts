// ChatService.ts
// This is a mock implementation of a chat service
// In a real implementation, this would connect to a messaging service like XMTP, Push Protocol, or Firebase

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
  read: boolean;
  listingId?: number; // Optional reference to a listing, useful for marketplace chats
}

export interface ChatThread {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: number;
  listingId?: number; // Optional reference to a listing
}

interface UserStatus {
  isOnline: boolean;
  lastSeen?: number;
}

class ChatService {
  private _messages: Record<string, ChatMessage[]> = {};
  private _threads: Record<string, ChatThread> = {};
  private _userStatus: Record<string, UserStatus> = {};

  // Generate thread ID from two user IDs
 public generateThreadId(userId1: string, userId2: string, listingId?: number): string {
    const sorted = [userId1, userId2].sort();
    return listingId ? `${sorted[0]}-${sorted[1]}-${listingId}` : `${sorted[0]}-${sorted[1]}`;
  }

  // Get or create a thread between two users
  async getOrCreateThread(userId1: string, userId2: string, listingId?: number): Promise<ChatThread> {
    const threadId = this.generateThreadId(userId1, userId2, listingId);
    
    if (!this._threads[threadId]) {
      this._threads[threadId] = {
        id: threadId,
        participants: [userId1, userId2],
        unreadCount: 0,
        updatedAt: Date.now(),
        listingId
      };
      this._messages[threadId] = [];
    }
    
    return this._threads[threadId];
  }

  // Get all threads for a user
  async getThreadsForUser(userId: string): Promise<ChatThread[]> {
    const userThreads = Object.values(this._threads).filter(thread => 
      thread.participants.includes(userId)
    );
    
    // Sort by latest update
    return userThreads.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // Get messages for a thread
  async getMessages(threadId: string): Promise<ChatMessage[]> {
    const messages = this._messages[threadId] || [];
    return [...messages].sort((a, b) => a.timestamp - b.timestamp);
  }

  // Send a message
  async sendMessage(
    senderId: string, 
    recipientId: string, 
    content: string,
    listingId?: number
  ): Promise<ChatMessage> {
    // Get or create thread
    const threadId = this.generateThreadId(senderId, recipientId, listingId);
    await this.getOrCreateThread(senderId, recipientId, listingId);
    
    // Create message
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      senderId,
      recipientId,
      content,
      timestamp: Date.now(),
      read: false,
      listingId
    };
    
    // Add message to thread
    if (!this._messages[threadId]) {
      this._messages[threadId] = [];
    }
    this._messages[threadId].push(message);
    
    // Update thread
    this._threads[threadId].lastMessage = message;
    this._threads[threadId].updatedAt = message.timestamp;
    this._threads[threadId].unreadCount += 1;
    
    return message;
  }

  // Mark messages as read
  async markAsRead(threadId: string, userId: string): Promise<void> {
    if (!this._messages[threadId]) return;
    
    // Mark all messages from the other user as read
    this._messages[threadId].forEach(message => {
      if (message.recipientId === userId && !message.read) {
        message.read = true;
      }
    });
    
    // Update unread count in thread
    if (this._threads[threadId]) {
      this._threads[threadId].unreadCount = 0;
    }
  }

  // Get total unread message count for a user
  async getUnreadCount(userId: string): Promise<number> {
    let count = 0;
    
    // Count unread messages in all threads where user is a participant
    Object.values(this._threads).forEach(thread => {
      if (thread.participants.includes(userId)) {
        // Only count messages sent to this user
        count += this._messages[thread.id]?.filter(
          msg => msg.recipientId === userId && !msg.read
        ).length || 0;
      }
    });
    
    return count;
  }

  // Set user status (online/offline)
  async setUserStatus(userId: string, isOnline: boolean): Promise<void> {
    this._userStatus[userId] = {
      isOnline,
      lastSeen: isOnline ? undefined : Date.now()
    };
  }

  // Get user status
  async getUserStatus(userId: string): Promise<UserStatus> {
    return this._userStatus[userId] || { isOnline: false, lastSeen: undefined };
  }

  // Delete a message (mark as deleted)
  async deleteMessage(messageId: string, threadId: string): Promise<boolean> {
    if (!this._messages[threadId]) return false;
    
    const index = this._messages[threadId].findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      // In a real implementation, we might not actually delete the message but mark it as deleted
      this._messages[threadId].splice(index, 1);
      return true;
    }
    
    return false;
  }

  // Delete a thread
  async deleteThread(threadId: string): Promise<boolean> {
    if (!this._threads[threadId]) return false;
    
    delete this._threads[threadId];
    delete this._messages[threadId];
    return true;
  }
  
  // Initialize with mock data
  async initWithMockData(currentUserId: string): Promise<void> {
    // Create some mock threads and messages
    const mockUsers = [
      {id: '0xabc123', name: 'Farmer John'},
      {id: '0xdef456', name: 'Buyer Alice'},
      {id: '0xghi789', name: 'Farmer Maria'},
    ];
    
    // Create threads with these users if they're not the current user
    for (const user of mockUsers) {
      if (user.id !== currentUserId) {
        const thread = await this.getOrCreateThread(currentUserId, user.id);
        
        // Add some mock messages
        const now = Date.now();
        const messageContents = [
          "Hello, I'm interested in your produce.",
          "Do you have availability for delivery next week?",
          "What's the minimum order quantity?",
          "I'd like to discuss pricing options."
        ];
        
        // Create a back-and-forth conversation
        for (let i = 0; i < 4; i++) {
          const sender = i % 2 === 0 ? user.id : currentUserId;
          const recipient = i % 2 === 0 ? currentUserId : user.id;
          
          const message: ChatMessage = {
            id: `mock_msg_${i}_${Date.now()}`,
            senderId: sender,
            recipientId: recipient,
            content: messageContents[i],
            timestamp: now - (4 - i) * 3600000, // Hours ago
            read: i < 3 // Last message unread if from other user
          };
          
          this._messages[thread.id].push(message);
        }
        
        // Update thread with last message
        const lastMessage = this._messages[thread.id][this._messages[thread.id].length - 1];
        this._threads[thread.id].lastMessage = lastMessage;
        this._threads[thread.id].updatedAt = lastMessage.timestamp;
        
        // Set unread count if last message is to current user and unread
        if (lastMessage.recipientId === currentUserId && !lastMessage.read) {
          this._threads[thread.id].unreadCount = 1;
        }
      }
    }
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService;
