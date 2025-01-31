const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Attachments = sequelize.define("Attachments", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fileUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  fileName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  fileKey: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userId: Sequelize.INTEGER,
  groupId: Sequelize.INTEGER,
});

module.exports = Attachments;
