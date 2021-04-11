var express = require('express');
var router = express.Router();
var ResumeModel = require('../models/resume.js');
var Constants = require('../Constants');
router.get('/', function(req, res, next) {
  res.render('creator', { ...req.session, Constants });
});

router.post('/', async function(req, res){
  if(!req.session.github)
	res.redirect('/creator?error=Github+is+required')
  const resume = new ResumeModel({
	  name: req.session.github.profile,
	  uid: req.session.github.profile,
	  profiles: req.session
  });
  resume.save();
  res.redirect('/'+req.session.github.profile)
})

module.exports = router;
