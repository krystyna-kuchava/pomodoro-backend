const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../services/firebase');
const verifyToken = require('../token/verifyToken');
const settingsService = require('../services/settings');
const STATUSES = require('../constants/statuses');
const ROUTES = require('../constants/routes');
const COLLECTIONS = require('../constants/collections');
const TOKEN_CONFIG = require('../configs/tokenConfig');

const router = express.Router();

function getSettingsDoc() {
    return db.collection(COLLECTIONS.SETTINGS).doc('08oJMf3yyrX56VFyFvWG');
}

router.get(ROUTES.SETTINGS, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const userId = authData.id;

            db.collection(COLLECTIONS.USERS).doc(userId).get().then((doc) => {
                const user = doc.data();

                settingsService.linkSettingsOfUser(user).then((user) => {
                    res.json(user.settings);
                });
            });
        }
    });
});

router.put(ROUTES.SETTINGS, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const userId = authData.id;
            const updatedSettingsData = {
                workIterations: req.body.workIterations,
                longBreak: req.body.longBreak,
                shortBreak: req.body.shortBreak,
                workTime: req.body.workTime
            };

            db.collection(COLLECTIONS.USERS).doc(userId).get().then((doc) => {
                const user = doc.data();

                user.settings.update(updatedSettingsData).then(() => {
                    settingsService.linkSettingsOfUser(user).then((user) => {
                        res.json(user.settings);
                    });
                });
            });
        }
    });
});

module.exports = router;
