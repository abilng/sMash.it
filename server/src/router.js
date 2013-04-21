/* route the data coming through
 */

//standard modules
var url = require("url");
var http = require("http");
var fs = require('fs');

//custom modules
var DOMParser = require('xmldom').DOMParser
var Mime = require('mime')
var hrestParser = require("./hrestparser").hrestParser
var RDFCreator = require("./jsonToGraph").RDFCreator;

//global
var static_basepath = __dirname+"/static/"

function parse (docurl,response) {
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

function send404 (response) {
    html404 = "<html lang='en'><head><title>404 Page Not Found</title>"
        +"</head><body><div id='container'>"
        +"<h1>404 Page Not Found</h1>"
        +"<p>The page you requested was not found.</p>"
        +"</div></body></html>";
    response.writeHead(404,{"Content-type":"text/html"});
    response.write(html404)
    response.end();
}

function htmlserver (path,response) {
    fs.readFile(static_basepath + path, function (err, data) {
        if (err){
            console.log("FileError:"+static_basepath + path)
            send404(response);
        }else {
            mime = Mime.lookup(static_basepath + path);
            response.writeHead(200, {'Content-Type': mime });
            response.end(data);
        }
    });
}


function route(request, response) {
    var req = url.parse(request.url, true);
    var pathname = req.pathname
    var query = req.query

    if (pathname == '/' ){
        htmlserver("index.html",response);
    }
    if (pathname == '/parse') {
	console.log("Pasre recieved")
        docurl = query.url;
        if(docurl){
            parse(docurl,response);
        } else {
            send404(response);   
        }
    } else if(pathname == '/rdf'){
	console.log("RDF request recieved")
        docurl = query.url;
	if(docurl){
	    rdfparser = new RDFCreator(response);
	    rdfparser.parseURL(docurl);
	} else {
            send404(response);   
        }
    } else {
        htmlserver(pathname,response);
    }


}

exports.route = route
