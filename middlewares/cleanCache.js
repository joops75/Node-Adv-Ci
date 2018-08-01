const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    // wait for request handler to finish first
    await next();
    // then clear cache
    clearHash(req.user.id);
}