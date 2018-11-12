// import needed libraries
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// import routes
const api = require('./routes/api');
const dashboard = require('./routes/dashboard');

// initialize server and set port
const app = express();
const port = process.env.PORT || 3000;

// add middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    key: 'user',
    secret: 'WASSALAPISECRET',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// set the view engine and views folder
app.set('view engine', 'ejs');
app.set('views', 'views');

// clear for cookies if exist
app.use((req, res, next) => {
    if (req.cookies.user && !req.session.user) {
        res.clearCookie('user');        
    }
    next();
});

// api
app.use('/api', api);

// dashbaord
app.use('/', dashboard);

app.use((req, res, next) => {
    res.status(404).render('pages/404');
});

// start server
app.listen(port, () => console.log(`running on port ${port}`));