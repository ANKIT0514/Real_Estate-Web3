const { getProvider, getPropertyNFT, verifySignature, formatEth } = require("../utils/blockchain.cjs");
const jwt = require("jsonwebtoken");

const getNonce = (req, res) => {
  const nonce   = Math.floor(Math.random() * 1_000_000);
  const message = `Welcome to Real Estate dApp!\nVerify your wallet.\nNonce: ${nonce}\nWallet: ${req.params.address}`;
  res.json({ success: true, message });
};

const verifyWallet = (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    const recovered = verifySignature(message, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase())
      return res.status(401).json({ success: false, message: "Invalid signature" });
    const token = jwt.sign({ wallet: walletAddress.toLowerCase() }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.json({ success: true, token, wallet: walletAddress });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getBalance = async (req, res) => {
  try {
    const balance = await getProvider().getBalance(req.params.address);
    res.json({ success: true, address: req.params.address, balance: formatEth(balance), unit: "ETH" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getWalletNFTs = async (req, res) => {
  try {
    const contract = getPropertyNFT();
    const ids      = await contract.getOwnerTokens(req.params.address);
    const nfts     = await Promise.all(ids.map(async (id) => {
      const prop = await contract.getProperty(id);
      return { tokenId: id.toString(), uri: prop.metadataURI, price: formatEth(prop.price), isListed: prop.isListed };
    }));
    res.json({ success: true, wallet: req.params.address, nfts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const verifyTx = async (req, res) => {
  try {
    const receipt = await getProvider().getTransactionReceipt(req.params.txHash);
    if (!receipt) return res.json({ success: true, confirmed: false, status: "pending" });
    res.json({ success: true, confirmed: receipt.status === 1, status: receipt.status === 1 ? "success" : "failed", blockNumber: receipt.blockNumber });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getNonce, verifyWallet, getBalance, getWalletNFTs, verifyTx };