console.log(req.headers)
if (req.params.hash !== undefined)
{

	hash = req.params.hash;
	// con.query('SELECT path FROM movies WHERE hash = ?', [hash], (err, rows) => {
	// 	if (err) throw err;
	// 	if (rows[0] !== undefined && rows[0].path !== undefined)
	// 	{
			const getTorrentFile = function(engine) {
				return new Promise ((resolve, reject) => {
					engine.on('ready', async() => {
						await engine.files.forEach((file, id) => {
							if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4' ||
								file.name.substr(file.name.length - 3) == 'avi' || file.name.substr(file.name.length - 3) == 'MP4')
							{
								resolve(file);
							}
						});
						reject('Error');;
					});
				});
			}
			async function startEngine(hash) {
				return (await torrentStream(hash, {
					tmp: __dirname + '/tmp/upload',
					path: __dirname + '/tmp/films/'}))
			}
			function getRange(file, rangeHeader, res) {
				const ranges = rangeParser(file.length, rangeHeader, {combine: true});
				if (ranges === -1)
					return (-1);
				else if (ranges === -2 || ranges.type !== 'bytes' || ranges.length > 1)
					return (0);
				else
					return (ranges[0]);
			}
			function stream(file, ranges, res) {
				if (ranges === -1) {
					res.statusCode = 416;
					return (false);
				}
				else if (ranges === 0) {
					res.setHeader('Content-Length', file.length);
					pump(file.createReadStream(), res);
				}
				else {
					res.statusCode = 206;
					res.setHeader('Content-Length', 1 + ranges.end - ranges.start);
					res.setHeader('Content-Range', `bytes ${ranges.start}-${ranges.end}/${file.length}`);
					pump(file.createReadStream({start: ranges.start, end: ranges.end}), res);
				}
				return (true);
			}
			// const path1 = '/tmp/hypertube/tmp/films/'+rows[0].path;
			// if (fs.existsSync(path1))
			// {
			// 	const stat = fs.statSync(path1)
			// 	const fileSize = stat.size
			// 	const range = req.headers.range
			// 	if (range) {
			// 		const parts = range.replace(/bytes=/, "").split("-")
			// 		const start = parseInt(parts[0], 10)
			// 		const end = parts[1]
			// 		? parseInt(parts[1], 10)
			// 		: fileSize-1
					
			// 		// if (ranges == -1)
			// 		// {
			// 		// 	res.statusCode = 416;
			// 		// 	res.end();
			// 		// }
			// 		// else
			// 		// {
			// 			const chunksize = (end-start)+1
			// 			const head = {
			// 			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			// 			'Accept-Ranges': 'bytes',
			// 			'Content-Length': chunksize,
			// 			'Content-Type': 'video/mp4',
			// 			}
			// 			console.log('s1');
			// 			engine.on('ready', () => {
			// 				console.log("ready");
			// 				engine.files.forEach(function(file) {
			// 					if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4' ||
			// 					file.name.substr(file.name.length - 3) == 'avi' || file.name.substr(file.name.length - 3) == 'MP4')
			// 					{
			// 						// var stream = file.createReadStream({start});
			// 						//ICI PROBLEME DANS CHROME ranges.end et ranges
			// 						console.log(file);
			// 						ranges = rangeParser(file.length, range, {combine: true});
			// 						console.log(ranges);
			// 						if (ranges.end == undefined) { ranges.end = end }
			// 						if (ranges.start == undefined) { ranges.start = start }
			// 						if (file.lenght == undefined) { file.lenght = fileSize }
			// 						res.statusCode = 206;
			// 						res.setHeader('Accept-Ranges', 'bytes');
			// 						res.setHeader('Content-Length', 1 + ranges.end - ranges.start);
			// 						res.setHeader('Content-Type', `video/mp4`);
			// 						res.setHeader('Content-Range', `bytes ${ranges.start}-${ranges.end}/${file.lenght}`);
			// 						pump(file.createReadStream({start: ranges.start, end: ranges.end}), res);
			// 					}
			// 				})
			// 			})
			// 			engine.on('download', (chunck) => {
			// 				// console.log(chunck);
			// 			})
			// 		// }
			// 	} else {
			// 		console.log('2');
			// 		const head = {
			// 			'Content-Length': fileSize,
			// 			'Content-Type': 'video/mp4',
			// 		}
			// 		engine.on('ready', () => {
			// 			console.log("ready");
			// 			engine.files.forEach(function(file) {
			// 				if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4' ||
			// 				file.name.substr(file.name.length - 3) == 'avi' || file.name.substr(file.name.length - 3) == 'MP4')
			// 				{
			// 					res.setHeader('Accept-Ranges', 'bytes');
			// 					res.setHeader('Content-Length', fileSize);
			// 					res.setHeader('Content-Type', `video/mp4`);
			// 					pump(file.createReadStream(), res);
			// 				}
			// 			})
			// 		})
			// 		engine.on('download', (chunck) => {
			// 			// console.log(chunck);
			// 	})
			// 	}
			// }
			// module.exports = {
	const ranger = req.headers.range;
	const enginePending = startEngine(hash);
	console.log('a');
	res.setHeader('Accept-Ranges', 'bytes');
	enginePending
		.then((engine) => {
			const getTorrent = getTorrentFile(engine);
			console.log('b');

			getTorrent
				.then(async(file) => {
	console.log('c');
					pathing = '/tmp/films/'+file.path;
					con.query('UPDATE movies SET path = ? WHERE hash = ?', [pathing, hash], (err) => {
						if (err) throw (err);
					})
					res.setHeader('Content-Type', `video/mp4`);
					const ranges = await getRange(file, ranger, res);
	console.log('d');
					
					if (!stream(file, ranges, res)) {
	console.log('e');

						return (res.end());
					}
				})
				.catch(err => {
					console.log(err);
				})
		})
		.catch(err => {
			console.log(err);
		})
}
		// }
// 	})
// }
console.log('4');