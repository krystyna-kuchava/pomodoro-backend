const ROUTES = {
    USER: {
        SIGN_UP: '/sign-up',
        LOGIN: '/login',
        USER: '/user'
    },
    TASK: {
        TASK: '/task',
        TASK_BY_ID: '/task/:taskId',
        TASKS_PERIOD_PRIORITY: '/tasks/:period/:priority',
        TASKS_PERIOD_CATEGORY: '/tasks/:period/:category',
        TASKS_TODAY: '/tasks/today/:categoryId',
        TASKS_GLOBAL: '/tasks/global/:categoryId',
        TASKS_DONE: '/tasks/done/:categoryId',
    },
    SETTINGS: '/settings',
    CATEGORIES: '/categories',
    PRIORITIES: '/priorities',
};

module.exports = ROUTES;
