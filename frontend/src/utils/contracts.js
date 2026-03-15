import { ethers } from 'ethers'

export const ADDRESSES = {
  PropertyNFT: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  Marketplace: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  Escrow:      '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  RentPayment: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
}

export const PROPERTY_NFT_ABI = [
  'function mintProperty(string metadataURI, uint256 price, uint256 rentPerMonth, bool isForRent, uint8 propType) returns (uint256)',
  'function listProperty(uint256 tokenId, uint256 price, bool isForRent, uint256 rentPerMonth)',
  'function delistProperty(uint256 tokenId)',
  'function getProperty(uint256 tokenId) view returns (tuple(uint256 tokenId, address owner, string metadataURI, uint256 price, uint256 rentPerMonth, bool isListed, bool isForRent, bool isVerified, uint256 listedAt, uint8 propType))',
  'function getOwnerTokens(address owner) view returns (uint256[])',
  'function approve(address to, uint256 tokenId)',
]

export const MARKETPLACE_ABI = [
  'function listProperty(uint256 tokenId, uint256 price)',
  'function buyProperty(uint256 tokenId) payable',
  'function delistProperty(uint256 tokenId)',
  'function makeOffer(uint256 tokenId, uint256 durationDays) payable',
  'function acceptOffer(uint256 tokenId, uint256 offerIndex)',
  'function withdraw()',
  'function getActiveListings() view returns (uint256[])',
  'function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool active, uint256 listedAt))',
  'function pendingWithdrawals(address) view returns (uint256)',
]

export const ESCROW_ABI = [
  'function createEscrow(uint256 tokenId, address seller, uint256 deadlineDays) payable returns (uint256)',
  'function buyerApprove(uint256 escrowId)',
  'function sellerApprove(uint256 escrowId)',
  'function raiseDispute(uint256 escrowId)',
  'function getEscrow(uint256 escrowId) view returns (tuple(uint256 escrowId, uint256 tokenId, address buyer, address seller, address arbiter, uint256 amount, uint256 createdAt, uint256 deadline, uint8 state, bool buyerApproved, bool sellerApproved))',
]

export const RENT_ABI = [
  'function createLease(uint256 tokenId, address tenant, uint256 rentAmount, uint256 durationMonths) payable',
  'function payRent(uint256 leaseId) payable',
  'function terminateLease(uint256 leaseId)',
  'function getLease(uint256 leaseId) view returns (tuple(uint256 leaseId, uint256 tokenId, address landlord, address tenant, uint256 rentAmount, uint256 depositAmount, uint256 startDate, uint256 endDate, uint256 lastPaidAt, uint256 totalPaid, uint256 missedPayments, uint8 status))',
  'function isRentDue(uint256 leaseId) view returns (bool due, bool isLate)',
]

export const getPropertyNFTContract = (signer) => new ethers.Contract(ADDRESSES.PropertyNFT, PROPERTY_NFT_ABI, signer)
export const getMarketplaceContract = (signer) => new ethers.Contract(ADDRESSES.Marketplace, MARKETPLACE_ABI, signer)
export const getEscrowContract      = (signer) => new ethers.Contract(ADDRESSES.Escrow,      ESCROW_ABI,      signer)
export const getRentContract        = (signer) => new ethers.Contract(ADDRESSES.RentPayment,  RENT_ABI,        signer)