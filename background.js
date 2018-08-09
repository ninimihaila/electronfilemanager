var http = require('http');
// var cluster = require('cluster');
// var numCPUs = 4;

// if (cluster.isMaster) {
//     for (var i = 0; i < numCPUs; i++) {
//         cluster.fork();
//     }
// } else {
    http.createServer(function(req, res) {
        res.writeHead(200);
        res.end('process ' + process.pid + ' says hello!');
    }).listen(9999);
// }
