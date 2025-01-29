const express = require("express");
const cors = require("cors");
const sequelize = require("./util/database");

const app = express();
app.use(cors());
app.use(express.json());

const io = require("socket.io")(5000, {
  cors: {
    origin: ["null"],
  },
});
io.on("connect", (socket) => {
  socket.on("join-group", (groupId) => {
    socket.join(String(groupId));
    console.log(`User ${socket.id} joined group ${groupId}`);
    socket.emit("joined-group", groupId);
  });
  socket.on("send-chat", (message, groupId) => {
    console.log(`Trying to send message: "${message}" to group: ${groupId}`);
    console.log("Socket rooms before sending:", socket.rooms);

    // Emit only if the socket is in the room
    if (socket.rooms.has(groupId)) {
      io.to(groupId).emit("receive-chat", message, groupId);
      console.log("Message sent successfully!");
    } else {
      console.log(`🚨 Socket ${socket.id} is NOT in group ${groupId}!`);
    }
  });
  socket.on("leave-group", (groupId) => {
    socket.leave(groupId);
    console.log(`left group ${groupId}`);
  });
});

const userRoutes = require("./routes/users");
const passwordRoutes = require("./routes/password");
const groupRoutes = require("./routes/groups");
const adminRoutes = require("./routes/admin");
const messageRoutes = require("./routes/messages");

app.use("/user", userRoutes);
app.use("/password", passwordRoutes);
app.use("/group", groupRoutes);
app.use("/admin", adminRoutes);
app.use("/message", messageRoutes);

const Users = require("./models/users");
const passwordRequests = require("./models/passwordRequests");
const Groups = require("./models/groups");
const GroupMembers = require("./models/groupMembers");
const Message = require("./models/messages");

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

Users.hasMany(Message, { foreignKey: "userId" });
Groups.hasMany(Message, { foreignKey: "groupId" });

Message.belongsTo(Users, { foreignKey: "userId" });
Message.belongsTo(Groups, { foreignKey: "groupId" });

sequelize
  .sync()
  .then(() => {
    console.log("DB sync done");
  })
  .catch((err) => console.log(err));

app.listen(3000);
