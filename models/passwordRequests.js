const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const ForgotPasswordRequests = sequelize.define("forgotPasswordRequests", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  userId: Sequelize.INTEGER,
  isActive: Sequelize.BOOLEAN,
});

module.exports = ForgotPasswordRequests;
