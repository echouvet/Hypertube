

regLow = /[a-z]/ 
regUp = /[A-Z]/
 var form = new formidable.IncomingForm();
form.parse(req, function (err, field, files) { if (err) throw err;
    if (req.session.profile != undefined)
        res.render('index.ejs', {profile: req.session})
    else if (!field || (!field.login && !field.pass))
    	res.render('register.ejs')
    else if (!field.login || !field.firstname || !field.lastname || !field.pass || !field.confirmpass || !field.mail || !files.pic)
    	res.render('register.ejs', {error: 'You must fill in every field to create an account'})
    else if (files.pic.type !== 'image/png' && files.pic.type !== 'image/jpeg' && files.pic.type !== 'image/jpg')
        res.render('register.ejs', {error: 'Only jpeg, jpg, and png images aloud'})
    else if (files.pic.size > 50000000)
        res.render('register.ejs', {error: 'Your image is too big'}) 
    else
    {
    var login = eschtml(field.login)
        firstname = eschtml(field.firstname)
        lastname = eschtml(field.lastname)
        pass = eschtml(field.pass)
        email = eschtml(field.mail)
        //faudra voir comment on gere les langues
        if (field.language)
        	language = eschtml(field.language)
        else
        	language = 'en'
        if (pass.length < 5 || pass.search(regLow) == -1 || pass.search(regUp) == -1)
    		res.render('register.ejs', {error: 'Password must be minimum 6 characters long and must contain an uppercase and a lowercase'})
    	else if (field.pass !== field.confirmpass)
    		res.render('register.ejs', {error: 'Your Password Confirmation did not match your Password'})
    	else if (!validator.isEmail(email))
    		res.render('register.ejs', {error: 'Your e-mail is not valid'})
    	else
    	{
            con.query('SELECT login FROM users WHERE (login = ? OR email = ?) AND api = 1', [login, email],
            function (error, result) { if (error) throw error; if (result.length != 0)
        	res.render('register.ejs', {error: 'Login or E-mail already exists in database'})
        	else 
            {
                con.query('SELECT id FROM `users` ORDER BY id DESC LIMIT 1', function(err, resid) { if (err) throw err;
                if (resid.length == 0)
                    var picid = '1';
                else
                    var picid = resid[0].id + 1;
                var path = 'img/users/' + picid;
                fs.readFile(files.pic.path, function (err, data) { if (err) throw err; 
                fs.writeFile(path, data, function (err) { if (err) throw err; }) });
                bcrypt.hash(pass, 10, function(err, hash) { if (err) throw err
                sql = 'INSERT INTO `users` (`login`, `firstname`, `lastname`, `pass`, `email`, `language`, `img`, `api`) VALUES (?, ?, ?, ?, ?, ?, ?, 1)'
                con.query(sql, [login, firstname, lastname, hash, email, language, path], function (err, res) { if (err) throw err }) })
                res.render('login.ejs', {success0: "Your account was successfully created !"}) })
            } })
    	}
    }
})