const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

// Real property images from Unsplash (free, no API key needed)
const PROPERTIES = [
  {
    name:        "Luxury Sea-View Villa",
    description: "A stunning 5-bedroom sea-facing villa with private pool, marble interiors, and panoramic ocean views. Perfect for luxury living.",
    image:       "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    price:       "15",
    rentPerMonth:"0.5",
    isForRent:   true,
    propType:    2, // Villa
    city:        "Mumbai",
    country:     "India",
    address:     "12 Marine Drive",
    bedrooms:    "5",
    bathrooms:   "4",
    area:        "4500",
  },
  {
    name:        "Modern Downtown Apartment",
    description: "Sleek 2-bedroom apartment in the heart of the city. Floor-to-ceiling windows, smart home features, rooftop access.",
    image:       "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    price:       "3.5",
    rentPerMonth:"0.15",
    isForRent:   true,
    propType:    1, // Apartment
    city:        "Bangalore",
    country:     "India",
    address:     "45 MG Road",
    bedrooms:    "2",
    bathrooms:   "2",
    area:        "1200",
  },
  {
    name:        "Classic Heritage House",
    description: "Beautiful 4-bedroom heritage bungalow with lush garden, original teak woodwork, and colonial architecture.",
    image:       "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    price:       "8",
    rentPerMonth:"0.3",
    isForRent:   true,
    propType:    0, // House
    city:        "Pune",
    country:     "India",
    address:     "7 Koregaon Park",
    bedrooms:    "4",
    bathrooms:   "3",
    area:        "3200",
  },
  {
    name:        "Penthouse Sky Residence",
    description: "Ultra-luxury penthouse on the 42nd floor. Private terrace, infinity pool, butler service, and 360° city views.",
    image:       "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    price:       "25",
    rentPerMonth:"0.8",
    isForRent:   true,
    propType:    1, // Apartment
    city:        "Delhi",
    country:     "India",
    address:     "1 Lutyens Zone",
    bedrooms:    "4",
    bathrooms:   "5",
    area:        "6000",
  },
  {
    name:        "Beachfront Paradise Villa",
    description: "Exclusive 6-bedroom beachfront villa with direct beach access, infinity pool, and stunning sunset views.",
    image:       "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
    price:       "35",
    rentPerMonth:"1.2",
    isForRent:   true,
    propType:    2, // Villa
    city:        "Goa",
    country:     "India",
    address:     "Beach Road, Calangute",
    bedrooms:    "6",
    bathrooms:   "6",
    area:        "7500",
  },
  {
    name:        "Smart Studio Apartment",
    description: "Fully furnished smart studio in tech hub area. High-speed fiber internet, automated systems, co-working space access.",
    image:       "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    price:       "1.2",
    rentPerMonth:"0.08",
    isForRent:   true,
    propType:    1, // Apartment
    city:        "Hyderabad",
    country:     "India",
    address:     "22 HITEC City",
    bedrooms:    "1",
    bathrooms:   "1",
    area:        "650",
  },
  {
    name:        "Mountain View Retreat",
    description: "Serene 3-bedroom mountain retreat with breathtaking Himalayan views, wooden interiors, and private garden.",
    image:       "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
    price:       "5.5",
    rentPerMonth:"0.2",
    isForRent:   true,
    propType:    0, // House
    city:        "Shimla",
    country:     "India",
    address:     "Hill View Road",
    bedrooms:    "3",
    bathrooms:   "2",
    area:        "2100",
  },
  {
    name:        "Commercial Office Space",
    description: "Prime commercial office space in business district. 8000 sqft, fully fitted, 24/7 security, parking included.",
    image:       "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    price:       "12",
    rentPerMonth:"0.4",
    isForRent:   true,
    propType:    3, // Commercial
    city:        "Chennai",
    country:     "India",
    address:     "100 Anna Salai",
    bedrooms:    "0",
    bathrooms:   "4",
    area:        "8000",
  },
]

async function main() {
  const [deployer, seller1, seller2] = await hre.ethers.getSigners()

  // Load deployed addresses
  const addressesPath = path.join(__dirname, "../backend/abis/addresses.json")
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ addresses.json not found! Run deploy first.")
    process.exit(1)
  }
  const { contracts } = JSON.parse(fs.readFileSync(addressesPath))

  // Load ABIs
  const nftArtifact    = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/PropertyNFT.sol/PropertyNFT.json")))
  const marketArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/Marketplace.sol/RealEstateMarketplace.json")))

  const propertyNFT = new hre.ethers.Contract(contracts.PropertyNFT, nftArtifact.abi, deployer)
  const marketplace = new hre.ethers.Contract(contracts.Marketplace, marketArtifact.abi, deployer)

  console.log("🌱 Seeding properties...\n")

  for (let i = 0; i < PROPERTIES.length; i++) {
    const p = PROPERTIES[i]

    // Build NFT metadata JSON
    const metadata = {
      name:        p.name,
      description: p.description,
      image:       p.image,
      attributes: [
        { trait_type: "Property Type", value: ["House","Apartment","Villa","Commercial","Land","Office"][p.propType] },
        { trait_type: "City",          value: p.city },
        { trait_type: "Country",       value: p.country },
        { trait_type: "Address",       value: p.address },
        { trait_type: "Bedrooms",      value: p.bedrooms },
        { trait_type: "Bathrooms",     value: p.bathrooms },
        { trait_type: "Area (sqft)",   value: p.area },
        { trait_type: "Price (ETH)",   value: p.price },
      ],
    }

    // Encode metadata as base64 data URI
    const metaURI  = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`
    const priceWei = hre.ethers.parseEther(p.price)
    const rentWei  = hre.ethers.parseEther(p.rentPerMonth)

    // Mint the NFT
    const mintTx = await propertyNFT.mintProperty(
      metaURI, priceWei, rentWei, p.isForRent, p.propType
    )
    const mintReceipt = await mintTx.wait()

    // Get token ID from event
    const tokenId = i + 1
    console.log(`✅ Minted: "${p.name}" → Token #${tokenId}`)

    // List first 5 properties on marketplace
    if (i < 5) {
      // Approve marketplace
      const approveTx = await propertyNFT.approve(contracts.Marketplace, tokenId)
      await approveTx.wait()

      // List on marketplace
      const listTx = await marketplace.listProperty(tokenId, priceWei)
      await listTx.wait()
      console.log(`   📋 Listed on marketplace for ${p.price} ETH`)
    }

    // Small delay to avoid nonce issues
    await new Promise(r => setTimeout(r, 500))
  }

  console.log("\n🎉 Seeding complete!")
  console.log(`✅ ${PROPERTIES.length} properties minted`)
  console.log(`✅ 5 properties listed on marketplace`)
  console.log("\nRefresh your browser to see all properties!")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})