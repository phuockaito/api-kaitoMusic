const express = require("express");
const router = express.Router();

const { authorizationToken } = require('../helpers/jwt_helpers');
const musicController = require("../Controllers/music");

router.post('/create', authorizationToken, musicController.CREATE_MUSIC);
router.get('/get-by-id', musicController.GET_BY_ID);
router.get('/get-name-singer', musicController.GET_NAME_SINGER);
router.get('/get-name-music', musicController.GET_NAME_MUSIC);
router.get('/get-category', musicController.GET_CATEGORY);
router.get('/get-all', musicController.GET_ALL);
router.get('/trending', musicController.TRENDING_MUSIC);
router.get('/favorite', musicController.FAVORITE_MUSIC);


router.delete('/delete-by-id', musicController.DELETE_BY_ID);

module.exports = router;
