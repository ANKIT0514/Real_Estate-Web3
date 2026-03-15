const { getMarketplace, getPropertyNFT, formatEth } = require("../utils/blockchain.cjs")

const _fetchMeta = async (uri) => {
  try {
    if (!uri) return {}
    if (uri.startsWith('data:application/json;base64,')) {
      const base64 = uri.replace('data:application/json;base64,', '')
      const json   = Buffer.from(base64, 'base64').toString('utf-8')
      return JSON.parse(json)
    }
    return {}
  } catch { return {} }
}

const getListings = async (req, res) => {
  try {
    const market   = getMarketplace()
    const nft      = getPropertyNFT()

    // Get all active listing IDs from contract
    const tokenIds = await market.getActiveListings()

    if (tokenIds.length === 0) {
      return res.json({ success: true, listings: [] })
    }

    const listings = await Promise.all(
      tokenIds.map(async (tokenId) => {
        const listing = await market.getListing(tokenId)
        const prop    = await nft.getProperty(tokenId)
        const meta    = await _fetchMeta(prop.metadataURI)

        return {
          tokenId:     tokenId.toString(),
          seller:      listing.seller,
          price:       formatEth(listing.price),
          priceWei:    listing.price.toString(),
          active:      listing.active,
          listedAt:    new Date(Number(listing.listedAt) * 1000).toISOString(),
          metadata:    prop.metadataURI,
          // From IPFS/base64 metadata
          name:        meta?.name        || `Property #${tokenId}`,
          description: meta?.description || '',
          image:       meta?.image       || '',
          attributes:  meta?.attributes  || [],
        }
      })
    )

    // Filter only active ones
    const active = listings.filter(l => l.active)

    res.json({ success: true, listings: active })
  } catch (err) {
    console.error('Marketplace error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

const getListing = async (req, res) => {
  try {
    const market  = getMarketplace()
    const nft     = getPropertyNFT()
    const listing = await market.getListing(req.params.tokenId)
    const offers  = await market.getOffers(req.params.tokenId)
    const prop    = await nft.getProperty(req.params.tokenId)
    const meta    = await _fetchMeta(prop.metadataURI)

    res.json({
      success: true,
      listing: {
        tokenId:  req.params.tokenId,
        seller:   listing.seller,
        price:    formatEth(listing.price),
        active:   listing.active,
        listedAt: new Date(Number(listing.listedAt) * 1000).toISOString(),
        name:     meta?.name  || `Property #${req.params.tokenId}`,
        image:    meta?.image || '',
      },
      offers: offers.map((o) => ({
        buyer:     o.buyer,
        amount:    formatEth(o.amount),
        expiresAt: new Date(Number(o.expiresAt) * 1000).toISOString(),
        accepted:  o.accepted,
      })),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const getPendingWithdrawal = async (req, res) => {
  try {
    const market  = getMarketplace()
    const pending = await market.pendingWithdrawals(req.params.wallet)
    res.json({ success: true, wallet: req.params.wallet, pending: formatEth(pending) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getListings, getListing, getPendingWithdrawal }