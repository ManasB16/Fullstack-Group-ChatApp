const express = require("express");

const chatController = require("../Controllers/chat");
const middleware = require("../Middleware/auth");

const router = express.Router();

router
  .route("/postchat")
  .post(middleware.Authenticate, chatController.postChat);

router
  .route("/getchat/:grpId")
  .get(middleware.Authenticate, chatController.getChat);

module.exports = router;
