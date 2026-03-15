const router = require("express").Router();
const c = require("../controllers/rent.controller.cjs");
router.get("/tenant/:wallet",      c.getTenantLeases);
router.get("/landlord/:wallet",    c.getLandlordLeases);
router.get("/due/:leaseId",        c.checkRentDue);
router.get("/:leaseId",            c.getLease);
module.exports = router;