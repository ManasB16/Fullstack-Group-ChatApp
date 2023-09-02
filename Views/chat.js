const socket = io("http://localhost:4000");
const token = localStorage.getItem("token");

socket.on("message", (msg, userName, groupId) => {
  let gId = localStorage.getItem("currentGroupId");
  if (groupId === gId) {
    let newP = document.createElement("p");
    newP.innerText = `${userName}: ${msg}`;
    document.getElementById("chats").appendChild(newP);
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
    let GroupId = localStorage.getItem("currentGroupId");
    let msg = e.target.message.value;
    const data = {
      message: msg,
      groupid: GroupId,
    };

    const postchat = await axios.post("http://localhost:4000/postchat", data, {
      headers: { Authorization: token },
    });
    const grpMsg = postchat.data.newChat;
    const msgElement = document.createElement("p");
    msgElement.innerText = `You: ${grpMsg.message}`;
    document.getElementById("chats").appendChild(msgElement);
    socket.emit("message", msg, grpMsg.name, GroupId);
    document.getElementById("msg").value = "";
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
    if (chat.userId == currUser.userId) {
      const childElement = `<p>You: ${chat.message}</p>`;
      parentNode.innerHTML += childElement;
    } else {
      const childElement = `<p>${chat.name}: ${chat.message}</p>`;
      parentNode.innerHTML += childElement;
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
        "http://localhost:4000/group/createGroup",
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
    let allGroups = await axios.get("http://localhost:4000/group/getGroups", {
      headers: { Authorization: token },
    });
    return allGroups.data.groups;
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

async function displayGroupsLeft() {
  try {
    let userId = parseJwt(localStorage.getItem("token")).userId;
    let groups = await getAllGroups();
    let ul = document.createElement("ul");
    ul.className = "list-unstyled";
    groups.forEach((grp) => {
      let li = document.createElement("li");
      li.setAttribute("groupId", grp.id);
      li.setAttribute("createdBy", grp.createdBy);
      li.setAttribute("groupName", grp.name);
      // if(grp.id == userId) console.log(true)
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
  const grpId = e.target.parentElement.getAttribute("groupId");
  document.querySelector("#visib").style.visibility = "visible";
  document.querySelector("#grpName").style.visibility = "visible";
  localStorage.setItem("currentGroupId", grpId);
  const grpName = e.target.parentElement.getAttribute("groupName");
  document.getElementById("grpName").innerHTML = "";
  document.getElementById("grpName").innerText = grpName;
  refresh(grpId);
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
      const res = await axios.post(
        "http://localhost:4000/group/addmembers",
        data,
        {
          headers: { Authorization: token },
        }
      );
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
      const res = await axios.post(
        "http://localhost:4000/group/removemember",
        data,
        {
          headers: { Authorization: token },
        }
      );
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
      const res = await axios.patch(
        "http://localhost:4000/group/changeadmin",
        data,
        {
          headers: { Authorization: token },
        }
      );
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
    let res = await axios.delete(
      `http://localhost:4000/group/deletegroup/${groupid}`,
      { headers: { Authorization: token } }
    );
    displayGroupsLeft();
  } catch (err) {
    document.body.innerHTML += `<p>${err}</p>`;
  }
}
