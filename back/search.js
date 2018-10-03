var query = eschtml(encodeURI(req.body.query))

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
		if (json.data.movie_count != 0)
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
		}
		

		// searchpiratebay(req.body.query, (piratemovies) => { 
			
		// 	movies = movies.concat(piratemovies)
		// 	count += piratemovies.length;
			
			res.render('search.ejs', {profile:req.session.profile, movies:movies, count:count, q:query})
		 // });
		
	})
}
else
	res.render('search.ejs', {profile:req.session.profile, error: "Something went wrong"})