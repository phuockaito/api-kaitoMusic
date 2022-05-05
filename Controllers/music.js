const mongoose = require("mongoose");
const vnmToAlphabet = require("vnm-to-alphabet");
const moment = require("moment");
const cloudinary = require("cloudinary");

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

const { CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

module.exports = {
  CREATE_MUSIC: async (req, res) => {
    try {
      const create_music = moment().format();
      const { id } = req;
      const music = JSON.parse(req.body.upload);
      const src_music = req.files["src_music"][0];
      const image_music = req.files["image_music"][0];
      const account = await mongooseAccount.findById(id);
      if (!account)
        return res.status(401).json({ messages: "account not found" });
      const url = music.link_mv;
      const youtube = url.split("/");
      if (youtube.length === 4) {
        const resultImageMusic = await cloudinary.v2.uploader.upload(
          image_music.path,
          { folder: "image_music" }
        );
        const resultMusic = await cloudinary.v2.uploader.upload(
          src_music.path,
          { resource_type: "video", folder: "audio" }
        );
        if (resultImageMusic && resultMusic) {
          const time = format(resultMusic.duration);
          const new_music = new mongooseMusic({
            _id: new mongoose.Types.ObjectId(),
            id_account: id,
            name_singer: music.name_singer.trim(),
            slug_name_singer: vnmToAlphabet(
              music.name_singer.trim().toLowerCase().replace(/ /g, "-")
            ),
            src_music: resultMusic.secure_url,
            link_mv: youtube[3],
            image_music: resultImageMusic.secure_url,
            time_format: time,
            seconds: resultMusic.duration,
            name_music: music.name_music.trim(),
            slug_name_music: vnmToAlphabet(
              music.name_music.trim().toLowerCase().replace(/ /g, "-")
            ),
            category: music.category.trim(),
            view: Math.floor(Math.random() * 20000) + 1,
            favorite: Math.floor(Math.random() * 20000) + 1,
            slug_category: vnmToAlphabet(
              music.category.trim().toLowerCase().replace(/ /g, "-")
            ),
            subscribe: music.name_singer.trim(),
            slug_subscribe: vnmToAlphabet(
              music.name_singer.trim().toLowerCase().replace(/ /g, "-")
            ),
            createdAt: create_music,
            updatedAt: create_music,
          });
          const result = await new_music.save();
          res.json({
            data: result,
          });
        } else {
          res.status(500).json({
            message: "Link youtube not format",
          });
        }
      }
    } catch (error) {
      res.status(401).json({
        message: error,
      });
    }
  },
  EDIT_MUSIC: async (req, res) => {
    try {
      const { id } = req;
      const imageMusicOld = req.body.image_music;
      const SrcMusicOld = req.body.src_music;
      const music = JSON.parse(req.body.upload);
      const srcMusicNew = req.files["src_music"];
      const imageMusicNew = req.files["image_music"];
      const account = await mongooseAccount.findById(id);
      const youtube = music.link_mv.split("/");
      if (!account)
        return res.status(401).json({ messages: "account not found" });

      if (youtube.length === 4) {
        if (srcMusicNew && !imageMusicNew) {
          const resultMusic = await cloudinary.v2.uploader.upload(
            srcMusicNew[0].path,
            { resource_type: "video", folder: "audio" }
          );
          if (resultMusic) {
            const result = await updateMusic({
              ...music,
              link_mv: youtube[3],
              src_music: resultMusic.secure_url,
              image_music: imageMusicOld,
            });
            res.json({
              data: result,
            });
          }
        }

        if (!srcMusicNew && imageMusicNew) {
          const resultImageMusic = await cloudinary.v2.uploader.upload(
            imageMusicNew[0].path,
            { folder: "image_music" }
          );
          if (resultImageMusic) {
            const result = await updateMusic({
              ...music,
              link_mv: youtube[3],
              image_music: resultImageMusic.secure_url,
              src_music: SrcMusicOld,
            });
            res.json({
              data: result,
            });
          }
        }

        if (srcMusicNew && imageMusicNew) {
          const resultImageMusic = await cloudinary.v2.uploader.upload(
            imageMusicNew[0].path,
            { folder: "image_music" }
          );
          const resultMusic = await cloudinary.v2.uploader.upload(
            srcMusicNew[0].path,
            { resource_type: "video", folder: "audio" }
          );
          if (resultMusic && resultImageMusic) {
            const result = await updateMusic({
              ...music,
              link_mv: youtube[3],
              image_music: resultImageMusic.secure_url,
              src_music: resultMusic.secure_url,
            });
            res.json({
              data: result,
            });
          }
        }

        if (!srcMusicNew && !imageMusicNew) {
          const result = await updateMusic({
            ...music,
            link_mv: youtube[3],
            image_music: imageMusicOld,
            src_music: SrcMusicOld,
          });
          res.json({
            data: result,
          });
        }
      } else {
        res.status(500).json({
          message: "Link youtube not format",
        });
      }
    } catch (error) {
      res.status(401).json({
        message: error,
      });
    }
  },
  GET_MUSIC_ACCOUNT: async (req, res) => {
    try {
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const { id } = req;
      const account = await mongooseAccount.findById(id);
      if (!account)
        return res.status(400).json({ message: "no found account" });
      const uploadLength = await mongooseMusic.find({ id_account: id });
      const features = new ApiFeatures(
        mongooseMusic.find({ id_account: id }),
        req.query
      ).sorting();
      const result = await features.query;
      res.json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: uploadLength.length,
        },
        data: result.slice(start, end),
      });
    } catch (err) {
      console.log(err);
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
        _id,
      });
    } catch (error) {
      res.json({
        message: error,
      });
    }
  },
};

const format = (seconds) => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = pad(date.getUTCSeconds());
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`;
  }
  return `${mm}:${ss}`;
};

const pad = (string) => ("0" + string).slice(-2);

const updateMusic = async ({
  name_music,
  name_singer,
  category,
  link_mv,
  src_music,
  image_music,
  _id,
}) => {
  const updatedAt = moment().format();
  const upload = {
    name_music: name_music.trim(),
    name_singer: name_singer.trim(),
    category: category.trim(),
    link_mv,
    src_music,
    image_music,
    updatedAt,
    slug_subscribe: vnmToAlphabet(
      name_singer.trim().toLowerCase().replace(/ /g, "-")
    ),
    slug_name_singer: vnmToAlphabet(
      name_singer.trim().toLowerCase().replace(/ /g, "-")
    ),
    subscribe: name_singer.trim(),
    slug_category: vnmToAlphabet(
      category.trim().toLowerCase().replace(/ /g, "-")
    ),
    slug_name_music: vnmToAlphabet(
      name_music.trim().toLowerCase().replace(/ /g, "-")
    ),
  };
  const resMusic = await mongooseMusic.findByIdAndUpdate(_id, upload, {
    new: true,
  });
  return resMusic;
};
