function render(movies, query)
{
	if (empty(query))
		query = 'Top Films';
	res.render('search.ejs', {profile:req.session.profile, movies:movies, count:movies.length, q:query})
}

function	mapyts(data){
	var movies = new Array();
	if (data.movie_count != 0)
	{
		movies = data.movies.map(elem => {
			return ({
				id: elem.id, 
				title: elem.title, 
				year: elem.year, 
				rating: elem.rating,
				genres: elem.genres,
				synopsis: elem.synopsis,
				language: elem.language,
				cover: elem.large_cover_image,
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
			render(mapyts(movies.data), query);
		} catch (err) {res.redirect('/error/' + err);}
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
			render(mapyts(movies.data), query)
		} catch (err) {res.redirect('/error/' + err); }
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
		var movies = new Array;
		movies = res.response.docs.filter(elem => {
			if (elem.mediatype == "movies")
				return true;
			else
				return false;
		}).map(elem => {
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
					downloads: elem.downloads
		})});
		render(movies, query)
	});
}

function toparchive() {
	fetch('https://archive.org/services/search/v1/scrape?debug=false&xvar=production&total_only=false&count=100&sorts=avg_rating%20desc&fields=identifier\
		%2Ctitle%2Cyear%2Cavg_rating%2Csubject%2Cdescription%2Clanguage%2Ccreator%2Cdownloads%2Cmediatype&q=mediatype%3A(movies)')
	.catch(error => console.log(error))
	.then(res => res.json())
	.then (json => {
		var movies = new Array;
		movies = json.items.map(elem => {
			return ({
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
					downloads: elem.downloads
			})})
		render(movies, '') });
}

var query = eschtml(req.body.query)
switch (req.body.srch) {
    case 'tpb' :
	    thepiratebay(query, (movies) => { render(movies, query) });
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
    		thepiratebay(query, (movies) => { render(movies, query) });
    })
	    break;
	default :
		isReachable('https://yts.am/api/v2/list_movies.json', {timeout: 2000}).then(r => {
    	if (r == true)
    		yts(query);
    	else
    		thepiratebay(query, (movies) => { render(movies, query) });
    })
}
