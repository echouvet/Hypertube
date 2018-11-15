if (!req.session.profile)
	res.redirect('/')
if (!empty(req.body.comment))
{
	var comment = eschtml(req.body.comment);
	var movie_id = eschtml(req.body.movie_id);
	con.query('INSERT INTO comments (`user_id`, `user_login`, `movie_id`, `comment`) VALUES (?, ?, ?, ?)',
	 [req.session.profile.id, req.session.profile.login, movie_id, comment],
	 (err) => { if (err) {throw err; res.redirect('/error/SQL error ' + err);} })
}
else
	res.redirect('/');