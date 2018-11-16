var en = 0;
var fr = 0;
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
if (empty(req.session.movies))
	res.redirect('/error/Cinema.js did not receive the movie')
else
{
	a = eschtml(req.body.i)
	req.session.movies.forEach(elem => {
		if (elem.id == eschtml(req.body.i))
			movies = elem;
	})
	if (empty(movies))
		res.redirect('/error/Could not find the movie')
	else
	{
		id = eschtml(movies.id);
		title = eschtml(encodeURI(movies.title));
		api = req.session.api;
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
			if (hash1[1] !== undefined)
			{
				var hash2 = hash1[1].split('&');
				var hash = hash2[0];
			}
			else
			{
				hash = movies.magnet;
			}
		}
		else
		{
			var magnet = 'magnet:?xt=urn:btih:'+movies.btih;
			torrentURI = magnet;
			hash = magnet;
		}
		function insertMovieBdd(hash, movies, api)
		{
			con.query('SELECT * FROM movies WHERE hash = ?', [hash], (err, rows) => {
				if (err) throw(err);
				if (rows[0] == undefined)
				{
					con.query('INSERT INTO movies(hash, title, api_id, api, state, last) VALUES (?, ?, ?, ?, ?, NOW())', [hash, movies.title, movies.id, api, 0],
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
		}
		function dl_sub(subtitles, hash) {
			const path = __dirname + '/tmp/subtitles/'+hash+subtitles.langcode+'.vtt';
			return axios({
				method: 'get',
				url: subtitles.url
			}).then(data => {
				return new Promise((resolve) => {
					fs.access(path, fs.constants.F_OK, (err) => {
						if (err) {
							const s = new Readable();
							const file = fs.createWriteStream(path)
	
							s.push(data.data);
							s.push(null);
							s
							.pipe(srtToVtt())
							.pipe(file)

							file.on('open', resolve)
						} else
							resolve();
					})
				})
			}).catch(err => {
				;
			})
		}
		function adding_sub_bdd(hash, title)
		{
			return OpenSubtitles.search({
				query: title,
			})
			.then(subtitles => {
				const promises = []
				if (subtitles.en)
				{
					en = 1;
					promises.push(dl_sub(subtitles.en, hash));
				}
				if (subtitles.fr)
				{
					fr = 1;
					promises.push(dl_sub(subtitles.fr, hash));
				}
				return Promise.all(promises);
			})
		}
		insertMovieBdd(hash, movies, api)
		setTimeout(function (){
			pathSub = [];
			adding_sub_bdd(hash, movies.title)
			.then(function(){
				if (req.session.profile.language == 'en')
				{
					if (en == 1)
					{
						pathSub[0] = '/tmp/subtitles/'+hash+'en.vtt'
						pathSub[2] = 'en'
					}
					if (fr == 1)
					{
						pathSub[1] = '/tmp/subtitles/'+hash+'fr.vtt'
						pathSub[3] = 'fr'
					}
				}
				else if (req.session.profile.language == 'fr')
				{
					if (en == 1)
					{
						pathSub[1] = '/tmp/subtitles/'+hash+'en.vtt'
						pathSub[3] = 'en'
					}
					if (fr == 1)
					{
						pathSub[0] = '/tmp/subtitles/'+hash+'fr.vtt'
						pathSub[2] = 'fr'
					}
				}
				else
				{
					if (en == 1)
					{
						pathSub[0] = '/tmp/subtitles/'+hash+'en.vtt'
						pathSub[2] = 'en'
					}
					if (fr == 1)
					{
						pathSub[1] = '/tmp/subtitles/'+hash+'fr.vtt'
						pathSub[3] = 'fr'
					}
				}
				con.query('SELECT * FROM movies WHERE hash = ?', [hash], (err, rows) => {
					if (err) res.redirect('/error/SQL error ' + err);
					var path1 = '/video/'+hash;
					if (rows[0] == undefined)
					{
						if (api == 1) {
						fetch('https://yts.am/api/v2/movie_suggestions.json?movie_id='+id)
							.then(res => { return res.json(); })
							.then(json => { 
							res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path1, hash: hash, suggestions: json.data.movies, api, pathSub: pathSub, a: a})
							movies = [];
							})
							.catch(err => { if (err) res.redirect('/error/YTS catch' + err); }) }
						else
						{
							res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path1, hash: hash, api, pathSub: pathSub, a: a})
							movies = [];
						}
					}
					else
					{
						if (rows[0].state == 1) {
						var path1 = '/tmp/films/'+rows[0].path;
						}
						else {
							var path1 = '/video/'+hash;
						}
						con.query('SELECT * FROM comments WHERE movie_id = ?', [rows[0].id], (err, coms) => {
							if (api == 1) {
								fetch('https://yts.am/api/v2/movie_suggestions.json?movie_id='+id)
								.then(res => { return res.json(); })
								.then(json => { 
									res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path1, hash: hash, suggestions: json.data.movies, api, id: rows[0].id, coms:coms, pathSub: pathSub, a: a})
									movies = [];
								})
								.catch(err => { if (err) res.redirect('/error/YTS catch' + err); }) }
							else
							{
								res.render('cinema.ejs', {profile: req.session.profile, title: title, movie: movies, path: path1, hash: hash, api, id: rows[0].id, coms:coms, pathSub: pathSub, a: a})
								movies = [];
							}
						});
					}
				})
			});
		}, 1500);
	}
}
