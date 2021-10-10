const mongoose = require("mongoose");
const moment = require("moment");

const mongooseAccount = require("../Model/account");
const mongooseMusic = require("../Model/music");
const mongoosePlayHistory = require("../Model/play-history");

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
      const playHistoryOld = await mongoosePlayHistory.find({
        id_account: id,
        id_music: idMusic,
      });
      if (playHistoryOld.length > 0) {
        for (let index = 0; index < playHistoryOld.length; index++) {
          const idPlayHistory = playHistoryOld[index]._id;
          const playHistory = await mongoosePlayHistory.findById(idPlayHistory);
          if (playHistory)
            await mongoosePlayHistory.deleteMany(
              { _id: idPlayHistory },
              { new: true }
            );
        }
      }
      const newFavorite = new mongoosePlayHistory({
        _id: new mongoose.Types.ObjectId(),
        id_music: idMusic,
        id_account: id,
        music,
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
      const playHistoryLength = await mongoosePlayHistory.find({
        id_account: id,
      });
      const features = new ApiFeatures(
        mongoosePlayHistory.find({ id_account: id }),
        req.query
      ).sorting();
      const result = await features.query;
      res.json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: playHistoryLength.length,
        },
        data: result.slice(start, end),
      });
    } catch (error) {
      res.status(400).json({ message: error });
    }
  },
};
