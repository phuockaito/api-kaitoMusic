const express = require("express");
const router = express.Router();

const listMusicControl = require("../Controllers/list-music");
const { authorizationToken } = require("../helpers/jwt_helpers");

router.get("/get-list", authorizationToken, listMusicControl.GET_MUSIC_LIST);
router.post("/create", authorizationToken, listMusicControl.CREATE_LIST_MUSIC);
router.get("/get-by-id", authorizationToken, listMusicControl.GET_BY_ID);
router.put("/add-list-music", authorizationToken, listMusicControl.ADD_LIST_MUSIC);
router.delete("/delete-music", authorizationToken, listMusicControl.REMOVE_MUSIC);
router.delete("/delete-list-music", authorizationToken, listMusicControl.REMOVE_LIST_MUSIC);
router.put("/update-name-list-music", authorizationToken, listMusicControl.UPDATE_NAME_LIST_MUSIC);
module.exports = router;