const router = require("express").Router();
const c = require("../controllers/escrow.controller.cjs");
router.get("/buyer/:wallet",       c.getBuyerEscrows);
router.get("/seller/:wallet",      c.getSellerEscrows);
router.get("/:escrowId",           c.getEscrowDeal);
module.exports = router;