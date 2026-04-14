const { getPropertyNFT, formatEth } = require("../utils/blockchain.cjs");
const axios = require("axios");

const TYPES = ["House","Apartment","Villa","Commercial","Land","Office"];

const _fetchMeta = async (uri) => {
  try {
    if (!uri) return {}
    
    // Handle base64 data URI (our seed script uses this)
    if (uri.startsWith('data:application/json;base64,')) {
      const base64 = uri.replace('data:application/json;base64,', '')
      const json   = Buffer.from(base64, 'base64').toString('utf-8')
      return JSON.parse(json)
    }

    // Handle IPFS URI
    if (uri.startsWith('ipfs://')) {
      const url = `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`
      const { data } = await axios.get(url, { timeout: 5000 })
      return data
    }

    // Handle regular HTTP URL
    const { data } = await axios.get(uri, { timeout: 5000 })
    return data

  } catch (e) {
    console.log('Meta fetch error:', e.message)
    return {}
  }
}

const _format = (tokenId, prop, meta) => {
  const attributes = Array.isArray(meta?.attributes) ? meta.attributes : []
  const attr = (trait) => attributes.find(a => a.trait_type?.toLowerCase() === trait.toLowerCase())?.value

  const title = meta?.title || meta?.name || `Property #${tokenId}`
  const description = meta?.description || ''
  const image = meta?.image || ''
  const city = meta?.city || attr('City') || attr('city') || ''
  const state = meta?.state || attr('State') || attr('state') || attr('Country') || ''
  const latitude = Number(meta?.latitude || meta?.lat || attr('Latitude') || attr('latitude') || '') || undefined
  const longitude = Number(meta?.longitude || meta?.lng || meta?.lon || attr('Longitude') || attr('longitude') || '') || undefined

  const priceInETH = formatEth(prop.price)
  const rawInr = meta?.priceInINR || meta?.price_in_inr || meta?.priceINR || meta?.priceINR
  const priceInINR = rawInr || (priceInETH ? `₹${Math.round(Number(priceInETH) * 165000).toLocaleString('en-IN')}` : '')

  const areaSqFt = attr('Area (sqft)') || attr('Area') || ''
  const ownerAddress = prop.owner
  const legalStatus = meta?.legalStatus || attr('Legal Status') || attr('Status') || (prop.isVerified ? 'Verified' : 'Pending Verification')
  const verificationStatus = meta?.verificationStatus || attr('Verification Status') || (prop.isVerified ? 'Verified' : 'Pending Verification')
  const documents = meta?.documents || meta?.files || []
  const createdAt = meta?.createdAt || meta?.created_at || meta?.created || (prop.listedAt ? new Date(Number(prop.listedAt) * 1000).toISOString() : new Date().toISOString())

  return {
    id:            tokenId.toString(),
    tokenId:       tokenId.toString(),
    title,
    name:          meta?.name || '',
    description,
    image,
    metadataURI:   prop.metadataURI,
    city,
    state,
    latitude,
    longitude,
    priceInETH,
    priceInINR,
    price:         priceInETH,
    rentPerMonth:  formatEth(prop.rentPerMonth),
    areaSqFt,
    ownerAddress,
    owner:         prop.owner,
    isListed:      prop.isListed,
    isForSale:     prop.isListed,
    isForRent:     prop.isForRent,
    isVerified:    prop.isVerified,
    legalStatus,
    verificationStatus,
    documents,
    createdAt,
    propertyType:  TYPES[Number(prop.propType)],
    attributes,
  }
}

const getAllProperties = async (req, res) => {
  try {
    const contract = getPropertyNFT()
    const total    = await contract.getTotalProperties()
    const totalNum = Number(total)

    // Get ALL properties, not just listed ones
    const properties = await Promise.all(
      Array.from({ length: totalNum }, (_, i) => i + 1).map(async (tokenId) => {
        const prop = await contract.getProperty(tokenId)
        const meta = await _fetchMeta(prop.metadataURI)
        return _format(tokenId, prop, meta)
      })
    )

    res.json({ success: true, total: totalNum, properties })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
};

const getProperty = async (req, res) => {
  try {
    const contract = getPropertyNFT();
    const prop     = await contract.getProperty(req.params.tokenId);
    const owner    = await contract.ownerOf(req.params.tokenId);
    const meta     = await _fetchMeta(prop.metadataURI);
    res.json({ success: true, property: { ..._format(req.params.tokenId, prop, meta), currentOwner: owner, ownerAddress: owner } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getOwnerProperties = async (req, res) => {
  try {
    const contract = getPropertyNFT();
    const ids      = await contract.getOwnerTokens(req.params.wallet);
    const properties = await Promise.all(
      ids.map(async (id) => {
        const prop = await contract.getProperty(id);
        const meta = await _fetchMeta(prop.metadataURI);
        return _format(id, prop, meta);
      })
    );
    res.json({ success: true, properties });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getStats = async (req, res) => {
  try {
    const contract  = getPropertyNFT();
    const total     = await contract.getTotalProperties();
    const listedIds = await contract.getAllListedProperties();
    res.json({ success: true, totalMinted: Number(total), totalListed: listedIds.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getAllProperties, getProperty, getOwnerProperties, getStats };