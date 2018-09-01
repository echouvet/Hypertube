con.query('CREATE DATABASE IF NOT EXISTS `hypertube`', function (err) { if (err) throw err })
con.query('USE `hypertube`', function (err) { if (err) throw err })
var users = `CREATE TABLE IF NOT EXISTS users ( \
    id INT AUTO_INCREMENT PRIMARY KEY, \
    login VARCHAR(255), \
    firstname VARCHAR(255), \
    lastname VARCHAR(255), \
    pass VARCHAR(255), \
    email VARCHAR(255), \
    language VARCHAR(255), \
    img VARCHAR(255) DEFAULT 'empty.png')`
con.query(users, function (err) { if (err) throw err })