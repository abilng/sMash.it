// JavaScript Document
/*
 * Hrest Parser used for generation of JSON from html;
 * Version:1.0 for Nodejs.
 * (c) 2010-2013 
 */

/**
 * usage:
 *  parser = new hrestParser(document,url_of_doc);//use of both is appreciated
 *  parser.parse();
 *  parser.getJSON() -> return json as text
 */

//Module Imports

//var http = require("http")
var XPathResult = require('xpath').XPathResult;
var xpatheval = require('xpath').evaluate;
//var DOMParser = require('xmldom').DOMParser

function xpath (expression,root,type){
    if(type == null){
        type = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
    }
    return xpatheval(expression,root,null, type,null );
}


var hrestParser = function (doc,url) {

    this.url = url;
    this.json = undefined;
    this.doc = doc;
    this.setStatus(hrestParser.LOADED);
}

hrestParser.DONE = 1;
hrestParser.LOADING = 2;
hrestParser.LOADED = 3;
hrestParser.JSONLOADING = 4;

hrestParser.XPATH = {
        ROOT : "//div[contains(@class,'hresource')]",
        NAME : "descendant::*[contains(@class,'name')]",
        URI : "descendant::*[contains(@class,'uri')]|descendant::*[contains(@class,'url')]",
        COMMENT : "./*[contains(@class,'comment')]",
        ISA : "descendant::*[@rel='hresource-is-a']",
        METHOD :"descendant::*[contains(@class,'method')]", 
        ATTRIBUTE : "descendant::*[contains(@class,'attribute')]",
        ATTRIBUTE_COMMENT : "../*[contains(@class,'comment')]",
        ATTRIBUTE_CONSUMER : "../descendant::*[@rel='hresource-consumed-by']",
        ATTRIBUTE_PRODUCER : "../descendant::*[@rel='hresource-produced-by']",
        //attrribute prperties:
        ATTRIBUTE_IS_READONLY : "contains(@class,'read-only')",
        ATTRIBUTE_IS_REQUIRED : "contains(@class,'required')",
        ATTRIBUTE_IS_WRITEONCE : "contains(@class,'write-once')",
        ATTRIBUTE_IS_QUERYABLE : "contains(@class,'queryable')",
        ATTRIBUTE_IS_GUID : "contains(@class,'guid')",

        //extra new
        ATTRIBUTE_TYPE : "../descendant::*[contains(@class,'hresource-datatype')]",

        OUTPUT_FORMAT : "./descendant::*[contains(@class,'hresource-opformat')]",

        ERROR_ROOT : "descendant::*[contains(@class,'hresource-error')]",
        ERROR_CODE : "descendant::*[contains(@class,'error-code')]",
        ERROR_COMMENT : "descendant::*[contains(@class,'comment')]"
    };
hrestParser.HRESOURCE_VERSION="1.0";

hrestParser.prototype = {

    
    attributeProp:function (attributeNode){
        var res = {};
    
        res["name"] = attributeNode.textContent.trim();
        res["read-only"] = xpath(hrestParser.XPATH.ATTRIBUTE_IS_READONLY,attributeNode,XPathResult.BOOLEAN_TYPE).booleanValue;
        res["write-once"] = xpath(hrestParser.XPATH.ATTRIBUTE_IS_WRITEONCE,attributeNode,XPathResult.BOOLEAN_TYPE).booleanValue;
        res["required"] = xpath(hrestParser.XPATH.ATTRIBUTE_IS_REQUIRED,attributeNode,XPathResult.BOOLEAN_TYPE).booleanValue;
        res["queryable"] = xpath(hrestParser.XPATH.ATTRIBUTE_IS_QUERYABLE,attributeNode,XPathResult.BOOLEAN_TYPE).booleanValue;
        res["guid"] = xpath(hrestParser.XPATH.ATTRIBUTE_IS_GUID,attributeNode,XPathResult.BOOLEAN_TYPE).booleanValue;
        
        var commentNodes = xpath(hrestParser.XPATH.ATTRIBUTE_COMMENT,attributeNode);
        var comment;
        if ( commentNodes.snapshotLength !=0){
            comment = commentNodes.snapshotItem(0).textContent.trim();
        }else{
            comment = "";
        }
    
        // consumers
        // link must be in format {uri}\#{attribute}
        //
        var consumers = new Array();
        var consumerNodes =  xpath(hrestParser.XPATH.ATTRIBUTE_CONSUMER,attributeNode);
        for(var i = 0;i<consumerNodes.snapshotLength;i++){
            var consumerNode = consumerNodes.snapshotItem(i)
            var hreflink=consumerNode.getAttribute('href').trim()
            hreflink = hreflink.split('#')
            var url = hreflink[0];
            var attribute;
            if(hreflink[1] == undefined){
                attribute = res["name"];
            } else {
                attribute  = hreflink[1];   
            }
            api = consumerNode.textContent.trim();
            consumers.push({"attribute":attribute,"doc-url":url,"api":api});
        }
        var producers = new Array();
        var producerNodes =  xpath(hrestParser.XPATH.ATTRIBUTE_PRODUCER,attributeNode);
        for(var i = 0;i<producerNodes.snapshotLength;i++){
            var producerNode = producerNodes.snapshotItem(i)
            var hreflink=producerNode.getAttribute('href').trim()
            hreflink = hreflink.split('#')
            var url = hreflink[0];
            var attribute;
            if(hreflink[1] == undefined){
                attribute = res["name"];
            } else {
                attribute  = hreflink[1];   
            }
            api = producerNode.textContent.trim();
            producers.push({"attribute":attribute,"doc-url":url,"api":api});
        }

        var typeNodes= xpath(hrestParser.XPATH.ATTRIBUTE_TYPE,attributeNode)
        var datatype;
        if (typeNodes.snapshotLength == 0){
            datatype = null
        } else {
            datatype = typeNodes.snapshotItem(0).textContent.trim();
        }

        res["type"] = datatype
        res["description"] = comment
        res["consumed-by"] = consumers
        res["producered-by"] = producers

        return res;
    },
    listErrors:function (root){
        var errors = [];
        var errorNodes = xpath(hrestParser.XPATH.ERROR_ROOT,root)
        var errorNode;
        for (var i = 0; i < errorNodes.snapshotLength; i++) {
            errorNode = errorNodes.snapshotItem(i);
            code = xpath(hrestParser.XPATH.ERROR_CODE,errorNode).snapshotItem(0).textContent.trim();
            comment = xpath(hrestParser.XPATH.ERROR_COMMENT,errorNode).snapshotItem(0).textContent.trim();
            errors.push({"code":code,"comment":comment})
        }
        if (errors.length == 0){
            return null
        } else {
            return errors
        }
    },
    listMethods:function (root) {
        httpMethods = ["GET","POST","PUT","DELETE"];
        var methods = [];
        var methodNodes = xpath(hrestParser.XPATH.METHOD,root)
        var methodNode;
        for (var i = 0; i < methodNodes.snapshotLength; i++) {
            methodNode = methodNodes.snapshotItem(i);
            method = methodNode.textContent.trim().toUpperCase();
            if(httpMethods.indexOf(method) != -1){
                methods.push(method);
            }
        }
        return methods;

    },
    getApis:function (doc){
        var result = [];
        var div;
        var divs = xpath(hrestParser.XPATH.ROOT,doc);

        for (var i = 0; i < divs.snapshotLength; i++) {
            var div = divs.snapshotItem(i)
            var name = xpath(hrestParser.XPATH.NAME,div).snapshotItem(0).textContent.trim();
            var uri = xpath(hrestParser.XPATH.URI,div).snapshotItem(0).textContent.trim();
            
            //superclass
            var superclassNodes = xpath(hrestParser.XPATH.ISA,div);
            var superurl;
            var superclass;
            var supername;
            if (superclassNodes.snapshotLength !=0) {
                superurl = superclassNodes.snapshotItem(0).getAttribute('href');
                supername = superclassNodes.snapshotItem(0).textContent.trim();
                superclass ={"name":supername,"doc-url":superurl};
            }else{
            superclass = null
            }

            //comment
            var commentNodes = xpath(hrestParser.XPATH.COMMENT,div);
            var comment;
            if (commentNodes.snapshotLength !=0){
                comment = commentNodes.snapshotItem(0).textContent.trim();
            }else{
                comment = ""
            }

            var opformatNode = xpath(hrestParser.XPATH.OUTPUT_FORMAT,div)
            var opformat;
            if(opformatNode.snapshotLength !=0){
                opformat = opformatNode.snapshotItem(0).textContent.trim();
            } else {
                opformat = "json";
            }

            var methods = this.listMethods(div);
            
            var attributes =[]
            var attributeNodes = xpath(hrestParser.XPATH.ATTRIBUTE,div);
            for (var j = 0; j < attributeNodes.snapshotLength; j++) {
                attributeNode = attributeNodes.snapshotItem(j);
                attributes.push(this.attributeProp(attributeNode));  
            };

            errors = this.listErrors(div);
            var app = {};
            app["name"] = name;
            app["uri"] = uri;
            app["is-a"] = superclass;
            app["description"] = comment;
            app["output-format"] = opformat;
            app["methods"] = methods;
            app["attributes"] = attributes;
            app["errors"] = errors;
            result.push(app);
        }
        return result;
    },
    parse:function () {
        
        var restapis = this.getApis(this.doc);
        if(restapis.length != 0){
            this.json = {};
            this.json["hresource"] = hrestParser.HRESOURCE_VERSION
            this.json["baseurl"] = "";
            this.json["doc-url"] = this.url;
            this.json["apis"] = restapis;
        }
        this.status = hrestParser.DONE;
    },
    getJSON:function(){
        if(this.status == hrestParser.DONE ) {
            return JSON.stringify(this.json);
        } else {
            return null;
        }
    },
    getJSONObject:function () {
        if(this.status == hrestParser.DONE ) {
            return this.json;
        } else {
            return null;
        }
    },
    setStatus:function(status){
        this.status = status;
    }
}


/*function parseUrl (url,response) {
    doc = ''
    http.get(url, function(res) {
        console.log("Got page: "+res.statusCode)
        res.setEncoding('utf-8')
        res.on('data', function(chunk) {
            doc += chunk;
        })
        res.on('end',function() {
            //console.log(doc)
            //console.log("EOD");
            document = new DOMParser().parseFromString(doc,"application/xhtml+xml");
            parser = new hrestParser(document,url);
            parser.parse();
            var json = parser.getJSON()
            response.write(json);
        })
    }).on('error', function(err) {
        console.log("Error on page")
    })
}
*/

//exports.parseUrl = parseUrl;
exports.hrestParser = hrestParser;
