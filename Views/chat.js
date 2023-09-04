const socket = io("http://localhost:4000");
const token = localStorage.getItem("token");

socket.on("message", (msg, userName, groupId) => {
  const grpId = localStorage.getItem("currentGroupId");
  if (grpId) {
    if (groupId === grpId) {
      let newP = document.createElement("p");
      newP.innerText = `${userName}: ${msg}`;
      document.getElementById("chats").appendChild(newP);
    }
  }
});

socket.on("file", (msg, userName, groupId) => {
  const grpId = localStorage.getItem("currentGroupId");
  if (grpId) {
    if (groupId == grpId) {
      let parentnode = document.getElementById("chats");

      const childElement = `${userName}: <a href="${msg}">${msg}</a><br />`;
      parentnode.innerHTML += childElement;
    }
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    displayGroupsLeft();
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
});

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

async function onSend(e) {
  try {
    e.preventDefault();
    if (document.querySelector("#fileBtn").files[0]) {
      const grpId = localStorage.getItem("currentGroupId");
      let file = document.querySelector("#fileBtn").files[0];
      let formData = new FormData();
      formData.append("file", file);
      let res = await axios.post(
        `http://localhost:4000/upload/${grpId}`,
        formData,
        {
          headers: { Authorization: token },
          "Content-Type": "multipart/form-data",
        }
      );
      const createdFile = res.data.newFile;
      socket.emit(
        "file",
        createdFile.message,
        createdFile.name,
        createdFile.groupId
      );
      showNewChatOnUi(createdFile);
    } else {
      let msg = e.target.message.value;
      const grpId = localStorage.getItem("currentGroupId");
      const data = {
        message: msg,
        groupid: grpId,
      };

      const postchat = await axios.post(
        "http://localhost:4000/postchat",
        data,
        {
          headers: { Authorization: token },
        }
      );
      const grpMsg = postchat.data.newChat;
      showNewChatOnUi(grpMsg);
      socket.emit("message", msg, grpMsg.name, grpId);
      document.getElementById("msg").value = "";
    }
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

async function refresh(groupId) {
  try {
    document.getElementById("chats").innerHTML = "";
    const getChats = await axios.get(
      `http://localhost:4000/getchat/${groupId}`,
      { headers: { Authorization: token } }
    );
    getChats.data.allChats.forEach((msg) => {
      showNewChatOnUi(msg);
    });
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

async function showNewChatOnUi(chat) {
  try {
    let currUser = parseJwt(token);
    const parentNode = document.getElementById("chats");
    if (chat.datatype === "text") {
      if (chat.userId == currUser.userId) {
        const childElement = `<p>You: ${chat.message}</p>`;
        parentNode.innerHTML += childElement;
      } else {
        const childElement = `<p>${chat.name}: ${chat.message}</p>`;
        parentNode.innerHTML += childElement;
      }
    } else {
      if (chat.userId == currUser.userId) {
        const childElement = `You: <a href="${chat.message}">${chat.message}</a><br/>`;
        parentNode.innerHTML += childElement;
      } else {
        const childElement = `${chat.name}: <a href="${chat.message}">${chat.message}</a><br/>`;
        parentNode.innerHTML += childElement;
      }
    }
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

async function createNewGroup() {
  try {
    const groupName = prompt("Enter New Group Name");
    if (groupName != null) {
      let createdGroup = await axios.post(
        "http://localhost:4000/createGroup",
        { groupName },
        {
          headers: { Authorization: token },
        }
      );
    }
    displayGroupsLeft();
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

async function getAllGroups() {
  try {
    let allGroups = await axios.get("http://localhost:4000/getGroups", {
      headers: { Authorization: token },
    });
    return allGroups.data.groups;
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

async function displayGroupsLeft() {
  try {
    let userId = parseJwt(token).userId;
    let groups = await getAllGroups();
    let ul = document.createElement("ul");
    ul.className = "list-unstyled";
    groups.forEach((grp) => {
      let li = document.createElement("li");
      li.setAttribute("groupId", grp.id);
      li.setAttribute("createdBy", grp.createdBy);
      li.setAttribute("groupName", grp.name);
      li.innerHTML = `<b>${grp.name}</b>`;

      if (grp.createdBy === userId) {
        let addButton = document.createElement("button");
        addButton.className = "btn btn-outline-success";
        addButton.textContent = "Add";
        addButton.addEventListener("click", addMembers);

        let delButton = document.createElement("button");
        delButton.textContent = "Remove";
        delButton.className = "btn btn-outline-danger";
        delButton.addEventListener("click", RemoveMember);

        let adminButton = document.createElement("button");
        adminButton.className = "btn btn-outline-secondary";
        adminButton.textContent = "ChangeAdmin";
        adminButton.addEventListener("click", changeAdmin);

        let delGroupButton = document.createElement("button");
        delGroupButton.className = "btn btn-outline-warning";
        delGroupButton.textContent = "Delete";
        delGroupButton.addEventListener("click", removeGroup);

        li.appendChild(addButton);
        li.appendChild(delButton);
        li.appendChild(adminButton);
        li.appendChild(delGroupButton);
      }
      let openChatbutton = document.createElement("button");
      openChatbutton.className = "btn btn-outline-info";
      openChatbutton.textContent = "Openchat";
      openChatbutton.addEventListener("click", groupchatpage);
      li.appendChild(openChatbutton);
      ul.appendChild(li);

      document.querySelector("#groups").innerHTML = ""; // clearing old list
      document.querySelector("#groups").appendChild(ul); // appending new list
    });
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

async function groupchatpage(e) {
  e.preventDefault();
  const GroupId = e.target.parentElement.getAttribute("groupId");
  document.querySelector("#visib").style.visibility = "visible";
  document.querySelector("#grpName").style.visibility = "visible";
  localStorage.setItem("currentGroupId", GroupId);
  const grpName = e.target.parentElement.getAttribute("groupName");
  document.getElementById("grpName").innerHTML = "";
  document.getElementById("grpName").innerText = grpName;
  refresh(GroupId);
}

async function addMembers(e) {
  try {
    e.preventDefault();
    let groupid = e.target.parentElement.getAttribute("groupId");
    const email = prompt("Enter member email:");
    const data = {
      groupid,
      email,
    };
    if (email) {
      const res = await axios.post("http://localhost:4000/addmembers", data, {
        headers: { Authorization: token },
      });
      alert(res.data.msg);
    } else alert("No such member exists");
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

async function RemoveMember(e) {
  try {
    e.preventDefault();
    let groupid = e.target.parentElement.getAttribute("groupId");
    const email = prompt("Enter the email you want to remove");
    const data = {
      groupid,
      email,
    };
    if (email) {
      const res = await axios.post("http://localhost:4000/removemember", data, {
        headers: { Authorization: token },
      });
      alert(res.data.msg);
    } else alert("No such member exists");
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

async function changeAdmin(e) {
  try {
    e.preventDefault();
    let groupid = e.target.parentElement.getAttribute("groupId");
    const email = prompt(
      "Enter mail of person who you want to promote as admin"
    );
    const data = {
      groupid,
      email,
    };
    if (email) {
      const res = await axios.patch("http://localhost:4000/changeadmin", data, {
        headers: { Authorization: token },
      });
      alert(res.data.msg);
      displayGroupsLeft();
    } else alert("No such member exists");
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

async function removeGroup(e) {
  try {
    e.preventDefault();
    let groupid = e.target.parentElement.getAttribute("groupId");
    if (groupid) {
      let res = await axios.delete(
        `http://localhost:4000/deletegroup/${groupid}`,
        { headers: { Authorization: token } }
      );
      alert(res.data.msg);
      displayGroupsLeft();
    }
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}
