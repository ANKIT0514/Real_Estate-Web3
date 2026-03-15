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

const _format = (tokenId, prop, meta) => ({
  tokenId:      tokenId.toString(),
  owner:        prop.owner,
  metadataURI:  prop.metadataURI,
  price:        formatEth(prop.price),
  rentPerMonth: formatEth(prop.rentPerMonth),
  isListed:     prop.isListed,
  isForRent:    prop.isForRent,
  isVerified:   prop.isVerified,
  propertyType: TYPES[Number(prop.propType)],
  name:         meta?.name        || "",
  description:  meta?.description || "",
  image:        meta?.image       || "",
  attributes:   meta?.attributes  || [],
});

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
    res.json({ success: true, property: { ..._format(req.params.tokenId, prop, meta), currentOwner: owner } });
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