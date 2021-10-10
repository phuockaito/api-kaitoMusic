const mongoose = require("mongoose");
const moment = require("moment");

const mongooseComment = require("../Model/comment");
const mongooseAccount = require("../Model/account");
const mongooseMusic = require("../Model/music");
const mongooseReplyComment = require("../Model/comment-reply");

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
  CREATE_COMMENT: async (req, res) => {
    try {
      const { id } = req;
      const createdAt = moment().format();
      const { content, id_music, id_reply } = req.body;
      const music = await mongooseMusic.findById(id_music);
      const account = await mongooseAccount.findById(id, {
        password: 0,
        email: 0,
        role: 0,
      });
      if (!music) return res.status(404).json({ message: "music not found" });
      if (!account)
        return res.status(400).json({ message: "account not found" });
      if (id_reply) {
        const comment = await mongooseComment.findById(id_reply);
        if (!comment)
          return res.status(404).send({ message: "comment not found" });
        await mongooseComment.findByIdAndUpdate(
          id_reply,
          { id_reply: id_reply },
          { new: true }
        );
        const newReply = new mongooseReplyComment({
          _id: new mongoose.Types.ObjectId(),
          id_reply: id_reply,
          id_music: id_music,
          music,
          id_account: id,
          account: account,
          content: content,
          createdAt: createdAt,
          updatedAt: createdAt,
        });
        const resultReply = await newReply.save();
        res.status(200).json({
          message: "reply comment created",
          id_reply,
          id_music,
          data: resultReply,
        });
      } else {
        const newComment = new mongooseComment({
          _id: new mongoose.Types.ObjectId(),
          content,
          id_music,
          music: { ...music },
          id_account: id,
          account: { ...account },
          createdAt,
          updatedAt: createdAt,
        });
        const result = await newComment.save();
        res.json({
          message: "comment created",
          data: result,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  },
  GET_BY_ID_MUSIC: async (req, res) => {
    try {
      const { _id } = req.query;
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const comment = await mongooseComment.find({ id_music: _id });
      if (!comment)
        return res.status(400).json({ message: "comment not found" });
      const featuresComment = new ApiFeatures(
        mongooseComment.find({ id_music: _id }),
        req.query
      ).sorting();
      const resultComment = await featuresComment.query;
      const length = resultComment.length;
      if (length) {
        for (let i = 0; i < length; i++) {
          const id = resultComment[i]._id;
          const item = resultComment[i].reply;
          const featuresCommentReply = new ApiFeatures(
            mongooseReplyComment.find({ id_music: _id, id_reply: id }),
            req.query
          ).sorting();
          const resultCommentReply = await featuresCommentReply.query;
          item.push(...resultCommentReply);
        }
      }
      res.status(200).json({
        pagination: {
          _limit: _limit,
          _page: _page,
          _total: comment.length,
        },
        data: resultComment.slice(start, end),
      });
    } catch (error) {
      res.status(400).json({ message: "error" });
    }
  },
  GET_LIST_COMMENT: async (req, res) => {
    try {
      // const { id } = req;
      const id = "6106ca69d06a343d98f7bace";
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const featuresCommentReply = new ApiFeatures(
        mongooseReplyComment.find({ id_account: id }),
        req.query
      ).sorting();
      const featuresComment = new ApiFeatures(
        mongooseComment.find({ id_account: id }, { reply: 0, id_reply: 0 }),
        req.query
      ).sorting();
      const resultComment = await featuresComment.query;
      const resultCommentReply = await featuresCommentReply.query;
      const concat = resultComment.concat(resultCommentReply);
      const resultList = concat.slice(start, end);
      res.status(200).json({
        pagination: {
          _start: start,
          _end: end,
          _limit: _limit,
          _page: _page,
          _total: concat.length,
        },
        data: resultList,
      });
    } catch (error) {
      res.status(400).json({ message: "error" });
    }
  },
  DELETE_BY_ID: async (req, res) => {
    try {
      const { id } = req;
      const { _id } = req.query;
      const account = await mongooseAccount.findById(id);
      const comment = await mongooseComment.findById(_id);
      const reply = await mongooseReplyComment.findById(_id);
      const arrayComments = await mongooseReplyComment.find({ id_reply: _id });
      if (!account) {
        return res.status(401).json({ message: "account not found" });
      } else {
        if (!comment) {
          if (!reply) {
            return res.status(400).json({ message: "comment not found" });
          } else {
            const resultCommentReply = await mongooseReplyComment.find({
              id_account: id,
              _id: _id,
            });
            if (resultCommentReply.length) {
              const resCommentReply =
                await mongooseReplyComment.findByIdAndDelete(_id);
              res.json({
                message: "comment deleted",
                id: _id,
                data: resCommentReply,
              });
            }
          }
        } else {
          const resultComment = await mongooseComment.find({
            id_account: id,
            _id: _id,
          });
          if (resultComment.length) {
            const resComment = await mongooseComment.findByIdAndDelete(_id, {
              reply: 0,
            });
            arrayComments.forEach(async (item) => {
              await mongooseReplyComment.findByIdAndDelete(item._id);
            });
            res.json({
              message: "comment deleted",
              id: _id,
              data: resComment,
            });
          }
        }
      }
    } catch (error) {
      res.status(400).json({ message: "error" });
    }
  },
  UPDATE_COMMENT_BY_ID: async (req, res) => {
    try {
      const { id } = req;
      const { _id } = req.query;
      const { content } = req.body;
      const updatedAt = moment().format();
      const dataUpdate = {
        content,
        edit_content: true,
        updatedAt,
      };
      const account = await mongooseAccount.findById(id);
      const comment = await mongooseComment.findById(_id);
      const reply = await mongooseReplyComment.findById(_id);
      if (!account) {
        return res.status(401).json({ message: "account not found" });
      } else {
        if (!comment) {
          if (!reply) {
            return res.status(400).json({ message: "comment not found" });
          } else {
            const resultCommentReply = await mongooseReplyComment.find({
              id_account: id,
              _id: _id,
            });
            if (resultCommentReply.length) {
              const resCommentReply =
                await mongooseReplyComment.findByIdAndUpdate(_id, dataUpdate, {
                  new: true,
                });
              res.json({
                message: "update comment success",
                id: _id,
                data: resCommentReply,
              });
            }
          }
        } else {
          const resultComment = await mongooseComment.find({
            id_account: id,
            _id: _id,
          });
          if (resultComment.length) {
            const resComment = await mongooseComment.findByIdAndUpdate(
              _id,
              dataUpdate,
              { new: true }
            );
            res.json({
              message: "update comment success",
              id: _id,
              data: resComment,
            });
          }
        }
      }
    } catch (error) {
      res.status(400).json({ message: "error" });
    }
  },
};
