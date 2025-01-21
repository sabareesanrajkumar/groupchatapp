const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const GroupMember = sequelize.define("GroupMember", {
  userId: Sequelize.INTEGER,
  groupId: Sequelize.INTEGER,
  role: Sequelize.STRING,
});

module.exports = GroupMember;
