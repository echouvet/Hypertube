if(!req.body || !req.body.email)
    res.redirect('/')
else
{
    email = eschtml(req.body.email)
    con.query('SELECT * FROM users WHERE email = ?', [email],
    function (error, result) { if (error) throw error;
    if (result.length == 0)
        res.render('login.ejs', {error2: "Email not found in database"})
    else
    {
        var smtpTransport = mailer.createTransport({
        service: "Gmail", auth: { user: "42hypertube.42@gmail.com", pass: "root4242" } 
            })
            newpass = rand.generate(10)
            mail = { from: "42hypertube.42@gmail.com", to: email, subject: "Reinitialisation de votre mot de passe",
            html: '<html><body><div align=center> \
            it seems that you have forgotten your hypertube password :(<BR />\
            YOUR LOGIN IS : '+result[0].login+'<BR /><BR />\
            YOUR NEW PASSWORD IS : '+newpass+'<BR />\
            </div></body></html>' } 
        smtpTransport.sendMail(mail, function(error, response){
        if (error) { res.render('login.ejs', {error2: 'Error whilst sending e-mail : ' + error}); }
        else {
            bcrypt.hash(newpass, 10, function(err, hash) { if (err) throw err
            sql = 'UPDATE users SET pass = ? WHERE email = ?'
            con.query(sql, [hash, email], function (error) { if (error) throw error; }) })
            res.render('login.ejs', {success: "Email successfully sent"})
        }
        smtpTransport.close() })
    } })
}
