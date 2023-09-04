const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();

const { postChat, getChat, uploadFile } = require("../Controllers/chat");

const { Authenticate } = require("../Middleware/auth");

router.route("/postchat").post(Authenticate, postChat);

router.route("/getchat/:grpId").get(Authenticate, getChat);

router
  .route("/upload/:groupId")
  .post(Authenticate, upload.single("file"), uploadFile);

module.exports = router;
