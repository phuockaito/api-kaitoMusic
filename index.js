const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const sever = require("http").createServer(app);
const PORT = process.env.PORT || 3001;
const cors = require("cors");

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

require("dotenv").config();
require("./initDB")();

const musicRouter = require("./Router/music");
const searchRouter = require("./Router/search");
const accountRouter = require("./Router/account");
const commentRouter = require("./Router/comment");
const listMusicRouter = require("./Router/list-music");
const favoriteRouter = require("./Router/favorite");
const playHistoryRouter = require("./Router/play-history");

app.use("/api/music", musicRouter);
app.use("/api/search", searchRouter);
app.use("/api/account", accountRouter);
app.use("/api/comment", commentRouter);
app.use("/api/list-music", listMusicRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/play-history", playHistoryRouter);

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});


sever.listen(PORT, () => {
  console.log(`server started on http://localhost:${PORT}`);
});