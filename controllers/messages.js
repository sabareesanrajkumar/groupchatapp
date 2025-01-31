const Message = require("../models/messages");
const User = require("../models/users");
const Group = require("../models/groups");
const GroupMember = require("../models/groupMembers");
const Sequelize = require("sequelize");

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
    const now = new Date();

    const todayIST = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const todayUTC = new Date(todayIST.getTime() - (5 * 60 + 30) * 60000);
    const tomorrowIST = new Date(todayIST);
    tomorrowIST.setDate(tomorrowIST.getDate() + 1);
    const tomorrowUTC = new Date(tomorrowIST.getTime() - (5 * 60 + 30) * 60000);

    const groupChat = await Message.findAll({
      where: {
        groupId: req.params.groupId,
        createdAt: {
          [Sequelize.Op.gte]: todayUTC,
          [Sequelize.Op.lt]: tomorrowUTC,
        },
      },

      attributes: ["userName", "message"],
    });
    res.status(200).json({ groupChat, loggedInUser: req.user.userName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getArchivedChat = async (req, res, next) => {
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
