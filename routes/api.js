const express = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const encrypt = require("../config/encryption");
const Customer = require("../models/Customer");
const Trucker = require("../models/Trucker");
const settings = require("../config/settings");
const router = express.Router();

// get JWT secret key
const jwtSecretKey = settings.JWT_SECRET_KEY;

// define user login schema
const loginSchema = Joi.object().keys({
    phone: Joi.string().regex(/^\d+$/).min(8).max(8).required(),
    password: Joi.string().min(6).required()
});

// define user register schema
const registerSchema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().regex(/^\d+$/).min(8).max(8).required(),
    password: Joi.string().min(6).required().strict(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().strict()
});

// define user profile schema
const profileSchema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().regex(/^\d+$/).min(8).max(8).required()
});

// define change password schema
const changePasswordSchema = Joi.object().keys({
    id: Joi.string().required(),
    password: Joi.string().min(6).required().strict(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().strict()
});

/* ***** Customer Routes ***** */

// login route
router.post("/customer-login", (req, res) => {
    // get user input
    const data = req.body;

    // validate input
    Joi.validate(data, loginSchema, (err, value) => {
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
                            // create a payload
                            const { id, name, email, phone } = user;
                            const payload = { id, name, email, phone };

                            // generate a token
                            jwt.sign({ payload }, jwtSecretKey, { expiresIn: "2 days" }, (err, token) => {
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
                                        data: payload
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
    const data = req.body;

    // validate input
    Joi.validate(data, registerSchema, (err, value) => {
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

// update profile route
router.post("/customer-update-profile", verifyToken, (req, res) => {
    
    // verify token
    jwt.verify(req.token, jwtSecretKey, (err, data) => {
        if(err) {
            res.status(403).json({
                status: "error",
                message: "Unauthorized Access!"
            });
        } else {
            // read data
            const data = req.body;

            // validate input
            Joi.validate(data, profileSchema, (err, value) => {
                if (err) { // validation fails
                    res.status(422).json({
                        status: "error",
                        message: "Invalid request data",
                        data: err.message
                    });
                } else { // validation succeeds
                    // update user profile
                    Customer.update({ name: data.name, email: data.email, phone: data.phone }, { where: { id: data.id } }).then(val => {
                        console.log(val);
                        res.status(200).json({
                            status: "success",
                            message: "Profile Updated"
                        });
                    }).catch(err => {
                        res.status(200).json({
                            status: "error",
                            message: "Cannot update profile!",
                            data: err
                        });
                    });
                }
            });
        }
    });
});

// change password route
router.post("/customer-change-password", verifyToken, (req, res) => {
    // verify token
    jwt.verify(req.token, jwtSecretKey, (err, data) => {
        if(err) {
            res.status(403).json({
                status: "error",
                message: "Unauthorized Access!"
            });
        } else {
            // read data
            const data = req.body;

            // validate input
            Joi.validate(data, changePasswordSchema, (err, value) => {
                if (err) { // validation fails
                    res.status(422).json({
                        status: "error",
                        message: "Invalid request data",
                        data: err.message
                    });
                } else { // validation succeeds
                    // encrypt password
                    encrypt.hashData(data.password).then(hash => {
                        // update user profile
                        Customer.update({ password: hash }, { where: { id: data.id } }).then(val => {
                            console.log(val);
                            res.status(200).json({
                                status: "success",
                                message: "Password has been changed"
                            });
                        }).catch(err => {
                            res.status(200).json({
                                status: "error",
                                message: "Cannot change password",
                                data: err
                            });
                        });
                    }).catch(err => {
                        res.status(200).json({
                            status: "error",
                            message: "New password cannot be hashed",
                            data: err
                        });
                    });
                }
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
    Joi.validate(data, loginSchema, (err, value) => {
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
    Joi.validate(data, registerSchema, (err, value) => {
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

// update profile route
router.post("/trucker-update-profile", verifyToken, (req, res) => {
    
    // verify token
    jwt.verify(req.token, jwtSecretKey, (err, data) => {
        if(err) {
            res.status(403).json({
                status: "error",
                message: "Unauthorized Access!"
            });
        } else {
            // read data
            const data = req.body;

            // validate input
            Joi.validate(data, profileSchema, (err, value) => {
                if (err) { // validation fails
                    res.status(422).json({
                        status: "error",
                        message: "Invalid request data",
                        data: err.message
                    });
                } else { // validation succeeds
                    // update user profile
                    Trucker.update({ name: data.name, email: data.email, phone: data.phone }, { where: { id: data.id } }).then(val => {
                        console.log(val);
                        res.status(200).json({
                            status: "success",
                            message: "Profile Updated"
                        });
                    }).catch(err => {
                        res.status(200).json({
                            status: "error",
                            message: "Cannot update profile!",
                            data: err
                        });
                    });
                }
            });
        }
    });
});

// change password route
router.post("/trucker-change-password", verifyToken, (req, res) => {
    // verify token
    jwt.verify(req.token, jwtSecretKey, (err, data) => {
        if(err) {
            res.status(403).json({
                status: "error",
                message: "Unauthorized Access!"
            });
        } else {
            // read data
            const data = req.body;

            // validate input
            Joi.validate(data, changePasswordSchema, (err, value) => {
                if (err) { // validation fails
                    res.status(422).json({
                        status: "error",
                        message: "Invalid request data",
                        data: err.message
                    });
                } else { // validation succeeds
                    // encrypt password
                    encrypt.hashData(data.password).then(hash => {
                        // update user profile
                        Trucker.update({ password: hash }, { where: { id: data.id } }).then(val => {
                            console.log(val);
                            res.status(200).json({
                                status: "success",
                                message: "Password has been changed"
                            });
                        }).catch(err => {
                            res.status(200).json({
                                status: "error",
                                message: "Cannot change password",
                                data: err
                            });
                        });
                    }).catch(err => {
                        res.status(200).json({
                            status: "error",
                            message: "New password cannot be hashed",
                            data: err
                        });
                    });
                }
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