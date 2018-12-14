const express = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const encrypt = require("../encryption");
const router = express.Router();
const Customer = require("../models/Customer");
const Trucker = require("../models/Trucker");
const settings = require("../settings");

// get JWT secret key
const jwtSecretKey = settings.JWT_SECRET_KEY;

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
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().strict()
});

/* ***** Customer Routes ***** */

// login route
router.post("/customer-login", (req, res) => {
    // get user input
    let data = req.body;

    // validate input
    Joi.validate(data, userLoginSchema, (err, value) => {
        if (err) { // validation fails
            res.status(422).json({
                status: "error",
                message: "Invalid request data",
                data: err.message
            });
        } else { // validation succeed
            // check user through database
            Customer.findOne({
                where: {
                    phone: req.body.phone,
                    status: 2
                }
            }).then(user => {
                if (!user) {
                    res.status(401).json({
                        status: "error",
                        message: "User does not exist or inactive!"
                    });
                } else {
                    // compare input password with db password
                    encrypt.compareData(req.body.password, user.dataValues.password).then(val => {
                        if (!val) {
                            res.status(401).json({
                                status: "error",
                                message: "Invalid Credentails!"
                            });
                        } else {
                            // generate a token
                            jwt.sign({ user }, jwtSecretKey, { expiresIn: "2 days" }, (err, token) => {
                                if (err) {
                                    res.status(403).json({
                                        status: "error",
                                        message: "Access token cannot be assigned!",
                                        data: err
                                    });
                                } else {
                                    res.status(200).json({
                                        status: "success",
                                        message: "Login Successful!",
                                        token: token,
                                        data: user
                                    });
                                }
                            });
                        }
                    }).catch(err => {
                        res.status(401).json({
                            status: "error",
                            message: "Password cannot be decrypted!",
                            data: err
                        });
                    });
                }
            }).catch(err => {
                res.status(500).json({
                    status: "error",
                    message: "Cannot retrieve data from database",
                    data: err
                });
            });
        }
    });
});

// register route
router.post("/customer-register", (req, res) => {
    // get user input
    let data = req.body;

    // validate input
    Joi.validate(data, userRegisterSchema, (err, value) => {
        if (err) { // validation fails
                res.status(422).json({
                status: "error",
                message: "Invalid request data",
                data: err.message
            });
        } else { // validation succeed
            // create a new user inside database
            Customer.create({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                status: 2
            }).then(user => {
                res.status(201).json({
                    status: "success",
                    message: "User created successfully!",
                    data: user
                });
            }).catch(err => {
                res.status(200).json({
                    status: "error",
                    message: "Cannot register user!",
                    data: err
                });
            });
        }
    });
});

// test route with verify token
router.post("/customer-request", verifyToken, (req, res) => {
    // verify token
    jwt.verify(req.token, jwtSecretKey, (err, data) => {
        if (err) {
            res.status(403).json({
                status: "error",
                message: "Unauthorized Access!"
            });
        } else {
            res.status(200).json({
                status: "success",
                message: "Request sent...",
                data
            });
        }
    });
});

/* ***** Trucker Routes ***** */

// login route
router.post("/trucker-login", (req, res) => {
    // get user input
    let data = req.body;

    // validate input
    Joi.validate(data, userLoginSchema, (err, value) => {
        if (err) { // validation fails
            res.status(422).json({
                status: "error",
                message: "Invalid request data",
                data: err.message
            });
        } else { // validation succeed
            // check user through database
            Trucker.findOne({
                where: {
                    phone: req.body.phone,
                    status: 2
                }
            }).then(user => {
                if (!user) {
                    res.status(401).json({
                        status: "error",
                        message: "User does not exist or inactive!"
                    });
                } else {
                    // compare input password with db password
                    encrypt.compareData(req.body.password, user.dataValues.password).then(val => {
                        if (!val) {
                            res.status(401).json({
                                status: "error",
                                message: "Invalid Credentails!"
                            });
                        } else {
                            // generate a token
                            jwt.sign({ user }, jwtSecretKey, { expiresIn: "2 days" }, (err, token) => {
                                if (err) {
                                    res.status(403).json({
                                        status: "error",
                                        message: "Access token cannot be assigned!",
                                        data: err
                                    });
                                } else {
                                    res.status(200).json({
                                        status: "success",
                                        message: "Login Successful!",
                                        token: token,
                                        data: user
                                    });
                                }
                            });
                        }
                    }).catch(err => {
                        res.status(401).json({
                            status: "error",
                            message: "Password cannot be decrypted!",
                            data: err
                        });
                    });
                }
            }).catch(err => {
                res.status(500).json({
                    status: "error",
                    message: "Cannot retrieve data from database",
                    data: err
                });
            });
        }
    });
});

// register route
router.post("/trucker-register", (req, res) => {
    // get user input
    let data = req.body;

    // validate input
    Joi.validate(data, userRegisterSchema, (err, value) => {
        if (err) { // validation fails
            res.status(422).json({
                status: "error",
                message: "Invalid request data",
                data: err.message
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
                    status: "success",
                    message: "User created successfully!",
                    data: user
                });
            }).catch(err => {
                res.status(200).json({
                    status: "error",
                    message: "Cannot register user!",
                    data: err
                });
            });
        }
    });
});

/* ***** defualt route ***** */
router.use("/", (req, res) => {
    res.json({
        message: "Welcome To Wassal API"
    });
});

/* ***** methods and middlewares ***** */

// method to verify token
function verifyToken(req, res, next) {
    // get request header of type authorization
    const bearerHeader = req.headers["authorization"];

    // check if authorization header is sent through the request
    if (typeof bearerHeader !== "undefined") {
        // extract token from the authorization header
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];

        // set request token
        req.token = bearerToken;

        // exit middleware
        next();
    } else {
        res.status(403).json({
            status: "error",
            message: "Unauthorized Access"
        });
    }
}

// export all routes
module.exports = router;