regLow = /[a-z]/ 
regUp = /[A-Z]/
var form = new formidable.IncomingForm()




if (!req.body || (!req.body.login && !req.body.pass))
	res.render('register.ejs')
else if (!req.body.login || !req.body.firstname || !req.body.lastname || !req.body.pass ||
 !req.body.confirmpass || !req.body.mail)
	res.render('register.ejs', {error: 'You must fill in every field to create an account'})
else
{
var login = eschtml(req.body.login)
    firstname = eschtml(req.body.firstname)
    lastname = eschtml(req.body.lastname)
    pass = eschtml(req.body.pass)
    email = eschtml(req.body.mail)
    //faudra voir comment on gere les langues
    if (req.body.language)
    	language = eschtml(req.body.language)
    else
    	language = 'en'
    if (pass.length < 5 || pass.search(regLow) == -1 || pass.search(regUp) == -1)
		res.render('register.ejs', {error: 'Password must be minimum 6 characters long and must contain an uppercase and a lowercase'})
	else if (req.body.pass !== req.body.confirmpass)
		res.render('register.ejs', {error: 'Your Password Confirmation did not match your Password'})
	else if (!validator.isEmail(email))
		res.render('register.ejs', {error: 'Your e-mail is not valid'})
	else
	{
        con.query('SELECT login FROM users WHERE login = ? OR email = ?', [login, email],
        function (error, result) { if (error) throw error; if (result.length != 0)
    	res.render('register.ejs', {error: 'Login or E-mail already exists in database'})
    	else 
        {
            form.parse(req, function (err, field, files) { if (err) throw err;
            if (!field || !files)
                res.render('register.ejs', {error: 'You must upload an image to create your account'})
            else if (files.file.type !== 'image/png' && files.file.type !== 'image/jpeg' && files.file.type !== 'image/jpg')
                res.render('register.ejs', {error: 'Only jpeg, jpg, and png images aloud'})
            else if (files.file.size > 5000000)
                res.render('register.ejs', {error: 'Your image is too big'})
            else
            {
                con.query('SELECT id FROM `users` DESC LIMIT 1', function(err, resid) { if (err) throw err;
                    if (resid.length == 0)
                        var picid = '1';
                    else
                        var picid = resid.id + 1;
                var path = 'img/users/' + picid;
                fs.readFile(files.file.path, function (err, data) { if (err) throw err; 
                fs.writeFile(path, data, function (err) { if (err) throw err; }) });
                bcrypt.hash(pass, 10, function(err, hash) { if (err) throw err
                sql = 'INSERT INTO `users` (`login`, `firstname`, `lastname`, `pass`, `email`, `language`, `img`) VALUES (?, ?, ?, ?, ?, ?, ?)'
                con.query(sql, [login, firstname, lastname, hash, email, language, path], function (err, res) { if (err) throw err }) })
                res.redirect('/login')
            }) } })
        } })
	}
}
