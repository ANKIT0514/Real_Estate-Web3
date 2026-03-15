const router = require("express").Router();
const c = require("../controllers/marketplace.controller.cjs");
router.get("/",                    c.getListings);
router.get("/withdrawal/:wallet",  c.getPendingWithdrawal);
router.get("/:tokenId",            c.getListing);
module.exports = router;