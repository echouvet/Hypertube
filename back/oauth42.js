var headers = {
        'Accept' : 'application/json',
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    }
    var options = {
        url: 'https://api.intra.42.fr/oauth/token',
        method: 'POST',
        headers: headers,
        form: {'code': req.query.code, 'client_id': '8f7f61588b5208b39c354a41e3981495710c178f7de7af8c62906f588e55c623', 'client_secret' : 'a9e24a055faf55ed936574d7c85813aedf32081cf29057470ad813bf82063dce', 'grant_type' : 'client_credentials'}
    }
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var resp = JSON.parse(body)
            var options = {
                url: 'https://api.intra.42.fr/',
                method: 'GET',
                headers: headers,
                qs: {'access_token': resp.access_token}
            }
            request(options, function (error, response, body) {
                    console.log(body)

                if (!error && response.statusCode == 200) {
                    var resp = JSON.parse(body)
                    console.log(resp)
                    req.session.profile = resp;
                    req.session.profile.img = resp.avatar_url;
                    res.render('index.ejs', {profile:req.session.profile, success:"Success login with your 42 account"})
                }
                else
    				res.render('index.ejs', {error:"something went wrong"})
            })
    	}
    	else
    		res.render('index.ejs', {error:"something went wrong"})
	});