const fs = require('fs')
const path = require('path')
const util = require('util')

const lstat = util.promisify(fs.lstat)
const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)

var http = require('http');

async function getDirDetails(location) {
  try {
    let details = {location: location}

    if (['bmp', 'png', 'gif', 'jpg'].some(ext => location.endsWith(`.${ext}`))) {
      details.image = 'file://' + location
      details.fileContent = null
    } else {
      details.image = null
      details.fileContent = null

      const stat = await lstat(location)

      if (stat.isDirectory()) {
        details.isDir = true
        details.files = []

        const files = await readdir(location)
        for (let i = 0; i < files.length; i++) {
          const fstat = await lstat(`${location}/${files[i]}`)
          details.files.push({ id: i, name: files[i], class: fstat.isDirectory() ? 'folder' : 'file' })
        }
      } else if (['txt', 'html', 'js', 'py'].some(ext => location.endsWith(`.${ext}`))) {
        details.fileContent = await readFile(location, 'utf8')
      } else {
        details.fileContent = null
      }
    }

    return details
  } catch (e) {
    console.log(e)
  }
}
// var cluster = require('cluster');
// var numCPUs = 4;

// if (cluster.isMaster) {
//     for (var i = 0; i < numCPUs; i++) {
//         cluster.fork();
//     }
// } else {
    http.createServer(async function(req, res) {
      if (req.method == 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
          body = JSON.parse(body)
          let location = body.location

          getDirDetails(location).then(details => {
            res.writeHead(200);
            res.end(JSON.stringify(details))
          })
        })
      } else {
        res.writeHead(200);
        res.end(`process ${process.pid} says hello! from ${req.url} ${req}`);
      }
    }).listen(9999);
// }
