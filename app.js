const express = require('express');
/*const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');*/
const morgan = require('morgan');
const firebase = require('firebase');

const app = express();

app.use(morgan('short'));
/*app.use(logger('dev'));*/
app.use(express.json());
app.use(express.urlencoded({extended: false}));
/*app.use(cookieParser());*/
/*app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));*/

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

const firebaseConfig = {
    /*apiKey: 'AIzaSyCZE3TdvXiYM5JFa1OuwpSwt44zuXPcifA',
    authDomain: 'pomodoro-prod-app.firebaseapp.com',
    // databaseURL: 'https://pomodoro-prod-app.firebaseio.com',
    projectId: 'pomodoro-prod-app',
    timestampsInSnapshots: true,
    // storageBucket: 'pomodoro-prod-app.appspot.com',
    // messagingSenderId: '789303722870'*/


    apiKey: "AIzaSyBD5ny0fMEYaakTyUm5rhQf183krXbC1GU",
    authDomain: "pomodoro-diploma.firebaseapp.com",
    databaseURL: "https://pomodoro-diploma.firebaseio.com",
    projectId: "pomodoro-diploma",
    storageBucket: "pomodoro-diploma.appspot.com",
    messagingSenderId: "577609052631",
    appId: "1:577609052631:web:506ffd3165a23d79d75b92",
    measurementId: "G-PRXQ1MZNDP"

};

firebase.initializeApp(firebaseConfig);

app.get('/', (req, res) => {
    console.log('Responding from the root route');
    res.send('Android, I love you!');
});

const routerSettingsService = require('./routes/settings');
app.use(routerSettingsService);

const routerUserService = require('./routes/user');
app.use(routerUserService);


app.listen(3030, () => {
    console.log('Server is up and listening on 3030...');
});
