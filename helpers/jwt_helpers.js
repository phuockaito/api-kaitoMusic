const JWT = require('jsonwebtoken');
const creatError = require('http-errors');
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET
} = process.env;

module.exports = {
  createAccessToken: (user) => {
    return new Promise((resolve, reject) => {
      JWT.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '30d' }, (err, accessToken) => {
        if (err) reject(creatError.InternalServerError());
        resolve(accessToken);
      })
    })
  },
  createRefreshToken: (user) => {
    return new Promise((resolve, reject) => {
      JWT.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '30d' }, (err, refreshTToken) => {
        if (err) reject(creatError.InternalServerError());
        resolve(refreshTToken);
      })
    })
  },
  authorizationToken: (req, res, next) => {
    try {
      if (!req.headers['authorization']) return next(creatError.Unauthorized())
      const authHeader = req.headers['authorization'];
      const bearerToken = authHeader.split(' ');
      const token = bearerToken[1];
      JWT.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
          return next(creatError.Unauthorized(message))
        }
        req.id = decoded.id;
        next();
      });
    } catch (error) {
      next(creatError.Unauthorized());
    }
  }
};