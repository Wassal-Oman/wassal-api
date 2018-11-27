const express = require('express');
const Admin = require('../models/Admin');
const encrypt = require('../encryption');

// initialize router
const router = express.Router();

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (!req.session.user && !req.cookies.user) {
        res.redirect('/login');
    } else {
        next();
    }    
};

// root route
router.get('/', sessionChecker, (req, res) => {
    res.redirect('/home');
});

// login route
router.route('/login')
    .get((req, res) => {
        if(req.session.user && req.cookies.user) {
            res.redirect('/home');
        } else {
            res.render('pages/login');
        }
    })
    .post((req, res) => {
        // get email and password
        let email = req.body.email;
        let password = req.body.password;

        Admin.findOne({ where: { email: email, status: 2 } }).then((user) => {
            console.log(user.dataValues);
            if (!user) {
                res.redirect('/login');
            } else {
                // compare input password with db password
                encrypt.compareData(password, user.dataValues.password).then(val => {
                    console.log(val);
                    if(!val) {
                        res.redirect('/login');
                    } else {
                        req.session.user = user.dataValues;
                        res.redirect(`/home?name=${user.dataValues.name}&email=${user.dataValues.email}`);
                    }
                }).catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
            }
        }).catch(err => {
            console.log(err);
            res.redirect('/login');
        });
    });

// signup route
router.route('/signup')
    .get(sessionChecker, (req, res) => {
        // get name and email
        let name = req.query.name;
        let email = req.query.email;

        res.render('pages/signup', {
            name: name,
            email: email
        });
    })
    .post(sessionChecker, (req, res) => {
        // get name and email
        let name = req.query.name;
        let email = req.query.email;
        
        Admin.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            status: 2
        })
        .then(user => {
            req.session.user = user.dataValues;
            res.redirect(`/home?name=${name}&email=${email}`);
        })
        .catch(error => {
            console.log(error);
            res.redirect(`/signup?name=${name}&email=${email}`);
        });
    });

// home route
router.get('/home', sessionChecker, (req, res) => {
    // get name and email
    let name = req.query.name;
    let email = req.query.email;

    // get all customer details

    res.render('pages/home', {
        name: name,
        email: email
    });
});

// logout route
router.get('/logout', sessionChecker, (req, res) => {
    res.clearCookie('user');
    res.redirect('/login');
});

// export all routes
module.exports = router;