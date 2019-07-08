const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
    res.json({
        status: false,
        msg: 'Please provide videoId in url'
    })
})

app.get('/:vId', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.htm'))
})

app.get('/video/:vId', function(req, res) {
    const path = 'assets/' + req.params.vId + '.mp4';
    fs.access(path, fs.F_OK, (err) => {
        if (err) {
            return res.status(404).json({
                status: false,
                msg: 'File doesnt exists'
            })
        }
        const stat = fs.statSync(path)
        const fileSize = stat.size
        const range = req.headers.range
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] ?
                parseInt(parts[1], 10) :
                fileSize - 1
            const chunksize = (end - start) + 1
            const file = fs.createReadStream(path, {
                start,
                end
            })
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(206, head)
            file.pipe(res)
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            fs.createReadStream(path).pipe(res)
        }
    })
})

app.listen(3000, function() {
    console.log('Listening on port 3000!')
})