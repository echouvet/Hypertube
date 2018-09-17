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
    WebTorrent = require('webtorrent')
    request = require('request');

    Promise = require('promise');
    sessionMiddleware = ssn({ secret: "Eloi has a beautiful secret",
        store: new MemoryStore(),
        key: 'sid',
        resave: true, 
        saveUninitialized: true
    });
    app.use(sessionMiddleware);
    app.use(express.static(__dirname)); 
    app.use(bodyParser.urlencoded({ extended: true }))


var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root42"
})
con.connect(function(err) { if (err) throw err
    eval(fs.readFileSync(__dirname + "/back/database.js")+'')
})

server.listen(8080)

function OauthLogin(code) {
  var XHR = new XMLHttpRequest();
  var urlEncodedData = "";
  var urlEncodedDataPairs = [];
  var client_secret = "fd8d61c5967a2fc42f734e4d408cab58521d72b9";
  var client_id = "64b33bf122900dfa0966";
  var redirectURI = "http://localhost:8080/oauthtoken";

    urlEncodedDataPairs.push(encodeURIComponent("code") + '=' + encodeURIComponent(code));
    urlEncodedDataPairs.push(encodeURIComponent("client_id") + '=' + encodeURIComponent(client_id));
    urlEncodedDataPairs.push(encodeURIComponent("client_secret") + '=' + encodeURIComponent(client_secret));
    urlEncodedDataPairs.push(encodeURIComponent("redirect_uri") + '=' + encodeURIComponent(redirectURI));
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');


  XHR.open('POST', 'https://github.com/login/oauth/access_token');

  XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  XHR.send(urlEncodedData);
}


app.get('/', function(req,res){
    if (req.session.profile == undefined)
        res.redirect('/login')
    else
        res.redirect('/index')
})
.all('/login', function(req,res){
    eval(fs.readFileSync(__dirname + "/back/login.js")+'')
})
.all('/register', function(req,res){
    eval(fs.readFileSync(__dirname + "/back/register.js")+'')
})
.post('/forgotpass', function(req, res) {
    eval(fs.readFileSync(__dirname + "/back/forgotpass.js")+'')
})
// login with github
.get('/oauth', function(req, res) {
    var headers = {
        'Accept' : 'application/json',
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/x-www-form-urlencoded'
    }
    var options = {
        url: 'https://github.com/login/oauth/access_token',
        method: 'POST',
        headers: headers,
        form: {'code': req.query.code, 'client_id': '64b33bf122900dfa0966', 'client_secret' : 'fd8d61c5967a2fc42f734e4d408cab58521d72b9'}
    }
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var resp = JSON.parse(body)
            var options = {
                url: 'https://api.github.com/user',
                method: 'GET',
                headers: headers,
                qs: {'access_token': resp.access_token}
            }
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var resp = JSON.parse(body)
                    req.session.profile = resp;
                    req.session.profile.img = resp.avatar_url;
                    res.render('index.ejs', {profile:req.session.profile})
                }
            })
    } })
})
//toutes pages ou pas besoin d'etre log, en haut
app.use(function(req, res, next) {
    if (req.session.profile == undefined)
        res.render('login.ejs', {error0: "You must be logged in to use Hypertube."})
    else
        next();
})
//toutes pages ou faut etre log faut mettre dessous ceci
.get('/logout', function(req, res) {
    req.session.destroy(); req.session = 0; res.redirect('/');
})
.all('/search', function(req, res) {
    eval(fs.readFileSync(__dirname + "/back/search.js")+'')
})
.get('/search/:id/:title', function(req, res) {
    var id = req.params.id; var client = new WebTorrent();
    var torrentURI = 'https://archive.org/download/' + id + '/' + id + '_archive.torrent'
        client.add(torrentURI, { path: 'torrents' }, function (torrent) {
            console.log('Client is downloading ...')
            var file = torrent.files.find(function (file) {
                return (file.path.endsWith('.mp4'))
            })
            res.render('cinema.ejs', {profile: req.session.profile, path: file.path, title:req.params.title})
        })
})
.all('/my_profile', function(req, res) {
    eval(fs.readFileSync(__dirname + "/back/my_profile.js")+'')
})
.get('/other_profiles', function(req, res) {
    con.query('SELECT * FROM USERS WHERE id <> ? ORDER BY id DESC', [req.session.profile.id], 
    function(err, result) {
        res.render('other_profiles.ejs', {profile: req.session.profile, users: result})
    })
})
.get('/index', function(req, res) {
    res.render('index.ejs', {profile: req.session.profile})
})
.get('*', function(req,res){
    res.redirect('/')
})