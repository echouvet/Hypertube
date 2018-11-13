function checkforvues(movies, query, api, callback)
{
	con.query('SELECT * FROM vues WHERE user_id = ?', [req.session.profile.id], (err, vueresult) => {
		if (err) { res.redirect('/error/SQL vue problem in search.js 1 ' + err); }
		if (vueresult.length == 0)
			return callback(movies)
		var ids = new Array;
		var i = 0;
		movieids = vueresult.map(el => {
			if (!ids.includes(el.movie_id))
			{
				ids[i] = el.movie_id;
				i++;
				return el.movie_id
			}
			else
				return null;
		}).filter(el => {
			if (el == null)
				return false
			else
				return true
		})
		con.query('SELECT * FROM movies WHERE id IN (?) AND api = ?', [movieids, api], (err, seenmovies) => {
			if (err) { res.redirect('/error/SQL vue problem in search.js 2 ' + err); }
			if (seenmovies == undefined || movies == undefined)
				return callback(movies)
			movies.forEach(movie => {	
				seenmovies.forEach(s => {
					if ((s.api_id == movie.id && !empty(movie.id) && !empty(s.api_id)) || 
						(s.title == movie.title && !empty(s.title) && !empty(movie.title)))
						movie.vue = 1
						
				})
			})
			return callback(movies)
		})
	})
}
function render(movies, query, api)
{
	if (!empty(req.body.srch))
	{
		req.session.movies = movies;
		req.session.api = api;
	}
	checkforvues(movies, query, api, (cmovies) => {
		if (empty(cmovies) || empty(movies))
			res.redirect('/error/No movies found')
		else if (empty(query) && req.body.srch == 'xto')
			res.render('index.ejs', {profile:req.session.profile, error: 'Top Movies not available with 1337x npm module', movies:cmovies, api: 1, sort: req.body.sort, search: req.body.srch, genres: req.body.genres, rating: req.body.filtrerating, qualityk: req.body.quality})
		else if (empty(query))
			res.render('index.ejs', {profile:req.session.profile, movies:cmovies, api: api, sort: req.body.sort, search: req.body.srch, genres: req.body.genres, rating: req.body.filtrerating, qualityk: req.body.quality})
		else
			res.render('search.ejs', {profile:req.session.profile, movies:cmovies, count:cmovies.length, q:query, api: api, sort: req.body.sort, search: req.body.srch, genres: req.body.genres, rating: req.body.filtrerating, qualityk: req.body.quality})
	})
}

function	mapyts(data){
	if (data.movie_count != 0)
	{
		var movies = data.movies.map(elem => {
			if (elem.large_cover_image)
				var cover = elem.large_cover_image;
			else
				var cover = elem.medium_cover_image;
			return ({
				id: elem.id, 
				title: elem.title, 
				year: elem.year, 
				rating: elem.rating,
				genres: elem.genres,
				synopsis: elem.synopsis, 
				language: elem.language,
				cover: cover,
				background: elem.background_image,
				runtime: elem.runtime,
				torrents: elem.torrents
			})
		})
	}
	return(movies)
}

async function yts(query){
	switch (req.body.sort) {
	    case '0':
	        var sort = "download_count";break;
	    case '1':
	        var sort = "like_count";break;
	    case '2':
	        var sort = "year";break;
	    case '3':
	        var sort = "date_added";break;
	    case '4':
	        var sort = "rating";break;
	    case '5':
	        var sort = "peers";break;
	    case '6':
	  		var sort = "seeds";break;
	}
	if (req.body.genres)
		var genre = eschtml(req.body.genres);
	else
		var genre = "All";
	if (req.body.filtrerating)
		var minimumrating = eschtml(req.body.filtrerating);
	if (req.body.quality)
		var quality = eschtml(req.body.quality);
	if (empty(query) || query === "undefined") {
		try {
			if (!sort) { var sort = "rating" };
			var requete = 'https://yts.am/api/v2/list_movies.json?sort_by=' + sort + '&limit=10&page='+number;
			if (genre != "All")
				var requete =  requete + '&genre=' + genre;
			if (minimumrating)
				var requete =  requete + '&minimum_rating=' +  minimumrating;
			if (quality)
				var requete =  requete + '&quality=' + quality;
			let fetching = await fetch(requete);
			let movies = await fetching.json();
			render(mapyts(movies.data), query, 1);
		} catch (err) {res.redirect('/error/YTS catch' + err);}
	}
	else
	{
		var ytsquery = encodeURI(query)
		try {
			if (!sort) { var sort = "title" };
			var requete = 'https://yts.am/api/v2/list_movies.json?query_term=' + ytsquery + '&sort_by=' + sort + '&limit=10&page='+number;
			if (genre != "All")
				var requete =  requete + '&genre=' + genre;
			if (minimumrating)
				var requete =  requete + '&minimum_rating=' +  minimumrating;
			if (quality)
				var requete =  requete + '&quality=' + quality;
			let fetching = await fetch(requete);
			let movies = await fetching.json();
			render(mapyts(movies.data), query, 1)
		} catch (err) {res.redirect('/error/YTS catch ' + err); }
	}
}

async function thepiratebay(query) {
	try {
		if (empty(query) || query === "undefined")
			var result = await PirateBay.topTorrents(200)
		else
		{
			var result = await PirateBay.search(query, {
		    	category: 'video',
				orderBy: 'name',
				sortBy: 'desc',
				filter: { verified: true }
	  		})
		}
	  	const piratemovies = result.map(elem => {
	  		elem.name = elem.name.replace(/\./g, ' ');
	  		return({
				id: elem.id,
				title: elem.name,
		        uploaddate: elem.uploadDate,
		        size: elem.size,
		        link: elem.link,
		        category: elem.subcategory.name,
		   		magnet: elem.magnetLink,
		   		cover: 'img/piratebay.png'
			})});
		render(piratemovies, query, 2)
	} catch (err) {res.redirect('/error/TPB catch ' + err); }
}

function mapxtorrent(rawmovies)
{
	var movies = rawmovies.map(elem => {
		return xtorrent.info(elem.href).then(function (info) {
			return({
				title: elem.title,
				href: elem.href,
				size: info.size,
				language: info.language,
				cover: '/img/1337X.png',
				uploaddate: info.date_uploaded,
				magnet: info.download.magnet
		})})});
	Promise.all(movies).then((movies) => render(movies, query, 4));
}

function apixtorrent(query) {
	try {
		xtorrent.search({query:query}).then(function (data) {
  			mapxtorrent(data);
		}) 
	} catch (err) { res.redirect('/error/apixtorrent fetch problem ' + err); }
}


var query = eschtml(req.body.query)
var number = req.body.number;
if (number === undefined)
	number = 1;
if (req.body.sort == undefined && req.body.genres == undefined && req.body.quality == undefined && req.body.filtrerating == undefined)
	req.body.sort = 4;
switch (req.body.srch) {
	case 'xto' :
		if (!empty(query))
			apixtorrent(query);
		else
		{
			isReachable('https://yts.am/api/v2/list_movies.json', {timeout: 3000}).then(r => {
			if (r == true)
			{
				req.body.srch = 'yts'
				yts(query, number);
			}
			else
				thepiratebay(query);
			})
		}
		break;
    case 'tpb' :
	    thepiratebay(query);
	    break;
    case 'yts' :
	    isReachable('https://yts.am/api/v2/list_movies.json', {timeout: 3000}).then(r => {
    	if (r == true) 
    		yts(query, number);
    	else
    		res.redirect('/error/YTS is momentarily down, please try again later');
    })
	    break;
	default :
		isReachable('https://yts.am/api/v2/list_movies.json', {timeout: 3000}).then(r => {
    	if (r == true)
    		yts(query);
    	else
		thepiratebay(query);
    })
}
