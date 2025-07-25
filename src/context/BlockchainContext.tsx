import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import blockchainService from '../services/BlockchainService';
import { CropListing, Offer, Status } from '../contracts/types';

interface UserProfile {
  id: string;
  name: string;
  walletAddress: string;
  email?: string;
  avatar?: string;
}

interface TokenBalance {
  symbol: string;
  balance: string;
  value?: string; // Value in USD
  tokenAddress: string;
}

interface BlockchainContextProps {
  account: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  userProfile: UserProfile | null;
  tokenBalances: TokenBalance[];
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<UserProfile | null>;
  signMessage: (message: string) => Promise<string | null>;
  sendTransaction: (to: string, amount: string, tokenAddress?: string) => Promise<string | null>;
  listCrop: (
    cropType: string,
    quantity: number,
    pricePerUnit: number,
    location: string,
    harvestDate: number,
    ipfsHash: string
  ) => Promise<number | null>;
  makeOffer: (listingId: number, quantity: number, pricePerUnit: number) => Promise<number | null>;
  acceptOffer: (offerId: number) => Promise<boolean>;
  updateOfferStatus: (offerId: number, status: Status) => Promise<boolean>;
  confirmDelivery: (offerId: number) => Promise<boolean>;
  raiseDispute: (offerId: number, reason: string) => Promise<boolean>;
  getListingsByFarmer: (farmerAddress: string) => Promise<number[]>;
  getOffersByBuyer: (buyerAddress: string) => Promise<number[]>;
  getCropListing: (listingId: number) => Promise<CropListing | null>;
  getOffer: (offerId: number) => Promise<Offer | null>;
}

// Create context
const BlockchainContext = createContext<BlockchainContextProps | undefined>(undefined);

// Context provider component
export const BlockchainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  // Initialize and check for existing wallet connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      setIsLoading(true);
      try {
        const connected = await blockchainService.isWalletConnected();
        setIsConnected(connected);
        
        if (connected) {
          const address = await blockchainService.getAccount();
          setAccount(address);
          
          // Get user profile
          const profile = await blockchainService.getUserProfile();
          setUserProfile(profile);
          
          // Get token balances
          const balances = await blockchainService.getTokenBalances();
          setTokenBalances(balances);
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
        setError('Failed to connect to wallet');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkWalletConnection();
    
    // In React Native, wallet event handling would be handled by the AppKitWallet SDK
    
    return () => {
      // Clean up listeners if needed
    };
  }, []);

  // Connect wallet
  const connectWallet = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await blockchainService.isWalletConnected();
      if (connected) {
        const address = await blockchainService.getAccount();
        setAccount(address);
        setIsConnected(true);
        
        // Get user profile
        const profile = await blockchainService.getUserProfile();
        setUserProfile(profile);
        
        // Get token balances
        const balances = await blockchainService.getTokenBalances();
        setTokenBalances(balances);
        
        return true;
      }
      
      // Connect using AppKitWallet
      const success = await blockchainService.connectWallet();
      if (success) {
        const address = await blockchainService.getAccount();
        setAccount(address);
        setIsConnected(true);
        
        // Get user profile
        const profile = await blockchainService.getUserProfile();
        setUserProfile(profile);
        
        // Get token balances
        const balances = await blockchainService.getTokenBalances();
        setTokenBalances(balances);
        
        return true;
      } else {
        setError('Failed to connect wallet');
        return false;
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await blockchainService.disconnectWallet();
      if (success) {
        setAccount(null);
        setIsConnected(false);
        setUserProfile(null);
        setTokenBalances([]);
        return true;
      } else {
        setError('Failed to disconnect wallet');
        return false;
      }
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user profile
  const updateUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await blockchainService.updateUserProfile(profile);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        return updatedProfile;
      } else {
        setError('Failed to update profile');
        return null;
      }
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Failed to update profile');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign message
  const signMessage = async (message: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const signature = await blockchainService.signMessage(message);
      return signature;
    } catch (err) {
      console.error('Error signing message:', err);
      setError('Failed to sign message');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send transaction
  const sendTransaction = async (to: string, amount: string, tokenAddress?: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const txHash = await blockchainService.sendTransaction(to, amount, tokenAddress);
      return txHash;
    } catch (err) {
      console.error('Error sending transaction:', err);
      setError('Failed to send transaction');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // List a crop
  const listCrop = async (
    cropType: string,
    quantity: number,
    pricePerUnit: number,
    location: string,
    harvestDate: number,
    ipfsHash: string
  ): Promise<number | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await blockchainService.listCrop(
        cropType,
        quantity,
        pricePerUnit,
        location,
        harvestDate,
        ipfsHash
      );
    } catch (err) {
      console.error('Error listing crop:', err);
      setError('Failed to list crop');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Make an offer on a crop
  const makeOffer = async (
    listingId: number,
    quantity: number,
    pricePerUnit: number
  ): Promise<number | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await blockchainService.makeOffer(listingId, quantity, pricePerUnit);
    } catch (err) {
      console.error('Error making offer:', err);
      setError('Failed to make offer');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Accept an offer
  const acceptOffer = async (offerId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await blockchainService.acceptOffer(offerId);
    } catch (err) {
      console.error('Error accepting offer:', err);
      setError('Failed to accept offer');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update offer status
  const updateOfferStatus = async (offerId: number, status: Status): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await blockchainService.updateOfferStatus(offerId, status);
    } catch (err) {
      console.error('Error updating offer status:', err);
      setError('Failed to update offer status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm delivery
  const confirmDelivery = async (offerId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await blockchainService.confirmDelivery(offerId);
    } catch (err) {
      console.error('Error confirming delivery:', err);
      setError('Failed to confirm delivery');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Raise a dispute
  const raiseDispute = async (offerId: number, reason: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await blockchainService.raiseDispute(offerId, reason);
    } catch (err) {
      console.error('Error raising dispute:', err);
      setError('Failed to raise dispute');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get listings by farmer
  const getListingsByFarmer = async (farmerAddress: string): Promise<number[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await blockchainService.getListingsByFarmer(farmerAddress);
    } catch (err) {
      console.error('Error getting farmer listings:', err);
      setError('Failed to get farmer listings');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get offers by buyer
  const getOffersByBuyer = async (buyerAddress: string): Promise<number[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await blockchainService.getOffersByBuyer(buyerAddress);
    } catch (err) {
      console.error('Error getting buyer offers:', err);
      setError('Failed to get buyer offers');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get crop listing details
  const getCropListing = async (listingId: number): Promise<CropListing | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await blockchainService.getCropListing(listingId);
    } catch (err) {
      console.error('Error getting crop listing:', err);
      setError('Failed to get crop listing');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get offer details
  const getOffer = async (offerId: number): Promise<Offer | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await blockchainService.getOffer(offerId);
    } catch (err) {
      console.error('Error getting offer:', err);
      setError('Failed to get offer');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BlockchainContext.Provider
      value={{
        account,
        isConnected,
        connectWallet,
        disconnectWallet,
        isLoading,
        error,
        userProfile,
        tokenBalances,
        updateUserProfile,
        signMessage,
        sendTransaction,
        listCrop,
        makeOffer,
        acceptOffer,
        updateOfferStatus,
        confirmDelivery,
        raiseDispute,
        getListingsByFarmer,
        getOffersByBuyer,
        getCropListing,
        getOffer
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

// Custom hook to use blockchain context
export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

// Add Window interface extension for ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}
