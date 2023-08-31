const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./Util/database");
const app = express();
var cors = require("cors");

app.use(
  cors({
    origin: "http://127.0.0.1:5500/",
  })
);

require("dotenv").config();

app.use(bodyParser.json({ extended: false }));

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
    app.listen(4000);
  })
  .catch((err) => console.log(err));
