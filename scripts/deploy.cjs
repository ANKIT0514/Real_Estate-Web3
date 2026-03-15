const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying with account:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(
    await hre.ethers.provider.getBalance(deployer.address)
  ), "ETH\n");

  // 1. Deploy PropertyNFT
  console.log("📦 Deploying PropertyNFT...");
  const PropertyNFT = await hre.ethers.getContractFactory("PropertyNFT");
  const propertyNFT = await PropertyNFT.deploy();
  await propertyNFT.waitForDeployment();
  const nftAddress = await propertyNFT.getAddress();
  console.log("✅ PropertyNFT deployed to:", nftAddress);

  // 2. Deploy Marketplace
  console.log("\n📦 Deploying Marketplace...");
  const Marketplace = await hre.ethers.getContractFactory("RealEstateMarketplace");
  const marketplace = await Marketplace.deploy(nftAddress, deployer.address);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  // 3. Deploy Escrow
  console.log("\n📦 Deploying Escrow...");
  const Escrow = await hre.ethers.getContractFactory("RealEstateEscrow");
  const escrow = await Escrow.deploy(nftAddress, deployer.address);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ Escrow deployed to:", escrowAddress);

  // 4. Deploy RentPayment
  console.log("\n📦 Deploying RentPayment...");
  const RentPayment = await hre.ethers.getContractFactory("RentPayment");
  const rentPayment = await RentPayment.deploy(nftAddress);
  await rentPayment.waitForDeployment();
  const rentAddress = await rentPayment.getAddress();
  console.log("✅ RentPayment deployed to:", rentAddress);

  // 5. Wire contracts together
  console.log("\n🔗 Connecting contracts...");
  await propertyNFT.setMarketplace(marketplaceAddress);
  await propertyNFT.setEscrow(escrowAddress);
  await propertyNFT.setRentContract(rentAddress);
  console.log("✅ Contracts connected!");

  // 6. Save addresses
  const addresses = {
    network:     hre.network.name,
    deployedAt:  new Date().toISOString(),
    deployer:    deployer.address,
    contracts: {
      PropertyNFT:  nftAddress,
      Marketplace:  marketplaceAddress,
      Escrow:       escrowAddress,
      RentPayment:  rentAddress,
    },
  };

  const outDir = path.join("backend", "abis");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );

  // 7. Update .env
  let envContent = fs.existsSync(".env") ? fs.readFileSync(".env", "utf-8") : "";
  const updates = {
    PROPERTY_NFT_ADDRESS: nftAddress,
    MARKETPLACE_ADDRESS:  marketplaceAddress,
    ESCROW_ADDRESS:       escrowAddress,
    RENT_ADDRESS:         rentAddress,
  };
  for (const [key, val] of Object.entries(updates)) {
    if (envContent.includes(key + "=")) {
      envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${val}`);
    } else {
      envContent += `\n${key}=${val}`;
    }
  }
  fs.writeFileSync(".env", envContent);

  console.log("\n📋 Deployment Summary:");
  console.log("──────────────────────────────────────────");
  console.log("PropertyNFT  :", nftAddress);
  console.log("Marketplace  :", marketplaceAddress);
  console.log("Escrow       :", escrowAddress);
  console.log("RentPayment  :", rentAddress);
  console.log("──────────────────────────────────────────");
  console.log("✅ Addresses saved to backend/abis/addresses.json");
  console.log("✅ .env updated!\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});