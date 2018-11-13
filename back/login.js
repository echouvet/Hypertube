if (req.session.profile != undefined)
   res.redirect('/')
else if (!req.body || (!req.body.login && !req.body.pass))
   res.render('login.ejs')
else if (!req.body.login || !req.body.pass)
	res.render('login.ejs', {error: 'Empty Field'})
else
{
var login = eschtml(req.body.login)
	pass = eschtml(req.body.pass)
	con.query('SELECT * FROM `users` WHERE login = ?', [login], function (err, result) { if (err) res.redirect('/error/SQL error ' + err);
	if (result.length == 0)
			res.render('login.ejs', {error: 'Unknown Username'})
		else
		{
			bcrypt.compare(pass, result[0].pass, function(err, respass) 
			{
				if(!respass)
					res.render('login.ejs', {error: 'Wrong Password'})
				else
				{
					req.session.profile = result[0];
					req.session.first = '1';
					req.i18n.setLocale(result[0].language);
					res.redirect('/index');
				}
			})
		}
	})
}