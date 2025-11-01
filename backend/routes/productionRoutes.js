const express = require("express")
const { getProduction, updateProduction } = require("../controller/productionController")
const router = express.Router()

router.get("/", getProduction)
router.put("/", updateProduction)

module.exports = router