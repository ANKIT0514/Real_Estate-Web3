// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PropertyNFT.sol";

contract RealEstateEscrow is ReentrancyGuard, Ownable {

    PropertyNFT public propertyNFT;

    enum EscrowState { AWAITING_DELIVERY, COMPLETE, DISPUTED, REFUNDED }

    struct EscrowDeal {
        uint256    escrowId;
        uint256    tokenId;
        address    buyer;
        address    seller;
        address    arbiter;
        uint256    amount;
        uint256    createdAt;
        uint256    deadline;
        EscrowState state;
        bool       buyerApproved;
        bool       sellerApproved;
    }

    uint256 private escrowCounter;
    mapping(uint256 => EscrowDeal) public escrows;
    mapping(address => uint256[]) public buyerEscrows;
    mapping(address => uint256[]) public sellerEscrows;
    address public defaultArbiter;

    event EscrowCreated  (uint256 indexed escrowId, uint256 tokenId, address buyer, address seller, uint256 amount);
    event EscrowReleased (uint256 indexed escrowId, address buyer, address seller, uint256 amount);
    event EscrowRefunded (uint256 indexed escrowId, address buyer, uint256 amount);
    event EscrowDisputed (uint256 indexed escrowId, address raisedBy);

    constructor(address _propertyNFT, address _defaultArbiter) Ownable(msg.sender) {
        propertyNFT    = PropertyNFT(_propertyNFT);
        defaultArbiter = _defaultArbiter;
    }

    function createEscrow(uint256 tokenId, address seller, uint256 deadlineDays)
        external payable returns (uint256)
    {
        require(msg.value > 0,        "Deposit required");
        require(seller != msg.sender, "Buyer cannot be seller");

        escrowCounter++;
        uint256 escrowId = escrowCounter;

        escrows[escrowId] = EscrowDeal({
            escrowId:       escrowId,
            tokenId:        tokenId,
            buyer:          msg.sender,
            seller:         seller,
            arbiter:        defaultArbiter,
            amount:         msg.value,
            createdAt:      block.timestamp,
            deadline:       block.timestamp + (deadlineDays * 1 days),
            state:          EscrowState.AWAITING_DELIVERY,
            buyerApproved:  false,
            sellerApproved: false
        });

        buyerEscrows[msg.sender].push(escrowId);
        sellerEscrows[seller].push(escrowId);
        emit EscrowCreated(escrowId, tokenId, msg.sender, seller, msg.value);
        return escrowId;
    }

    function buyerApprove(uint256 escrowId) external nonReentrant {
        EscrowDeal storage deal = escrows[escrowId];
        require(msg.sender == deal.buyer, "Only buyer");
        require(deal.state == EscrowState.AWAITING_DELIVERY, "Wrong state");
        deal.buyerApproved = true;
        if (deal.sellerApproved) _releaseFunds(escrowId);
    }

    function sellerApprove(uint256 escrowId) external nonReentrant {
        EscrowDeal storage deal = escrows[escrowId];
        require(msg.sender == deal.seller, "Only seller");
        require(deal.state == EscrowState.AWAITING_DELIVERY, "Wrong state");
        deal.sellerApproved = true;
        if (deal.buyerApproved) _releaseFunds(escrowId);
    }

    function arbiterRelease(uint256 escrowId) external nonReentrant {
        EscrowDeal storage deal = escrows[escrowId];
        require(msg.sender == deal.arbiter, "Only arbiter");
        _releaseFunds(escrowId);
    }

    function arbiterRefund(uint256 escrowId) external nonReentrant {
        EscrowDeal storage deal = escrows[escrowId];
        require(msg.sender == deal.arbiter, "Only arbiter");
        _refundBuyer(escrowId);
    }

    function raiseDispute(uint256 escrowId) external {
        EscrowDeal storage deal = escrows[escrowId];
        require(msg.sender == deal.buyer || msg.sender == deal.seller, "Not authorized");
        require(deal.state == EscrowState.AWAITING_DELIVERY, "Wrong state");
        deal.state = EscrowState.DISPUTED;
        emit EscrowDisputed(escrowId, msg.sender);
    }

    function getEscrow(uint256 escrowId) external view returns (EscrowDeal memory) {
        return escrows[escrowId];
    }

    function getBuyerEscrows(address buyer) external view returns (uint256[] memory) {
        return buyerEscrows[buyer];
    }

    function getSellerEscrows(address seller) external view returns (uint256[] memory) {
        return sellerEscrows[seller];
    }

    function _releaseFunds(uint256 escrowId) internal {
        EscrowDeal storage deal = escrows[escrowId];
        deal.state = EscrowState.COMPLETE;
        uint256 amount = deal.amount;
        deal.amount = 0;
        propertyNFT.transferFrom(deal.seller, deal.buyer, deal.tokenId);
        propertyNFT.transferPropertyOwnership(deal.tokenId, deal.seller, deal.buyer);
        payable(deal.seller).transfer(amount);
        emit EscrowReleased(escrowId, deal.buyer, deal.seller, amount);
    }

    function _refundBuyer(uint256 escrowId) internal {
        EscrowDeal storage deal = escrows[escrowId];
        deal.state = EscrowState.REFUNDED;
        uint256 amount = deal.amount;
        deal.amount = 0;
        payable(deal.buyer).transfer(amount);
        emit EscrowRefunded(escrowId, deal.buyer, amount);
    }
}