const mongoose = require("mongoose");
const moment = require('moment');

const create_music = moment().format();
const MusicSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id_account: { type: String, required: true },
  name_singer: { type: String, required: true },
  slug_name_singer: { type: String, required: true },
  src_music: { type: String, required: true },
  link_mv: { type: String, default: null },
  image_music: { type: String, required: true },
  time_format: { type: String, required: true },
  seconds: { type: Number, required: true },
  name_music: { type: String, required: true },
  slug_name_music: { type: String, required: true },
  category: { type: String, required: true },
  slug_category: { type: String, required: true },
  sum_comment: { type: Number, default: null },
  view: { type: Number, default: null },
  subscribe: { type: String, required: true },
  slug_subscribe: { type: String, required: true },
  favorite: { type: Number, default: null },
  account_favorite: { type: Array, default: [] },
  createdAt: { type: Date, default: create_music },
  updatedAt: { type: Date, default: create_music },
});

module.exports = mongoose.model('Music', MusicSchema);