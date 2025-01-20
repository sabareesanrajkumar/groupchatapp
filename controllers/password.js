const Sib = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Users = require("../models/users");
const passwordRequests = require("../models/passwordRequests");

exports.forgotPassword = async (req, res, next) => {
  const client = Sib.ApiClient.instance;

  const apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const tranEmailApi = new Sib.TransactionalEmailsApi();

  const sender = {
    email: process.env.MY_EMAIL_ID,
  };

  const receivers = [
    {
      email: req.body.email,
    },
  ];

  try {
    const user = await Users.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const resetUuid = uuidv4();

    await passwordRequests.create({
      id: resetUuid,
      userId: user.id,
      isActive: true,
    });
    const resetLink = `http://localhost:3000/password/resetpassword/${resetUuid}`;

    const response = await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Reset your password",
      textContent: `
        This is the reset password link
        ${resetLink}
        `,
    });

    console.log("Email sent successfully:", response);
    res
      .status(200)
      .json({ message: "Password reset email sent successfully!" });
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.text || error.message
    );
    res.status(500).json({ error: "Failed to send password reset email." });
  }
};

let uuid;
exports.validateResetLink = async (req, res, next) => {
  uuid = req.params.uuid;

  try {
    const resetRequest = await passwordRequests.findOne({
      where: { id: uuid, isActive: true },
    });

    if (!resetRequest) {
      return res.status(400).json({ message: "reset link expired" });
    }
    return res.send(`
      <html>
        <head>
          <title>Reset Password</title>

          </head>
        <body>
          <h1>Reset Password</h1>
          <form id="reset-password-form">
            <input name="resetUuid" id="reset-uuid" value=${uuid} type="hidden">
            <input type="password" name="newPassword" placeholder="New Password" required />
            <button type="submit">Reset Password</button>
          </form>

          <script nonce="abc123">
            document.getElementById('reset-password-form').addEventListener("submit",async(event)=>{
              event.preventDefault();
            const formData = {
                resetUuid:event.target.resetUuid.value,
                newPassword:event.target.newPassword.value,
            }
            try {
                
                await fetch("http://localhost:3000/password/updatepassword", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
                alert('your password is changed');
                window.close();
            }catch(err){
                console.log(err);
                alert('link expired');
                window.close();
              }
            })
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).json({ message: "couldn't reset password" });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { resetUuid, newPassword } = req.body;
    const resetRequest = await passwordRequests.findOne({
      where: { id: resetUuid, isActive: true },
    });

    const user = await Users.findOne({ where: { id: resetRequest.userId } });
    const saltrounds = 10;
    bcrypt.hash(newPassword, saltrounds, async (err, hash) => {
      await user.update({ passWord: hash });
      await resetRequest.update({ isActive: false });

      return res
        .status(200)
        .json({ success: true, message: "password changed" });
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "failed to reset password" });
  }
};
