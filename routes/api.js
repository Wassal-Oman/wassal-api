const express = require('express');
const Joi = require('joi');
const router = express.Router();
const Customer = require('../models/Customer');
const Trucker = require('../models/Trucker');

// define user login schema
const userLoginSchema = Joi.object().keys({
    phone: Joi.string().regex(/^\d+$/).min(8).max(8).required(),
    password: Joi.string().min(6).required()
});

// define user register schema
const userRegisterSchema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().regex(/^\d+$/).min(8).max(8).required(),
    password: Joi.string().min(6).required().strict(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict()
});

/* ***** Customer Routes ***** */

// login route
router.post('/customer-login', (req, res) => {

    // get user input
    let data = req.body;

    // validate input
    Joi.validate(data, userLoginSchema, (err, value) => {

        if(err) { // validation fails
            
            res.status(422).json({
                status: 'error',
                message: 'Invalid request data',
                data: err
            });

        } else { // validation succeed

            // check user through database
            Customer.findOne({
                where: {
                    phone: req.body.phone,
                    status: 2
                },
                attributes: ['id', 'name', 'email', 'phone', 'createdAt', 'updatedAt', 'status']
            }).then(user => {
                if(!user) {
                    res.status(422).json({
                        status: 'error',
                        message: 'User does not exist or inactive!'
                    });
                } else {
                    res.status(200).json({
                        status: 'success',
                        message: 'Login Successful!',
                        data: user
                    });
                }
            }).catch(err => {
                res.status(500).json({
                    status: 'error',
                    message: 'Cannot retrieve data from database',
                    data: err
                });
            });
        }
    });
});

// register route
router.post('/customer-register', (req, res) => {

    // get user input
    let data = req.body;

    // validate input
    Joi.validate(data, userRegisterSchema, (err, value) => {

        if(err) { // validation fails
            
            res.status(422).json({
                status: 'error',
                message: 'Invalid request data',
                data: err
            });
            
        } else { // validation succeed

            // create a new user inside database
            Customer.create({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password
            }).then(user => {
                res.status(201).json({
                    status: 'success',
                    message: 'User created successfully!'
                });
            }).catch(err => {
                res.status(200).json({
                    status: 'error',
                    message: 'Cannot register user!',
                    data: err
                });
            });
        }
    });
});

/* ***** Trucker Routes ***** */

// login route
router.post('/trucker-login', (req, res) => {

    // get user input
    let data = req.body;

    // validate input
    Joi.validate(data, userLoginSchema, (err, value) => {

        if(err) { // validation fails
            
            res.status(422).json({
                status: 'error',
                message: 'Invalid request data',
                data: err
            });

        } else { // validation succeed

            // check user through database
            Trucker.findOne({
                where: {
                    phone: req.body.phone,
                    status: 2
                },
                attributes: ['id', 'name', 'email', 'phone', 'createdAt', 'updatedAt', 'status']
            }).then(user => {
                if(!user) {
                    res.status(422).json({
                        status: 'error',
                        message: 'User does not exist or inactive!'
                    });
                } else {
                    res.status(200).json({
                        status: 'success',
                        message: 'Login Successful!',
                        data: user
                    });
                }
            }).catch(err => {
                res.status(500).json({
                    status: 'error',
                    message: 'Cannot retrieve data from database',
                    data: err
                });
            });
        }
    });
});

// register route
router.post('/trucker-register', (req, res) => {

    // get user input
    let data = req.body;

    // validate input
    Joi.validate(data, userRegisterSchema, (err, value) => {

        if(err) { // validation fails
            
            res.status(422).json({
                status: 'error',
                message: 'Invalid request data',
                data: err
            });
            
        } else { // validation succeed

            // create a new user inside database
            Trucker.create({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password
            }).then(user => {
                res.status(201).json({
                    status: 'success',
                    message: 'User created successfully!'
                });
            }).catch(err => {
                res.status(200).json({
                    status: 'error',
                    message: 'Cannot register user!',
                    data: err
                });
            });
        }
    });
});

// defualt route
router.use('/', (req, res) => {
    res.json({
        "msg": "Welcome To Wassal API"
    });
});

// export all routes
module.exports = router;