const User = require("../Models/User");
const Chat = require("../Models/Chat");
const Group = require("../Models/Group");
const UserGroup = require("../Models/UserGroup");

async function createGroup(req, res, next) {
  try {
    const group = await Group.create({
      name: req.body.groupName,
      createdBy: req.user.id,
    });
    await UserGroup.create({ groupId: group.id, userId: req.user.id });
    res
      .status(201)
      .json({ msg: `Successfully Created group ${req.body.groupName}` });
  } catch (err) {
    res.status(500).json({ msg: "No Group created", err });
  }
}

async function getGroups(req, res, next) {
  try {
    // let user = await User.findOne({ where: { id: req.user.id } });
    let groups = await req.user.getGroups();
    res.status(201).json({ groups, success: true });
  } catch (err) {
    res.status(500).json({ msg: "Can't get users", err });
  }
}

async function addMembers(req, res, next) {
  try {
    const { groupid, email } = req.body;
    const user = await User.findOne({ where: { email } });
    const group = await Group.findOne({ where: { id: groupid } });
    if (!user) {
      return res
        .status(404)
        .json({ msg: "No user Registered with that email", success: false });
    }
    const isUser = await user.hasGroups(group);
    if (isUser) {
      return res.status(404).json({ msg: "user is already presesnt in group" });
    }
    await UserGroup.create({ groupId: groupid, userId: user.id });
    res.status(201).json({ msg: "Member Added Successfully", success: true });
  } catch (err) {
    res.status(500).json({ msg: "Can't add user", err });
  }
}

async function removeMember(req, res, next) {
  try {
    const { groupid, email } = req.body;
    const user = await User.findOne({ where: { email } });
    const group = await Group.findOne({ where: { id: groupid } });
    if (!user) {
      return res
        .status(404)
        .json({ msg: "No user Registered with that email", success: false });
    }
    const isUser = await user.hasGroups(group);
    if (!isUser) {
      return res.status(404).json({
        msg: "User Already not a Member in the group",
        success: false,
      });
    }
    await UserGroup.destroy({ where: { groupId: groupid, userId: user.id } });
    res.status(201).json({ msg: "Member Removed Successfully", success: true });
  } catch (err) {
    res.status(500).json({ msg: "Was not able to delete user", err });
  }
}

async function changeAdmin(req, res, next) {
  try {
    const { groupid, email } = req.body;
    const user = await User.findOne({ where: { email } });
    const group = await Group.findOne({ where: { id: groupid } });
    if (!user) {
      return res
        .status(404)
        .json({ msg: "No user Registered with that email", success: false });
    }
    const isUser = await user.hasGroups(group);
    if (!isUser) {
      return res.status(404).json({
        msg: "User not a Member in the group Please add them first",
        success: false,
      });
    }
    await Group.update({ createdBy: user.id }, { where: { id: groupid } });
    res.status(201).json({
      msg: "changed admin successfully,You are no longer an admin",
      success: true,
    });
  } catch (err) {
    res.status(500).json({ msg: "Was not able to change Admin", err });
  }
}

async function deleteGroup(req, res, next) {
  try {
    const { id } = req.params;
    await Group.destroy({ where: { id: id } });
    await UserGroup.destroy({ where: { groupId: id } });
    await Chat.destroy({ where: { groupId: id } });
    res.status(201).json({ msg: "Group Deleted Successsfully" });
  } catch (err) {
    res.status(500).json({ msg: "Was not able to delete Group", err });
  }
}

module.exports = {
  createGroup,
  getGroups,
  addMembers,
  removeMember,
  changeAdmin,
  deleteGroup,
};
