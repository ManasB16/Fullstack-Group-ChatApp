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
