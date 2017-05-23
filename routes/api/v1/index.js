const router = require('express').Router();

router.use('/game', require('./game'));

router.use('/quiz', require('./quiz'));

router.use('/user', require('./user'));

module.exports = router;