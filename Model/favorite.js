const mongoose = require("mongoose");
const moment = require('moment');

const create = moment().format();

const FavoriteSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  id_account: { type: String, required: true },
  id_music: { type: String, required: true },
  music: { type: Object, default: {} },
  createdAt: { type: Date, default: create },
  updatedAt: { type: Date, default: create },
});

module.exports = mongoose.model('Favorite', FavoriteSchema);