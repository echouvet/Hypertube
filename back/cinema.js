if (empty(req.body.movie))
	res.render('cinema.ejs', {profile:req.session.profile, movie: movies, error: "Something went wrong"})
else
{
	var movies = req.body.movie
	var id = eschtml(movies.id);
	var title = eschtml(encodeURI(movies.title));
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
	var i = getQuality(req.params.quality);
	
	if (!empty(movies.torrents))
	{
		console.log('Vous etes vrmt des mrdes')
		var hash = movies.torrents[i].hash
		var torrentURI = movies.torrents[i].url
	}
	else
	{
		console.log("PUTAIN")
		//les 2 lignes ci-dessous sont mauvaise (LUCIEN HELP PLS xD) ps: console.log(movies) pour plus d'infos
		var hash = movies.magnet
		var torrentURI = movies.link
	}
	magnetLink(torrentURI, (err, link) => { if (err) throw err;
		var magnet = link;
		const engine = torrentStream(magnet, {
			tmp: __dirname + '/tmp/upload',
			path: __dirname + '/tmp/films/'});
		engine.on('ready', () => {
			engine.files.forEach(function(file) {
				if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4' ||
				file.name.substr(file.name.length - 3) == 'avi')
				{
					con.query('SELECT path FROM movies WHERE hash = ?', [hash], (err, rows) => {
						if (err) throw err;
						if (rows[0] == undefined)
						{
							con.query('INSERT INTO movies(hash, path) VALUES (?, ?)', [hash, file.path], 
								(err) => { if (err) throw err; })
						}
						
					})
					var stream = file.createReadStream();
				}
			})
		})
		engine.on('download', (chunck) => {
			 console.log(chunck);
		})
	})
	con.query('SELECT * FROM movies WHERE hash = ?', [movies.torrents[i].hash], (err, rows) => {
		if (err) throw err;
		if (rows[0] == undefined)
		{
			// res.redirect('/')
			res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: '/tmp'})
			
		}
		else
		{
			path = '/tmp/films/'+rows[0].path;
			// res.redirect('/')
			res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path})
		}
	})	
}