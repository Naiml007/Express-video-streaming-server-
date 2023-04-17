const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res) {
  // Get the list of video files in the "assets" folder
  const videoFiles = fs.readdirSync('assets').filter(file => {
    return file.endsWith('.mp4');
  });


  // Create a playlist with all the video files
  const playlist = videoFiles.map(file => {
    return {
      file: `/video/${file}`,
      title: file.replace('.mp4', '')
    };
  });
  app.set('view engine', 'ejs');

  // Render the index.ejs template with the playlist
  res.render('index.ejs', { playlist: playlist });
});

app.get('/video/:filename', function(req, res) {
  const path = `assets/${req.params.filename}`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.listen(3000, function() {
  console.log('Server started on port 3000');
});
