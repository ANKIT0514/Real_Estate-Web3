const { ethers } = require("ethers");
const fs   = require("fs");
const path = require("path");

const addressesPath = path.join(__dirname, "../abis/addresses.json");
let addresses = {};
if (fs.existsSync(addressesPath)) {
  addresses = JSON.parse(fs.readFileSync(addressesPath)).contracts;
}

const loadABI = (contractName) => {
  const fileNameMap = {
    "PropertyNFT": "PropertyNFT",
    "RealEstateMarketplace": "Marketplace",
    "RealEstateEscrow": "Escrow",
    "RentPayment": "RentPayment"
  };
  const fileName = fileNameMap[contractName] || contractName;
  const p = path.join(__dirname, `../../artifacts/contracts/${fileName}.sol/${contractName}.json`);
  if (!fs.existsSync(p)) { console.warn(`ABI not found: ${contractName}`); return []; }
  return JSON.parse(fs.readFileSync(p)).abi;
};

const getProvider = () =>
  new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");

const getSigner = () =>
  new ethers.Wallet(process.env.PRIVATE_KEY, getProvider());

const getPropertyNFT  = (s) => new ethers.Contract(addresses.PropertyNFT,  loadABI("PropertyNFT"),           s || getProvider());
const getMarketplace  = (s) => new ethers.Contract(addresses.Marketplace, loadABI("RealEstateMarketplace"), s || getProvider());
const getEscrow       = (s) => new ethers.Contract(addresses.Escrow,       loadABI("RealEstateEscrow"),      s || getProvider());
const getRentPayment  = (s) => new ethers.Contract(addresses.RentPayment,  loadABI("RentPayment"),           s || getProvider());

const verifySignature = (message, signature) => ethers.verifyMessage(message, signature);
const formatEth  = (wei) => ethers.formatEther(wei);
const parseEth   = (eth) => ethers.parseEther(eth.toString());

module.exports = { getProvider, getSigner, getPropertyNFT, getMarketplace, getEscrow, getRentPayment, verifySignature, formatEth, parseEth };