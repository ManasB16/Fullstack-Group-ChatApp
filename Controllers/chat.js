const Chat = require("../Models/Chat");
const AWS = require("aws-sdk");
const multer = require("multer");

const postChat = async (req, res, next) => {
  try {
    const { message, groupid } = req.body;
    const newChat = await req.user.createChat({
      name: req.user.name,
      message: message,
      datatype: "text",
      groupId: groupid,
    });
    res.status(201).json({ newChat, success: true });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

const getChat = async (req, res, next) => {
  try {
    const { grpId } = req.params;
    const allChats = await Chat.findAll({ where: { groupId: grpId } });
    res.status(200).json({ allChats });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

async function uploadFile(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const userName = req.user.name;

    const filename = "File" + userId + "/" + Date.now() + req.file.originalname;
    const fileURL = await uploadToS3(req.file, filename);
    const newFile = await Chat.create({
      name: userName,
      message: fileURL,
      datatype: "file",
      userId: userId,
      groupId: groupId,
    });
    res.status(201).json({ newFile, success: true });
  } catch (err) {
    res.status(404).json({ msg: "error uploading file", err: err });
  }
}

async function uploadToS3(data, filename) {
  try {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.ACCESS_KEY_ID;
    const IAM_USER_SECRET = process.env.SECRET_ACCESS_KEY;

    let s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
    });
    var params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data.buffer,
      ACL: "public-read",
    };
    return new Promise((resolve, reject) => {
      s3bucket.upload(params, (err, s3response) => {
        if (err) {
          reject(err);
        } else {
          resolve(s3response.Location);
        }
      });
    });
  } catch (err) {
    console.log(err);
    return err;
  }
}
module.exports = {
  postChat,
  getChat,
  uploadFile,
  uploadToS3,
};
