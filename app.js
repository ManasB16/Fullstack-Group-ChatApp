const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./Util/database");

require("dotenv").config();

const app = express();
var cors = require("cors");

app.use(cors());

app.use(bodyParser.json({ extended: false }));

const userRoute = require("./Routes/user");

const User = require("./Models/User");

app.use("/user", userRoute);
app.use((req, res) => {
  console.log(req.url);
  res.sendFile(path.join(__dirname, `Views`, `${req.url}`));
});

sequelize
  .sync({ force: false })
  .then((result) => {
    app.listen(4000);
  })
  .catch((err) => console.log(err));
