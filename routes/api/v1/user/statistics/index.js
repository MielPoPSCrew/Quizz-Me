const router = require('express').Router(),
      _      = require('lodash');

/**
 * @api {get} /user/statistics/username - Show user statistics information
 * @apiName ShowUserStatistics
 * @apiGroup User
 *
 * @apiParam {String} username - The user name.
 *
 * @apiSuccess {Number} gamesTotal - The total number of games played.
 * @apiSuccess {Number} gamesWon - The total number of games won.
 * @apiSuccess {Number} goodAnswers - The total number of good answers.
 * @apiSuccess {Number} quickAnswers - The total number of quick answers.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "gamesTotal: 0,
 *          "gamesWon: 0,
 *          "goodAnswers: 0,
 *          "quickAnswers: 0
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
            res.json(user[0].statistics);
        }
    });
});

/**
 * @api {put} /user/statistics/username - Update user statistics information
 * @apiName ShowUserStatistics
 * @apiGroup User
 *
 * @apiParam {String} username - The user name.
 * @apiParam {Object} statistics - The user statistics.
 * @apiParam {Number} statistics.gamesTotal - The total number of games played.
 * @apiParam {Number} statistics.gamesWon - The total number of games won.
 * @apiParam {Number} statistics.goodAnswers - The total number of good answers.
 * @apiParam {Number} statistics.quickAnswers - The total number of quick answers.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "gamesTotal: 0,
 *          "gamesWon: 0,
 *          "goodAnswers: 0,
 *          "quickAnswers: 0
 *     }
 *
 * @apiError UserNotFound - No user with this name could be found.
 * @apiError StatisticsEmpty - User statistics cannot be empty.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": {
 *       	"message": "This user does not exist."
 *       }
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": {
 *       	"message": "The statistics cannot be empty."
 *       }
 *     }
 */
router.put('/:username', (req, res) => {
    DB.get('users').find({"username": req.params.username}).then((user) => {
        if (_.isEmpty(user)) {
            res.json({"error": "This user does not exist."});
        } else if (_.isEmpty(req.body.statistics)) {
            res.json({"error": "The statistics cannot be empty."});
        } else {
            DB.get('users').update(
                {"username": req.params.username},
                {"$set": { "statistics": req.body.statistics}}
            );

            res.json(req.body.statistics);
        }
    });
});

module.exports = router;