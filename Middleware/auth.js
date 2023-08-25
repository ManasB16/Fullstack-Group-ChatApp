const User = require("../Models/User");
const jwt = require("jsonwebtoken");

const Authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    const user = jwt.verify(token, "my_secret_key");
    const useR = await User.findByPk(user.userId);
    req.user = useR;
    next();
  } catch (err) {
    return res.status(401).json({ success: false });
  }
};

module.exports = {
  Authenticate,
};
