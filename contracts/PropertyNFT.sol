// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyNFT is ERC721URIStorage, Ownable {

    struct Property {
        uint256 tokenId;
        address owner;
        string  metadataURI;
        uint256 price;
        uint256 rentPerMonth;
        bool    isListed;
        bool    isForRent;
        bool    isVerified;
        uint256 listedAt;
        PropertyType propType;
    }

    enum PropertyType { House, Apartment, Villa, Commercial, Land, Office }

    uint256 private _tokenIds;
    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public ownerTokens;

    address public marketplace;
    address public escrowContract;
    address public rentContract;

    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string metadataURI, uint256 price);
    event PropertyListed(uint256 indexed tokenId, uint256 price);
    event PropertyDelisted(uint256 indexed tokenId);
    event PropertyVerified(uint256 indexed tokenId);

    modifier onlyPropertyOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not the property owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == marketplace ||
            msg.sender == escrowContract ||
            msg.sender == rentContract ||
            msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    constructor() ERC721("RealEstateProperty", "PROP") Ownable(msg.sender) {}

    function setMarketplace(address _marketplace) external onlyOwner {
        marketplace = _marketplace;
    }

    function setEscrow(address _escrow) external onlyOwner {
        escrowContract = _escrow;
    }

    function setRentContract(address _rent) external onlyOwner {
        rentContract = _rent;
    }

    function mintProperty(
        string  memory metadataURI,
        uint256 price,
        uint256 rentPerMonth,
        bool    isForRent,
        PropertyType propType
    ) external returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        properties[newTokenId] = Property({
            tokenId:      newTokenId,
            owner:        msg.sender,
            metadataURI:  metadataURI,
            price:        price,
            rentPerMonth: rentPerMonth,
            isListed:     false,
            isForRent:    isForRent,
            isVerified:   false,
            listedAt:     0,
            propType:     propType
        });

        ownerTokens[msg.sender].push(newTokenId);
        emit PropertyMinted(newTokenId, msg.sender, metadataURI, price);
        return newTokenId;
    }

    function listProperty(
        uint256 tokenId,
        uint256 price,
        bool    isForRent,
        uint256 rentPerMonth
    ) external onlyPropertyOwner(tokenId) {
        require(price > 0, "Price must be > 0");
        Property storage prop = properties[tokenId];
        prop.price        = price;
        prop.isListed     = true;
        prop.isForRent    = isForRent;
        prop.rentPerMonth = rentPerMonth;
        prop.listedAt     = block.timestamp;
        approve(marketplace, tokenId);
        emit PropertyListed(tokenId, price);
    }

    function delistProperty(uint256 tokenId) external onlyPropertyOwner(tokenId) {
        properties[tokenId].isListed = false;
        emit PropertyDelisted(tokenId);
    }

    function verifyProperty(uint256 tokenId) external onlyOwner {
        properties[tokenId].isVerified = true;
        emit PropertyVerified(tokenId);
    }

    function transferPropertyOwnership(uint256 tokenId, address from, address to)
        external onlyAuthorized
    {
        _removeFromOwnerTokens(from, tokenId);
        ownerTokens[to].push(tokenId);
        properties[tokenId].owner    = to;
        properties[tokenId].isListed = false;
    }

    function getProperty(uint256 tokenId) external view returns (Property memory) {
        return properties[tokenId];
    }

    function getOwnerTokens(address _owner) external view returns (uint256[] memory) {
        return ownerTokens[_owner];
    }

    function getTotalProperties() external view returns (uint256) {
        return _tokenIds;
    }

    function getAllListedProperties() external view returns (uint256[] memory) {
        uint256 total = _tokenIds;
        uint256 count = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (properties[i].isListed) count++;
        }
        uint256[] memory listed = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (properties[i].isListed) listed[idx++] = i;
        }
        return listed;
    }

    function _removeFromOwnerTokens(address _owner, uint256 tokenId) internal {
        uint256[] storage tokens = ownerTokens[_owner];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }
}