/*

  This will generate RDF this.graph when the url of a documentation is passed to the processresources
  function.The whole XML data(this.graph) is in the variable this.xw.This will put all produced,consumed,subclass
  relations among the services in a queue and upto 500 entries from the queue are this.processed

*/

var http = require("http");

//custom modules
var DOMParser = require('xmldom').DOMParser
var hrestParser = require("./hrestparser").hrestParser
var XMLWriter = require('xml-writer');



var RDFCreator = function (response){
    this.resources = new Array();
    this.graph = new Array();
    this.inserted_resource=0;
    this.processed=0;
    this.response = response;

    this.xw = new XMLWriter(true);
    /* initialize the RDF */
   this.xw.formatting = 'indented';
   this.xw.indentChar = ' ';
   this.xw.indentation = 2;
   this.xw.startDocument();
   this.xw.startElement('rdf:RDF');
   this.xw.writeAttribute('xmlns:rdf','http://www.w3.org/1999/02/22-rdf-syntax-ns#');
   this.xw.writeAttribute('xmlns:rfds','http://www.w3.org/2000/01/rdf-schema#');
   this.xw.writeAttribute('xmlns:rest','http://purl.org/dc/elements/1.1/');
};


RDFCreator.prototype = {

listContains:function (href)
{
    index=this.resources.indexOf(href);
    if(index==-1)
	return false;
    else
	return true;
},
/* This function will process all the this.resources in a documentation file */
processJson :  function (json) 
{
    var obj=JSON.parse(json);
    var baseurl=obj.baseurl;
    this.xw.startElement('rdf:Description');
    this.xw.writeAttribute('rdf:about',baseurl);
    for(i=0;i<obj.apis.length;i++) {
	var Name = obj.apis[i].name; //check conflict
	this.xw.writeElement('rdfs:label',Name);
	var docUrl = obj["doc-url"];
	this.xw.writeElement('rest:doc-url',docUrl);
	var uri = obj.apis[i].uri;
	if(obj.apis[i]['is-a'] != null){
   	    this.xw.writeElement('rdfs:Resource',uri);
   	    var superclass=obj.apis[i]['is-a']['doc-uri'];
   	    var superclassid=obj.apis[i]['is-a'].name;
   	    this.xw.startElement('rdfs:subclassof');
   	    this.xw.writeAttribute('rdf:ID',superclassid);
   	    this.xw.writeElement('rdfs:Resource',superclass);
   	    this.xw.endElement();

	    if(!this.listContains(superclass))
     		this.resources.push(superclass);
	}
	var description=obj.apis[i].description;
	this.xw.writeElement('rdfs:comment',description);
	for(j=0;j<obj.apis[i].attributes.length;j++) {
	    this.xw.startElement('rest:attribute');
	    if(obj.apis[i].attributes[j]['read-only']==true)
		this.xw.writeAttribute('rest:read-only','true');
	    if(obj.apis[i].attributes[j]['write-once']==true)
		this.xw.writeAttribute('rest:write-once','true');
	    if(obj.apis[i].attributes[j].required==true)
		this.xw.writeAttribute('rest:required','true');
	    if(obj.apis[i].attributes[j].queryable==true)
		this.xw.writeAttribute('rest:queryable','true');
	    if(obj.apis[i].attributes[j].guid==true)
		this.xw.writeAttribute('rest:guid','true');
	    Name=obj.apis[i].attributes[j].name;
	    this.xw.writeElement('rdfs:label',Name);
	    var type=obj.apis[i].attributes[j].type;
	    if(type==null)
		this.xw.writeElement('rdf:type','Undefined');
	    else
		this.xw.writeElement('rdf:type',type);
	    description=obj.apis[i].attributes[j].description;
	    this.xw.writeElement('rdfs:comment',description);
	    for(k=0;k<obj.apis[i].attributes[j]['consumed-by'].length;k++) {
		var attribute=obj.apis[i].attributes[j]['consumed-by'][k].attribute;
		var consumer=obj.apis[i].attributes[j]['consumed-by'][k]["doc-url"];
		if(consumer &&!this.listContains(consumer))
		    this.resources.push(consumer);
		consumer=consumer+'\\#'+attribute;
		this.xw.writeElement('rest:consumedBy',consumer);
	    }
	    for(k=0;k<obj.apis[i].attributes[j]['produced-by'].length;k++) {
		var attribute=obj.apis[i].attributes[j]['produced-by'][k].attribute;
		var producer=obj.apis[i].attributes[j]['produced-by'][k]["doc-url"];
		if(producer && !this.listContains(producer)){
		    this.resources.push(producer);
		}
		producer=producer+'\\#'+attribute;
		this.xw.writeElement('rest:producedBy',producer);
	    }
	    this.xw.endElement(); 
	}
    }
    this.xw.endElement();
    this.inserted_resource++;
},

parseURL : function (docurl) {
    parent = this;
    console.log(docurl);
    if(!docurl) return;
    doc = ''
    http.get(docurl, function(res) {
        console.log("Got page: "+res.statusCode)
        res.setEncoding('utf-8')
        res.on('data', function(chunk) {
            doc += chunk;
        })
        res.on('end',function() {
            document = new DOMParser().parseFromString(doc,"application/xhtml+xml");
            parser = new hrestParser(document,docurl);
            parser.parse();
            var json = parser.getJSON();

            if(json){
                /* Generate graph */
		parent.resources.push(docurl);
		parent.processJson(json);
		parent.processed++;
 		if(parent.processed<parent.resources.length) {
		    if(parent.processed >50) { 
			parent.xw.endElement();
			parent.xw.endDocument();
			parent.response.writeHead(200, {"Content-type" : "application/rdf+xml"});
                	parent.response.write(parent.xw.toString());
                	parent.response.end();
			//console.log(parent.xw.toString());
                        return;
		    }
		    url=parent.resources[parent.processed];
		    parent.parseURL(url);
		    /*console.log(parent.resources.length + "" +parent.processed );
		    for(i=0;i<parent.resources.length;i++)
		    	console.log(parent.resources[i]);*/
 		}
		else 
 		{
		    parent.xw.endElement();
	            parent.xw.endDocument();
                    parent.response.writeHead(200, {"Content-type" : "application/rdf + xml"});
                    parent.response.write(parent.xw.toString());
                    parent.response.end();
		    //console.log(parent.xw.toString());
                    return; 
		}
	    }else{
		parent.processed++;
		if(parent.processed>=parent.resources.length){ 
		    parent.xw.endElement();
		    parent.xw.endDocument();
                    parent.response.writeHead(200, {"Content-type" : "application/rdf + xml"});
                    parent.response.write(parent.xw.toString());
                    parent.response.end();
		    //console.log(parent.xw.toString());
                    return;
                 }
	    }
	})
    }).on('error', function(err) {
        console.log("Error on page")
	parent.processed++;
	if(parent.processed>=parent.resources.length){ 
	    parent.xw.endElement();
	    parent.xw.endDocument();
            parent.response.writeHead(200, {"Content-type" : "application/rdf + xml"});
            parent.response.write(parent.xw.toString());
            parent.response.end();
	    //console.log(parent.xw.toString());
            return;
        }
    })
}
};

exports.RDFCreator = RDFCreator

