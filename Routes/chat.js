const express = require("express");

const chatController = require("../Controllers/chat");
const middleware = require("../Middleware/auth");

const router = express.Router();

router.post("/postchat", middleware.Authenticate, chatController.postChat);

router.get("/getchat", chatController.getChat);

module.exports = router;
