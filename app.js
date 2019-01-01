// import needed libraries
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const flash = require('connect-flash');

// import routes
const api = require('./routes/api');
const dashboard = require('./routes/dashboard');

// initialize server and set port
const app = express();
const port = process.env.PORT || 3000;

// add middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(flash());
app.use(session({
    key: 'user',
    secret: 'WASSALAPISECRET',
    resave: false,
    saveUninitialized: false,
}));

// set the view engine and views folder
app.set('view engine', 'ejs');
app.set('views', 'views');

// notification messages
app.use(function(req, res, next) {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning');
    next();
});

// api
app.use('/api', api);

// dashbaord
app.use('/', dashboard);

// if route does not exist
app.use((req, res, next) => {
    res.status(404).render('404');
});

// start server
app.listen(port, () => console.log(`running on port ${port}`));