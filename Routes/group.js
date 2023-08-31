const express = require("express");

const groupController = require("../Controllers/group");
const middleware = require("../Middleware/auth");

const router = express.Router();

router
  .route("/group/createGroup")
  .post(middleware.Authenticate, groupController.createGroup);

router
  .route("/group/getGroups")
  .get(middleware.Authenticate, groupController.getGroups);

router
  .route("/group/addmembers")
  .post(middleware.Authenticate, groupController.addMembers);

router
  .route("/group/removemember")
  .post(middleware.Authenticate, groupController.removeMember);

router
  .route("/group/changeadmin")
  .patch(middleware.Authenticate, groupController.changeAdmin);

router
  .route("/group/deletegroup/:id")
  .delete(middleware.Authenticate, groupController.deleteGroup);

module.exports = router;
