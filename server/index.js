
var server = require("./src/server")
var router = require("./src/router")
var port = 8081

server.start(router.route, port)