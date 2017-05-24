const router = require('express').Router();

router.get('/', function(req, res) {
    res.render('steve');
});

module.exports = router;
