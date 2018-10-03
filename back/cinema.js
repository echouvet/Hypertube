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
				i++;
			}
			searchpiratebay(req.body.query, (piratemovies) => { 
				
				movies = movies.concat(piratemovies)
				count += piratemovies.length;
				
			});
		}
		var torrentURI = movies[0].torrents[0].url;

		magnetLink(torrentURI, (err, link) => {
			if (err) throw err;
			var magnet = link;
			console.log(link);
			magnet = link+movies[0].torrents[0].hash
			const engine = torrentStream(magnet, {
				tmp: '/tmp/hypertube/tmp/upload',
				path: '/tmp/hypertube/tmp/films/'+movies[0].title});
			engine.on('ready', () => {
				console.log(engine.files)
				engine.files.forEach(function(file) {
					var stream = file.createReadStream();
				})
			})
			engine.on('download', (chunck) => {
				console.log(chunck);
			})
		})
		console.log(JSON.stringify(movies));
		res.render('cinema.ejs', {profile: req.session.profile, title:req.params.title, movie: movies, path: '/tmp/films/Avengers: Infinity War/Avengers Infinity War (2018) [BluRay] [3D] [HSBS] [YTS.AM]/Avengers.Infinity.War.2018.3D.HSBS.BluRay.x264-[YTS.AM].mp4'})
		
		
	})
}
else
	res.render('cinema.ejs', {profile:req.session.profile, movie: movies, error: "Something went wrong"})