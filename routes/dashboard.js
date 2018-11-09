const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const settings = require('../settings');
const route = express.Router();

// create db connection
const connection = mysql.createConnection(settings.db_connection);

// defualt route
route.get('/', (req, res) => {
    res.render('pages/index');
});

// login route
route.post('/admin-login', (req, res) => {
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
                    res.send('Login Successful!');
                } else {
                    res.send('Wrong username or password!');
                }
            });

        }
    );
});

async function checkUser(password, hashedPass) {
    return await bcrypt.compare(password, hashedPass);
}

// export all routes
module.exports = route;