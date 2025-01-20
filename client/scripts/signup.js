document
  .getElementById("signup-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = {
      userName: event.target.username.value,
      email: event.target.email.value,
      passWord: event.target.password.value,
      phoneNumber: event.target.phonenumber.value,
    };
    try {
      const postResponse = await axios.post(
        "http://localhost:3000/user/signup",
        formData
      );
      if (postResponse.status == 200) {
        window.location.href = "login.html";
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
function resetForm(event) {
  event.target.username.value = "";
  event.target.email.value = "";
  event.target.password.value = "";
  event.target.phonenumber.value = "";
}
