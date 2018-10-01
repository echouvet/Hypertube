function adduser (body) {
    con.query('SELECT * FROM users WHERE login = ? AND api = 3', [body.login], (err, result) => {
        if (err) throw err;
        if (result.length == 0)
        {
            sql = 'INSERT INTO `users` (`login`, `img`, `api`) VALUES ( ?, ?, 3)'
            con.query(sql, [body.login, body.avatar_url], (err) => { if (err) throw err; })
        }
    })
}


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
            request(options, (error2, response, body) => {
                if (!error && response.statusCode == 200) {
                    req.session.profile = new Array
                    var body = JSON.parse(body)
                    req.session.profile.login = body.login;
                    req.session.profile.img = body.avatar_url;
                    req.session.profile.api = '3';
                    adduser(body)
                    res.render('index.ejs', {profile:req.session.profile, success: req.i18n.__('Welcome ') + body.login + '!'})
                }
                else
                    res.render('index.ejs', {error: response.statusCode + " : " + error2})
            })
        }
        else
            res.render('index.ejs', {error: response.statusCode + " : " + error})
    });