const Group = require("../models/groups");
const Users = require("../models/users");
const GroupMember = require("../models/groupMembers");

exports.addMember = async (req, res, next) => {
  try {
    console.log(req.user.phoneNumber);
    console.log(req.body.groupId);
    const user = await Users.findOne({
      where: { phoneNumber: req.body.phoneNumber },
    });

    if (!user) {
      return res.status(401).json({ success: false });
    }

    await GroupMember.create({
      userId: user.id,
      groupId: req.body.groupId,
      role: "member",
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.log("Err>>>>", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMembers = async (req, res, next) => {
  try {
    const members = await GroupMember.findAll({
      where: { groupId: req.params.groupId },
      include: [
        { model: Users, attributes: ["id", "userName", "phoneNumber"] },
      ],
    });

    res.json(
      members.map((m) => ({
        userId: m.userId,
        userName: m.user.userName,
        role: m.role,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.makeAdmin = async (req, res, next) => {
  try {
    await GroupMember.update(
      { role: "admin" },
      { where: { groupId: req.body.groupId, userId: req.body.userId } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      where: { id: req.params.groupId },
    });
    if (group.creatorId == req.params.userId) {
      return res
        .status(201)
        .json({ success: false, message: "cannot remove creator" });
    } else {
      await GroupMember.destroy({
        where: { groupId: req.params.groupId, userId: req.params.userId },
      });
      return res.status(200).json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
