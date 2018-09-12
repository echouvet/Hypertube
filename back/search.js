var query = eschtml(encodeURI(req.body.query));
if (!empty(query))
{
	fetch('https://archive.org/services/search/v1/scrape?count=100&sorts=downloads%20desc&fields=identifier%2Cdownloads%2Ctitle%2Cmediatype%2Ccreator%2Cmonth%2Cweek%2Cdate%2Cdescription&q=title%3A(' + query + ')')
    	.then(res => res.json())
    	.then(function(json) {
			var i = 0;
			while (json.items[i])
			{
				if (json.items[i].mediatype != "movies")
				{
					json.items.splice(i, 1);
					i--;
				}
				i++;
			}
			res.render('search.ejs', {profile:req.session.profile, result:json.items, count:json.count, q:query})
    	});
}
else
{
	res.render('search.ejs', {profile:req.session.profile});
}