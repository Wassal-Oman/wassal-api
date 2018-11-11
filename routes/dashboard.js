const express = require('express');
const bcrypt = require('bcrypt');
const settings = require('../settings');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const User = require('../models');

// initialize router
const router = express.Router();

// access token
let accessToken = '';

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/');
    } else {
        next();
    }    
};

router.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

router.route('/login')
    .get(sessionChecker, (req, res) => {
        res.render('pages/login');
    })
    .post((req, res) => {
        // get email and password
        let username = req.body.username;
        let password = req.body.password;

        User.findOne({ where: { username: username } }).then((user) => {
            if (!user) {
                res.redirect('/login');
            } else if (!user.validPassword(password)) {
                res.redirect('/login');
            } else {
                req.session.user = user.dataValues;
                res.redirect('/home');
            }
        });
    });

// route for user signup
router.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.render('pages/signup');
    })
    .post((req, res) => {
        User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        .then(user => {
            req.session.user = user.dataValues;
            res.redirect('/home');
        })
        .catch(error => {
            res.redirect('/signup');
        });
    });

router.get('/home', (req, res) => {

    if (req.session.user && req.cookies.user_sid) {
        res.render('pages/home');
    } else {
        res.redirect('/login');
    }
});

router.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

// export all routes
module.exports = router;