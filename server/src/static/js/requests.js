var docjsons = new Array();
var docurls = new Array();
var attributeArray = new Object();

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

function addtoAttributeArray (jindex,aindex,sec) {
    var id = "widget-"+jindex +"-"+ aindex +"-" + sec;
    var obj = {};
    obj['apiindex'] = aindex;
    obj['jindex'] = jindex;
    obj['method'] = "";
    obj['inputs'] = new Object();
    obj['outputs'] = new Object();
    attributeArray[id] = obj;
}

function setMethodArray(id,method) {
    
    if(attributeArray[id].method == method)
        return;

    var splitstr = id.split("-");
    var jindex = parseInt(splitstr[1])
    var aindex = parseInt(splitstr[2])
    var json_api = docjsons[jindex].apis[aindex];


    attributeArray[id].method = method;

    inputs = getInputs(json_api,method);
    outputs = getOutputs(json_api,method);

    for (var i = 0; i < inputs.length; i++) {
        attributeArray[id].inputs[inputs[i]]={
            "value":null,
            "link":null
        };
    };

    for (var i = 0; i < outputs.length; i++) {
        attributeArray[id].outputs[outputs[i]]={
            "link":null
        };
    };
}

function makelinkAttributeArray(swidgetid,arg1,dwidgetid,arg2){
    attributeArray[swidgetid].outputs[arg1].link = {
        "id":dwidgetid,
        "arg":arg2
    };
    attributeArray[dwidgetid].inputs[arg2].link = {
        "id":swidgetid,
        "arg":arg1
    };
}


function addSideBar (name,json,index) {
	var heading = $("<h3 id=" + index + ">").text(name)
    var div= $("<div style='padding:0px'>")
    for (var i = json.apis.length - 1; i >= 0; i--) {
    	var button = $("<button class='mybutton' id='apibtn-" + index +"-" +i + "''>").text(json.apis[i].name);
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
            + "</p></br><button onclick='openModalForm(this)'> Edit arguments </button><select name = 'Method'>";
    for(var i=0;i<docjsons[jsonindex].apis[apiindex].methods.length;i++){
        innerhtmlstring+= "<option value= '" + docjsons[jsonindex].apis[apiindex].methods[i].type + "'>" 
                    + docjsons[jsonindex].apis[apiindex].methods[i].type + "</option>";
    }
    return innerhtmlstring; 
}

function getInputs (json_api,method) {
    var index = -1;
    for (var i = 0; i < json_api.methods.length; i++) {
        if (json_api.methods[i].type == method){
            index = i;
            break;
        }
    };
    return json_api.methods[index].inputs
}

function getOutputs (json_api,method) {
    var index = -1;
    for (var i = 0; i < json_api.methods.length; i++) {
        if (json_api.methods[i].type == method){
            index = i;
            break;
        }
    };
    return json_api.methods[index].outputs
}


function argumentDiv (id,method) {
    var splitstr = id.split("-");
    var jindex = parseInt(splitstr[1])
    var aindex = parseInt(splitstr[2])
    var json_api = docjsons[jindex].apis[aindex];

    setMethodArray(id,method);

    var div = $("<div class='dialog-form'>");
    var form = $("<form>")
    var apiName = json_api.name;
    inputs = getInputs(json_api,method);

    for (var i = 0; i < json_api.attributes.length; i++) {
        
        var attribute=json_api.attributes[i];
        if(inputs.indexOf(attribute["name"]) == -1){
            continue;
        }
        
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

        if(attributeArray[id].inputs[attribute["name"]]){
            if(attributeArray[id].inputs[attribute["name"]].value!=null){
                alert(attributeArray[id].inputs[attribute["name"]].value);
                $(input).attr("value",attributeArray[id].inputs[attribute["name"]].value.toString())
            }
        }
        attributediv.append(label,input,comment);
        form.append(attributediv);
    };
    form.append($("<input type=button value='Done' onclick=\"argumentsSubmit(this,'"+id+"')\">"));
    div.append(form);
    return div;
}

function mappingDiv(src,src_method,dst,dest_method){
    var srcindex = src.split("-");
    var dstindex = dst.split("-");
    
    var src_index1 = srcindex[1];
    var src_index2 = srcindex[2];

    var dst_index1 = dstindex[1];
    var dst_index2 = dstindex[2];

    var outputs=getOutputs(docjsons[src_index1].apis[src_index2],src_method);
    //console.log(outputs);
    //op = outputs;
    var inputs=getInputs(docjsons[dst_index1].apis[dst_index2],dest_method);
    //console.log(inputs);
    //ip = inputs;
    var srcapiname=docjsons[src_index1].apis[src_index2].name;
    var dstapiname=docjsons[dst_index1].apis[dst_index2].name;


    var mappingdiv = $("<div class='attributemapping'>");
    var mappings = $("<div class='mappings'>");
    var m = $("<div class='m'>");
    var addbtn = $("<button onclick='newMap("+src_index1+","+src_index2+",\""+src_method+"\","+dst_index1+","+dst_index2+",\""+dest_method+"\")'>").text("Add mapping");
    var o_selector = makeSelector(outputs);
    o_selector.attr("name","output");
    o_selector.attr('id',"outputsel");
    m.append(o_selector);
    m.append($("<p>").text("    ->    "));
    var i_selector = makeSelector(inputs);
    i_selector.attr("name","input");
    i_selector.attr('id',"inputsel");
    m.append(i_selector);
    m.append($('<a class="close" href="#" onclick="removeMapping()">'));
    mappings.append(m);
    mappingdiv.append(mappings);
    mappingdiv.append(addbtn);
    mappingdiv.append($("<input type=button value='Done' onclick='mappingSubmit(this,\""+src+"\",\""+dst+"\")'>"));
    return mappingdiv;
}

function makeSelector(list){
    var sel = $("<select>");
    for(var i=0;i<list.length;i++){
        htmlstr = $("<option value = '" + list[i] + "'>" + list[i] + "</option>");
        sel.append(htmlstr);
    }
    return sel;
}

function newMap(s1,s2,sm,d1,d2,dm){
    var op = getOutputs(docjsons[s1].apis[s2],sm);
    var ip = getInputs(docjsons[d1].apis[d2],dm);
    var mp = $("<div class='m'>");
    var o_selector = makeSelector(op);
    o_selector.attr("name","output");
    o_selector.attr('id',"outputsel");
    mp.append(o_selector);
    mp.append($("<p>").text("    ->    "));
    var i_selector = makeSelector(ip);
    i_selector.attr("name","input");
    i_selector.attr('id',"inputsel");
    mp.append(i_selector);
    mp.append($('<a class="close" href="#" onclick="removeMapping(this)">'));
    $(".mappings").append(mp);
}

function argumentsSubmit(element,id){
    //alert("element here gives submit button in the div")
    var splitstr = id.split("-");
    var jindex = parseInt(splitstr[1])
    var aindex = parseInt(splitstr[2])
    var json_api = docjsons[jindex].apis[aindex];
    var inputs = getInputs(docjsons[jindex].apis[aindex],
        attributeArray[id].method);
    for (var i = 0; i < inputs.length; i++) {
        var val= $(element).parent().find("input[name="+ inputs[i] +"]").val();
        attributeArray[id].inputs[inputs[i]].value=val;
    };
    div = $(element).parent().parent();
    $(div).dialog("close");
    $(div).remove();
    return false;
}

function mappingSubmit(element,swidgetid,dwidgetid){
    //alert("element here give submit button in div2")
    var srcindex = swidgetid.split("-");
    var dstindex = dwidgetid.split("-");
    
    var src_index1 = srcindex[1];
    var src_index2 = srcindex[2];

    var dst_index1 = dstindex[1];
    var dst_index2 = dstindex[2];

    var div = $(element).parent();

    $(div).find(".m").each(function (index,element) {
        arg1 = $(element).find("select")[0].value
        arg2 = $(element).find("select")[1].value
        makelinkAttributeArray(swidgetid,arg1,dwidgetid,arg2)
    })

    $(div).dialog("close");
    $(div).remove();
    return false;

}

function requestGraph(startnodes){
    var ids = new Array();
    var calledids = new Array();
    for (var i = 0; i < startnodes.length; i++) {
        ids.push(startnodes[i]);
    };
    while(ids.length!=0){
        var node = ids.pop();
        if(calledids.indexOf(node)!=-1) 
            continue;
        var url = docjsons[attributeArray[node].apiindex].apis[attributeArray[node].jindex].uri;
        var data = "" ;
        var reqmethod = attributeArray[node].method;
        var keys = Object.keys(attributeArray[node].inputs);
        for (k in keys) {
            var inputname = keys[k];
            var inputObject = attributeArray[node].inputs[inputname];
            if(inputObject.link==null){
                data += inputname+"="+inputObject.value+"&";
            }else{
                var pred_id = inputObject.link.id;
                var pred_arg = inputObject.link.arg;
                data += inputname+"={"+calledids.indexOf(pred_id)+" @ "+pred_arg+"}&";
            }
        };
        console.log(reqmethod+"  "+url+"?"+data);
        calledids.push(node);
        var okeys = Object.keys(attributeArray[node].outputs);
        for(k in okeys){
            var outputname = okeys[k]
            var outputObject = attributeArray[node].outputs[outputname];
            if(outputObject.link != null) {
                ids.push(outputObject.link.id);
            }
        }
    }
}