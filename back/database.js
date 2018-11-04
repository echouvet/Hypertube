con.query('CREATE DATABASE IF NOT EXISTS `hypertube`', (err) => { if (err) res.redirect('/error/SQL error ' + err); })
con.query('USE `hypertube`', (err) => { if (err) res.redirect('/error/SQL error ' + err); })
var users = `CREATE TABLE IF NOT EXISTS users ( \
id INT AUTO_INCREMENT PRIMARY KEY, \
login VARCHAR(255), firstname VARCHAR(255), \
lastname VARCHAR(255), pass VARCHAR(255), \
email VARCHAR(255), language VARCHAR(255), \
api INT, img VARCHAR(255) )`;
con.query(users, (err) => { if (err) res.redirect('/error/SQL error ' + err); }) 

var movies = 'CREATE TABLE IF NOT EXISTS movies ( \
id INT AUTO_INCREMENT PRIMARY KEY, \
hash TEXT, path VARCHAR(255), \
title TEXT, api_id VARCHAR(255), api INT, state INT)';
con.query(movies, (err) => {if (err) res.redirect('/error/SQL error ' + err);});

var vues = 'CREATE TABLE IF NOT EXISTS vues (\
id INT AUTO_INCREMENT PRIMARY KEY, \
user_id INT, \
movie_id INT)';
con.query(vues, (err) => {if (err) res.redirect('/error/SQL error ' + err);});

var comments = 'CREATE TABLE IF NOT EXISTS comments (\
id INT AUTO_INCREMENT PRIMARY KEY, \
user_id INT, \
user_login VARCHAR(255), \
movie_id INT, \
comment TEXT)';
con.query(comments, (err) => {if (err) res.redirect('/error/SQL error ' + err);});

var sub = 'CREATE TABLE IF NOT EXISTS subtitles ( \
    id INT AUTO_INCREMENT PRIMARY KEY, \
    hash TEXT, path VARCHAR(255), \
    en INT, fr INT)';
con.query(sub, (err) => {if (err) res.redirect('/error/SQL error ' + err);});