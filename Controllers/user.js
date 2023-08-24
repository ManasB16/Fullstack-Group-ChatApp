const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function isStringValid(string) {
  if (string == undefined || string.length === 0) {
    return true;
  } else {
    return false;
  }
}

function generateToken(id, name) {
  return jwt.sign({ userId: id, name: name }, "my_secret_key");
}

const postUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (
      isStringValid(name) ||
      isStringValid(email) ||
      isStringValid(password)
    ) {
      return res.status(400).json({ err: "Something is missing" });
    }
    const saltrounds = 10;
    bcrypt.hash(password, saltrounds, async (err, hash) => {
      await User.create({
        name: name,
        email: email,
        password: hash,
      });
      res.status(201).json({ message: "Successfully created new User" });
    });
  } catch (err) {
    res.status(403).json({
      error: err,
    });
  }
};

const postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (isStringValid(email) || isStringValid(password)) {
      return res.status(400).json({ err: "Something is missing" });
    }

    let user = await User.findAll({ where: { email: email } });
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, async (err, result) => {
        if (err) {
          throw new Error("Something went wrong");
        }
        if (result) {
          return res.status(200).json({
            success: true,
            message: "User Logged in successfully",
            token: generateToken(user[0].id, user[0].name),
          });
        } else {
          return res
            .status(400)
            .json({ success: false, message: "Password Incorrect" });
        }
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User does not Exists" });
    }
  } catch (err) {
    res.status(500).json({
      message: err,
      success: false,
    });
  }
};

module.exports = {
  postUser,
  postLogin,
};
