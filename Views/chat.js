const token = localStorage.getItem("token");

window.addEventListener("DOMContentLoaded", async () => {
  try {
    refresh();
  } catch (err) {
    document.body.innerHTML += `<div style="color: red;text-align: center;">
                                    <h3>${err}</h3>
                              </div>`;
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

    const msg = {
      message: e.target.message.value,
    };

    const postchat = await axios.post(
      "http://localhost:4000/chat/postchat",
      msg,
      {
        headers: { Authorization: token },
      }
    );
    alert("Chat Sent");
    document.getElementById("msg").value = "";
  } catch (err) {
    document.body.innerHTML += `<div style="color: red;text-align: center;">
                                    <h3>${err}</h3>
                              </div>`;
  }
}

async function refresh() {
  try {
    document.getElementById("chats").innerHTML = "";
    let concatedArr;

    let chat = JSON.parse(localStorage.getItem("Allchats"));
    if (chat == null || chat.length == 0 || chat == undefined) lastchatid = 0;
    else lastchatid = chat[chat.length - 1].id;

    const getChats = await axios.get(
      `http://localhost:4000/chat/getchat?lastchatid=${lastchatid}`,
      { headers: { Authorization: token } }
    );
    const backendArr = getChats.data.allChats;

    if (chat == null || chat == undefined || chat.length == 0) {
      concatedArr = [...backendArr];
    } else {
      concatedArr = chat.concat(backendArr);
    }
    if (concatedArr.length > 10) {
      concatedArr = concatedArr.slice(concatedArr.length - 10);
    }

    const localstorageChat = JSON.stringify(concatedArr);
    localStorage.setItem("Allchats", localstorageChat);

    concatedArr.forEach((msg) => {
      showNewChatOnUi(msg);
    });
  } catch (err) {
    document.body.innerHTML += `<div style="color: red;text-align: center;">
                                    <h3>${err}</h3>
                              </div>`;
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
    document.body.innerHTML += `<div style="color: red;text-align: center;">
                                    <h3>${err}</h3>
                              </div>`;
  }
}

// setInterval(refresh, 1000);
