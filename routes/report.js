const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../services/firebase');
const verifyToken = require('../token/verifyToken');
const STATUSES = require('../constants/statuses');
const ROUTES = require('../constants/routes');
const COLLECTIONS = require('../constants/collections');
const TOKEN_CONFIG = require('../configs/tokenConfig');
const TASK_STATUSES = require('../constants/task');

const reportService = require('../services/report');

const router = express.Router();

router.get(ROUTES.REPORT.DAY, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const userId = authData.id;
            const today = reportService.convertToDate(new Date());

            const numbers = today.split('-');
            const newDate = numbers[1] + '-' + numbers[0] + '-' + numbers[2];

            console.log(newDate);

            const failedTasks = db.collection(COLLECTIONS.TASKS)
                .where('userId', '==', userId)
                .where('status', '==', TASK_STATUSES.STATUSES.FAILED)
                .where('completeDay', '==', newDate)
                .get();

            const urgentTasks = db.collection(COLLECTIONS.TASKS)
                .where('userId', '==', userId)
                .where('status', '==', TASK_STATUSES.STATUSES.DONE)
                .where('priorityId', '==', TASK_STATUSES.PRIORITIES.URGENT)
                .where('completeDay', '==', newDate)
                .get();

            const highTasks = db.collection(COLLECTIONS.TASKS)
                .where('userId', '==', userId)
                .where('status', '==', TASK_STATUSES.STATUSES.DONE)
                .where('priorityId', '==', TASK_STATUSES.PRIORITIES.HIGH)
                .where('completeDay', '==', newDate)
                .get();

            const normalTasks = db.collection(COLLECTIONS.TASKS)
                .where('userId', '==', userId)
                .where('status', '==', TASK_STATUSES.STATUSES.DONE)
                .where('priorityId', '==', TASK_STATUSES.PRIORITIES.NORMAL)
                .where('completeDay', '==', newDate)
                .get();

            const lowTasks = db.collection(COLLECTIONS.TASKS)
                .where('userId', '==', userId)
                .where('status', '==', TASK_STATUSES.STATUSES.DONE)
                .where('priorityId', '==', TASK_STATUSES.PRIORITIES.LOW)
                .where('completeDay', '==', newDate)
                .get();

            Promise.all([failedTasks, urgentTasks, highTasks, normalTasks, lowTasks]).then(resultsSnapshot => {
                if (resultsSnapshot.empty) {
                    res.status(STATUSES.OK).send({
                        successMessage: 'No tasks'
                    });
                } else {
                    const report = [['Failed'], ['Urgent'], ['High'], ['Normal'], ['Low']];

                    let index = 0;

                    resultsSnapshot.forEach((snap, index) => {
                        report[index].push(snap.size);

                        index++;
                    });

                    res.json(report);
                }
            });
        }
    });
});

router.get(ROUTES.REPORT.MONTH, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const userId = authData.id;
            const finishedTasks = [];

            db.collection(COLLECTIONS.TASKS)
                .where('userId', '==', userId)
                .where('status', '==', TASK_STATUSES.STATUSES.DONE)
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        finishedTasks.push(doc.data());
                    });
                })
                .then(() => {
                    db.collection(COLLECTIONS.TASKS)
                        .where('userId', '==', userId)
                        .where('status', '==', TASK_STATUSES.STATUSES.FAILED)
                        .get()
                        .then((querySnapshot) => {
                            querySnapshot.forEach((doc) => {
                                finishedTasks.push(doc.data());
                            });

                            console.log(finishedTasks);
                        })
                        .then(() => {
                            const reportByDates = reportService.createArrayOfAllReports(finishedTasks);

                            res.json(reportByDates);
                        });
                });
        }
    });
});

router.get(ROUTES.REPORT.MONTH_PRIORITY, verifyToken, (req, res) => {
    jwt.verify(req.token, TOKEN_CONFIG.tokenType, (err, authData) => {
        if (err) {
            res.sendStatus(STATUSES.FORBIDDEN);
        } else {
            const userId = authData.id;
            const priprity = req.params.priority;

            let finishedPriorityTasks = 0;
            let failedPriorityTasks = 0;
            let finishedTasks = 0;
            let failedTasks = 0;

            db.collection(COLLECTIONS.TASKS)
                .where('userId', '==', userId)
                .where('status', '==', TASK_STATUSES.STATUSES.DONE)
                .where('priorityId', '==', priprity)
                .get()
                .then((querySnapshot) => {
                    finishedPriorityTasks = querySnapshot.size;
                })
                .then(() => {
                    db.collection(COLLECTIONS.TASKS)
                        .where('userId', '==', userId)
                        .where('status', '==', TASK_STATUSES.STATUSES.FAILED)
                        .where('priorityId', '==', priprity)
                        .get()
                        .then((querySnapshot) => {
                            finishedPriorityTasks += querySnapshot.size;
                            failedPriorityTasks = querySnapshot.size;
                        })
                        .then(() => {
                            db.collection(COLLECTIONS.TASKS)
                                .where('userId', '==', userId)
                                .where('status', '==', TASK_STATUSES.STATUSES.FAILED)
                                .get()
                                .then((querySnapshot) => {
                                    failedTasks = querySnapshot.size;
                                    finishedTasks = querySnapshot.size;
                                })
                                .then(() => {
                                    db.collection(COLLECTIONS.TASKS)
                                        .where('userId', '==', userId)
                                        .where('status', '==', TASK_STATUSES.STATUSES.DONE)
                                        .get()
                                        .then((querySnapshot) => {
                                            finishedTasks += querySnapshot.size;
                                        })
                                        .then(() => {
                                            res.json({finishedPriorityTasks, failedPriorityTasks, failedTasks, finishedTasks});
                                        });
                                });
                        })
                });
        }
    });
});

module.exports = router;
