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
		var hash1 = torrentURI.split('btih:');
		var hash2 = hash1[1].split('&');
		var hash = hash2[0];

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
			console.log(movies);
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
	function dl_sub(subtitles, hash) {
		const path = __dirname + '/tmp/subtitles/'+hash+subtitles.langcode+'.vtt';
		axios({
			method: 'get',
			url: subtitles.url
		}).then(data => {
			fs.access(path, fs.constants.F_OK, (err) => {
				if (err) {
					const s = new Readable();
					console.log('la');

					s.push(data.data);
					s.push(null);
					s
					.pipe(srtToVtt())
					.pipe(fs.createWriteStream(path));
				
					con.query('SELECT * FROM subtitles WHERE hash = ?', [hash], (err, rows) => {
						if (err) throw err;
						if (rows[0] === undefined)
						{
							con.query('INSERT INTO subtitles(hash, path, en, fr) VALUES(?, ?, ?, ?)', [hash, path, 0, 0], (err) => {
								if (err) throw err;
							})
						}
					})

				}
			})
		}).catch(err => {
			;
		})
	}
	function adding_sub_bdd(hash)
	{
		
		con.query('SELECT title FROM movies WHERE hash = ?' , [hash], (err, rows) => {
			if (err) throw err;
			if (rows[0] !== undefined)
			{
				console.log(rows[0].title)
				OpenSubtitles.search({
					query: rows[0].title,
				})
				.then(subtitles => {
					console.log(subtitles);
					if (subtitles.en)
					{

						dl_sub(subtitles.en, hash);
						console.log('si');

						con.query('UPDATE subtitles SET en = ? WHERE hash = ?', [1, hash], (err) => {
							if (err) throw err;
						})
						setTimeout(function() {}, 5000);
					}
					if (subtitles.fr)
					{
						dl_sub(subtitles.fr, hash);
						con.query('UPDATE subtitles SET fr = ? WHERE hash = ?', [1, hash], (err) => {
							if (err) throw err;
						})
						setTimeout(function() {}, 5000);
					}
				})
			}
		})
	}
	adding_sub_bdd(hash);
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
			var pathSub = new Array();
			con.query('SELECT * FROM subtitles WHERE hash = ?', [hash], (err, rows1) => {
				if (err) throw err;
				if (rows1[0] !== undefined) {
					if (rows1[0].en == 1)
					{
						pathSub[0] = '/tmp/subtitles/'+hash+'en.vtt'
					}
					if (rows1[0].fr == 1)
					{
						pathSub[1] = '/tmp/subtitles/'+hash+'fr.vtt'
					}
				}
				console.log(pathSub)
				con.query('SELECT * FROM comments WHERE movie_id = ?', [rows[0].id], (err, coms) => {
					if (api == 1) {
						fetch('https://yts.am/api/v2/movie_suggestions.json?movie_id='+id)
						.then(res => { return res.json(); })
						.then(json => { 
							res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path1, hash: hash, suggestions: json.data.movies, api, id: rows[0].id, coms:coms, pathSub: pathSub})
						})
						.catch(err => { if (err) res.redirect('/error/YTS catch' + err); }) }
						else
						res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path1, hash: hash, api, id: rows[0].id, coms:coms, pathSub: pathSub}) });
					
				})
			}
		})
	}, 10000);
}
