const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true },
  slug_title: { type: String, required: true },
  image: { type: String, default: null },
});
module.exports = mongoose.model("Menu", MenuSchema);