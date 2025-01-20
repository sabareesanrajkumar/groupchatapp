const express = require("express");
const router = express.Router();

const passwordController = require("../controllers/password");

router.post("/forgotpassword", passwordController.forgotPassword);
router.get("/resetpassword/:uuid", passwordController.validateResetLink);
router.post("/updatepassword", passwordController.updatePassword);

module.exports = router;
