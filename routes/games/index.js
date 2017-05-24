const router = require('express').Router();

router.get('/', function(req, res, next) {
    res.render('games/join');
});

router.get('/create', function(req, res, next) {
    res.render('games/create');
});

/*
 * Get the list of available games
 */
router.get('/:id', function(req, res, next) {
    res.render('games/games');
});



module.exports = router;
