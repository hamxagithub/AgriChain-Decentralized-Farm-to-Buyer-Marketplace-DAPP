import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import blockchainService from '../services/BlockchainService';
import { CropListing, Offer, Status } from '../contracts/types';

interface BlockchainContextProps {
  account: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
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
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
        setError('Failed to connect to wallet');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkWalletConnection();
    
    // In React Native, wallet event handling would be different
    // This would typically be handled by the wallet connection library
    
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
        return true;
      }
      
      // If not connected, use WalletConnect or other React Native wallet connection
      // For React Native, we'd use a different wallet connection method
      try {
        const address = await blockchainService.getAccount();
        setAccount(address);
        setIsConnected(true);
        return true;
      } catch (walletError) {
        setError('No wallet connection available. Please connect a wallet');
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
        isLoading,
        error,
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
