const Message = require("../models/messages");
const User = require("../models/users");
const Group = require("../models/groups");
const GroupMember = require("../models/groupMembers");

exports.sendMessage = async (req, res, next) => {
  try {
    const chat = req.body.chat;
    const userName = req.user.userName;
    const newMessage = await Message.create({
      userName,
      groupId: req.params.groupId,
      message: chat,
      userId: req.user.id,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChat = async (req, res, next) => {
  try {
    const groupChat = await Message.findAll({
      where: { groupId: req.params.groupId },
      attributes: ["userName", "message"],
    });
    res.status(200).json({ groupChat, loggedInUser: req.user.userName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
