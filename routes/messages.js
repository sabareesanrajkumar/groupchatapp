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

router.get(
  "/getarchivedchat/:groupId",
  authenticationController.authenticate,
  messageController.getArchivedChat
);

module.exports = router;
