const router = require('express').Router();

router.get('/', function(req, res, next) {
    res.render('quizz/list');
});

router.get('/create', function(req, res, next) {
    res.render('quizz/create');
});

module.exports = router;
