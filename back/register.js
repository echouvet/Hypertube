regLow = /[a-z]/ 
regUp = /[A-Z]/
if (!req.body || (!req.body.login && !req.body.pass))
	res.render('register.ejs')
else if (!req.body.login || !req.body.firstname || !req.body.lastname || !req.body.pass ||
 !req.body.confirmpass || !req.body.mail)
	res.render('register.ejs', {error: 'You must fill in every field to create an account'})
else
{
        console.log(req.body)
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
        console.log(req.body)
        con.query('SELECT login FROM users WHERE login = ? OR email = ?', [login, email],
        function (error, result, next) { if (error) throw error; if (result.length != 0)
        	res.render('register.ejs', {error: 'Login or E-mail already exists in database'})
        	else next();  })
        bcrypt.hash(pass, 10, function(err, hash) { if (err) throw err
        sql = 'INSERT INTO `users` (`login`, `firstname`, `lastname`, `pass`, `email`, `language`) VALUES (?, ?, ?, ?, ?, ?)'
        con.query(sql, [login, firstname, lastname, hash, email, language], function (err, res) { if (err) throw err }) })
        res.redirect('/login')
	}
}
