const { getRentPayment, formatEth } = require("../utils/blockchain.cjs");

const STATUS = ["ACTIVE","TERMINATED","EXPIRED"];

const _fmt = (lease) => ({
  leaseId:        lease.leaseId.toString(),
  tokenId:        lease.tokenId.toString(),
  landlord:       lease.landlord,
  tenant:         lease.tenant,
  rentAmount:     formatEth(lease.rentAmount),
  depositAmount:  formatEth(lease.depositAmount),
  startDate:      new Date(Number(lease.startDate)*1000).toISOString(),
  endDate:        new Date(Number(lease.endDate)*1000).toISOString(),
  totalPaid:      formatEth(lease.totalPaid),
  missedPayments: Number(lease.missedPayments),
  status:         STATUS[Number(lease.status)],
});

const getLease = async (req, res) => {
  try {
    const contract = getRentPayment();
    const lease    = await contract.getLease(req.params.leaseId);
    const history  = await contract.getPaymentHistory(req.params.leaseId);
    res.json({
      success: true,
      lease: _fmt(lease),
      paymentHistory: history.map((p) => ({
        amount: formatEth(p.amount),
        paidAt: new Date(Number(p.paidAt)*1000).toISOString(),
        isLate: p.isLate,
      })),
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getTenantLeases   = async (req, res) => {
  try {
    const ids    = await getRentPayment().getTenantLeases(req.params.wallet);
    const leases = await Promise.all(ids.map((id) => getRentPayment().getLease(id)));
    res.json({ success: true, leases: leases.map(_fmt) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getLandlordLeases = async (req, res) => {
  try {
    const ids    = await getRentPayment().getLandlordLeases(req.params.wallet);
    const leases = await Promise.all(ids.map((id) => getRentPayment().getLease(id)));
    res.json({ success: true, leases: leases.map(_fmt) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const checkRentDue = async (req, res) => {
  try {
    const { due, isLate } = await getRentPayment().isRentDue(req.params.leaseId);
    res.json({ success: true, due, isLate });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getLease, getTenantLeases, getLandlordLeases, checkRentDue };