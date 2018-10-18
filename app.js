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
    PirateBay = require('thepiratebay');
    parseTorrent = require('parse-torrent');
    torrentStream = require('torrent-stream');
    magnetLink = require('magnet-link');
    reqAjax = require('ajax-request');
    archive = require('archive.org');
    isReachable = require('is-reachable');
    srtToVtt = require('srt-to-vtt');
    OS = require('opensubtitles-api');
    OpenSubtitles = new OS({useragent:'TemporaryUserAgent'});
    xtorrent = require('xtorrent');
    const { zooqle } = require('zooqle')

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
    // oui ceci est moche, mais necessaire. Demandez a Eloi si y'a un doubt
    if (req.session && req.session.profile)
    {
        if (empty(req.session.profile.id)) {
            con.query('SELECT * FROM users WHERE login = ? AND api = ?', [req.session.profile.login, req.session.profile.api], 
                (err, result) => {  if (err) throw err;
                req.session.profile.id = result[0].id; 
                if (result[0].language !== 0)
                {
                    req.session.profile.language = result[0].language
                    req.i18n.setLocale(req.session.profile.language);
                }
                next();
            })
        }
        else if (!empty(req.session.profile.language))
        {
            req.i18n.setLocale(req.session.profile.language);
            next();
        }
        else
            next();
    }
    else
        next();
})
.get('/', (req,res) => {
    if (req.session.profile == undefined)
        res.redirect('/login')
    else
        res.redirect('/index')
})
.get('/error/:msg', (req,res) => {
   var msg = eschtml(req.params.msg)
    if (req.session.profile == undefined)
        res.render('error.ejs', {msg: msg})
    else
        res.render('error.ejs', {profile: req.session.profile, msg: msg})
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
.post('/comment', (req, res) => {
   eval(fs.readFileSync(__dirname + "/back/comment.js")+'')
})
.post('/cinema', (req, res) =>  {
    eval(fs.readFileSync(__dirname+"/back/cinema.js")+'')
})
.post('/getPath', (req, res) =>  {
    eval(fs.readFileSync(__dirname+"/back/getpath.js")+'')
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
.all('/index', (req, res) =>  {
    eval(fs.readFileSync(__dirname + "/back/search.js")+'')
})
.get('*', (req,res) => {
    res.redirect('/')    
})
