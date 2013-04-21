/*

This will generate RDF graph when the url of a documentation is passed to the processResources
function.The whole XML data(graph) is in the variable xw.This will put all produced,consumed,subclass
relations among the services in a queue and upto 500 entries from the queue are processed

*/

var resources=new Array();
var graph=new Array();
var baseURL;
var count=0;
var inserted_resource=0;
var processed=1;
var xw=new XMLWriter('UTF-8','1.0');

function listContains(href)
{
 index=resources.indexOf(href);
 if(index==-1)
  return false;
 else
  return true;
}



/* This function will process all the resources in a documentation file */
function processResponse(json) 
{
 var obj=JSON.parse(json);
 var baseurl=obj.baseurl;
 xw.writeStartElement('rdf:Description');
 xw.writeAttributeString('rdf:about',baseurl);
 for(i=0;i<obj.apis.length;i++) {
   var Name=obj.apis[i].name; //check conflict
   xw.writeElementString('rdfs:label',Name);
   var docUrl=obj.apis[i].doc-url;
   xw.writeElementString('rest:doc-url',docUrl);
   var uri=obj.apis[i].uri;
   xw.writeElementString('rdfs:Resource',uri);
   var superclass=obj.apis[i].is-a.doc-uri;
   var superclassid=obj.apis[i].is-a.name;
   xw.writeStartElement('rdfs:subclassof');
   xw.writeAttributeString('rdf:ID',superclassid);
   xw.writeElementString('rdfs:Resource',superclass);
   xw.writeEndElement();
   if(!listContains(superclass))
     resources.push(superclass);
   var description=obj.apis[i].description;
   xw.writeElementString('rdfs:comment',description);
   for(j=0;j<obj.apis[i].attributes.length;j++) {
     xw.writeStartElement('rest:attribute');
     if(obj.apis[i].attributes[j].read-only==true)
       xw.writeAttributeString('rest:read-only','true');
     if(obj.apis[i].attributes[j].write-once==true)
       xw.writeAttributeString('rest:write-once','true');
     if(obj.apis[i].attributes[j].required==true)
       xw.writeAttributeString('rest:required','true');
     if(obj.apis[i].attributes[j].queryable==true)
       xw.writeAttributeString('rest:queryable','true');
     if(obj.apis[i].attributes[j].guid==true)
       xw.writeAttributeString('rest:guid','true');
     Name=obj.apis[i].attributes[j].name;
     xw.writeElementString('rdfs:label',Name);
     var type=obj.apis[i].attributes[j].type;
     if(type==NULL)
       xw.writeElementString('rdf:type','Undefined');
     else
       xw.writeElementString('rdf:type',type);
     description=obj.apis[i].attributes[j].description;
     xw.writeElementString('rdfs:comment',description);
     for(k=0;k<obj.apis[i].attributes[j].consumed-by.length;k++) {
       var attribute=obj.apis[i].attributes[j].consumed-by[k].attribute;
       var consumer=obj.apis[i].attributes[j].consumed-by[k].uri;
       if(!listContains(consumer))
         resources.push(consumer);
       consumer=consumer+'\\#'+attribute;
       xw.writeElementString('rest:consumedBy',consumer);
     }
     for(k=0;k<obj.apis[i].attributes[j].produced-by.length;k++) {
       var attribute=obj.apis[i].attributes[j].produced-by[k].attribute;
       if(!listContains(producer))
         resources.push(producer);
       var producer=obj.apis[i].attributes[j].produced-by[k].uri;
       producer=producer+'\\#'+attribute;
       xw.writeElementString('rest:producedBy',producer);
     }
     xw.writeEndElement(); 
   }
 }
 xw.writeEndElement();
 inserted_resource++;
}

function getJson(url)
{
 return JSON.parse($.ajax({
     type: 'GET',
     url: url,
     dataType: 'json',
     global: false,
     async:false,
     success: function(data) {
         return data;
     }
 }).responseText);
}

/* Entry function */
function processResources(url)
{
 /* initialize the RDF */
 xw.formatting = 'indented';
 xw.indentChar = ' ';
 xw.indentation = 2;
 xw.writeStartDocument();
 xw.writeStartElement('rdf:RDF');
 xw.writeAttributeString('xmlns:rdf','http://www.w3.org/1999/02/22-rdf-syntax-ns#');
 xw.writeAttributeString('xmlns:rfds','http://www.w3.org/2000/01/rdf-schema#');
 xw.writeAttributeString('xmlns:rest','http://purl.org/dc/elements/1.1/');

/* Generate Graph */
 resources.push(url);
 var json=getJson(url);
 processResponse(json);
 while(inserted_resource<=50) {
  if(processed<=resources.length) {
    url=resources[processed];
    processed++;
    json=getJson(url);
    processResponse(json);
  }
  else
    break;
 }

 xw.writeEndElement();
 xw.writeEndDocument();
 console.log(xw.flush());
}
