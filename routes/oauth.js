var express = require('express');
var querystring = require('querystring');
var axios = require('axios');
var router = express.Router();
var Feed = require('rss-to-json');
var Constants = require('../Constants');

router.get('/github', async function(req, res, next) {
  const {code} = req.query;
  const accessTokenResponse = await axios.post("https://github.com/login/oauth/access_token", {
      client_id: Constants.GITHUB_CLIENTID,
      client_secret: Constants.GITHUB_SECRET,
      code,
  }, { headers: { Accept: 'application/json' }});
  const userResponse = await axios.get('https://api.github.com/user', { headers: { Authorization: `token ${accessTokenResponse.data.access_token}`, Accept: 'application/json'}});
  const reposResponse = await axios.get(`https://api.github.com/users/${userResponse.data.login}/repos`);
  const sortedRepos = reposResponse.data.sort((r1, r2) => r2.stargazers_count - r1.stargazers_count);
  const languages = {};
  let totalLoc = 0;
  for( const i in sortedRepos){
      if(i>5)
        break;
      const repo = sortedRepos[i];
      const languageResponse = await axios.get(`https://api.github.com/repos/${repo.full_name}/languages`);
      for(k in Object.keys(languageResponse.data)){
          const lang = Object.keys(languageResponse.data)[k] ;
          const loc = languageResponse.data[Object.keys(languageResponse.data)[k]];
          if(!languages[lang])
            languages[lang] = 0;
          languages[lang] += loc;
          totalLoc += loc;
      }
  }
  let languageList = [];
  for(l in Object.keys(languages)){
      const lang = Object.keys(languages)[l];
      const loc = languages[lang];
      languageList.push({ language: lang, locContribution: loc*100/totalLoc});
  }
  languageList = languageList.sort((l1, l2) => l2.locContribution - l1.locContribution);
  req.session.github = {
      profile: userResponse.data.login,
      profileUrl: userResponse.data.html_url,
      sortedRepos,
      languageList,
  }
  res.redirect('/creator');
});

router.get('/stackoverflow', async function(req, res, next){
	const { code } = req.query;
	console.log(Constants.STACKOVERFLOW_CLIENTID);
	const accessTokenResponse = await axios.post('https://stackoverflow.com/oauth/access_token/json', querystring.stringify({
		client_id: `${Constants.STACKOVERFLOW_CLIENTID}`,
		client_secret : Constants.STACKOVERFLOW_SECRETKEY,
		code,
		redirect_uri: "https://openresume.dev/oauth/stackoverflow"
	}), { headers: {}});
	console.log(accessTokenResponse.data);
	const { access_token } = accessTokenResponse.data;
	const answersResponse = await axios.get('https://api.stackexchange.com/2.2/me/answers?site=stackoverflow&order=desc&sort=votes&key=l5WGfHPWiEe*Modi9iKt7A((&filter=!--1nZx2SAHs1&access_token='+access_token);
	console.log(answersResponse.data);
	if(answersResponse && answersResponse.data && answersResponse.data.items.length > 0){
		req.session.stackoverflow = {
			profile: answersResponse.data.items[0].owner.link,
			reputation: answersResponse.data.items[0].reputation,
			answers: answersResponse.data.items
		}
	}
	
	res.redirect('/creator')

})

router.get('/linkedin', async function(req, res, next) {
    req.session.linkedin = { profile: req.query.link } ;
    res.redirect('/creator');
});  



router.get('/producthunt', async function(req, res, next) {
    const {code} = req.query;
    const accessTokenResponse = await axios.post("https://api.producthunt.com/v2/oauth/token", {
        client_id: Constants.PRODUCTHUNT_CLIENTID,
        client_secret: Constants.PRODUCTHUNT_SECRETKEY,
        redirect_uri: Constants.PRODUCTHUNT_URL,
        grant_type: 'authorization_code',
        code,
    }, { headers: { Accept: 'application/json' }});
    const {access_token} = accessTokenResponse.data;
    const userResponse = await axios.post('https://api.producthunt.com/v2/api/graphql', { query: "query { viewer { user { madePosts { edges { node { name description url votesCount thumbnail { url } } } } username} } }"}, { headers: { Authorization: `Bearer ${access_token}`}});
    console.log(userResponse.data)
    req.session.producthunt = userResponse.data.data.viewer.user
    res.redirect('/creator');
})

router.get('/medium', async function(req, res, next) {
    const { username } = req.query;
    Feed.load('https://medium.com/feed/@'+username, function(err, rss){
        if(!err){
            req.session.medium = { username, rss }
        }
        else{
            console.log("error", err);
        }
        return res.redirect('/creator');
    });
});



module.exports = router;
