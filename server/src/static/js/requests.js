var docjsons = new Array();
var docurls = new Array();

var base_url = ".";


$(document).ready(function(){
	

	$("#api_load").on("click", function(event){
		var url = $('#docurl').val();
		var pattern = /(file|ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		if (pattern.test(url)) {
			if(docurls.indexOf(url) == -1){
				$.getJSON(base_url+'/parse?url=' + url, function(data) {
					docjsons.push(data);
					docurls.push(url);
					addSideBar("test",data,docurls.length - 1);
				});
			}
    	}
    	else alert("Url is invalid");
	});
});

function addSideBar (name,json,index) {
	var heading = $("<h3 id=" + index + ">").text(name)
    var div= $("<div style='padding:0px'>")
    for (var i = json.apis.length - 1; i >= 0; i--) {
    	var button = $("<button class='mybutton' id='apibtn" + i +"-" +index + "''>").text(json.apis[i].name);
    	button.draggable({cancel:false, 
    								revert:false, 
    								appendTo: "#editorcontainer", 
    								helper:'clone',
    								zIndex: 25,
    								scroll:false,
    								start:function(e,ui){$(ui.helper).addClass("ui-draggable-helper");} });
    	div.append(button);
    };
    $("#accordion").append(heading,div);
    $("#accordion").accordion("refresh");
}

function getApiName (jsonindex,apiindex) {
    return docjsons[jsonindex].apis[apiindex].name;
}

function createWidgetContent(jsonindex,apiindex){
    var innerhtmlstring = "<p> " + docjsons[jsonindex].apis[apiindex].description 
            + "</p></br><button> Edit arguments </button><select name = 'Method'>";
    for(var i=0;i<docjsons[jsonindex].apis[apiindex].methods.length;i++){
        innerhtmlstring+= "<option value= '" + docjsons[jsonindex].apis[apiindex].methods[i].type + "'>" 
                    + docjsons[jsonindex].apis[apiindex].methods[i].type + "</option>";
    }
    return innerhtmlstring; 
}


function argumentDiv (json_api,methods) {
    var div = $("<div><form>");
    var apiName = json_api.name;
    for (var i = 0; i < json_api.attributes.length; i++) {
        attribute=json_api.attributes[i];

        var attributediv = $("<div class='attribute'>");
        
        var label = $("<label>").text(attribute["name"]);
        label.attr('for',apiName +"_" + attribute["name"]+"_input")


        var input = $("<input>")
        input.attr('name',attribute["name"])
        input.attr('id',apiName +"_" + attribute["name"]+"_input")
        
        if(attribute["type"]== null){
            input.attr('type','text');
            input.attr('placeholder',attribute["name"]);
        } else {
            switch(attribute["type"].toUpperCase()){
                case "INT":
                    input.attr('type','number');
                    input.attr('placeholder',attribute["type"])
                    break;
                case "INTEGER":
                    input.attr('type','number');
                    input.attr('placeholder',attribute["type"])
                    break;
                case "FLOAT":
                    input.attr('type','number');
                    input.attr('step','any');
                    input.attr('placeholder',attribute["type"])
                    break;
                case "INT64":
                    input.attr('type','number');
                    input.attr('placeholder',attribute["type"])
                    break;
                case "BOOLEAN":
                    input.attr('type','checkbox');
                    break;
                case "BOOL":
                    input.attr('type',"checkbox");
                    break;
                default:
                    input.attr('type','text');
                    input.attr('placeholder',attribute["type"])
                    break;
            }
        }

        var comment = $("<p class='comment'>").text(attribute["description"]);


        if(attribute["read-only"]) {
            attributediv.addClass("read-only");
            if(input.attr('type') != 'checkbox') {
                input.prop('readonly',true)
            }
        }
        if(attribute["write-once"]){
            attributediv.addClass("write-once");
        }  
        if(attribute["required"]) {
            attributediv.addClass("required");
            if(input.attr('type') != 'checkbox') {
                input.prop('required',true)
            }
        }
        if(attribute["queryable"]) {
            attributediv.addClass("queryable");
        }
        if(attribute["guid"]) {
            attributediv.addClass("quid");
        }            

        attributediv.append(label,input,comment);
        div.append(attributediv);
    };

    return div;
}

