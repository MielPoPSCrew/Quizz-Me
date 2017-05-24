const router = require('express').Router();

router.get('/', function(req, res, next) {
    res.render('games/join');
});

/*
 * Get the list of available games
 */
router.get('/:id', function(req, res, next) {
    DB.get('quiz').find().then((games) => {
       let pendingGames = [];
       let freeGames = [];
       games.forEach((game) => {
          if(game.nbPlayer !== 0)
          {
              pendingGames.push(game);
          }
          else{
              freeGames.push(game);
          }
          res.render('games/games', {pendingGames,freeGames});
       });
    });
});

router.get('/create', function(req, res, next) {
    res.render('games/create');
});

module.exports = router;
