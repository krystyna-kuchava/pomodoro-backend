const STATUSES = require('../constants/statuses');

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');

        req.token = bearer[1];

        // Next middleware
        next();
    } else {
        res.sendStatus(STATUSES.FORBIDDEN);
    }
}

module.exports = verifyToken;
