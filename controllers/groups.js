const Group = require("../models/groups");
const GroupMember = require("../models/groupMembers");

exports.createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      creatorId: req.user.id,
    });

    console.log(group.dataValues.id);
    await GroupMember.create({
      userId: req.user.id,
      groupId: group.dataValues.id,
      role: "admin",
    });

    res.status(201).json(group);
  } catch (error) {
    console.log("error>>>>>>>>>", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getGroups = async (req, res, next) => {
  try {
    const groups = await GroupMember.findAll({
      where: { userId: req.user.id },
      include: [{ model: Group, attributes: ["name"] }],
    });
    res.status(200).json(groups);
  } catch (err) {
    console.log("ERR", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.checkAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.groupId;
    const member = await GroupMember.findOne({
      where: { userId, groupId, role: "admin" },
    });

    if (member) {
      return res.status(200).json({ isAdmin: true });
    } else {
      return res.status(200).json({ isAdmin: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
