const mongoose = require("mongoose");
const moment = require("moment");

const mongooseAccount = require("../Model/account");
const mongooseMusic = require("../Model/music");
const mongooseFavorite = require("../Model/favorite");

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  sorting() {
    this.query = this.query.sort("-createdAt");
    return this;
  }
}

module.exports = {
  CREATE: async (req, res) => {
    try {
      const create = moment().format();
      const { id } = req;
      const { idMusic } = req.body;
      const account = await mongooseAccount.findById(id);
      const music = await mongooseMusic.findById(idMusic);
      if (!music) return res.status(404).json({ message: "Music not found" });
      if (!account)
        return res.status(404).json({ message: "Account not found" });
      const favorite = await mongooseMusic.findByIdAndUpdate(
        idMusic,
        { favorite: music.favorite + 1 },
        { new: true }
      );
      const favoriteOld = await mongooseFavorite.find({
        id_account: id,
        id_music: idMusic,
      });
      if (favoriteOld.length) {
        const idFavorite = favoriteOld[0]._id;
        const favorite = await mongooseFavorite.findById(idFavorite);
        if (favorite) await mongooseFavorite.findByIdAndDelete(idFavorite);
      }
      const newFavorite = new mongooseFavorite({
        _id: new mongoose.Types.ObjectId(),
        id_music: idMusic,
        id_account: id,
        music: favorite,
        createdAt: create,
        updatedAt: create,
      });
      const result = await newFavorite.save();
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      res.status(400).json({ message: error });
      console.log(error);
    }
  },
  GET_BY_TOKEN: async (req, res) => {
    try {
      const { id } = req;
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const account = await mongooseAccount.findById(id);
      if (!account)
        return res.status(404).json({ message: "Account not found" });
      const FavoriteLength = await mongooseFavorite.find({ id_account: id });
      const features = new ApiFeatures(
        mongooseFavorite.find({ id_account: id }),
        req.query
      ).sorting();
      const result = await features.query;
      res.json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: FavoriteLength.length,
        },
        data: result.slice(start, end),
      });
    } catch (error) {
      res.status(400).json({ message: error });
    }
  },
  DELETE_BY_ID: async (req, res) => {
    try {
      const { id } = req;
      const { _id } = req.query;
      const account = await mongooseAccount.findById(id);
      const favorite = await mongooseFavorite.findById(_id);
      const idMusic = favorite.id_music;
      const music = await mongooseMusic.findById(idMusic);
      if (!account)
        return res.status(404).json({ message: "Account not found" });
      if (!favorite)
        return res.status(404).json({ message: "Favorite not found" });
      await mongooseMusic.findByIdAndUpdate(
        idMusic,
        { favorite: music.favorite - 1 },
        { new: true }
      );
      const result = await mongooseFavorite.findByIdAndDelete(_id);
      res.status(200).json({
        message: "Delete success",
        id: _id,
        data: result,
      });
    } catch (error) {
      res.status(400).json({ message: error });
    }
  },
};
