function adduser (body) {
    con.query('SELECT * FROM users WHERE login = ? AND api = 2', [body.login], (err, result) => {
        if (err) throw err;
        if (result.length == 0)
        {
            sql = 'INSERT INTO `users` (`login`, `firstname`, `lastname`, `img`, `api`) VALUES ( ?, ?, ?, ?, 2)'
            con.query(sql, [body.login, body.first_name, body.last_name, body.image_url], (err) => { if (err) throw err; })
        }
    })
}

request.post({
    url: 'https://api.intra.42.fr/oauth/token',
    json: true,
    body: {
        code: req.query.code,
        grant_type: 'authorization_code',
        client_id: 'e9d8c67e741dc42f8076e26764e96751113a2956434b46baa131d0739f784127',
        client_secret: '4efea04549b65cea709c2b9b8ce5241b8ad7b907282bf457b6e94b56e3bcd012',
        redirect_uri: 'http://localhost:8080/oauth42'
    }
}, (error, response, body) => {
    if (error)
        res.render('index.ejs', {error: response.statusCode + " : " + error})
    else if (response.body.error || response.statusCode != 200) 
        res.render('index.ejs', {error: response.statusCode + " : " + response.body.error})
    else
    {
        token = response.body.access_token;
        request.get({
            url: 'https://api.intra.42.fr/v2/me?access_token=' + token,
            json: true
        }, (error, response, body) => {
            if (error)
                res.render('index.ejs', {error: response.statusCode + " : " + error})
            else if (response.body.error || response.statusCode != 200)
                res.render('index.ejs', {error: response.statusCode + " : " + response.body.error})
            else
            {
                adduser(body)
                req.session.profile = new Array;
                req.session.profile.login = body.login
                req.session.profile.firstname = body.first_name
                req.session.profile.lastname = body.last_name
                req.session.profile.img = body.image_url
                req.session.api = '2';
                res.render('index.ejs', {profile:req.session.profile, success:"Welcome " + body.displayname + "!"})
            }
        })
    } 
});