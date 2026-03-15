// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PropertyNFT.sol";

contract RentPayment is ReentrancyGuard, Ownable {

    PropertyNFT public propertyNFT;

    enum LeaseStatus { ACTIVE, TERMINATED, EXPIRED }

    struct Lease {
        uint256     leaseId;
        uint256     tokenId;
        address     landlord;
        address     tenant;
        uint256     rentAmount;
        uint256     depositAmount;
        uint256     startDate;
        uint256     endDate;
        uint256     lastPaidAt;
        uint256     totalPaid;
        uint256     missedPayments;
        LeaseStatus status;
    }

    struct RentRecord {
        uint256 amount;
        uint256 paidAt;
        bool    isLate;
    }

    uint256 private leaseCounter;
    mapping(uint256 => Lease) public leases;
    mapping(uint256 => RentRecord[]) public paymentHistory;
    mapping(uint256 => uint256) public propertyToActiveLease;
    mapping(address => uint256[]) public tenantLeases;
    mapping(address => uint256[]) public landlordLeases;

    uint256 public constant GRACE_PERIOD = 5 days;
    uint256 public lateFeePercent = 10;

    event LeaseCreated  (uint256 indexed leaseId, uint256 tokenId, address landlord, address tenant);
    event RentPaid      (uint256 indexed leaseId, address tenant, uint256 amount, bool isLate);
    event LeaseTerminated(uint256 indexed leaseId);
    event LeaseExpired  (uint256 indexed leaseId);

    constructor(address _propertyNFT) Ownable(msg.sender) {
        propertyNFT = PropertyNFT(_propertyNFT);
    }

    function createLease(
        uint256 tokenId,
        address tenant,
        uint256 rentAmount,
        uint256 durationMonths
    ) external payable nonReentrant {
        require(propertyNFT.ownerOf(tokenId) == msg.sender, "Not property owner");
        require(propertyToActiveLease[tokenId] == 0,        "Already leased");
        require(tenant != msg.sender,                       "Cannot be own tenant");
        require(msg.value == rentAmount,                    "Deposit = 1 month rent");

        leaseCounter++;
        uint256 leaseId = leaseCounter;

        leases[leaseId] = Lease({
            leaseId:        leaseId,
            tokenId:        tokenId,
            landlord:       msg.sender,
            tenant:         tenant,
            rentAmount:     rentAmount,
            depositAmount:  msg.value,
            startDate:      block.timestamp,
            endDate:        block.timestamp + (durationMonths * 30 days),
            lastPaidAt:     block.timestamp,
            totalPaid:      0,
            missedPayments: 0,
            status:         LeaseStatus.ACTIVE
        });

        propertyToActiveLease[tokenId] = leaseId;
        tenantLeases[tenant].push(leaseId);
        landlordLeases[msg.sender].push(leaseId);
        emit LeaseCreated(leaseId, tokenId, msg.sender, tenant);
    }

    function payRent(uint256 leaseId) external payable nonReentrant {
        Lease storage lease = leases[leaseId];
        require(msg.sender == lease.tenant,         "Only tenant");
        require(lease.status == LeaseStatus.ACTIVE, "Not active");
        require(block.timestamp <= lease.endDate,   "Lease expired");

        bool isLate = block.timestamp > lease.lastPaidAt + 30 days + GRACE_PERIOD;
        uint256 required = lease.rentAmount;
        if (isLate) {
            required += (required * lateFeePercent) / 100;
            lease.missedPayments++;
        }
        require(msg.value >= required, "Insufficient amount");

        paymentHistory[leaseId].push(RentRecord({ amount: msg.value, paidAt: block.timestamp, isLate: isLate }));
        lease.lastPaidAt  = block.timestamp;
        lease.totalPaid  += msg.value;

        payable(lease.landlord).transfer(msg.value);
        emit RentPaid(leaseId, msg.sender, msg.value, isLate);
    }

    function terminateLease(uint256 leaseId) external nonReentrant {
        Lease storage lease = leases[leaseId];
        require(msg.sender == lease.landlord || msg.sender == lease.tenant, "Not authorized");
        require(lease.status == LeaseStatus.ACTIVE, "Not active");
        lease.status = LeaseStatus.TERMINATED;
        propertyToActiveLease[lease.tokenId] = 0;
        if (lease.depositAmount > 0) {
            uint256 deposit = lease.depositAmount;
            lease.depositAmount = 0;
            address recipient = msg.sender == lease.landlord ? lease.tenant : lease.landlord;
            payable(recipient).transfer(deposit);
        }
        emit LeaseTerminated(leaseId);
    }

    function getLease(uint256 leaseId) external view returns (Lease memory) {
        return leases[leaseId];
    }

    function getPaymentHistory(uint256 leaseId) external view returns (RentRecord[] memory) {
        return paymentHistory[leaseId];
    }

    function getTenantLeases(address tenant) external view returns (uint256[] memory) {
        return tenantLeases[tenant];
    }

    function getLandlordLeases(address landlord) external view returns (uint256[] memory) {
        return landlordLeases[landlord];
    }

    function isRentDue(uint256 leaseId) external view returns (bool due, bool isLate) {
        Lease memory lease = leases[leaseId];
        due    = block.timestamp >= lease.lastPaidAt + 30 days;
        isLate = block.timestamp >= lease.lastPaidAt + 30 days + GRACE_PERIOD;
    }
}