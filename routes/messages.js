const express = require("express");
const router = express.Router();

const authenticationController = require("../middleware/auth");
const messageController = require("../controllers/messages");

router.post(
  "/send/:groupId",
  authenticationController.authenticate,
  messageController.sendMessage
);

router.get(
  "/getchat/:groupId",
  authenticationController.authenticate,
  messageController.getChat
);

module.exports = router;
