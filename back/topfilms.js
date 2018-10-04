
	fetch('https://yts.am/api/v2/list_movies.json?sort_by=rating&limit=20')
	.catch(error => console.log(error))
	.then(res => res.json())
	.then((json) => {
		var movies = new Array();
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
    	res.render('index.ejs', {profile:req.session.profile, movies:movies})
	})