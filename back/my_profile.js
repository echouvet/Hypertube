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
}

var error = 0;
if (!req.session || !req.session.profile)
	res.redirect('/')
else
{
    var form = new formidable.IncomingForm();
    form.parse(req, function (err1, field, files) { if (err1) throw err1; 
    if (empty(field) && empty(files))
        res.render('my_profile.ejs', {profile: req.session.profile})
    else
    {
        if (!empty(field.firstname))
            updateuser('firstname', eschtml(field.firstname))
        if (!empty(field.lastname))
            updateuser('lastname', eschtml(field.lastname))
        if (!empty(field.lang))
            updateuser('language', eschtml(field.lang))
        if (!empty(field.pass) && error != 1) {
            var regLow = /[a-z]/; var regUp = /[A-Z]/;
            if (field.pass.length < 5 || field.pass.search(regLow) == -1 || field.pass.search(regUp) == -1) {
                render('error', 'Password must be minimum 6 characters long and must contain an uppercase and a lowercase')
                error = 1; }
            else if (field.pass != field.confirmpass) {
                render('error', 'Your new Password and Password Confirmation did not match'); error = 1; }
            else {
                bcrypt.hash(eschtml(field.pass), 10, function(err, hash) { if (err) throw err
                updateuser('pass', hash) }) }  }
        if (files.pic.size !== 0 && error != 1)
        {
            if (files.pic.type !== 'image/png' && files.pic.type !== 'image/jpeg' && files.pic.type !== 'image/jpg') {
                render('error', 'File must be .png, .jpeg, or .jpg'); error = 1; }
            else if (files.pic.size > 5000000) {
                render('error', 'File is too big'); error = 1; }
            else {
                fs.readFile(files.pic.path, function (err, data) { if (err) throw err; 
                    fs.writeFile('img/users/' + req.session.profile.id, data, function (err) { if (err) throw err; }) });
                updateuser('img', 'img/users/' + req.session.profile.id) }
        }
        if (!empty(field.login) && error != 1) {
            wait.for.promise(new Promise(function(resolve, reject) {
                con.query('SELECT id FROM users WHERE login = ?', [eschtml(field.login)], function (err, result) { if (err) throw err;
                    if (result.length == 0) 
                        updateuser('login', eschtml(field.login)) 
                    else { 
                        render('error', 'Login already exists in database'); error = 1; } 
                    resolve('test'); } )
            }) );
        }
        if (!empty(field.email) && error != 1) {
            if (!validator.isEmail(field.email)) {
                render('error', 'E-mail is not valid'); error = 1; }
            wait.for.promise(new Promise(function(resolve, reject) {
                con.query('SELECT id FROM users WHERE email = ?', [eschtml(field.email)], function (err, result) { if (err) throw err;
                    if (result.length == 0) 
                        updateuser('email', eschtml(field.email)) 
                    else { 
                        render('error', 'Email already exists in database'); error = 1; } 
                    resolve('test'); })
            }) )
        }
        if (error != 1)
            render('success', 'Your profile was successfully updated')
    }
    })
}