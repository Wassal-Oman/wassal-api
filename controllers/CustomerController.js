// import needed libraries
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const settings = require("../config/settings");
const encrypt = require("../config/encryption");
const Customer = require("../models/Customer");
const Request = require("../models/Request");

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

// define a storage
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// initialize upload constant
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => { checkUploadedFile(file, cb ); }
}).single('img');

// method to filter uploaded file
function checkUploadedFile(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    // check for uploaded file type
    if(mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only allowed!');
    }
}

// login
module.exports.login = (req, res) => {

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
};

// register
module.exports.register = (req, res) => {
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
};

// update profile
module.exports.updateProfile = (req, res) => {
    
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
};

// change password
module.exports.changePassword = (req, res) => {
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
}

// request
module.exports.request = (req, res) => {
    // verify token
    jwt.verify(req.token, jwtSecretKey, (err, data) => {
        if (err) {
            res.status(403).json({
                status: "error",
                message: "Unauthorized Access!"
            });
        } else {
            // upload image
            upload(req, res, (err) => {
                if(err) {
                    console.log(err);
                    res.status(200).json({
                        status: "error",
                        message: "Cannot upload your image!"
                    });
                } else {
                    // get data from request
                    const { customerId, location, destination, description, request_date, request_time, typeId } = req.body;
                    const img = `uploads/${req.file.filename}`;

                    // store file name inside database
                    Request.create({
                        location,
                        destination,
                        description,
                        typeId,
                        request_date,
                        request_time,
                        img,
                        customerId
                    }).then(val => {
                        res.status(201).json({
                            status: "success",
                            message: "Your order has been sent!",
                            data: val
                        });
                    }).catch(err => {
                        res.status(200).json({
                            status: "error",
                            message: "Cannot complete your order!",
                            data: err
                        });
                    });
                }
            });
        }
    });
};