function updateuser(column, change) {
    if (req.session.profile.api !== 1)
    {
       if (column !== 'language')
        {
            error = ' You can only update your language preference whilst not using a local account'
            return ;
        }
    }
    var sql = 'UPDATE users SET ' + column + ' = ? WHERE id = ?'
    con.query(sql, [change, req.session.profile.id], function (err) { if (err) throw err })
    req.session.profile[column] = change;
    update = 1;
}

var error = '';
update = 0;
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
        {
            if (field.lang == req.session.profile.language)
                error = 'Your current language is already ' + eschtml(field.lang)
            else
                updateuser('language', eschtml(field.lang))
        }
        if (!empty(field.pass) && error === '') {
            var regLow = /[a-z]/; var regUp = /[A-Z]/;
            if (field.pass.length < 5 || field.pass.search(regLow) == -1 || field.pass.search(regUp) == -1) {
                error += ' Password must be minimum 6 characters long and must contain an uppercase and a lowercase'; }
            else if (field.pass != field.confirmpass) {
                error += ' Your new Password and Password Confirmation did not match'; }
            else {
                bcrypt.hash(eschtml(field.pass), 10, (err, hash) => { if (err) throw err
                updateuser('pass', hash) }) }  }
        if (files.pic.size !== 0 && error === '' && req.session.profile.api == 1)
        {
            if (files.pic.type !== 'image/png' && files.pic.type !== 'image/jpeg' && files.pic.type !== 'image/jpg') {
                error += ' File must be .png, .jpeg, or .jpg'; }
            else if (files.pic.size > 50000000) {
                error += ' File is too big'; }
            else {
                fs.readFile(files.pic.path, (err, data) => { if (err) throw err; 
                    fs.writeFile('img/users/' + req.session.profile.id, data, (err) => { if (err) throw err; }) });
                updateuser('img', 'img/users/' + req.session.profile.id) }
        }
        if (!empty(field.login) && error === '') {
            wait.for.promise(new Promise((resolve) => {
                con.query('SELECT id FROM users WHERE login = ?', [eschtml(field.login)], (err, result) => { if (err) throw err;
                    if (result.length == 0) 
                        updateuser('login', eschtml(field.login)) 
                    else { 
                        error += ' Login already exists in database'; } 
                    resolve(); })
            }) );
        }
        if (!empty(field.email) && error === '') {
            if (!validator.isEmail(field.email)) { 
                error += ' E-mail is not valid'; }
            else {
                wait.for.promise(new Promise((resolve) => {
                    con.query('SELECT id FROM users WHERE email = ?', [eschtml(field.email)], (err, result) => { if (err) throw err;
                        if (result.length == 0) 
                            updateuser('email', eschtml(field.email)) 
                        else { 
                            error += ' Email already exists in database'; } 
                        resolve(); })
                }) )
            }
        }
        if (req.session.profile.api !== 1 && error === '' && files.pic.size !== 0)
            res.render('my_profile.ejs', {error: 'You can only update your language preference whilst not using a local account', profile: req.session.profile})
        else if (update == 0 && error === '')
            res.render('my_profile.ejs', {error: 'You must input something to update', profile: req.session.profile})
        else if (error === '')
            res.render('my_profile.ejs', {success: 'Your profile was successfully updated', profile: req.session.profile})
        else
            res.render('my_profile.ejs', {error: error, profile: req.session.profile})
    }
    })
}