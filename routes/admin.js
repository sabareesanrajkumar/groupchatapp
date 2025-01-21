const express = require("express");
const router = express.Router();

const authenticationController = require("../middleware/auth");
const adminController = require("../controllers/admin");

router.post(
  "/addmember",
  authenticationController.authenticate,
  adminController.addMember
);

router.get(
  "/getmembers/:groupId",
  authenticationController.authenticate,
  adminController.getMembers
);

router.post(
  "/makeadmin",
  authenticationController.authenticate,
  adminController.makeAdmin
);

router.delete("/removemember/:groupId/:userId", adminController.removeMember);

module.exports = router;
