function    render(type, msg) {
    if (type == 'error')
        res.render('my_profile.ejs', {error: msg, profile: req.session.profile})
    else if (type == 'success')
        res.render('my_profile.ejs', {success: msg, profile: req.session.profile})
    else
        res.render('my_profile.ejs', {profile: req.session.profile})
}
function updateuser(column, change) {
    var sql = 'UPDATE users SET ' + column + ' = ? WHERE id = ?'
    con.query(sql, [change, req.session.profile.id], function (err) { if (err) throw err })
    req.session.profile[column] = change;
    render('success', 'Your ' + column + ' was successfully changed')
}

if (!req.session || !req.session.profile)
	res.redirect('/')
else if (!req.body)
	render('', '');
//il me faut du front pour continuer...
