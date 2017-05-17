const router = require('express').Router();

router.use('/games', require('./games'));

router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
