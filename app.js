const express = require("express");
const cors = require("cors");
const sequelize = require("./util/database");

const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
const passwordRoutes = require("./routes/password");
const groupRoutes = require("./routes/groups");

app.use("/user", userRoutes);
app.use("/password", passwordRoutes);
app.use("/group", groupRoutes);

const Users = require("./models/users");
const passwordRequests = require("./models/passwordRequests");
const Groups = require("./models/groups");
const GroupMembers = require("./models/groupMembers");

Users.hasMany(passwordRequests, {
  foreignKey: "userId",
});
passwordRequests.belongsTo(Users, {
  foreignKey: "userId",
});

Users.belongsToMany(Groups, {
  through: GroupMembers,
  foreignKey: "userId",
});

Groups.belongsToMany(Users, {
  through: GroupMembers,
  foreignKey: "groupId",
});

Groups.hasMany(GroupMembers, { foreignKey: "groupId" });
GroupMembers.belongsTo(Groups, { foreignKey: "groupId" });
GroupMembers.belongsTo(Users, { foreignKey: "userId" });

sequelize
  .sync()
  .then(() => {
    console.log("DB sync done");
  })
  .catch((err) => console.log(err));

app.listen(3000);
