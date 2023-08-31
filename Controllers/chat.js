const Chat = require("../Models/Chat");
const sequelize = require("../Util/database");

const postChat = async (req, res, next) => {
  try {
    const { message, groupid } = req.body;
    const newChat = await req.user.createChat({
      name: req.user.name,
      message: message,
      userId: req.user.id,
      groupId: groupid,
    });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

const getChat = async (req, res, next) => {
  try {
    const { grpId } = req.params;
    console.log(grpId);
    const allChats = await Chat.findAll({ where: { groupId: grpId } });
    res.status(200).json({ allChats });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

module.exports = {
  postChat,
  getChat,
};
