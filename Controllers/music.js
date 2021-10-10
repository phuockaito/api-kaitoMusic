const mongoose = require("mongoose");
const vnmToAlphabet = require("vnm-to-alphabet");
const moment = require("moment");

const mongooseMusic = require("../Model/music");
const mongooseAccount = require("../Model/account");
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
  CREATE_MUSIC: async (req, res) => {
    try {
      const { id } = req;
      const create_music = moment().format();
      const account = await mongooseAccount.findById(id);
      if (!account)
        return res.status(401).json({ messages: "account not found" });
      const checkAdmin = await mongooseAccount.findOne({ _id: id, role: 1 });
      if (!checkAdmin)
        return res.status(401).json({ messages: "account admin not found" });
      const {
        name_singer,
        avatar_singer,
        lyric,
        src_music,
        link_mv,
        image_music,
        name_music,
        time,
        category,
        view,
        favorite,
        subscribe,
      } = req.body;
      const new_music = new mongooseMusic({
        _id: new mongoose.Types.ObjectId(),
        id_account: id,
        name_singer: name_singer.trim(),
        slug_name_singer: vnmToAlphabet(
          name_singer.trim().toLowerCase().replace(/ /g, "-")
        ),
        avatar_singer,
        lyric,
        src_music,
        link_mv,
        image_music,
        time,
        name_music: name_music.trim(),
        slug_name_music: vnmToAlphabet(
          name_music.trim().toLowerCase().replace(/ /g, "-")
        ),
        category: category.trim(),
        slug_category: vnmToAlphabet(
          category.trim().toLowerCase().replace(/ /g, "-")
        ),
        view,
        favorite,
        subscribe,
        slug_subscribe: vnmToAlphabet(
          subscribe.trim().toLowerCase().replace(/ /g, "-")
        ),
        createdAt: create_music,
        updatedAt: create_music,
      });
      const result = await new_music.save();
      res.json({
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        message: error,
      });
    }
  },
  GET_BY_ID: async (req, res) => {
    try {
      const { _id } = req.query;
      const music = await mongooseMusic.findById(_id);
      if (!music) return res.status(404).json({ message: "music not found" });
      const result = await mongooseMusic.findByIdAndUpdate(
        _id,
        { view: music.view + 1 },
        { new: true }
      );
      res.json({
        message: "success",
        data: result,
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  },
  GET_NAME_SINGER: async (req, res) => {
    try {
      const { singer } = req.query;
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const length_music = await mongooseMusic.find();
      const features = new ApiFeatures(
        mongooseMusic.find({ slug_subscribe: singer }),
        req.query
      ).sorting();
      const result = await features.query;
      if (!result.length)
        return res.status(404).json({ message: "music not found" });
      res.json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: length_music.length,
        },
        data: result.slice(start, end),
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  },
  GET_CATEGORY: async (req, res) => {
    try {
      const { category } = req.query;
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const length_music = await mongooseMusic.find();
      const features = new ApiFeatures(
        mongooseMusic.find({ slug_category: category }),
        req.query
      ).sorting();

      const result = await features.query;
      if (!result.length)
        return res.status(404).json({ message: "music not found" });
      res.json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: length_music.length,
        },
        data: result.slice(start, end),
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  },
  GET_NAME_MUSIC: async (req, res) => {
    try {
      const { music } = req.query;
      const result = await mongooseMusic.findOne({ slug_name_music: music });
      if (!result) return res.status(404).json({ message: "music not found" });
      res.json({
        message: "success",
        data: result,
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  },
  GET_ALL: async (req, res) => {
    try {
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const length_music = await mongooseMusic.find();
      const features = new ApiFeatures(
        mongooseMusic.find(),
        req.query
      ).sorting();
      const result = await features.query;
      if (!result.length)
        return res.status(404).json({ message: "music not found" });
      res.json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: length_music.length,
        },
        data: result.slice(start, end),
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  },
  TRENDING_MUSIC: async (req, res) => {
    try {
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const length_music = await mongooseMusic.find();
      const features = new ApiFeatures(
        mongooseMusic.find().sort({ view: -1 }),
        req.query
      );
      const result = await features.query;
      if (!result.length)
        return res.status(404).json({ message: "music not found" });
      res.json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: length_music.length,
        },
        data: result,
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  },
  FAVORITE_MUSIC: async (req, res) => {
    try {
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const length_music = await mongooseMusic.find();
      const features = new ApiFeatures(
        mongooseMusic.find().sort({ favorite: -1 }),
        req.query
      );
      const result = await features.query;
      if (!result.length)
        return res.status(404).json({ message: "music not found" });
      res.json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: length_music.length,
        },
        data: result.slice(start, end),
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  },
  DELETE_BY_ID: async (req, res) => {
    try {
      const { _id } = req.query;
      const music = await mongooseMusic.findByIdAndDelete(_id);
      if (!music) return res.status(404).json({ message: "music not found" });
      res.json({
        id: _id,
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  },
};
