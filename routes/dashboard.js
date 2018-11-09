const express = require('express');
const router = express.Router();

// defualt route
router.get('/', (req, res) => {
    res.render('pages/index');
});

// export all routes
module.exports = router;