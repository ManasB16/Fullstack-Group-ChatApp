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

const User = require("./Models/User");

app.use("/user", userRoute);
app.use((req, res) => {
  res.sendFile(path.join(__dirname, `Views`, `${req.url}`));
});

sequelize
  .sync({ force: false })
  .then((result) => {
    app.listen(4000);
  })
  .catch((err) => console.log(err));
