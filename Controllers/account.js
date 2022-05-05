const mongoose = require("mongoose");
const moment = require("moment");
const bcrypt = require("bcrypt");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const mongooseMusic = require("../Model/music");
const mongooseAccount = require("../Model/account");
const {createAccessToken} = require("../helpers/jwt_helpers");

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
const { MAILING_SERVICE_CLIENT_ID, GOOGLE_SECRET } = process.env;
const client = new OAuth2(MAILING_SERVICE_CLIENT_ID);
module.exports = {
  LIST_ACCOUNT: async (req, res) => {
    try {
      const account = await mongooseAccount.find();
      account.forEach(async (ac) => {
        await mongooseAccount.findByIdAndDelete(ac._id);
      });
      res.status(200).json(account);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },
  REGISTER: async (req, res) => {
    try {
      const avatarDefault = [
        "https://res.cloudinary.com/phuockaito/image/upload/v1627194964/user/1_oupk48.png",
        "https://res.cloudinary.com/phuockaito/image/upload/v1627194964/user/2_dtmvm9.png",
        "https://res.cloudinary.com/phuockaito/image/upload/v1627194964/user/3_ttwqrr.png",
        "https://res.cloudinary.com/phuockaito/image/upload/v1627194964/user/4_fbupvc.png",
        "https://res.cloudinary.com/phuockaito/image/upload/v1627194964/user/5_c2r91d.png",
      ];
      const random = Math.floor(Math.random() * avatarDefault.length);
      const create = moment().format();
      const { userName, password, email } = req.body;
      if (!validateEmail(email))
        return res.status(400).json({ msg: "Invalid emails." });
      const doseExists = await mongooseAccount.findOne({ email: email });
      if (doseExists)
        return res.status(400).json({ message: "account exists" });
      if (!password)
        return res.status(400).json({ message: "Please enter password" });
      if (userName.length < 1 || userName.length > 30)
        return res
          .status(400)
          .json({ message: "Username should not exceed 30 characters" });
      if (password.length < 8)
        return res
          .status(400)
          .json({ message: "password must be at least 8 characters long" });
      const passwordHash = await bcrypt.hash(password.trim(), 12);
      const newAccount = new mongooseAccount({
        _id: new mongoose.Types.ObjectId(),
        user_name: userName.trim(),
        password: passwordHash,
        email: email.trim(),
        image: avatarDefault[random],
        createdAt: create,
        updatedAt: create,
      });
      const result = await newAccount.save();
      const user = {
        id: result._id,
        userName: result.user_name,
        email: result.email,
      };
      const accessToken = await createAccessToken(user);
      res.json({
        accessToken,
        data: result,
      });
    } catch (err) {
      res.json({
        status: "error",
        message: err,
      });
    }
  },
  LOGIN: async (req, res) => {
    try {
      const { email, password } = req.body;
      const account = await mongooseAccount.findOne({ email: email.trim() });
      if (!account)
        return res.status(400).json({ message: "Account does not exist" });
      const isMatch = await bcrypt.compare(password.trim(), account.password);
      if (!isMatch)
        return res.status(400).json({ message: "Incorrect password" });
      const user = {
        id: account._id,
        userName: account.user_name,
        email: account.email,
      };
      const accessToken = await createAccessToken(user);
      res.json({
        accessToken,
        data: account,
      });
    } catch (err) {
      res.json({
        status: "error",
        message: err,
      });
    }
  },
  PROFILE: async (req, res) => {
    try {
      const { id } = req;
      const account = await mongooseAccount.findById(id);
      if (!account)
        return res.status(400).json({ message: "no found account" });
      const user = {
        id: account._id,
        userName: account.user_name,
        email: account.email,
      };
      const accessToken = await createAccessToken(user);
      res.json({
        accessToken,
        data: account,
      });
    } catch (error) {
      res.json({
        status: "error",
        message: error,
      });
    }
  },
  GET_MUSIC_AUTHORIZATION_TOKEN: async (req, res) => {
    try {
      const { id } = req;
      const _page = req.query._page * 1 || 1;
      const _limit = req.query._limit * 1 || 20;
      const start = (_page - 1) * _limit;
      const end = start + _limit;
      const account = await mongooseAccount.findById(id);
      if (!account)
        return res.status(400).json({ message: "no found account" });
      const length_music = await mongooseMusic.find({ id_account: id });
      const features = new ApiFeatures(
        mongooseMusic.find({ id_account: id }),
        req.query
      ).sorting();
      const result = await features.query;
      res.status(200).json({
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
  LOGIN_GOOGLE: async (req, res) => {
    try {
      const { token } = req.body;
      const create = moment().format();
      const verify = await client.verifyIdToken({
        idToken: token,
        audience: MAILING_SERVICE_CLIENT_ID,
      });
      const { email_verified, email, name, picture } = verify.payload;
      if (!email_verified)
        return res.status(400).json({ msg: "Email verification failed." });
      const account = await mongooseAccount.findOne({ email: email });
      const password = email + GOOGLE_SECRET;
      const passwordHash = await bcrypt.hash(password, 12);
      const user = {
        id: account._id,
        userName: account.user_name,
        email: account.email,
      };
      if (account) {
        const accessToken = await createAccessToken(user);
        res.status(200).json({
          data: account,
          accessToken,
        });
      } else {
        const newAccount = new mongooseAccount({
          _id: new mongoose.Types.ObjectId(),
          user_name: name,
          email,
          password: passwordHash,
          image: picture,
          createdAt: create,
          updatedAt: create,
        });
        await newAccount.save();
        const account = await mongooseAccount.findOne({ email: email });
        const accessToken = await createAccessToken(user);
        res.status(200).json({
          data: account,
          accessToken,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error,
      });
    }
  },
};

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
