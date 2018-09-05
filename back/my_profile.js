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
function check_existing(culumn, change, callback) {
    con.query('SELECT id FROM users WHERE ' + column ' = ?', [change],
    function (err, result) { if (error) throw error;
        if (result.length == 0) { return callback(1); }
        else { return callback(0); } })
}

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
        var error = 0;
        if (!empty(field.firstname))
            updateuser('firstname', eschtml(field.firstname))
        if (!empty(field.lastname))
            updateuser('lastname', eschtml(field.lastname))
        if (!empty(field.lang))
            updateuser('language', eschtml(field.lang))
        if (!empty(field.login)){
            check_existing('login', eschtml(field.login), function(data){ 
            if (data == 1){
               render('error', 'Login already exists in database'); var error = 1; }
            else { updateuser('login', eschtml(field.login)) }})
        }
        if (!empty(field.email)) {
            check_existing('email', eschtml(field.email), function(data){ 
            if (!validator.isEmail(email)) {
                render('error', 'E-mail is not valid'); var error = 1; }
            else if (data == 1){
               render('error', 'E-mail already exists in database'); var error = 1; }
            else { updateuser('email', eschtml(field.email)) }})
        }
        if (!empty(field.pass)) {
            var regLow = /[a-z]/; var regUp = /[A-Z]/;
            if (field.pass.length < 5 || field.pass.search(regLow) == -1 || field.pass.search(regUp) == -1) {
                render('error', 'Password must be minimum 6 characters long and must contain an uppercase and a lowercase')
                var error = 1; }
            else if (field.pass != field.confirmpass) {
                render('error', 'Your new Password and Password Confirmation did not match') var error = 1; }
            else {
                bcrypt.hash(eschtml(field.pass), 10, function(err, hash) { if (err) throw err
                updateuser('pass', hash) }) }  }
        if (!empty(files))
        {
            if (files.pic.type !== 'image/png' && files.pic.type !== 'image/jpeg' && files.pic.type !== 'image/jpg') {
                render('error', 'File must be .png, .jpeg, or .jpg') var error = 1; }
            else if (files.pic.size > 5000000) {
                render('error', 'File is too big') var error = 1; }
            else {
                fs.readFile(files.pic.path, function (err, data) { if (err) throw err; 
                fs.writeFile('img/users/' + req.session.profile.id, data, function (err) { if (err) throw err; }) });
                updateuser('img', 'img/users/' + req.session.profile.id) }
        }
        if (error == 0)
            render('success', 'Your profile was successfully updated')
    }
    })
}