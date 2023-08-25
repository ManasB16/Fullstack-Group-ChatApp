const token = localStorage.getItem("token");

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
    document.body.innerHTML += `<p>${err}</p>`;
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  refresh();
});

async function refresh() {
  document.getElementById("chats").innerHTML = "";
  const getChats = await axios.get("http://localhost:4000/chat/getchat");
  getChats.data.allChats.forEach((chat) => {
    showNewChatOnUi(chat);
  });
}

async function showNewChatOnUi(chat) {
  const parentNode = document.getElementById("chats");
  const childElement = `<li>${chat.name}-${chat.message}</li>`;
  parentNode.innerHTML += childElement;
}

setInterval(refresh, 1000);
