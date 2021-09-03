const express = require("express");
const router = express.Router();
// bring in the protect function from the auth middleware
const { protect } = require("../middleware/auth");
const { getPublic, getPrivate } = require("../controllers/controller");

// user routing, use protect middleware
router.route("/public").get(getPublic);
router.route("/private").get(protect, getPrivate);

module.exports = router;
