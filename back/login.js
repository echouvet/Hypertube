if (req.session.profile != undefined)
   res.render('index.ejs')
else if (!req.body || (!req.body.login && !req.body.pass))
   res.render('login.ejs')
else if (!req.body.login || !req.body.pass)
	res.render('login.ejs', {req: req, error: 'Empty Field'})
else
{
var login = eschtml(req.body.login)
	pass = eschtml(req.body.pass)
	con.query('SELECT * FROM `users` WHERE login = ?', [login], function (err, result) { if (err) throw err; 
	if (result.length == 0)
			res.render('login.ejs', {req: req, error: 'Unknown Username'})
		else
		{
			bcrypt.compare(pass, result[0].pass, function(err, respass) 
			{
				if(!respass)
					res.render('login.ejs', {req: req, error: 'Wrong Password'})
				else
				{
					req.session.profile = result[0].firstname + ' ' + result[0].lastname
					req.session.lang = result[0].language
               req.session.img = result[0].img
					res.render('index.ejs', {success: 'Welcome ' + req.session.profile})
				}
			})
		}
	})
}