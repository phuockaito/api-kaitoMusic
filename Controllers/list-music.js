const mongoose = require("mongoose");
const moment = require("moment");

const mongooseListMusic = require("../Model/list-music");
const mongooseAccount = require("../Model/account");
const mongooseMusic = require("../Model/music");
const mongooseArrayMusic = require("../Model/array-music");

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
  GET_MUSIC_LIST: async (req, res) => {
    try {
      const { id } = req;
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const account = await mongooseAccount.findById(id);
      if (!account)
        return res.status(401).json({ message: "account not found" });
      const arrayMusicLists = await mongooseListMusic.find({ id_account: id });
      const features = new ApiFeatures(
        mongooseListMusic.find({ id_account: id }, { array_music: 0 }),
        req.query
      ).sorting();
      const arrayMusic = await features.query;
      res.status(200).json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: arrayMusicLists.length,
        },
        data: arrayMusic.slice(start, end),
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  },
  CREATE_LIST_MUSIC: async (req, res) => {
    try {
      const imageDefault = [
        "https://res.cloudinary.com/phuockaito/image/upload/v1627569073/1_h6ulpv.png",
        "https://res.cloudinary.com/phuockaito/image/upload/v1627569073/2_l1nuwu.jpg",
        "https://res.cloudinary.com/phuockaito/image/upload/v1627569074/4_pvuo5v.png",
      ];
      const create = moment().format();
      const random = Math.floor(Math.random() * imageDefault.length);
      const { id } = req;
      const { idMusic, nameList } = req.body;
      const account = await mongooseAccount.findById(id);
      const music = await mongooseMusic.findById(idMusic);
      if (!account)
        return res.status(401).json({ message: "account not found" });
      if (!music) return res.status(401).json({ message: "music not found" });
      const newListMusic = new mongooseListMusic({
        _id: new mongoose.Types.ObjectId(),
        id_account: id,
        name_list: nameList,
        image_list: imageDefault[random],
        createdAt: create,
        updatedAt: create,
      });
      const listMusic = await newListMusic.save();
      if (listMusic) {
        const arrayMusic = new mongooseArrayMusic({
          _id: new mongoose.Types.ObjectId(),
          id_account: id,
          id_music: idMusic,
          music,
          id_list: listMusic._id,
          createdAt: create,
          updatedAt: create,
        });
        const resultArrayMusic = await arrayMusic.save();
        listMusic.array_music.push(resultArrayMusic);
      }
      res.json({
        data: listMusic,
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  },
  GET_BY_ID: async (req, res) => {
    try {
      const { id } = req;
      const { _id } = req.query;
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const arrayMusicLists = await mongooseArrayMusic.find({
        id_account: id,
        id_list: _id,
      });
      const features = new ApiFeatures(
        mongooseArrayMusic.find({ id_account: id, id_list: _id }),
        req.query
      ).sorting();

      const arrayMusic = await features.query;
      const account = await mongooseAccount.findById(id);
      const listMusic = await mongooseListMusic.findById(_id);
      if (!account)
        return res.status(401).json({ message: "account not found" });
      if (!listMusic)
        return res.status(401).json({ message: "list music not found" });
      if (listMusic)
        listMusic.array_music.push(...arrayMusic.slice(start, end));
      res.status(200).json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: arrayMusicLists.length,
        },
        data: listMusic,
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  },
  ADD_LIST_MUSIC: async (req, res) => {
    try {
      const { id } = req;
      const { _id, _id_music } = req.body;
      const create = moment().format();
      const music = await mongooseMusic.findById(_id_music);
      const listMusic = await mongooseListMusic.findById(_id);
      const account = await mongooseAccount.findById(id);
      const arrayMusicOld = await mongooseArrayMusic.find({
        id_account: id,
        id_list: _id,
        id_music: _id_music,
      });
      if (arrayMusicOld.length) {
        arrayMusicOld.forEach(async (arrayMusic) => {
          await mongooseArrayMusic.findByIdAndDelete(arrayMusic._id);
        });
      }
      if (!music) return res.status(401).json({ message: "music not found" });
      if (!listMusic)
        return res.status(401).json({ message: "listMusic not found" });
      if (!account)
        return res.status(401).json({ message: "account not found" });
      const arrayMusic = new mongooseArrayMusic({
        _id: new mongoose.Types.ObjectId(),
        id_account: id,
        id_music: _id_music,
        music,
        id_list: listMusic._id,
        createdAt: create,
        updatedAt: create,
      });
      const resultArrayMusic = await arrayMusic.save();
      res.status(200).json({
        data: resultArrayMusic,
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  },
  REMOVE_MUSIC: async (req, res) => {
    try {
      const { id } = req;
      const { _id, _id_music } = req.query;
      const account = await mongooseAccount.findById(id);
      const listMusic = await mongooseListMusic.findById(_id);
      if (!account)
        return res.status(401).json({ message: "account not found" });
      if (!listMusic)
        return res.status(401).json({ message: "list music not found" });
      const arrayMusicOld = await mongooseArrayMusic.find({
        id_account: id,
        id_list: _id,
        id_music: _id_music,
      });
      if (arrayMusicOld.length) {
        arrayMusicOld.forEach(
          async (arrayMusic) =>
            await mongooseArrayMusic.findByIdAndDelete(arrayMusic._id)
        );
      }
      res.status(200).json({
        message: "delete success",
        data: arrayMusicOld[0],
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  },
  REMOVE_LIST_MUSIC: async (req, res) => {
    try {
      const { id } = req;
      const { _id } = req.query;
      const account = await mongooseAccount.findById(id);
      const listMusic = await mongooseListMusic.findById(_id);
      if (!account)
        return res.status(401).json({ message: "account not found" });
      if (!listMusic)
        return res.status(401).json({ message: "list music not found" });
      const arrayMusicOld = await mongooseArrayMusic.find({
        id_account: id,
        id_list: _id,
      });
      if (arrayMusicOld.length) {
        arrayMusicOld.forEach(
          async (arrayMusic) =>
            await mongooseArrayMusic.findByIdAndDelete(arrayMusic._id)
        );
      }

      const result = await mongooseListMusic.findByIdAndDelete(_id);
      res.status(200).json({
        message: "delete success",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  },
  UPDATE_NAME_LIST_MUSIC: async (req, res) => {
    try {
      const { id } = req;
      const { nameList, _id } = req.body;
      const account = await mongooseAccount.findById(id);
      const listMusic = await mongooseListMusic.findById(_id);
      if (!account)
        return res.status(401).json({ message: "account not found" });
      if (!listMusic)
        return res.status(401).json({ message: "listMusic not found" });
      const result = await mongooseListMusic.findByIdAndUpdate(
        _id,
        { name_list: nameList },
        { new: true }
      );
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        message: error.message,
      });
    }
  },
};
