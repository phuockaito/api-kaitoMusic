const mongoose = require("mongoose");
const moment = require('moment');
const create = moment().format();

const CommentSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  content: { type: String, require: true },
  id_reply: { type: String, default: null },
  reply: { type: Array, default: [] },
  id_music: { type: String, require: true },
  music: { type: Object, default: {} },
  id_account: { type: String, required: true },
  account: { type:Object, default: {} },
  edit_content: { type: Boolean, default: false },
  createdAt: { type: Date, default: create },
  updatedAt: { type: Date, default: create },
});

module.exports = mongoose.model('Comment', CommentSchema);