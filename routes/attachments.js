const express = require("express");
const router = express.Router();

const attachmentsController = require("../controllers/attachments");
const authenticationController = require("../middleware/auth");

const multer = require("multer");
const upload = multer();

router.post(
  "/upload",
  authenticationController.authenticate,
  upload.single("file"),
  attachmentsController.upload
);

router.get(
  "/download/:fileKey",
  authenticationController.authenticate,
  attachmentsController.download
);

module.exports = router;
