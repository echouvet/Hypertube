if (req.body.movie !== undefined && req.body.hash !== undefined)
{
	con.query('SELECT path FROM movies WHERE hash = ?', [req.body.hash], (err, rows) => {
		if (err) res.redirect('/error/SQL error ' + err);
		if (rows[0] !== undefined)
		{
			res.setHeader('Content-Type', 'text/plain');
			return res.end(JSON.stringify(rows[0].path))
		}
		else
		{
			res.setHeader('Content-Type', 'text/plain');
			return res.end(JSON.stringify('tmpo'))
		}
	})
}