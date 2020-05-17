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

router.post(ROUTES.USER.SIGN_UP, (req, res) => {
    const {email, password, name} = req.body;

    // check user with the same email
    db.collection(COLLECTIONS.USERS).where('email', '==', email).get().then((snapshot) => {
        if (snapshot.empty) {
            const defaultSettings = settingsService.defaultSettings();

            // creating default settings for new user
            db.collection(COLLECTIONS.SETTINGS).add({...defaultSettings})
                .then(ref => {
                    const settingsId = ref.id;
                    const settings = db.collection(COLLECTIONS.USERS).doc(settingsId);

                    // creating new user
                    db.collection(COLLECTIONS.USERS).add({email, password, name, settings})
                        .then(ref => {
                            const userId = ref.id;

                            // getting document of new user
                            db.collection(COLLECTIONS.USERS).doc(userId).get().then(doc => {

                                if (!doc.exists) {
                                    res.status(STATUSES.NOT_FOUND).send({
                                        errorMessage: 'User was not created'
                                    });
                                } else {
                                    const user = doc.data();
                                    const userId = doc.id;

                                    settingsService.linkSettingsOfUser(user).then((user) => {
                                        jwt.sign({id: userId}, TOKEN_CONFIG.tokenType, {expiresIn: TOKEN_CONFIG.duration}, (err, token) => {
                                            res.send({token, userId, userName: user.name});
                                        });
                                    });
                                }

                            });
                        });

                });
        } else {
            res.status(STATUSES.BAD_REQUEST).send({
                errorMessage: 'User with such email already exits'
            });
        }
    });
});

router.post(ROUTES.USER.LOGIN, (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    db.collection(COLLECTIONS.USERS).where('email', '==', email).get().then((snapshot) => {
        if (snapshot.empty) {
            res.status(STATUSES.NOT_FOUND).send({
                errorMessage: 'User does not exist'
            });
        } else {
            snapshot.forEach(doc => {
                const user = doc.data();
                const userId = doc.id;

                if (user.password === password) {
                    settingsService.linkSettingsOfUser(user).then((user) => {
                        jwt.sign({id: userId}, TOKEN_CONFIG.tokenType, {expiresIn: TOKEN_CONFIG.duration}, (err, token) => {
                            res.send({token, userId, userName: user.name});
                        });
                    });
                } else {
                    res.status(STATUSES.UNAUTHORIZED).send({
                        auth: false,
                        accessToken: null,
                        errorMessage: 'Invalid password'
                    });
                }
            });
        }
    });
});

router.get(ROUTES.USER.USER, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const userId = authData.id;

            db.collection(COLLECTIONS.USERS).doc(userId).get().then((doc) => {
                const user = doc.data();

                settingsService.linkSettingsOfUser(user).then((user) => {
                    res.json(user);
                });
            });
        }
    });
});

module.exports = router;
