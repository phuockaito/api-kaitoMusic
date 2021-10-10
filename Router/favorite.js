const express = require("express");
const router = express.Router();

const favoriteController = require("../Controllers/favorite");
const { authorizationToken } = require("../helpers/jwt_helpers");

router.post("/create", authorizationToken, favoriteController.CREATE);
router.get("/get-authorization-token", authorizationToken, favoriteController.GET_BY_TOKEN);
router.delete("/delete-by-id", authorizationToken, favoriteController.DELETE_BY_ID);

module.exports = router;