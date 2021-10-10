const mongoose = require("mongoose");
const moment = require('moment');

const create = moment().format();

const AccountSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user_name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, default: null },
  role: { type: Number, default: 1 },
  sum_comment: { type: Number, default: null },
  sum_list_music: { type: Number, default: null },
  sum_upload: { type: Number, default: null },
  password: { type: String, required: true },
  updatedAt: { type: Date, default: create },
  createdAt: { type: Date, default: create },
});

module.exports = mongoose.model('Account', AccountSchema);