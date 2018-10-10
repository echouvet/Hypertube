function render(movies, query)
{
	res.render('search.ejs', {profile:req.session.profile, movies:movies, count:movies.length, q:query})
}

function	mapyts(data){
	var movies = new Array();
	if (data.movie_count != 0)
	{
		var i = 0;
		while (data.movies[i])
		{
			movies.push({
				id: data.movies[i].id, 
				title: data.movies[i].title, 
				year: data.movies[i].year, 
				rating: data.movies[i].rating,
				genres: data.movies[i].genres,
				synopsis: data.movies[i].synopsis,
				language: data.movies[i].language,
				cover: data.movies[i].large_cover_image,
				background: data.movies[i].background_image,
				runtime: data.movies[i].runtime,
				torrents: data.movies[i].torrents
			});
			i++;
		}
	}
	return (movies)
}

function yts(query){
	var ytsquery = encodeURI(query)
	if (empty(query) || query === "undefined") {
		fetch('https://yts.am/api/v2/list_movies.json?sort_by=rating&limit=20')
		.catch(error => res.redirect('/error/' + error))
		.then(res => res.json())
		.then((json) => {
			var movies = mapyts(json.data)
	    	res.render('index.ejs', {profile:req.session.profile, movies:movies})
		})
	}
	else
	{
		switch (req.body.sort) {
	    case '0':
	        var sort = "download_count";
	        break;
	    case '1':
	        var sort = "like_count";
	        break;
	    case '2':
	        var sort = "year";
	        break;
	    case '3':
	        var sort = "date_added";
	        break;
	    case '4':
	        var sort = "rating";
	        break;
	    case '5':
	        var sort = "peers";
	        break;
	    case '6':
	  		var sort = "seeds";
	    default:
	    	var sort = "title";
		}
		fetch('https://yts.am/api/v2/list_movies.json?query_term=' + ytsquery + '&sort_by=' + sort)
		.catch(error => res.redirect('/error/' + error))
		.then(res => res.json())
		.then((json) => {
			var movies = mapyts(json.data)
			render(movies, query)
		})
	}
}

async function thepiratebay(query, callback) {
	let result = new Array;
	if (empty(query) || query === "undefined")
		result = await PirateBay.topTorrents(200).catch(err => console.log('Piratebay Error: ' + err))
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

function archiveorg(query) {
	archive.search({q: query}, function(err, res) {
		var i = 0;
		var movies = new Array();
		while (res.response.docs[i])
		{
			if (res.response.docs[i].mediatype == "movies") {
				movies.push({
					id: res.response.docs[i].identifier, 
					title: res.response.docs[i].title, 
					year: res.response.docs[i].year,
					rating: res.response.docs[i].avg_rating,
					genres: res.response.docs[i].subject,
					synopsis: res.response.docs[i].description,
					language: res.response.docs[i].language,
					cover: 'https://archive.org/services/img/' + res.response.docs[i].identifier,
					background: 'https://archive.org/services/img/' + res.response.docs[i].identifier,
					creator: res.response.docs[i].creator,
					downloads: res.response.docs[i].downloads
				});
			}
			i++;
		}
		render(movies, query)
	});
}

if (empty(req.body.query) || req.body.query === "undefined") {
	thepiratebay(query, (movies) => { res.render('index.ejs', {profile:req.session.profile, movies: movies}) })
	// Cette ligne en temps normal est : yts(query); Mais quand yts est down, on utilise ThePirateBays pour eviter
}
else
{
	var query = eschtml(req.body.query)
	switch (req.body.srch) {
	    case 'tpb' :  
		    thepiratebay(query, (movies) => { render(movies, query) });
		    break;
	    case 'arc' : 
	    	archiveorg(query);
		    break;
	    case 'yts' : 
		    yts(query);
		    break;
		default :
			yts(query);
	}
}