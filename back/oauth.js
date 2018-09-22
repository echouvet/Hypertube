var headers = {
        'Accept' : 'application/json',
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    }
    var options = {
        url: 'https://github.com/login/oauth/access_token',
        method: 'POST',
        headers: headers,
        form: {'code': req.query.code, 'client_id': '64b33bf122900dfa0966', 
        'client_secret' : 'fd8d61c5967a2fc42f734e4d408cab58521d72b9'}
    }
    request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var resp = JSON.parse(body)
            var options = {
                url: 'https://api.github.com/user',
                method: 'GET',
                headers: headers,
                qs: {'access_token': resp.access_token}
            }
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    var resp = JSON.parse(body)
                    req.session.profile = resp;
                    req.session.profile.img = resp.avatar_url;
                    res.render('index.ejs', {profile:req.session.profile, success:"Success login with your github account"})
                }
                else
    				res.render('index.ejs', {error:"something went wrong"})
            })
    	}
    	else
    		res.render('index.ejs', {error:"something went wrong"})
	});