const router = require('express').Router();

router.get('/', function(req, res, next) {
    res.render('games/join');
});

/*
 * Get the list of available games
 */
router.get('/:id', function(req, res, next) {
    res.render('games/games');
});

router.get('/create', function(req, res, next) {
    res.render('games/create');
});

module.exports = router;
