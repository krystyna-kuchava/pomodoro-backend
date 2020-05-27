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
        TASKS_BY_STATUS: '/tasks/:status',
        TASK_TODO: '/task/todo/:taskId',
        TASK_DONE: '/task/done/:taskId',
        TASKS_TODO_LIST: '/tasks/list/todo-list',
        TASKS_DONE_LIST: '/tasks/list/done-list',
    },
    SETTINGS: '/settings',
    CATEGORIES: '/categories',
    PRIORITIES: '/priorities',
    REPORT: {
        DAY: '/report/day',
        WEEK: '/report/week',
        MONTH: '/report/month',
        MONTH_PRIORITY: '/report/month/priority/:priority',
    }
};

module.exports = ROUTES;
