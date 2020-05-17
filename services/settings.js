const db = require('../services/firebase');
const COLLECTIONS = require('../constants/collections');

function defaultSettings() {
    return {
        longBreak: 20,
        workIterations: 4,
        workTime: 20,
        shortBreak: 5
    }
}

function linkSettingsOfUser(userDocument) {
    return userDocument.settings.get().then((document) => {
        if (document.exists) {
            userDocument.settings = document.data();
        } else {
            userDocument.settings = defaultSettings();
        }
        return userDocument;
    })
}

module.exports = {
    defaultSettings: defaultSettings,
    linkSettingsOfUser: linkSettingsOfUser
};
