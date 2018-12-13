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
                        res.redirect('/home');
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
        res.render('pages/signup');
    })
    .post(sessionChecker, (req, res) => {
        Admin.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            status: 2
        })
        .then(user => {
            res.redirect('/home');
        })
        .catch(error => {
            res.redirect('/signup');
        });
    });

// home route
router.get('/home', sessionChecker, (req, res) => {
    // get name and email
    let name = req.session.user.name;
    let email = req.session.user.email;

    res.render('pages/home', {
        name: name,
        email: email
    });
});

// adminstrators route
router.get('/admins', sessionChecker, (req, res) => {
    // get name and email
    let name = req.session.user.name;
    let email = req.session.user.email;

    res.render('pages/administrators', {
        name: name,
        email: email
    });
});

// customers route
router.get('/customers', sessionChecker, (req, res) => {
    // get name and email
    let name = req.session.user.name;
    let email = req.session.user.email;

    res.render('pages/customers', {
        name: name,
        email: email
    });
});

// truck drivers route
router.get('/truck-drivers', sessionChecker, (req, res) => {
    // get name and email
    let name = req.session.user.name;
    let email = req.session.user.email;

    res.render('pages/truckers', {
        name: name,
        email: email
    });
});

// requests route
router.get('/requests', sessionChecker, (req, res) => {
    // get name and email
    let name = req.session.user.name;
    let email = req.session.user.email;

    res.render('pages/requests', {
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