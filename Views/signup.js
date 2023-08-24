async function signup(e) {
  try {
    e.preventDefault();

    let user = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };

    let post = await axios.post("http://localhost:4000/user/signup", user);
    window.location.href = "login.html";
  } catch (err) {
    document.body.innerHTML += `<p>User Alreay Exists ${err}</p>`;
  }
}

