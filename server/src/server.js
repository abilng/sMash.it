/* A simple http server in node
 * port - port to listen
 * start() - start server
 */

var http = require("http");

function start(route, port) {
	function onRequest(request, response) {
		console.log("Request recieved :"+request.url)
		route(request,response)
	}

	http.createServer(onRequest).listen(port)
	
	console.log("Server started!")
}

exports.start = start