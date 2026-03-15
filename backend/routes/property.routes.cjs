const router = require("express").Router();
const c = require("../controllers/property.controller.cjs");
router.get("/stats",               c.getStats);
router.get("/",                    c.getAllProperties);
router.get("/owner/:wallet",       c.getOwnerProperties);
router.get("/:tokenId",            c.getProperty);
module.exports = router;