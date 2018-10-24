function getQuality(torrents, quality) {
	let a = 0;
	if (!empty(quality) && !empty(torrents))
	{
		torrents.forEach((el, i) => {
			if (el.quality === quality)
				a = i;
		})
	}
	if (a != 0)
		return a;
	return 0;
}
// console.log("body", req.body, req.headers);
if (empty(req.body.movie)) 
	res.redirect('/error/Cinema.js did not receive req.body.movie')
else
{
	var movies = JSON.parse(req.body.movie)
	id = eschtml(movies.id);
	title = eschtml(encodeURI(movies.title));
	api = eschtml(req.body.api);
	i = getQuality(movies.torrents, req.body.quality);
	if (!empty(movies.torrents))
	{
		var hash = movies.torrents[i].hash
		var torrentURI = movies.torrents[i].url
	}
	else if (!empty(movies.magnet))
	{
		var torrentURI = movies.magnet
		var hash = torrentURI;
		// var torrentURI = movies.link
	}
	else
	{
		var magnet = 'magnet:?xt=urn:btih:'+movies.btih;
		torrentURI = magnet;
		hash = magnet;
	}
	
	// magnetLink(torrentURI, (err, link) => { if (err) res.redirect('/error/MagnetLink error ' + err);
	// 	if (magnet === undefined)
	// 		var magnet = link;
	// 	const engine = torrentStream(magnet, {
	// 		tmp: __dirname + '/tmp/upload',
	// 		path: __dirname + '/tmp/films/'});
	// 	engine.on('ready', () => {
	// 		console.log("ready1");
	// 		engine.files.forEach(function(file) {
	// 			if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4' ||
	// 			file.name.substr(file.name.length - 3) == 'avi' || file.name.substr(file.name.length - 3) == 'MP4')
	// 			{

		
	con.query('SELECT * FROM movies WHERE hash = ?', [hash], (err, rows) => {
		if (err) throw(err);
		if (rows[0] == undefined)
		{
			console.log('lop');
			con.query('INSERT INTO movies(hash, title, api_id, api, state) VALUES (?, ?, ?, ?, ?)', [hash, movies.title, movies.id, api, 0], 
				(err, result) => { if (err) res.redirect('/error/SQL error ' + err); })
			con.query('SELECT id FROM movies ORDER BY id DESC LIMIT 1', (err, result) => {if (err) throw err;
				con.query('INSERT INTO vues (user_id, movie_id) VALUES (?, ?)', [req.session.profile.id, result[0].id], 
				(err) => { if (err) throw err;})
			})
		}
		else
		{
			con.query('INSERT INTO vues (user_id, movie_id) VALUES (?, ?)', [req.session.profile.id, rows[0].id], 
				(err) => { if (err) throw err;})
		}
	})
					// var stream = file.createReadStream();
		// 	})
		// })
	// 	engine.on('download', (chunck) => {
	// 		console.log(chunck);
	//    })
	//    engine.on('idle', function () {
	// 	   console.log('torrent end');
	// 	   con.query('UPDATE movies SET state = ?', [1], (err) => {
	// 		   if (err) console.log(err);
	// 	   })
	//    })
	// })
	setTimeout(function() {

	con.query('SELECT * FROM movies WHERE hash = ?', [hash], (err, rows) => {
		if (err) res.redirect('/error/SQL error ' + err);
		if (rows[0] == undefined)
		{
			console.log('ouais')
			if (api == 1) {
			fetch('https://yts.am/api/v2/movie_suggestions.json?movie_id='+id)
				.then(res => { return res.json(); })
				.then(json => { 
					res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: '/tmp', hash: hash, suggestions: json.data.movies, api})
				})
				.catch(err => { if (err) res.redirect('/error/YTS catch' + err); }) }
			else
			{
				res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: '/tmp', hash: hash, api})
			}

		}
		else
		{
				console.log('oulay');
				if (rows[0].state == 1) {
				console.log('non');
				var path1 = '/tmp/films/'+rows[0].path;
			}
			else {
				console.log('oui');
				var path1 = '/video/'+hash;
			}
				con.query('SELECT * FROM comments WHERE movie_id = ?', [rows[0].id], (err, coms) => {
					if (api == 1) {
						fetch('https://yts.am/api/v2/movie_suggestions.json?movie_id='+id)
						.then(res => { return res.json(); })
						.then(json => { 
							res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path1, hash: hash, suggestions: json.data.movies, api, id: rows[0].id, coms:coms})
						})
						.catch(err => { if (err) res.redirect('/error/YTS catch' + err); }) }
						else
						res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path1, hash: hash, api, id: rows[0].id, coms:coms}) });
		}
	})
}, 4000);

}