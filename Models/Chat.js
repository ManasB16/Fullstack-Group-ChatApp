const Sequelize = require("sequelize");
const sequelize = require("../Util/database");

const Chat = sequelize.define("chats", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Chat;
