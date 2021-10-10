const express = require("express");
const router = express.Router();
const vnmToAlphabet = require("vnm-to-alphabet");

const mongooseMusic = require("../Model/music");

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  sorting() {
    this.query = this.query.sort("-createAt");
    return this;
  }
}
router.get("/", async (req, res) => {
  try {
    const query =
      vnmToAlphabet(req.query.query.trim().toLowerCase().replace(/ /g, "-")) ||
      "";
    const _page = req.query._page * 1 || 1;
    const _limit = req.query._limit * 1 || 20;
    const start = (_page - 1) * _limit;
    const end = start + _limit;
    const queryString = {
      $or: [
        { slug_name_music: { $regex: query, $options: "$i" } },
        { slug_name_singer: { $regex: query, $options: "$i" } },
        { slug_category: { $regex: query, $options: "$i" } },
        { slug_album: { $regex: query, $options: "$i" } },
        { time: { $regex: query, $options: "$i" } },
      ],
    };
    const features = new ApiFeatures(
      mongooseMusic.find(queryString),
      req.query
    ).sorting();
    const result = await features.query;
    res.json({
      pagination: {
        _limit: _limit,
        _page: _page,
        _total: result.length,
      },
      data: result.slice(start, end),
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
module.exports = router;
