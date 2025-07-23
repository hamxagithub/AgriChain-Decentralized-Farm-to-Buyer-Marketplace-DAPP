// Contract types
export enum Status {
  Listed = 0,
  Offered = 1,
  Accepted = 2,
  InTransit = 3,
  Delivered = 4,
  Disputed = 5,
  Completed = 6,
  Cancelled = 7
}

export interface CropListing {
  id: number;
  farmer: string;
  cropType: string;
  quantity: number;
  pricePerUnit: number;
  location: string;
  harvestDate: number;
  ipfsHash: string;
  isActive: boolean;
  timestamp: number;
}

export interface Offer {
  id: number;
  listingId: number;
  buyer: string;
  quantity: number;
  pricePerUnit: number;
  status: Status;
  timestamp: number;
}

// Mock contract ABI - This would be replaced with the actual ABI from compilation
export const CONTRACT_ABI = [
  // This is a simplified representation for demonstration
  // The actual ABI would be generated from the Solidity contract
];

// The deployed contract address would be set here after deployment
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
