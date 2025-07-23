import { create } from 'ipfs-http-client';

// Define the IPFS configuration - using a public gateway
// In production, you would want to use your own IPFS node or a pinning service
const IPFS_PROJECT_ID = 'YOUR_INFURA_PROJECT_ID';
const IPFS_PROJECT_SECRET = 'YOUR_INFURA_PROJECT_SECRET';

const auth = 'Basic ' + Buffer.from(IPFS_PROJECT_ID + ':' + IPFS_PROJECT_SECRET).toString('base64');

// Connect to IPFS
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
});

class IPFSService {
  // Upload file to IPFS
  public async uploadFile(file: File): Promise<string | null> {
    try {
      // Convert file to buffer
      const buffer = await this.fileToBuffer(file);
      
      // Add file to IPFS
      const result = await ipfs.add(buffer);
      
      // Return the IPFS hash
      return result.path;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      return null;
    }
  }
  
  // Convert file to buffer
  private async fileToBuffer(file: File): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const buffer = Buffer.from(reader.result as ArrayBuffer);
        resolve(buffer);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  // Get IPFS URL from hash
  public getIPFSUrl(hash: string): string {
    // Using a public IPFS gateway
    return `https://ipfs.io/ipfs/${hash}`;
  }
}

const ipfsService = new IPFSService();
export default ipfsService;
