/* route the data coming through
 */
var url = require("url")
var http = require("http")

var DOMParser = require('xmldom').DOMParser

var hrestParser = require("./hrestparser").hrestParser

function route(request, response) {
	var req = url.parse(request.url, true);
	var pathname = req.pathname
	var query = req.query

	if (pathname == '/parse') {
		console.log("Pasre recieved")
		
		docurl = query.url;
		
    	doc = ''
    	http.get(docurl, function(res) {
    	    console.log("Got page: "+res.statusCode)
        	res.setEncoding('utf-8')
        	res.on('data', function(chunk) {
            	doc += chunk;
        	})
        	res.on('end',function() {
            	//console.log(doc)
            	//console.log("EOD");
            	document = new DOMParser().parseFromString(doc,"application/xhtml+xml");
            	parser = new hrestParser(document,docurl);
            	parser.parse();
            	var json = parser.getJSON();

            	if(json){
            		response.writeHead(200, {"Content-type" : "application/json"});
            		response.write(json);
            		response.end();

            	}else {
            		response.writeHead(500, {"Content-type" : "application/json"});
            		response.write('{"error":"no api found"}');
            		response.end();
            	}
        	})
    	}).on('error', function(err) {
    		    console.log("Error on page")
   		})

   		
	}


}

exports.route = route