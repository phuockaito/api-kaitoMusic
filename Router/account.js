const express = require("express");
const router = express.Router();

const accountController = require("../Controllers/account");
const { authorizationToken } = require('../helpers/jwt_helpers');

router.post("/register", accountController.REGISTER);
router.post("/login", accountController.LOGIN);
router.get('/profile', authorizationToken, accountController.PROFILE);
router.get('/get-music-authorization-token', authorizationToken, accountController.GET_MUSIC_AUTHORIZATION_TOKEN);
router.post("/google-login", accountController.LOGIN_GOOGLE);
router.get('/list', accountController.LIST_ACCOUNT);

module.exports = router;
