const mongoose = require("mongoose");
const moment = require('moment');
const create = moment().format();

const CommentReplySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id_reply: { type: String, required: null },
  id_music: { type: String, required: true },
  music: { type: Object, default: {} },
  id_account: { type: String, required: true },
  account: { type: Object, default: {} },
  edit_content: { type: Boolean, default: false },
  content: { type: String, required: true },
  createdAt: { type: Date, default: create },
  updatedAt: { type: Date, default: create },
});

module.exports = mongoose.model('CommentReply', CommentReplySchema);