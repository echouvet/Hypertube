if (req.params.hash !== undefined)
{
	hash = req.params.hash;
	con.query('SELECT path FROM movies WHERE hash = ?', [hash], (err, rows) => {
		if (err) throw err;
		if (rows[0] !== undefined && rows[0].path !== undefined)
		{
			const path = '/tmp/hypertube/tmp/films/'+rows[0].path;
			const stat = fs.statSync(path)
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
				const file = fs.createReadStream(path, {start, end})
				const head = {
				'Content-Range': `bytes ${start}-${end}/${fileSize}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunksize,
				'Content-Type': 'video/mp4',
				}
				console.log('1');
				res.writeHead(206, head)
				file.pipe(res)
			} else {
				console.log('2');
				const head = {
				'Content-Length': fileSize,
				'Content-Type': 'video/mp4',
				}
				res.writeHead(200, head)
				fs.createReadStream(path).pipe(res)
			}
		}
	})
}