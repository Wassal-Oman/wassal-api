// import needed libraries
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

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

// set the view engine and views folder
app.set('view engine', 'ejs');
app.set('views', 'views');

// api
app.use('/api', api);

// dashbaord
app.use('/', dashboard);

// start server
app.listen(port, () => console.log(`running on port ${port}`));