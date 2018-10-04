con.query('CREATE DATABASE IF NOT EXISTS `hypertube`', (err) => { if (err) throw err })
con.query('USE `hypertube`', (err) => { if (err) throw err })
var users = `CREATE TABLE IF NOT EXISTS users ( \
	    id INT AUTO_INCREMENT PRIMARY KEY, \
	    login VARCHAR(255), firstname VARCHAR(255), \
	    lastname VARCHAR(255), pass VARCHAR(255), \
	    email VARCHAR(255), language VARCHAR(255), \
	    api INT, img VARCHAR(255) )`
con.query(users, (err) => { if (err) throw (err) }) 

var movies =	'CREATE TABLE IF NOT EXISTS movies ( \
				id INT AUTO_INCREMENT PRIMARY KEY, \
				hash VARCHAR(255), path VARCHAR(255))'
con.query(movies, (err) => {if (err) throw err});
