// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PropertyNFT.sol";

contract RealEstateMarketplace is ReentrancyGuard, Ownable {

    PropertyNFT public propertyNFT;
    uint256 public platformFeeBps = 250;
    address public feeRecipient;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool    active;
        uint256 listedAt;
    }

    struct Offer {
        address buyer;
        uint256 amount;
        uint256 expiresAt;
        bool    accepted;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(address => uint256) public pendingWithdrawals;
    uint256[] public activeListingIds;

    event PropertyListed   (uint256 indexed tokenId, address seller, uint256 price);
    event PropertySold     (uint256 indexed tokenId, address seller, address buyer, uint256 price);
    event PropertyDelisted (uint256 indexed tokenId);
    event OfferMade        (uint256 indexed tokenId, address buyer, uint256 amount);
    event OfferAccepted    (uint256 indexed tokenId, address buyer, uint256 amount);
    event Withdrawal       (address indexed user, uint256 amount);

    constructor(address _propertyNFT, address _feeRecipient) Ownable(msg.sender) {
        propertyNFT  = PropertyNFT(_propertyNFT);
        feeRecipient = _feeRecipient;
    }

    function listProperty(uint256 tokenId, uint256 price) external {
        require(propertyNFT.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be > 0");
        require(
            propertyNFT.getApproved(tokenId) == address(this) ||
            propertyNFT.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        listings[tokenId] = Listing({
            tokenId:  tokenId,
            seller:   msg.sender,
            price:    price,
            active:   true,
            listedAt: block.timestamp
        });
        activeListingIds.push(tokenId);
        emit PropertyListed(tokenId, msg.sender, price);
    }

    function buyProperty(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active,             "Not listed");
        require(msg.value >= listing.price, "Insufficient ETH");
        require(msg.sender != listing.seller, "Seller cannot buy");

        address seller = listing.seller;
        uint256 price  = listing.price;
        uint256 fee    = (price * platformFeeBps) / 10000;
        uint256 sellerProceeds = price - fee;

        listing.active = false;
        _removeActiveListing(tokenId);

        propertyNFT.transferFrom(seller, msg.sender, tokenId);
        propertyNFT.transferPropertyOwnership(tokenId, seller, msg.sender);

        pendingWithdrawals[seller]       += sellerProceeds;
        pendingWithdrawals[feeRecipient] += fee;

        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        emit PropertySold(tokenId, seller, msg.sender, price);
    }

    function delistProperty(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].active, "Not listed");
        listings[tokenId].active = false;
        _removeActiveListing(tokenId);
        emit PropertyDelisted(tokenId);
    }

    function makeOffer(uint256 tokenId, uint256 durationDays) external payable {
        require(listings[tokenId].active, "Not listed");
        require(msg.value > 0, "Offer must be > 0");
        offers[tokenId].push(Offer({
            buyer:     msg.sender,
            amount:    msg.value,
            expiresAt: block.timestamp + (durationDays * 1 days),
            accepted:  false
        }));
        emit OfferMade(tokenId, msg.sender, msg.value);
    }

    function acceptOffer(uint256 tokenId, uint256 offerIndex) external nonReentrant {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        Offer storage offer = offers[tokenId][offerIndex];
        require(!offer.accepted, "Already accepted");
        require(block.timestamp <= offer.expiresAt, "Offer expired");

        address buyer  = offer.buyer;
        uint256 amount = offer.amount;
        offer.accepted = true;
        listings[tokenId].active = false;
        _removeActiveListing(tokenId);

        uint256 fee            = (amount * platformFeeBps) / 10000;
        uint256 sellerProceeds = amount - fee;

        propertyNFT.transferFrom(msg.sender, buyer, tokenId);
        propertyNFT.transferPropertyOwnership(tokenId, msg.sender, buyer);

        pendingWithdrawals[msg.sender]   += sellerProceeds;
        pendingWithdrawals[feeRecipient] += fee;
        emit OfferAccepted(tokenId, buyer, amount);
    }

    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    function getActiveListings() external view returns (uint256[] memory) {
        return activeListingIds;
    }

    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }

    function getOffers(uint256 tokenId) external view returns (Offer[] memory) {
        return offers[tokenId];
    }

    function setPlatformFee(uint256 feeBps) external onlyOwner {
        require(feeBps <= 1000, "Max 10%");
        platformFeeBps = feeBps;
    }

    function _removeActiveListing(uint256 tokenId) internal {
        for (uint256 i = 0; i < activeListingIds.length; i++) {
            if (activeListingIds[i] == tokenId) {
                activeListingIds[i] = activeListingIds[activeListingIds.length - 1];
                activeListingIds.pop();
                break;
            }
        }
    }
}