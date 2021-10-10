const mongoose = require("mongoose");
const moment = require('moment');

const create = moment().format();

const ArrayMusicScheme = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id_account: { type: String, required: true },
  id_music: { type: String, required: true },
  music: { type: Object, required: true },
  createdAt: { type: Date, default: create },
  updatedAt: { type: Date, default: create },
  id_list: { type: String, required: true },
});
module.exports = mongoose.model('ArrayMusic', ArrayMusicScheme);