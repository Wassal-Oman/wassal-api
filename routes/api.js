const express = require('express');
const router = express.Router();

// defualt route
router.get('/', (req, res) => {
    res.json({
        "msg": "Welcome To Wassal API"
    });
});

// customer routes
router.get('/customer-login', (req, res) => {
    res.json({
        "msg": "Welcome To Customer Login Route"
    });
});

// truck driver routes
router.get('/trucker-login', (req, res) => {
    res.json({
        "msg": "Welcome To Truck Driver Login Route"
    });
});

// export all routes
module.exports = router;