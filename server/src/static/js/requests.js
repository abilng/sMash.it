var json = new Array();

var base_url = "http://127.0.0.1:8081";


$(document).ready(function(){
	

	$("#api_load").on("click", function(event){
		var url = $('#docurl').val();
		var pattern = /(file|ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		if (pattern.test(url)) {
			alert(url);
			$.getJSON(base_url+'/parse?url=' + url, function(data) {
					json.push(data);
					alert(data)
			});
    	}
    	else alert("Url is invalid");
	});

});