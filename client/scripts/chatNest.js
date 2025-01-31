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
    const groupNames = getGroupResponse.data.map((element) => {
      return [element.groupId, element.Group.name];
    });
    renderGroups(groupNames);
  }
});

let socket = io("http://localhost:5000");
socket.on("connect", () => {
  console.log("you're connected");
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
    groupItem.addEventListener("click", async () => {
      document.getElementById("send-value-container").style.display = "flex";
      document.getElementById("chat-name").textContent = groupName;
      document.getElementById("chat-name").dataset.groupId = groupId;
      const adminResponse = await axios.get(
        `http://localhost:3000/group/checkadmin/${groupId}`,
        {
          headers: { Authorization: token },
        }
      );

      if (
        groupId !== localStorage.getItem("currentGroupId") &&
        localStorage.getItem("currentGroupId") !== null
      ) {
        console.log(
          "left group",
          localStorage.getItem("currentGroupId"),
          "and joined",
          groupId
        );
        socket.emit("leave-group", localStorage.getItem("currentGroupId"));
      }

      socket.emit("join-group", groupId);
      socket.on("joined-group", (groupId) => {
        localStorage.setItem("currentGroupId", groupId);
      });

      console.log(adminResponse);
      if (adminResponse.data.isAdmin === true) {
        document.getElementById("admin-power").style.display = "block";
      } else {
        document.getElementById("admin-power").style.display = "none";
      }
      getGroupChat(groupId);
    });

    groupList.appendChild(groupItem);
  });

  sidebar.appendChild(groupList);
}

document.getElementById("edit-member").addEventListener("click", openEditModal);
document
  .querySelector(".close-edit-modal")
  .addEventListener("click", closeEditModal);

async function openEditModal() {
  const groupId = getSelectedGroupId();
  const members = await fetchGroupMembers(groupId);
  renderGroupMembers(members, groupId);
  document.getElementById("edit-member-modal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("edit-member-modal").style.display = "none";
}

async function fetchGroupMembers(groupId) {
  try {
    const response = await axios.get(
      `http://localhost:3000/admin/getmembers/${groupId}`,
      { headers: { Authorization: token } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching group members:", error);
    return [];
  }
}

function renderGroupMembers(members, groupId) {
  const memberList = document.getElementById("group-member-list");
  memberList.innerHTML = "";

  members.forEach((member) => {
    const listItem = document.createElement("li");
    listItem.classList.add("member-item");

    listItem.innerHTML = `
            <span>${member.userName} (${member.role})</span>
            <button class="make-admin-btn" data-userid="${member.userId}" data-groupid="${groupId}">Make Admin</button>
            <button class="remove-member-btn" data-userid="${member.userId}" data-groupid="${groupId}">Remove</button>
        `;

    memberList.appendChild(listItem);
  });

  document.querySelectorAll(".make-admin-btn").forEach((btn) => {
    btn.addEventListener("click", makeAdmin);
  });

  document.querySelectorAll(".remove-member-btn").forEach((btn) => {
    btn.addEventListener("click", removeMember);
  });
}

document
  .getElementById("add-member-btn")
  .addEventListener("click", async () => {
    const phoneNumber = document.getElementById("add-member-phone").value;
    const groupId = getSelectedGroupId();

    if (!phoneNumber) {
      alert("Please enter a phone number.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/admin/addmember`,
        { phoneNumber: phoneNumber, groupId: groupId },
        { headers: { Authorization: token } }
      );

      if (response.status === 200) {
        alert("Member added successfully!");
        document.getElementById("add-member-phone").value = "";
        openEditModal();
      } else {
        alert("User not found.");
      }
    } catch (error) {
      console.error("Error adding member:", error);
    }
  });

async function makeAdmin(event) {
  const userId = event.target.dataset.userid;
  const groupId = event.target.dataset.groupid;
  try {
    const makeAdminResponse = await axios.post(
      `http://localhost:3000/admin/makeadmin`,
      { userId: userId, groupId: groupId },
      { headers: { Authorization: token } }
    );
    alert("User is now an admin.");
    openEditModal();
  } catch (error) {
    console.error("Error making admin:", error);
  }
}

async function removeMember(event) {
  const userId = event.target.dataset.userid;
  const groupId = event.target.dataset.groupid;

  try {
    const removeMemberResponse = await axios.delete(
      `http://localhost:3000/admin/removemember/${groupId}/${userId}`
    );
    if (removeMemberResponse.status == 200) {
      alert("User removed from group.");
      openEditModal();
    }
    if (removeMemberResponse.status == 201) {
      alert("Cannot remove creator from group.");
    }
  } catch (error) {
    console.error("Error removing member:", error);
  }
}

function getSelectedGroupId() {
  return document.getElementById("chat-name").dataset.groupId;
}

const sendForm = document.getElementById("send-chat");
sendForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const chat = event.target.message.value;
  const groupId = getSelectedGroupId();
  const token = localStorage.getItem("token");
  const sender = localStorage.getItem("loggedInUser");
  const chatStorageResponse = await axios.post(
    `http://localhost:3000/message/send/${groupId}`,
    { chat },
    { headers: { Authorization: token } }
  );
  socket.emit("send-chat", chat, groupId, sender);
  event.target.message.value = "";
});

function displayNewMessage(message, groupId, sender) {
  const loggedInUser = localStorage.getItem("loggedInUser");
  const chatContent = document.getElementById("chat-content");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  if (sender === loggedInUser) {
    messageElement.classList.add("sent");
  } else {
    messageElement.classList.add("received");
  }

  messageElement.innerHTML = `
      <p class="sender">${sender}</p>
      <p class="text">${message}</p>
    `;

  chatContent.appendChild(messageElement);
}

async function getGroupChat(groupId) {
  const getChatResponse = await axios.get(
    `http://localhost:3000/message/getchat/${groupId}`,
    { headers: { Authorization: token } }
  );

  if (getChatResponse.status == 200) {
    localStorage.setItem("loggedInUser", getChatResponse.data.loggedInUser);
    renderGroupChat(
      getChatResponse.data.groupChat,
      getChatResponse.data.loggedInUser
    );
    addLoadPreviousChatBtn(groupId);
  }
}

async function getArchivedGroupChat(groupId) {
  const getArchivedChatResponse = await axios.get(
    `http://localhost:3000/message/getarchivedchat/${groupId}`,
    { headers: { Authorization: token } }
  );

  if (getArchivedChatResponse.status == 200) {
    localStorage.setItem(
      "loggedInUser",
      getArchivedChatResponse.data.loggedInUser
    );
    renderGroupChat(
      getArchivedChatResponse.data.groupChat,
      getArchivedChatResponse.data.loggedInUser
    );
  }
}

function renderGroupChat(data, loggedInUser) {
  const chatContent = document.getElementById("chat-content");
  chatContent.innerHTML = "";

  data.forEach((msg) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (msg.userName === loggedInUser) {
      messageElement.classList.add("sent");
    } else {
      messageElement.classList.add("received");
    }
    const fileKeyPattern = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/;
    if (fileKeyPattern.test(msg.message)) {
      messageElement.innerHTML = `
      <p class="sender">${msg.userName}</p>
      <button  id="${msg.message}" onclick="downloadFile('${msg.message}')" class="multimedia-chat">sent a file</button>
    `;
    } else {
      messageElement.innerHTML = `
      <p class="sender">${msg.userName}</p>
      <p class="text">${msg.message}</p>
    `;
    }
    chatContent.appendChild(messageElement);
  });

  chatContent.scrollTop = chatContent.scrollHeight;
}

function addLoadPreviousChatBtn(groupId) {
  console.log("adding previous button");
  const chatContent = document.getElementById("chat-content");
  const archiveButton = document.createElement("button");
  archiveButton.innerHTML = "load entire chat";
  archiveButton.id = "archive-button";
  archiveButton.addEventListener("click", () => {
    getArchivedGroupChat(groupId);
    document.getElementById("archive-button").style.display = "none";
  });
  chatContent.prepend(archiveButton);
}

document.getElementById("send-file-btn").addEventListener("click", () => {
  document.getElementById("send-file-modal").style.display = "flex";
});

document
  .querySelector(".close-send-file-modal")
  .addEventListener("click", () => {
    document.getElementById("send-file-modal").style.display = "none";
  });

document
  .getElementById("upload-file-btn")
  .addEventListener("click", async () => {
    const fileInput = document.querySelector(`.attachments-input`);
    if (!fileInput || fileInput.files.length === 0) {
      alert("Please select files to upload.");
      return;
    }
    const file = fileInput.files[0];
    const formData = new FormData();
    const groupId = getSelectedGroupId();
    formData.append("file", file);
    formData.append("loggedInUser", localStorage.getItem("loggedInUser"));
    formData.append("groupId", groupId);

    try {
      const response = await axios.post(
        `http://localhost:3000/attachment/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      const groupId = getSelectedGroupId();
      const data = {
        fileUrl: response.data.fileUrl,
        fileKey: response.data.fileKey,
        sender: localStorage.getItem("loggedInUser"),
      };
      socket.emit("uploadFile", data, groupId);
      alert("File sent successfully!");
      document.getElementById("send-file-modal").style.display = "none";
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed.");
    }
  });

socket.on("receive-chat", (message, groupId, sender) => {
  displayNewMessage(message, groupId, sender);
});

socket.on("fileShared", (data, groupId) => {
  displayNewFile(data);
});

function displayNewFile(data) {
  const loggedInUser = localStorage.getItem("loggedInUser");
  const chatContent = document.getElementById("chat-content");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  console.log("display newFile", data);
  if (data.sender === loggedInUser) {
    messageElement.classList.add("sent");
  } else {
    messageElement.classList.add("received");
  }

  messageElement.innerHTML = `
  <p class="sender">${data.sender}</p>
  <button  id="${data.fileKey}" onclick="downloadFile('${data.fileKey}')" class="multimedia-chat">sent a file</button>
`;

  chatContent.appendChild(messageElement);
}

async function downloadFile(fileKey) {
  console.log("att id in download", fileKey);
  try {
    const downloadResponse = await axios.get(
      `http://localhost:3000/attachment/download/${fileKey}`,
      { headers: { Authorization: token }, responseType: "blob" }
    );
    const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));

    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = downloadResponse.headers["content-disposition"];
    let fileName = fileKey;
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="?(.+?)"?$/);
      if (matches && matches[1]) {
        fileName = matches[1];
      }
    }

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
    alert("Failed to download file.");
  }
}
