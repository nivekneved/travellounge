var express = require('express');
var router = express.Router();

/* GET home page - redirect to dashboard */
router.get('/', function (req, res, next) {
  res.redirect('/dashboard');
});

module.exports = router;
