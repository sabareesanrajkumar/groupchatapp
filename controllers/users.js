const Users = require("../models/users");
const bcrypt = require("bcrypt");
require("dotenv").config();

exports.createUser = async (req, res, next) => {
  try {
    const { userName, email, passWord, phoneNumber } = req.body;
    const saltrounds = 10;
    const hash = await bcrypt.hash(passWord, saltrounds);
    const use = await Users.create({
      userName,
      email,
      passWord: hash,
      phoneNumber,
    });
    return res.status(200).json({ success: true, message: "user created" });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      console.log(err.name);
      return res
        .status(500)
        .json({ success: false, message: "user already exists" });
    }
    return res
      .status(500)
      .json({ success: false, message: "failed to create user" });
  }
};
