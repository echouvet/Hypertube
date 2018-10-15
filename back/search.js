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
		// seenmovies = tout les films que t'as vue
		// movies = tout les films qu'a rendue l'api durent ta recherche
		// faut comparer les 2 pour pouvoir ajouter une case 'vue' dans movies quand c pareil, pour le front
		// le probleme c'est qu'ils n'ont pas de variables en commun. Faudrais pouvoir comparer le hash....
		// ce qu'est au dessus marche, puis rien ne crash, mais pour l'instant movies ne change pas ;(
			return callback(movies)
		})
	})
}

function render(movies, query, api)
{
	checkforvues(movies, query, api, (cmovies) => {
		var cmovies = movies;
		if (!cmovies)
			res.redirect('/error/No movies found')
		else if (empty(query))
			res.render('index.ejs', {profile:req.session.profile, movies:cmovies, api})
		else
			res.render('search.ejs', {profile:req.session.profile, movies:cmovies, count:cmovies.length, q:query, api})
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
	return (movies)
}

async function yts(query){
	if (empty(query) || query === "undefined") {
		try {
			let fetching = await fetch('https://yts.am/api/v2/list_movies.json?sort_by=rating&limit=20');
			let movies = await fetching.json();
			render(mapyts(movies.data), query, 1);
		} catch (err) {res.redirect('/error/YTS catch' + err);}
	}
	else
	{
		var ytsquery = encodeURI(query)
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
		try {
			let fetching = await fetch('https://yts.am/api/v2/list_movies.json?query_term=' + ytsquery + '&sort_by=' + sort);
			let movies = await fetching.json();
			render(mapyts(movies.data), query, 1)
		} catch (err) {res.redirect('/error/YTS catch ' + err); }
	}
}

async function thepiratebay(query) {
	if (empty(query) || query === "undefined")
		result = await PirateBay.topTorrents(200).catch(err => {if (err) res.redirect('/error/thepiratebay catch ' + err);} )
	else
	{
		result = await PirateBay.search(query, {
	    	category: 'video',
			orderBy: 'name',
			sortBy: 'desc',
			filter: { verified: true }
  		}).catch(err => {if (err) res.redirect('/error/thepiratebay catch ' + err);})
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
}

function maparchive(rawmovies)
{
	var movies = rawmovies.map(elem => {
				return({
					id: elem.identifier,
					title: elem.title,
					year: elem.year,
					rating: elem.avg_rating,
					genres: elem.subject,
					synopsis: elem.description,
					language: elem.language,
					cover: 'https://archive.org/services/img/' + elem.identifier,
					background: 'https://archive.org/services/img/' + elem.identifier,
					creator: elem.creator,
					downloads: elem.downloads,
					btih: elem.btih,
					magnet: 'https://archive.org/download/'+elem.identifier+'/'+elem.identifier+'_archive.torrent'
		})});
	render(movies, query, 3)
}

function archiveorg(query) {
	archive.search({q: query}, function(err, res) {
		if (err) { res.redirect('/error/archive.org api search problem ' + err); }
		var movies = res.response.docs.filter(elem => {
			if (elem.mediatype == "movies")
				return true;
			else
				return false;
		})
		maparchive(movies)
	});
}

async function toparchive() {
	try {
		let fetching = await fetch('https://archive.org/services/search/v1/scrape?debug=false&xvar=production&total_only=false&count=100&sorts=avg_rating%20desc&fields=identifier\
		%2Ctitle%2Cyear%2Cavg_rating%2Csubject%2Cdescription%2Clanguage%2Ccreator%2Cdownloads%2Cmediatype&q=mediatype%3A(movies)');
		let movies = await fetching.json();
		maparchive(movies.items)
	} catch (err) { res.redirect('/error/archive.org fetch problem ' + err); }
}

var query = eschtml(req.body.query)
switch (req.body.srch) {
    case 'tpb' :
	    thepiratebay(query);
	    break;
    case 'arc' :
    if (empty(query))
    	toparchive();
    else
    	archiveorg(query);
	    break;
    case 'yts' :
	    isReachable('https://yts.am/api/v2/list_movies.json', {timeout: 2000}).then(r => {
    	if (r == true) 
    		yts(query);
    	else
    		res.redirect('/error/YTS is momentarily down, please try again later');
    })
	    break;
	default :
		isReachable('https://yts.am/api/v2/list_movies.json', {timeout: 2000}).then(r => {
    	if (r == true)
    		yts(query);
    	else
    		thepiratebay(query);
    })
}
