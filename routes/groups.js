const express = require("express");
const router = express.Router();

const authenticationController = require("../middleware/auth");
const groupController = require("../controllers/groups");

router.post(
  "/creategroup",
  authenticationController.authenticate,
  groupController.createGroup
);

router.get(
  "/getgroups",
  authenticationController.authenticate,
  groupController.getGroups
);

router.get(
  "/checkadmin/:groupId",
  authenticationController.authenticate,
  groupController.checkAdmin
);

module.exports = router;
