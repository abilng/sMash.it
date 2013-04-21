function init()
{
	$( "#accordion" ).accordion({heightStyle: "content",collapsible: "true"});
    $('button.mybutton').draggable({cancel:false, 
    								revert:false, 
    								appendTo: "#editorcontainer", 
    								helper:'clone',
    								zIndex: 25,
    								scroll:false,
    								start:function(e,ui){$(ui.helper).addClass("ui-draggable-helper");} });
    $('div.workbench').droppable({accept: 'button.mybutton',
    							  drop: function(ev,ui){
    							  	var pos=$(ui.helper).position();
                                    var parentpos=$('div.workbench').position();
                                    pos.left = pos.left - parentpos.left;
                                    pos.top = pos.top - parentpos.top;
    							  	//$(this).find("p").html("position left : " + parseInt(pos.left) + " top : " + parseInt(pos.top));
    							  	insertDiv(this,pos);
    							  }
    							});
}
var targetColor = "#bd0b0b";
var w23Stroke = "rgb(189,11,11)";
var endpointOptions = {     
    isSource:true,
    isTarget:true,
    endpoint:"Rectangle",
    endpointStyles:[
        { gradient : { stops:[[0, w23Stroke], [1, "#558822"]] }},
        { gradient : {stops:[[0, w23Stroke], [1, "#882255"]] }}], 
    paintStyle:{ fillStyle: targetColor, lineWidth:5, strokeStyle:w23Stroke, outlineColor:"#000000", outlineWidth:1}, //Line color
    isSource: true, //Starting point of the connector
    connectorStyle: { strokeStyle: targetColor, lineWidth: 5, outlineColor:"#000000", outlineWidth:1 }, 
    maxConnections: -1,
    dropOptions: {
        activeClass: 'dragActive'
    }
}; 
jsPlumb.ready(function() {
        jsPlumb.setRenderMode(jsPlumb.CANVAS);
        jsPlumb.importDefaults({
        Connector : ["Bezier",{ curviness: 50}],
        Endpoint : ["Dot", {radius: 10}],
        EndpointStyle : { fillStyle : "#FF0000" },
        ConnectorZIndex : 20,
        ConnectionsDetachable: true
    })
//    jsPlumb.addEndpoint($(".widget"), endpointOptions);
//    jsPlumb.draggable($(".widget"));
})


function insertDiv(element,pos){
            var obj = new Date();
            var Div = $('<div>', { id: "X" + obj.getSeconds() },
             { class: 'widget' }).css({ position:'absolute', left: parseInt(pos.left) +'px', top:parseInt(pos.top)+'px'})

            var head = $("<div class='widget-head'>").append($("<b>").text("title"),
                        $('<a class="close" href="#" onclick="closeWidget.call(this)">'));
            var content = $('<div class="widget-content" style="display: block;">').append($("<p>").text("this is a test widget"),
                        $('<p>').text('yes this is one'));

            Div.append(head,content);
            $('#wbench').append(Div)

            jsPlumb.addEndpoint($(Div), endpointOptions);
            jsPlumb.draggable($(Div));
            $(Div).addClass('widget');
}

function closeWidget(){
	//$(this).parentNode.parentNode.animate({opacity: 0});
	//alert("hi" + $(this).parents("div").parents("div").attr('id'));
	var ele = $(this).parents("div").parents("div").attr('id');
    jsPlumb.removeAllEndpoints($("#"+ele));
	$("#"+ele).remove();
}

