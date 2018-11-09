const express = require('express');
const router = express.Router();

// customer routes
router.post('/customer-login', (req, res) => {
    res.json({
        "msg": "Welcome To Customer Login Route"
    });
});

// truck driver routes
router.post('/trucker-login', (req, res) => {
    res.json({
        "msg": "Welcome To Truck Driver Login Route"
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