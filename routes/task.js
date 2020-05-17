const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../services/firebase');
const verifyToken = require('../token/verifyToken');
const STATUSES = require('../constants/statuses');
const ROUTES = require('../constants/routes');
const COLLECTIONS = require('../constants/collections');
const TOKEN_CONFIG = require('../configs/tokenConfig');

const router = express.Router();

router.post(ROUTES.TASK.TASK, verifyToken, (req, res) => {
    const {title, description, categoryId, priorityId, estimation, deadlineDate} = req.body;
    console.log(req.body);

    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const userId = authData.id;

            // creating new user
            db.collection(COLLECTIONS.TASKS).add({
                title,
                description,
                categoryId,
                priorityId,
                estimation,
                deadlineDate,
                userId,
                status: 'GLOBAL_LIST'
            })
                .then(ref => {
                    const taskId = ref.id;

                    // getting document of new user
                    db.collection(COLLECTIONS.TASKS).doc(taskId).get().then(doc => {

                        if (!doc.exists) {
                            res.status(STATUSES.NOT_FOUND).send({
                                errorMessage: 'Task was not created'
                            });
                        } else {
                            res.status(STATUSES.CREATED).send({
                                successMessage: 'Task was created'
                            });
                        }

                    });
                });
        }
    });

});

router.get(ROUTES.TASK.TASK_BY_ID, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const taskId = req.params.taskId;

            db.collection(COLLECTIONS.TASKS).doc(taskId).get().then((doc) => {
                const task = doc.data();

                res.json({taskId, ...task});
            });
        }
    });
});

router.put(ROUTES.TASK.TASK_BY_ID, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const taskId = req.params.taskId;

            const updatedTaskData = {
                title: req.body.title,
                description: req.body.description,
                categoryId: req.body.categoryId,
                priorityId: req.body.priorityId,
                estimation: req.body.estimation,
                deadlineDate: req.body.deadlineDate
            };

            db.collection(COLLECTIONS.TASKS).doc(taskId).update(updatedTaskData).then(() => {
                res.status(STATUSES.OK).send({
                    successMessage: 'Task was edited'
                });
            });
        }
    });
});

router.delete(ROUTES.TASK.TASK_BY_ID, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const taskId = req.params.taskId;

            db.collection(COLLECTIONS.TASKS).doc(taskId).delete().then(() => {
                res.status(STATUSES.OK).send({
                    successMessage: 'Task was deleted'
                });
            });
        }
    });
});

router.get(ROUTES.TASK.TASKS_TODAY, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const categoryId = req.params.categoryId;

            db.collection(COLLECTIONS.TASKS).where('categoryId', '==', categoryId).get().then((snapshot) => {
                console.log(snapshot);

                res.status(STATUSES.OK).send({
                    successMessage: 'Task was deleted'
                });
            });
        }
    });
});


module.exports = router;
