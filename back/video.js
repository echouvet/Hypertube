console.log(req.headers)
if (req.params.hash !== undefined)
{
	hash = req.params.hash;
	con.query('SELECT path FROM movies WHERE hash = ?', [hash], (err, rows) => {
		if (err) throw err;
		if (rows[0] !== undefined && rows[0].path !== undefined)
		{
			const path1 = '/tmp/hypertube/tmp/films/'+rows[0].path;
				const engine = torrentStream(hash, {
					tmp: __dirname + '/tmp/upload',
					path: __dirname + '/tmp/films/'});
				
			if (fs.existsSync(path1))
			{
				const stat = fs.statSync(path1)
				const fileSize = stat.size
				const range = req.headers.range
				if (range) {
					const parts = range.replace(/bytes=/, "").split("-")
					const start = parseInt(parts[0], 10)
					const end = parts[1]
					? parseInt(parts[1], 10)
					: fileSize-1
					ranges = rangeParser(fileSize, range, {combine: true});
					console.log(ranges);
					const chunksize = (end-start)+1
					const head = {
					'Content-Range': `bytes ${start}-${end}/${fileSize}`,
					'Accept-Ranges': 'bytes',
					'Content-Length': chunksize,
					'Content-Type': 'video/mp4',
					}
					console.log('s1');
					engine.on('ready', () => {
						console.log("ready");
						engine.files.forEach(function(file) {
							if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4' ||
							file.name.substr(file.name.length - 3) == 'avi' || file.name.substr(file.name.length - 3) == 'MP4')
							{
								// var stream = file.createReadStream({start});
								res.setHeader('Accept-Ranges', 'bytes');
								res.setHeader('Content-Type', `video/mp4`);
								res.setHeader('Content-Length', 1 + ranges.end - ranges.start);
								res.setHeader('Content-Range', `bytes ${ranges.start}-${ranges.end}/${file.length}`);
								pump(file.createReadStream({start: ranges.start, end: ranges.end}), res);
							}
						})
					})
					engine.on('download', (chunck) => {
						// console.log(chunck);
				})
				} else {
					console.log('2');
					const head = {
						'Content-Length': fileSize,
						'Content-Type': 'video/mp4',
					}
					engine.on('ready', () => {
						console.log("ready");
						engine.files.forEach(function(file) {
							if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4' ||
							file.name.substr(file.name.length - 3) == 'avi' || file.name.substr(file.name.length - 3) == 'MP4')
							{
								var stream = file.createReadStream();
								res.writeHead(200, head)
								fs.createReadStream(path1).pipe(res)
							}
						})
					})
					engine.on('download', (chunck) => {
						// console.log(chunck);
				})
				}
			}

		}
	})
}
console.log('4');