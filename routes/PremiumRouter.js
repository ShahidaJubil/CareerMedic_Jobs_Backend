const express = require("express");
const { postPremiumProfile, getPremiumProfile, getEachPremiumProfile, putPremiumProfile, deletePremiumProfile } = require("../controller/premiumUsers");
const router = express.Router();


router.post("/post/profile/premium",postPremiumProfile)
router.get("/get/profile/premium",getPremiumProfile)
router.get("/geteach/profile/premium/:id",getEachPremiumProfile)
router.put("/put/profile/premium/:id",putPremiumProfile)
router.delete("/delete/profile/premium/:id",deletePremiumProfile)

module.exports = router;