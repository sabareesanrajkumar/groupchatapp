document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    document.getElementById("error").innerHTML = "";
    const FormData = {
      phoneNumber: event.target.phonenumber.value,
      passWord: event.target.password.value,
    };
    try {
      const postResponse = await axios.post(
        "http://localhost:3000/user/login",
        FormData
      );
      if (postResponse.status == 200) {
        localStorage.setItem("token", postResponse.data.token);
      }
      resetForm(event);
    } catch (err) {
      resetForm(event);
      if (err.response.status != 200) {
        document.getElementById("error").innerHTML = JSON.stringify(
          err.response.data.message
        );
      }
    }
  });
async function forgotPassword() {
  document.getElementById("forgot-password-form").style.display = "block";
  document.getElementById("forgot-password-btn").style.display = "none";
  document.getElementById("login").style.display = "none";
  document
    .getElementById("forgot-password-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const forgotPasswordResponse = await axios.post(
        "http://localhost:3000/password/forgotpassword",
        { email: event.target.email.value }
      );
      event.target.email.value = "";
      document.getElementById("forgot-password-form").style.display = "none";
      alert("reset link sent to your mail");
      window.location.href = "../views/login.html";
    });
}

function resetForm(event) {
  event.target.phonenumber.value = "";
  event.target.password.value = "";
}
