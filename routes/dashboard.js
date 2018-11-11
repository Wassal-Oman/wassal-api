const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const settings = require('../settings');
const route = express.Router();

// create db connection
const connection = mysql.createConnection(settings.db_connection);

// access token
let accessToken = '';

route.get('/', (req, res) => {
    res.redirect('/login');
});

// defualt route
route.get('/login', (req, res) => {
    res.render('pages/login');
});

// login route
route.post('/login', (req, res) => {
    // get email and password
    const email = req.body.email;
    const password = req.body.password;

    // simple query
    connection.query(
        'SELECT * FROM `Admin` WHERE `ad_email` = ?', [email], (err, results) => {
            let data = results[0];

            // check user
            checkUser(password, data.ad_password).then((match) => {
                if(match) {
                    accessToken = 'token';
                    res.redirect('/home');
                } else {
                    res.send('Wrong username or password!');
                }
            });

        }
    );
});

route.get('/home', (req, res) => {

    if(accessToken === '') {
        res.redirect('/login');
    } else {
        res.render('pages/home');
    }
});

async function checkUser(password, hashedPass) {
    return await bcrypt.compare(password, hashedPass);
}

// export all routes
module.exports = route;