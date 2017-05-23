const router = require('express').Router(),
      _      = require('lodash');

/**
 * @api {get} /user/username - Show username information
 * @apiName ShowUser
 * @apiGroup User
 *
 * @apiParam {String} username - The user name.
 *
 * @apiSuccess {String} _id - The user ID.
 * @apiSuccess {String} username - The user name.
 * @apiSuccess {Object} statistics - The user statistics.
 * @apiSuccess {Number} created - The creation timestamp.
 * @apiSuccess {Number} statistics.gamesTotal - The total number of games played.
 * @apiSuccess {Number} statistics.gamesWon - The total number of games won.
 * @apiSuccess {Number} statistics.goodAnswers - The total number of good answers.
 * @apiSuccess {Number} statistics.quickAnswers - The total number of quick answers.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "_id":	"592319afee20ab38b6cb24c7",
 *          "username":	"guest_D1j19Jj0B",
 *          "created": 1495472559023,
 *          "statistics": {
 *              "gamesTotal: 0,
 *              "gamesWon: 0,
 *              "goodAnswers: 0,
 *              "quickAnswers: 0
 *           }
 *     }
 *
 * @apiError UserNotFound - No user with this name could be found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": {
 *       	"message": "This user does not exist."
 *       }
 *     }
 */
router.get('/:username', (req, res) => {
    DB.get('users').find({"username": req.params.username}).then((user) => {
        if (_.isEmpty(user)) {
            res.json({"error": {"message": "This user does not exist."}});
        } else {
            res.json(user[0]);
        }
    });
});

router.use('/statistics', require('./statistics'));

module.exports = router;