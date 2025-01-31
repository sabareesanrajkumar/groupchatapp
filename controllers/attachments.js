const Attachments = require("../models/attachments");
const Messages = require("../models/messages");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_IAM_USER_ACCESS_KEY,
  secretAccessKey: process.env.AWS_IAM_USER_SECRET_KEY,
});

exports.upload = async (req, res) => {
  try {
    const { loggedInUser, groupId } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileContent = req.file.buffer;
    const fileName = `${uuidv4()}-${req.file.originalname}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: req.file.mimetype,
    };

    s3.upload(params, async (err, data) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      const newAttachment = await Attachments.create({
        fileName: req.file.originalname,
        fileUrl: data.Location,
        fileKey: fileName,
        groupId,
        userId: req.user.id,
      });
      const newMessage = await Messages.create({
        userName: req.user.userName,
        groupId: req.body.groupId,
        message: fileName,
        userId: req.user.id,
      });
      return res.status(200).json({
        message: "File uploaded successfully",
        fileUrl: data.Location,
        fileKey: fileName,
        sender: req.user.userName,
        attachmentId: newAttachment.id,
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.download = async (req, res) => {
  const fileKey = req.params.fileKey;
  console.log(fileKey);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
  };

  try {
    const s3Object = await s3.getObject(params).promise();

    res.setHeader("Content-Type", s3Object.ContentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileKey}"`);
    res.send(s3Object.Body);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ message: "File not found" });
  }
};
