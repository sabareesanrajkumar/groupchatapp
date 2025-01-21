const createGroupBtn = document.getElementById("creategroup");
const modal = document.getElementById("create-group-modal");
const closeModal = document.querySelector(".close-modal");
const form = document.getElementById("create-group-form");
const token = localStorage.getItem("token");

createGroupBtn.addEventListener("click", function () {
  modal.style.display = "flex";
});

closeModal.addEventListener("click", function () {
  modal.style.display = "none";
});

window.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const groupName = document.getElementById("group-name").value;
  const groupDescription = document.getElementById("group-description").value;

  if (groupName.trim() === "" || groupDescription.trim() === "") {
    alert("Please fill all fields.");
    return;
  }
  document.getElementById("group-name").value = "";
  document.getElementById("group-description").value = "";

  const groupData = {
    name: groupName,
    description: groupDescription,
  };

  const createGroupResponse = await axios.post(
    "http://localhost:3000/group/creategroup",
    groupData,
    { headers: { Authorization: token } }
  );

  if (createGroupResponse.status === 201) {
    const getGroupResponse = await axios.get(
      "http://localhost:3000/group/getgroups",
      { headers: { Authorization: token } }
    );

    console.log("groups", getGroupResponse.data);
    const groupNames = getGroupResponse.data.map((element) => {
      return [element.groupId, element.Group.name];
    });
    renderGroups(groupNames);
  }

  modal.style.display = "none";
});

window.addEventListener("DOMContentLoaded", async () => {
  const getGroupResponse = await axios.get(
    "http://localhost:3000/group/getgroups",
    { headers: { Authorization: token } }
  );

  if (getGroupResponse.status === 200) {
    console.log("groups first", getGroupResponse.data);
    const groupNames = getGroupResponse.data.map((element) => {
      return [element.groupId, element.Group.name];
    });
    console.log("names", groupNames);
    renderGroups(groupNames);
  }
});

function renderGroups(groupNames) {
  const sidebar = document.getElementById("sidebar");
  const existingList = document.getElementById("group-list");
  if (existingList) {
    existingList.remove();
  }

  const groupList = document.createElement("div");
  groupList.id = "group-list";

  groupNames.forEach(([groupId, groupName]) => {
    const groupItem = document.createElement("div");
    groupItem.classList.add("group-item");
    groupItem.textContent = groupName;
    groupItem.dataset.groupId = groupId;
    groupItem.addEventListener("click", () => {
      document.getElementById("chat-name").textContent = groupName;
    });

    groupList.appendChild(groupItem);
  });

  sidebar.appendChild(groupList);
}
