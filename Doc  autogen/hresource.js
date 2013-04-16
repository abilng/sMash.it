//
// Read a json from src of <link rel=hresource-documentation src="....">
// and convert it to a human readable HTML
//
$(document).ready(function(){
	loadhresourcedoc($("body"));
})
function loadhresourcedoc (base) {
	var json = $("LINK[rel='hresource-documentation']").attr("src");
	if(json == null){
		alert("Error!");
	}else { 
		$.getJSON(json,function(data){
			var apis = data["apis"]
			for (var i = 0; i < apis.length; i++) {
				var api = apis[i];
				var name = api["name"];
				var attributes = api["attributes"];

				base.append("<div id='"+ name +"' class='hresource'>")
				
				var hresourceDiv = $(".hresource:eq("+ i +")");
				var attributeslist = $("<ol id='attributes'>");


				hresourceDiv.append("<h2 class='name'>" + name + "</h2>");
				hresourceDiv.append("<p class='comment'>" + api["description"] + "</p>")
				if(api["is-a"] != null){
					var para = $("<p>").text("This rest api is a ")
						.append($("<a rel='hresource-is-a' href=" + api["is-a"]["doc-url"] + ">")
						.text(api["is-a"]["name"]));
					hresourceDiv.append(para);
				}
				hresourceDiv.append("<pre>URI: </pre><span class='uri'>" + api["uri"] + "</span>");
				hresourceDiv.append("<pre>Output format:</pre><span class='hresource-opformat'>" +
					api["output-format"] + "</span>");
				for (var j = 0; j < attributes.length; j++) {
					var attribute  = attributes[j]
					var code = $("<code class='attribute'>").text(attribute["name"]);
					var comment = $("<p class='comment'>").text(attribute["description"]);
					var properties = $("<ul id='properties'>");
					var consumers = attribute["consumed-by"];
                    var producers = attribute["producered-by"];
					
					var attributehtml = $("<li>");
					var isproperties = false;

					if(attribute["read-only"]) {
						code.addClass("read-only");
						properties.append($("<li>").append($("<a href ='#properties-explain'>").text("read-only")));
						isproperties = true;
					}
                    if(attribute["write-once"]){
                    	code.addClass("write-once");
                    	properties.append($("<li>").append($("<a href ='#properties-explain'>").text("write-once")));
                    	isproperties = true;
                    }  
                    if(attribute["required"]) {
                    	code.addClass("required");
                    	properties.append($("<li>").append($("<a href ='#properties-explain'>").text("required")));
                    	isproperties = true;
                    }
                    if(attribute["queryable"]) {
                    	code.addClass("queryable");
                    	properties.append($("<li>").append($("<a href ='#properties-explain'>").text("queryable")));
                    	isproperties = true;
                    }
                    if(attribute["guid"]) {
                    	code.addClass("quid");
                    	properties.append($("<li>").append($("<a href ='#properties-explain'>").text("global unique id")));
                    	isproperties = true;
                    }
    				
    				attributehtml.append(code);
    				if(attribute["type"] != null){
    					attributehtml.append("<span class='hresource-datatype'>" + attribute["type"]  +"</span>");
    				}
    				attributehtml.append(comment);


    				if(isproperties){
    					attributehtml.append("<pre>Properties:</pre>",properties)
    				}


    				var producerslist = $("<ul id='producers'>")
    				for (var k = 0; k < producers.length; k++) {
    					var producer = producers[k];
    					producerslist.append("<li><a rel='hresource-produced-by' href='" +
    					producer["doc-url"] +"#"+ producer["attribute"] + "'>" +
    					producer["api"] + "</a></li>");
    				};
    				if(producers.length !=0) {
    					attributehtml.append("<pre>Produced by:</pre>",producerslist);
    				}

    				var consumerslist = $("<ul id='consumers'>")
    				for (var k = 0; k < consumers.length; k++) {
    					var consumer = consumers[k];
    					consumerslist.append("<li><a rel='hresource-consumed-by' href='" +
    					consumer["doc-url"] +"#"+ consumer["attribute"] + "'>" +
    					consumer["api"] + "</a></li>");
    				};
    				if(consumers.length !=0) {
    					attributehtml.append("<pre>Consumed by:</pre>",consumerslist);
    				}

    				attributeslist.append(attributehtml);


				};
				hresourceDiv.append("<pre>Arguments:</pre>",attributeslist);

				var errors = api["errors"];
				if(errors !=null){
					var errortable = $("<table id='errortable'>").append($("<thead>"),$("<tbody>"));
					for (var j = 0; j < errors.length; j++) {
						var tablerow = $("<tr class='hresource-error'>")
						tablerow.append($("<td class='error-code'>").text(errors[j]["code"]));
						tablerow.append($("<td class='comment'>").text(errors[j]["comment"]));
						errortable.append(tablerow);
					};
					hresourceDiv.append("<pre>Errors:</pre>",errortable);
				}

			};
			base.append($("<div id='properties-explain'>").append(
				"<h4>required</h4>",
				"<p>Indicates an essential attribute.All attributes which are not given as required can be omitted</p>",
				"<h4>queryable</h4>",
				"<p>Indicates the attribute may be provided in the HTTP querystring during a GET operation to filter the results</p>",
				"<h4>read-only</h4>",
				"<p>A read-only attribute may be retrieved during a GET operation but may not be included in a POST or a PUT</p>",
				"<h4>write-once</h4>",
				"<p>A write-once  attribute can be specified only during the create operation (POST) but not during update (PUT).</p>",
				"<h4>globally unique id</h4>",
				"<p> The attribute is a globally unique identifier for the resource that could be used across multiple services</p>"
				))
		});
	}
}