var id = req.params.id;


var query = eschtml(encodeURI(req.params.title));
async function searchpiratebay(query, callback) {
	let result = new Array;
	if (empty(query))
	{
		result = await PirateBay.topTorrents(200).catch(err => console.log('Piratebay Error: ' + err))
	}
	else
	{
		result = await PirateBay.search(query, {
	    	category: 'video',
			orderBy: 'name',
			sortBy: 'desc'
  		}).catch(err => console.log('Piratebay Error: ' + err))
	}
  	const piratemovies = result.map(elem => {
  		elem.name = elem.name.replace(/\./g, ' ');
  		return({
			id: elem.id,
			title: elem.name,
	        year: elem.uploadDate,
	        size: elem.size,
	        link: elem.link,
	        category: elem.subcategory.name,
	   		magnet: elem.magnetLink
		})});
	return callback(piratemovies)
}



if (!empty(query) && query !== "undefined")
{
	if (req.body.sort == "d1")
		var sorts = "downloads%20desc";
	else if (req.body.sort == "d2")
		var sorts = "downloads%20asc";
	else if (req.body.sort == "r1")
		var sorts = "avg_rating%20desc";
	else if (req.body.sort == "r2")
		var sorts = "avg_rating%20asc";
	else if (req.body.sort == "date1")
		var sorts = "date%20desc";
	else if (req.body.sort == "date2")
		var sorts = "date%20asc";
	else
		var sorts = "title%20desc";
	fetch('https://yts.am/api/v2/list_movies.json?query_term=' + query)
	.catch(error => console.log(error))
	.then(res => res.json())
	.then((json) => {
		var movies = new Array();
		var count = json.data.movie_count;
		var i = 0;
		if (json.data.movies !== undefined)
		{
			while (json.data.movies[i])
			{
				movies.push({
					id: json.data.movies[i].id, 
					title: json.data.movies[i].title, 
					year: json.data.movies[i].year, 
					rating: json.data.movies[i].rating,
					genres: json.data.movies[i].genres,
					synopsis: json.data.movies[i].synopsis,
					language: json.data.movies[i].language,
					cover: json.data.movies[i].large_cover_image,
					background: json.data.movies[i].background_image,
					runtime: json.data.movies[i].runtime,
					torrents: json.data.movies[i].torrents
				});
				if (movies[i].id == id)
				{
					break;
				}
				i++;
			}
			console.log(movies[i]);
			movies = movies[i];
		}
		var torrentURI = movies.torrents[0].url;
		console.log(JSON.stringify(movies))
		var i = 0;
		function getQuality()
		{
			if (req.params.quality)
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
		torrentURI = movies.torrents[i].url
		console.log(movies.torrents)
		magnetLink(torrentURI, (err, link) => {
			
			if (err) throw err;
			var magnet = link;
			console.log(movies.torrents[i]);
			console.log(magnet)
			const engine = torrentStream(magnet, {
				tmp: '/tmp/hypertube/tmp/upload',
				path: '/tmp/hypertube/tmp/films/'});
			engine.on('ready', () => {
				engine.files.forEach(function(file) {
					if ((file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4' ||
					file.name.substr(file.name.length - 3) == 'avi'))
					{
						con.query('SELECT path FROM movies WHERE hash = ?', [movies.torrents[i].hash], (err, rows) => {
							if (err) throw err;
							if (rows[0] == undefined)
							{
								var sql = 'INSERT INTO movies(hash, path) VALUES ?';
								var values = [  [movies.torrents[i].hash, file.path]  ];
								con.query(sql, [values], (err, result) => {
									if (err) throw err;
								})
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
				console.log("fdsfoisjfosij")
				res.render('cinema.ejs', {profile: req.session.profile, title:req.params.title, movie: movies, path: '/tmp'})
				
			}
			else
			{
				path = '/tmp/films/'+rows[0].path;
				console.log(path);
				res.render('cinema.ejs', {profile: req.session.profile, title:req.params.title, movie: movies, path: path})
			}
		})
	})
}
else
	res.render('cinema.ejs', {profile:req.session.profile, movie: movies, error: "Something went wrong"})