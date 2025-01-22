const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Message = sequelize.define("Message", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userName: Sequelize.STRING,
  groupId: Sequelize.INTEGER,
  message: Sequelize.STRING,
});

module.exports = Message;
