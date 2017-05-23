const router = require('express').Router();

router.use('/search', require('./search'));

router.use('/game', require('./game'));

router.use('/quiz', require('./quiz'));

module.exports = router;