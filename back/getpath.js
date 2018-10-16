
console.log('foewjfiowejofjwoefjweifjwoiejfoweifjwiejfoji' +req.body);
if (req.body.movie !== undefined && req.body.hash !== undefined)
{
	console.log('okok')
	con.query('SELECT path FROM movies WHERE hash = ?', [req.body.hash], (err, rows) => {
		if (err) res.redirect('/error/SQL error ' + err);
		if (rows[0] !== undefined)
		{
			var response = {
				status  : 200,
				success : 'Updated Successfully',
				path	: rows[0].path
			}
			res.end(JSON.stringify(response));
		}
		else
		{
			var response = {
				status  : 200,
				success : 'Updated Successfully',
				path	: '/tmpo'
			}
			res.end(JSON.stringify(response));
		}
	})
}