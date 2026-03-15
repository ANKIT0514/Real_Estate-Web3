const { getEscrow, formatEth } = require("../utils/blockchain.cjs");

const STATES = ["AWAITING_DELIVERY","COMPLETE","DISPUTED","REFUNDED"];

const _fmt = (deal) => ({
  escrowId:       deal.escrowId.toString(),
  tokenId:        deal.tokenId.toString(),
  buyer:          deal.buyer,
  seller:         deal.seller,
  amount:         formatEth(deal.amount),
  deadline:       new Date(Number(deal.deadline)*1000).toISOString(),
  state:          STATES[Number(deal.state)],
  buyerApproved:  deal.buyerApproved,
  sellerApproved: deal.sellerApproved,
});

const getEscrowDeal     = async (req, res) => {
  try {
    const deal = await getEscrow().getEscrow(req.params.escrowId);
    res.json({ success: true, deal: _fmt(deal) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getBuyerEscrows   = async (req, res) => {
  try {
    const ids   = await getEscrow().getBuyerEscrows(req.params.wallet);
    const deals = await Promise.all(ids.map((id) => getEscrow().getEscrow(id)));
    res.json({ success: true, escrows: deals.map(_fmt) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getSellerEscrows  = async (req, res) => {
  try {
    const ids   = await getEscrow().getSellerEscrows(req.params.wallet);
    const deals = await Promise.all(ids.map((id) => getEscrow().getEscrow(id)));
    res.json({ success: true, escrows: deals.map(_fmt) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getEscrowDeal, getBuyerEscrows, getSellerEscrows };