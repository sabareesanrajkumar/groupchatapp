// models/archivedMessages.js

const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const ArchivedMessage = sequelize.define("ArchivedMessage", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userName: Sequelize.STRING,
  groupId: Sequelize.INTEGER,
  message: Sequelize.STRING,
  archivedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  sentAt: Sequelize.STRING,
});

module.exports = ArchivedMessage;
