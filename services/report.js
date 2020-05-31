const convertToDate = (date) => {
    let dd = date.getDate();
    let mm = date.getMonth() + 1; //January is 0!
    let yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    date = mm + '-' + dd + '-' + yyyy;
    return date;
};

const getDateAgo = (date, days) => {
    date = new Date(date);
    let dateCopy = new Date(date);

    dateCopy.setDate(date.getDate() - days);
    return convertToDate(dateCopy);
};


function arrayOfDaysOfMonth() {
    const dates = [];

    const currentDate = convertToDate(new Date());
    for (let i = 0; i < 30; i++) {
        const date = getDateAgo(currentDate, i);
        const numbers = date.split('-');
        const newDate = numbers[1] + '-' + numbers[0] + '-' + numbers[2];
        dates.push(newDate);
    }

    return dates;
}

function getTasksByPriority(tasksByDate, priority) {
    return tasksByDate.filter((task) => {
        if (priority === 'failed') {
            if (task.status === 'FAILED') {
                return priority;
            }
        }
        else if (task.status === 'DONE_LIST') {
            return task.priorityId === priority;
        }
    });
}

function reportOfTasksForDayByPriorities(tasksOfDay) {
    const urgentTasks = getTasksByPriority(tasksOfDay, '1');
    const highTasks = getTasksByPriority(tasksOfDay, '2');
    const middleTasks = getTasksByPriority(tasksOfDay, '3');
    const lowTasks = getTasksByPriority(tasksOfDay, '4');
    const failedTasks = getTasksByPriority(tasksOfDay, 'failed');
    //create report(array) of tasks for day
    return [
        urgentTasks.length,
        highTasks.length,
        middleTasks.length,
        lowTasks.length,
        failedTasks.length
    ];
}

function createArrayOfAllReports(tasks) {
    const dates = arrayOfDaysOfMonth();
    const arrayOfReportsByDates = [];

    let tasksOfDay = [];

    dates.map((date) => {
        tasksOfDay = tasks.filter(task => task.completeDay === date);
        const reportTasks = reportOfTasksForDayByPriorities(tasksOfDay);
        const reportForDay = {
            date,
            reportTasks
        };

        //push report of one day into array of all days reports
        arrayOfReportsByDates.push(reportForDay);
    });

    return arrayOfReportsByDates;
}

module.exports = {
    createArrayOfAllReports: createArrayOfAllReports,
    convertToDate: convertToDate
};
