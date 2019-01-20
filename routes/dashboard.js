const express = require('express');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Trucker = require('../models/Trucker');
const Truck = require('../models/Truck');
const Request = require('../models/Request');
const encrypt = require('../config/encryption');
const Type = require('../models/Type');

// initialize router
const router = express.Router();

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (!req.session.user) {
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
        if(req.session.user) {
            res.redirect('/home');
        } 
        res.render('login');
    })
    .post((req, res) => {
        // get email and password
        const { email, password } = req.body;

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
        res.render('signup');
    })
    .post(sessionChecker, (req, res) => {
        Admin.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            status: 2
        }).then(user => {
            res.redirect('/home');
        }).catch(error => {
            res.redirect('/signup');
        });
    });

// home route
router.get('/home', sessionChecker, (req, res) => {
    // get name and email
    const { name, email } = req.session.user;

    // get statistics
    let customerPromise = getCustomersCount();
    let truckerPromise = getTruckersCount();
    let truckPromise = getTrucksCount();
    let requestPromise = getRequestsCount();

    Promise.all([customerPromise, truckerPromise, truckPromise, requestPromise]).then(val => {
        // render home page
        res.render('home', {
            name: name,
            email: email,
            customerCount: val[0],
            truckerCount: val[1],
            truckCount: val[2],
            requestCount: val[3]
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
});

// adminstrators route
router.get('/admins', sessionChecker, (req, res) => {
    // get name and email
    const { name, email } = req.session.user;

    // get records
    getAdministrators().then(data => {
        res.render('administrators', {
            name: name,
            email: email,
            data
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
});

// add truck type route
router.route('/add-truck-type')
    .get(sessionChecker, (req, res) => {
        res.render('add-truck-type');
    }).post((req, res) => {
        const type = req.body.type;

        // create a new type
        Type.create({
            type
        }).then(val => {
            console.log(val);
            req.flash('success', 'New Truck Type has been Added');
            res.redirect(req.get('referer'));
        }).catch(err => {
            console.log(err);
            req.flash('error', 'Cannot Add This Type');
            res.redirect(req.get('referer'));
        });
    });

// customers route
router.get('/customers', sessionChecker, (req, res) => {
    // get name and email
    const { name, email } = req.session.user;

    // get records
    getCustomers().then(data => {
        res.render('customers', {
            name: name,
            email: email,
            data
        });
    }).then(err => {
        console.log(err);
        res.redirect('/500');
    });
});

// truck drivers route
router.get('/truck-drivers', sessionChecker, (req, res) => {
    // get name and email
    const { name, email } = req.session.user;

    // get records
    getTruckers().then(data => {
        res.render('truckers', {
            name: name,
            email: email,
            data
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
});

// requests route
router.get('/requests', sessionChecker, (req, res) => {
    // get name and email
    const { name, email } = req.session.user;

     // get records
    getRequests().then(data => {
        res.render('requests', {
            name: name,
            email: email,
            data
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
});

// logout route
router.get('/logout', sessionChecker, (req, res) => {
    // destroy session and redirect to login
    req.session.destroy();
    res.redirect('/login');
});

router.get('/500', (req, res) => {
    res.render('500');
});

/* ***** Functions and Middlewares ***** */
function getAdministrators() {
    return new Promise((resolve, reject) => {
        Admin.findAll({ where: { status: 2 } }).then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getCustomers() {
    return new Promise((resolve, reject) => {
        Customer.findAll({ where: { status: 2 } }).then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getTruckers() {
    return new Promise((resolve, reject) => {
        Trucker.findAll().then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getTrucks() {
    return new Promise((resolve, reject) => {
        Truck.findAll().then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getRequests() {
    return new Promise((resolve, reject) => {
        Request.findAll().then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getCustomersCount() {
    return new Promise((resolve, reject) => {
        Customer.findAndCountAll({ where: { status: 2 } }).then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getTruckersCount() {
    return new Promise((resolve, reject) => {
        Trucker.findAndCountAll({ where: { status: 2 } }).then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getTrucksCount() {
    return new Promise((resolve, reject) => {
        Truck.findAndCountAll().then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getRequestsCount() {
    return new Promise((resolve, reject) => {
        Request.findAndCountAll().then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}

// export all routes
module.exports = router;