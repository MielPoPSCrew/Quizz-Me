const router = require('express').Router();


/*
 * Get the list of available games
 */
router.get('/', function(req, res, next) {
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
          res.render('games', {pendingGames,freeGames});
       });
    });
});

module.exports = router;
