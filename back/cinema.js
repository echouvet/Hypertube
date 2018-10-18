if (empty(req.body.movie))
{
	res.redirect('/error/Cinema.js did not receive req.body.movie')
}
else
{
	console.log(req.body.movie);
	var movies = JSON.parse(req.body.movie)
	var id = eschtml(movies.id);
	var title = eschtml(encodeURI(movies.title));
		api = eschtml(req.body.api);
	var i = 0;
	function getQuality()
	{
		if (req.params.quality && movies.torrents)
		{
			params = req.params.quality;
			if (params) {
				while (movies.torrents[i] && movies.torrents[i].quality != params)
					i++;
				if (movies.torrents[i].quality == params)
					return (i);
				else
					i = 0;
			}
			return (i)
		}
		else
			i = 0;
		return (i);
	}
	var i = getQuality(req.body.quality);
	
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
	
	magnetLink(torrentURI, (err, link) => { if (err) res.redirect('/error/MagnetLink error ' + err);
		if (magnet === undefined)
			var magnet = link;
		const engine = torrentStream(magnet, {
			tmp: __dirname + '/tmp/upload',
			path: __dirname + '/tmp/films/'});
		engine.on('ready', () => {
			engine.files.forEach(function(file) {
				if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4' ||
				file.name.substr(file.name.length - 3) == 'avi' || file.name.substr(file.name.length - 3) == 'MP4')
				{
					con.query('SELECT * FROM movies WHERE hash = ?', [hash], (err, rows) => {
						if (err) res.redirect('/error/SQL error ' + err);
						if (rows[0] == undefined)
						{
							con.query('INSERT INTO movies(hash, path, api_id, api) VALUES (?, ?, ?, ?)', [hash, file.path, movies.id, api], 
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
					var stream = file.createReadStream();
				}
			})
		})
		engine.on('download', (chunck) => {
			 // console.log(chunck);
		})
	})
	con.query('SELECT * FROM movies WHERE hash = ?', [hash], (err, rows) => {
		if (err) res.redirect('/error/SQL error ' + err);
		if (rows[0] == undefined)
		{
			if (api == 1) {
			fetch('https://yts.am/api/v2/movie_suggestions.json?movie_id='+id)
				.then(res => { return res.json(); })
				.then(json => { 

					OpenSubtitles.search({
						hash: hash,
						path: path,
						filename: movies.title,
						extensions: ['srt'],
						query: movies.title
					}).then(subtitles => {
						console.log("pouletto")
						console.log(subtitles);
					})
					res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: '/tmp', hash: hash, suggestions: json.data.movies, api})
				})
				.catch(err => { if (err) res.redirect('/error/YTS catch' + err); }) }
			else
			{
				OpenSubtitles.search({
					hash: hash,
					path: path,
					filename: movies.title,
					extensions: ['srt'],
					query: movies.title
				}).then(subtitles => {
					console.log("pouletto")
					console.log(subtitles);
				})
				res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: '/tmp', hash: hash, api})
			}

		}
		else
		{
			path = '/tmp/films/'+rows[0].path
			OpenSubtitles.search({
				hash: hash,
				path: path,
				filename: movies.title,
				extensions: ['srt'],
				query: movies.title
			}).then(subtitles => {
				console.log("pouletto")
				console.log(subtitles);
			})
			fs.createReadStream('tmp/25.srt')
				.pipe(srtToVtt())
				.pipe(fs.createWriteStream('tmp/25.vtt'));
			con.query('SELECT * FROM comments WHERE movie_id = ?', [rows[0].id], (err, coms) => {
			if (api == 1) {
			fetch('https://yts.am/api/v2/movie_suggestions.json?movie_id='+id)
				.then(res => { return res.json(); })
				.then(json => { 
					
					res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path, hash: hash, suggestions: json.data.movies, api, id: rows[0].id, coms:coms})
				})
				.catch(err => { if (err) res.redirect('/error/YTS catch' + err); }) }
			else
				res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path, hash: hash, api, id: rows[0].id, coms:coms}) });
		}
	})
}