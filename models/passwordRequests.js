const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const passwordRequests = sequelize.define("passwordRequests", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  userId: Sequelize.INTEGER,
  isActive: Sequelize.BOOLEAN,
});

module.exports = passwordRequests;
