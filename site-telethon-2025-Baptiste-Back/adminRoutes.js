const express = require("express");
const { getAllAdmins, loginAdmin } = require("./adminController");

const router = express.Router();

router.get("/", getAllAdmins);
router.post("/login", loginAdmin);

module.exports = router;
