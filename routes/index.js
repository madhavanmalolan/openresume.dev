var express = require('express');
var router = express.Router();
var ResumeModel = require('../models/resume');

/* GET home page. */
router.get('/', function(req, res, next) {
  ResumeModel.find({}, function(err, results){
	  console.log(err);
	  console.log(results);
  });
  res.redirect('/creator')
});

router.get('/:username', async function(req, res){
    const resume = await ResumeModel.findOne({ uid: req.params.username }).exec();
    res.render('resume', { title: "@"+req.params.username, resume });
});

module.exports = router;
