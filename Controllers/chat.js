const Chat = require("../Models/Chat");
const sequelize = require("../Util/database");
const { Op } = require("sequelize");

const postChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const newChat = await req.user.createChat({
      name: req.user.name,
      message: message,
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
    const chatId = req.query.lastchatid;
    const allChats = await Chat.findAll({
      where: {
        id: {
          [Op.gt]: chatId,
        },
      },
    });
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
