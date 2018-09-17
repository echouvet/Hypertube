var query = eschtml(encodeURI(req.body.query))
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
	fetch('https://archive.org/services/search/v1/scrape?count=500&sorts=' + sorts + '&fields=identifier%2Cdownloads%2Ctitle%2Cmediatype%2Clanguage%2Cmonth%2Cweek%2Cpublicdate%2Cdescription%2Cavg_rating%2Cformat%2Cdate&q=title%3A(' + query + ')')
    	.catch(error => console.log(error))
    	.then(res => res.json())
    	.then(function(json) {
			var i = 0;
			while (json.items[i])
			{
				var j = 0;
				while (json.items[i].format[j] != "Archive BitTorrent" && json.items[i].format[j])
					j++;
				if (json.items[i].mediatype != "movies" || json.items[i].format[j] != "Archive BitTorrent")
				{
					json.items.splice(i, 1);
					i--;
				}
				i++;
			}
			res.render('search.ejs', {profile:req.session.profile, result:json.items, count:i, q:query})
    	});	
}
else
	res.render('search.ejs', {profile:req.session.profile, error: "Something went wrong"})