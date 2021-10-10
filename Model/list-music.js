const mongoose = require("mongoose");
const moment = require('moment');

const create = moment().format();

const ListMusicSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id_account: { type: String, required: true },
  name_list: { type: String, required: true },
  image_list: { type: String, default: null },
  array_music: { type: Array, default: [] },
  createdAt: { type: Date, default: create },
  updatedAt: { type: Date, default: create },
});

module.exports = mongoose.model('ListMusic', ListMusicSchema);