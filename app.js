var express = require('express')
	app = express()
    http = require("http")
    server = http.createServer(app);
    mysql = require('mysql')
    mailer = require("nodemailer")
    rand = require("random-key")
    formidable = require('formidable')
    bcrypt = require('bcrypt')
    validator = require('validator')
    fs = require('fs')
    eschtml = require('htmlspecialchars')
    ssn = require('express-session')
    MemoryStore = require('session-memory-store')(ssn)
    bodyParser = require('body-parser')
    empty = require('is-empty');
    wait = require('wait-for-stuff');
    fetch = require('node-fetch');
    request = require('request');
    Promise = require('promise');
    i18n = require('i18n-2');

    sessionMiddleware = ssn({ secret: "Eloi has a beautiful secret",
        store: new MemoryStore(),
        key: 'sid',
        resave: true, 
        saveUninitialized: true
    });
    app.use(sessionMiddleware);
    app.use(express.static(__dirname)); 
    app.use(bodyParser.urlencoded({ extended: true }))
    app.set('view engine', 'ejs');
    
    i18n.expressBind(app, {
        locales: ['en', 'fr', 'de'],
        defaultLocale: 'en'
    });

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root42"
})
con.connect((err) => { if (err) throw err
    eval(fs.readFileSync(__dirname + "/back/database.js")+'')
})

server.listen(8080)


app.use((req, res, next) => {
    if (req.session && req.session.profile && req.session.profile.language !== '' && req.session.profile.language !== undefined)
        req.i18n.setLocale(req.session.profile.language);
    next();
})
.get('/', (req,res) => {
    if (req.session.profile == undefined)
        res.redirect('/login')
    else
        res.redirect('/index')
})
.all('/login', (req,res) => {
    eval(fs.readFileSync(__dirname + "/back/login.js")+'')
})
.all('/register', (req,res) => {
    eval(fs.readFileSync(__dirname + "/back/register.js")+'')
})
.post('/forgotpass', (req, res) =>  {
    eval(fs.readFileSync(__dirname + "/back/forgotpass.js")+'')
})
// login with github
.get('/oauth', (req, res) =>  {
    eval(fs.readFileSync(__dirname + "/back/oauth.js")+'')
})
.get('/oauth42', (req, res) =>  {
    eval(fs.readFileSync(__dirname + "/back/oauth42.js")+'')
})
//toutes pages ou pas besoin d'etre log, en haut
.use((req, res, next) => {
    if (req.session.profile == undefined)
        res.render('login.ejs', {error0: "You must be logged in to use Hypertube."})
    else
        next();
})
//toutes pages ou faut etre log faut mettre dessous ceci
.get('/logout', (req, res) =>  {
    req.session.destroy(); req.session = 0; res.redirect('/');
})
.all('/search', (req, res) =>  {
    eval(fs.readFileSync(__dirname + "/back/search.js")+'')
})
.get('/search/:id/:title', (req, res) =>  {
    var id = req.params.id;
    var torrentURI = 'https://archive.org/download/' + id + '/' + id + '_archive.torrent'
    res.render('cinema.ejs', {profile: req.session.profile, path: file.path, title:req.params.title})
})
.all('/my_profile', (req, res) =>  {
    eval(fs.readFileSync(__dirname + "/back/my_profile.js")+'')
})
.get('/other_profiles', (req, res) => {
    con.query('SELECT * FROM USERS WHERE (id <> ? AND api <> ?) ORDER BY id DESC', [req.session.profile.id, req.session.profile.api],
    (err, result) => {
        res.render('other_profiles.ejs', {profile: req.session.profile, users: result})
    })
})
.get('/index', (req, res) =>  {
    res.render('index.ejs', {profile: req.session.profile})
})
.get('*', (req,res) => {
    res.redirect('/')
})