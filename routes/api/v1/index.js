const router = require('express').Router();

router.use('/game', require('./game'));

router.use('/quiz', require('./quiz'));

module.exports = router;