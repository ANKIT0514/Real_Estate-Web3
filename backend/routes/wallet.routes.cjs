const router = require("express").Router();
const c = require("../controllers/wallet.controller.cjs");
router.get("/nonce/:address",      c.getNonce);
router.post("/verify",             c.verifyWallet);
router.get("/balance/:address",    c.getBalance);
router.get("/nfts/:address",       c.getWalletNFTs);
router.get("/tx/:txHash",          c.verifyTx);
module.exports = router;