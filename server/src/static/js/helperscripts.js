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
                                    var indexstr = $(ui.draggable).attr("id");
                                    //alert("-> " + indexstr.charAt(indexstr.length-1) + "-> " + indexstr.charAt(indexstr.length-3) );
                                    var jindex = parseInt(indexstr.charAt(indexstr.length-1));
                                    var aindex = parseInt(indexstr.charAt(indexstr.length-3));
                                    //alert("j: " + jindex);
                                    var con = createWidgetContent(jindex,aindex);
                                    var title = getApiName(jindex,aindex);
                                    //alert($(ui.draggable).attr("id"));
    							  	//$(this).find("p").html("position left : " + parseInt(pos.left) + " top : " + parseInt(pos.top));
    							  	insertDiv(this,pos,title,con);
    							  }
    							});
}
var targetColor = "#bd0b0b";
var w23Stroke = "rgb(189,11,11)";
var outendpointOptions = {     
    isSource:true,
    endpoint:["Rectangle",{width:12, height:13}],
    endpointStyles:[
        { gradient : { stops:[[0, w23Stroke], [1, "#558822"]] }},
        { gradient : {stops:[[0, w23Stroke], [1, "#882255"]] }}], 
    paintStyle:{ fillStyle: targetColor, lineWidth:5, strokeStyle:w23Stroke, outlineColor:"#000000", outlineWidth:1}, //Line color
    connectorStyle: { strokeStyle: targetColor, lineWidth: 5, outlineColor:"#000000", outlineWidth:1 }, 
    maxConnections: -1,
    dropOptions: {
        activeClass: 'dragActive'
    },
    anchor: "BottomCenter"
}; 

var inendpointOptions = {
    isTarget:true,
    endpointStyles:[
        { gradient : { stops:[[0, "#000050"], [1, "#000000"]] }},
        { gradient : {stops:[[0, "#000000"], [1, "#000050"]] }}], 
    paintStyle:{ fillStyle: targetColor, lineWidth:5, strokeStyle:w23Stroke, outlineColor:"#000000", outlineWidth:1}, //Line color
    connectorStyle: { strokeStyle: targetColor, lineWidth: 5, outlineColor:"#000000", outlineWidth:1 }, 
    maxConnections: -1,
    dropOptions: {
        activeClass: 'dragActive'
    },
    anchor: "TopCenter"
};

jsPlumb.ready(function() {
        jsPlumb.setRenderMode(jsPlumb.SVG);
        jsPlumb.importDefaults({
        Connector : ["Bezier",{ curviness: 200}],
        Endpoint : ["Dot", {radius: 10}],
        EndpointStyle : { fillStyle : "#FF0000" },
        ConnectorZIndex : 20,
        ConnectionsDetachable: true
    })
//    jsPlumb.addEndpoint($(".widget"), endpointOptions);
//    jsPlumb.draggable($(".widget"));
})

function insertDiv(element,pos,title,cont){
            var obj = new Date();
            var Div = $('<div>', { id: "X" + obj.getSeconds() },
             { class: 'widget' }).css({ position:'absolute', left: parseInt(pos.left) +'px', top:parseInt(pos.top)+'px'})

            var head = $("<div class='widget-head'>").append($("<b>").text(title),
                        $('<a class="close" href="#" onclick="closeWidget.call(this)">'));
            var content = $('<div class="widget-content" style="display: block;">').append(cont);

            Div.append(head,content);
            $('#wbench').append(Div)

            jsPlumb.addEndpoint($(Div), outendpointOptions);
            jsPlumb.addEndpoint($(Div), inendpointOptions);
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

