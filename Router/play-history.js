const express = require("express");
const router = express.Router();

const PlayHistoryController = require("../Controllers/play-history");
const { authorizationToken } = require("../helpers/jwt_helpers");

router.post("/create", authorizationToken, PlayHistoryController.CREATE);
router.get("/get-by-token", authorizationToken, PlayHistoryController.GET_BY_TOKEN);

module.exports = router;