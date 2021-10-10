const express = require("express");
const router = express.Router();

const commentController = require("../Controllers/comment");
const { authorizationToken } = require('../helpers/jwt_helpers');

router.post("/create", authorizationToken, commentController.CREATE_COMMENT);
router.get("/get-by-id-music", commentController.GET_BY_ID_MUSIC);
router.get("/get-list-comment-authorization-token", commentController.GET_LIST_COMMENT);
router.delete("/delete-by-id", authorizationToken, commentController.DELETE_BY_ID);
router.put("/update-comment-by-id", authorizationToken, commentController.UPDATE_COMMENT_BY_ID);

module.exports = router;