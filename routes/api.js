const express = require("express");
const router = express.Router();

// controllers
const CustomerController = require('../controllers/CustomerController');
const TruckerController = require('../controllers/TruckerController');

/* ***** Customer Routes ***** */
router.post("/customer-login", CustomerController.login);
router.post("/customer-register", CustomerController.register);
router.post("/customer-update-profile", verifyToken, CustomerController.updateProfile);
router.post("/customer-change-password", verifyToken, CustomerController.changePassword);
router.post("/customer-request", verifyToken, CustomerController.request);

/* ***** Trucker Routes ***** */
router.post("/trucker-login", TruckerController.login);
router.post("/trucker-register", TruckerController.register);
router.post("/trucker-update-profile", verifyToken, TruckerController.updateProfile);
router.post("/trucker-change-password", verifyToken, TruckerController.changePassword);

/* ***** defualt route ***** */
router.use("/", (req, res) => {
    res.json({
        message: "Welcome To Wassal API"
    });
});

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