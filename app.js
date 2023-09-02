require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./Util/database");
var cors = require("cors");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("message", (msg, userName, groupId) => {
    socket.broadcast.emit("message", msg, userName, groupId);
  });
});

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

const userRoute = require("./Routes/user");
const passwordRoute = require("./Routes/password");
const chatsRoute = require("./Routes/chat");
const groupRoute = require("./Routes/group");

const User = require("./Models/User");
const ForgotPassword = require("./Models/Password");
const Chats = require("./Models/Chat");
const Group = require("./Models/Group");
const UserGroup = require("./Models/UserGroup");

app.use("/user", userRoute);
app.use("/password", passwordRoute);
app.use(chatsRoute);
app.use(groupRoute);
app.use((req, res) => {
  res.sendFile(path.join(__dirname, `Views`, `${req.url}`));
});

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

User.hasMany(Chats);
Chats.belongsTo(User);

Chats.belongsTo(Group);
Group.hasMany(Chats);

Group.belongsToMany(User, { through: UserGroup });
User.belongsToMany(Group, { through: UserGroup });

sequelize
  .sync({ force: false })
  .then((result) => {
    http.listen(4000);
  })
  .catch((err) => console.log(err));
