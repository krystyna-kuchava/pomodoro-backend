const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../services/firebase');
const verifyToken = require('../token/verifyToken');
const STATUSES = require('../constants/statuses');
const ROUTES = require('../constants/routes');
const COLLECTIONS = require('../constants/collections');
const TOKEN_CONFIG = require('../configs/tokenConfig');
const TASK_STATUSES = require('../constants/task');

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
                deadlineDate: req.body.deadlineDate,
                status: req.body.status
            };

            db.collection(COLLECTIONS.TASKS).doc(taskId).update(updatedTaskData).then(() => {
                res.status(STATUSES.OK).send({
                    successMessage: 'Task was edited'
                });
            });
        }
    });
});

router.put(ROUTES.TASK.TASK_TODO, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const taskId = req.params.taskId;

            const updatedTaskData = {
                status: 'TODO_LIST'
            };

            db.collection(COLLECTIONS.TASKS).doc(taskId).update(updatedTaskData).then(() => {
                res.status(STATUSES.OK).send({
                    successMessage: 'Task was moved'
                });
            });
        }
    });
});

router.put(ROUTES.TASK.TASK_DONE, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const taskId = req.params.taskId;

            const updatedTaskData = {
                status: 'DONE_LIST'
            };

            db.collection(COLLECTIONS.TASKS).doc(taskId).update(updatedTaskData).then(() => {
                res.status(STATUSES.OK).send({
                    successMessage: 'Task was done'
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

router.get(ROUTES.TASK.TASKS_BY_STATUS, verifyToken, (req, res) => {
    let tasksStatus;

    switch (req.params.status) {
        case 'global':
            tasksStatus = 'GLOBAL_LIST';
            break;
        case 'todo':
            tasksStatus = 'TODO_LIST';
            break;
        case 'done':
            tasksStatus = 'DONE_LIST';
            break;
        default:
            tasksStatus = 'GLOBAL_LIST';
    }

    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const workTasks = db.collection(COLLECTIONS.TASKS)
                .where('status', '==', TASK_STATUSES.STATUSES[tasksStatus])
                .where('categoryId', '==', TASK_STATUSES.CATEGORIES.WORK)
                .get();

            const sportTasks = db.collection(COLLECTIONS.TASKS)
                .where('status', '==', TASK_STATUSES.STATUSES[tasksStatus])
                .where('categoryId', '==', TASK_STATUSES.CATEGORIES.SPORT)
                .get();

            const studyingTasks = db.collection(COLLECTIONS.TASKS)
                .where('status', '==', TASK_STATUSES.STATUSES[tasksStatus])
                .where('categoryId', '==', TASK_STATUSES.CATEGORIES.STUDYING)
                .get();

            const hobbyTasks = db.collection(COLLECTIONS.TASKS)
                .where('status', '==', TASK_STATUSES.STATUSES[tasksStatus])
                .where('categoryId', '==', TASK_STATUSES.CATEGORIES.HOBBY)
                .get();

            const otherTasks = db.collection(COLLECTIONS.TASKS)
                .where('status', '==', TASK_STATUSES.STATUSES[tasksStatus])
                .where('categoryId', '==', TASK_STATUSES.CATEGORIES.OTHER)
                .get();

            Promise.all([workTasks, sportTasks, studyingTasks, hobbyTasks, otherTasks]).then(resultsSnapshot => {
                if (resultsSnapshot.empty) {
                    res.status(STATUSES.OK).send({
                        successMessage: 'No tasks'
                    });
                } else {
                    const categories = [
                        TASK_STATUSES.CATEGORIES.WORK,
                        TASK_STATUSES.CATEGORIES.SPORT,
                        TASK_STATUSES.CATEGORIES.STUDYING,
                        TASK_STATUSES.CATEGORIES.HOBBY,
                        TASK_STATUSES.CATEGORIES.OTHER
                    ];

                    const tasks = {
                        [TASK_STATUSES.CATEGORIES.WORK]: [],
                        [TASK_STATUSES.CATEGORIES.SPORT]: [],
                        [TASK_STATUSES.CATEGORIES.STUDYING]: [],
                        [TASK_STATUSES.CATEGORIES.HOBBY]: [],
                        [TASK_STATUSES.CATEGORIES.OTHER]: []
                    };

                    resultsSnapshot.forEach((snap, index) => {
                        if (!snap.empty) {
                            snap.forEach(doc => {
                                tasks[categories[index]].push({taskId: doc.id, ...doc.data()});
                            });
                        }
                    });
                    res.json(tasks);
                }
            });
        }
    });
});

module.exports = router;
