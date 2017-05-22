const router = require('express').Router();

router.use('/1.0', require('./v1'));

router.use('/admin', require('./admin'));

module.exports = router;