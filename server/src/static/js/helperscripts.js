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
                                    var splitstr = indexstr.split("-");
                                    var jindex = parseInt(splitstr[1]);
                                    var aindex = parseInt(splitstr[2]);
                                    //alert("j: " + jindex);
                                    var con = createWidgetContent(jindex,aindex);
                                    var title = getApiName(jindex,aindex);
                                    
                                    insertDiv(pos,title,con,jindex,aindex);
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

jsPlumb.bind("jsPlumbConnection", function (CurrentConnection) {
        if (CurrentConnection.connection.targetId ==
                                           CurrentConnection.connection.sourceId)
            jsPlumb.detach(CurrentConnection.connection);
        else
            init(CurrentConnection.connection);
        //alert("hi"+CurrentConnection.connection.targetId+"->"+CurrentConnection.connection.sourceId)
        var src = CurrentConnection.connection.sourceId;
        var dst = CurrentConnection.connection.targetId;
        var smethod = $('#'+src).find("select").val();
        var dmethod = $('#'+dst).find("select").val();
        $('#'+src).find("select").attr("disabled", true);
        $('#'+dst).find("select").attr("disabled", true);
        
        setMethodArray(src,smethod);
        setMethodArray(dst,dmethod);
        //alert("-"+smethod+dmethod);
        var mapdiv = mappingDiv(src,smethod,dst,dmethod);
        $('body').append(mapdiv);
        $(mapdiv).dialog({
                        autoOpen: false,
                        height: 300,
                        width: 525,
                        modal: true,
                      })
        $(mapdiv).dialog("open");
});

jsPlumb.bind("jsPlumbConnectionDetached",function (CurrentConnection) {
   var src = CurrentConnection.connection.sourceId;
   var dst = CurrentConnection.connection.targetId;
   rmlinkAttributeArray(src,dst); 
   //$('#'+src).find("select").attr("disabled", true);
   //$('#'+dst).find("select").attr("disabled", true);
        
});



function insertDiv(pos,title,cont,jindex,aindex){
            var sec = new Date().getTime()
            var Div = $('<div>', { id: "widget-"+jindex +"-"+ aindex +"-" + sec },
             { class: 'widget' }).css({
              position:'absolute', left: parseInt(pos.left) +'px', 
              top:parseInt(pos.top)+'px'});

            var head = $("<div class='widget-head'>").append($("<b>").text(title),
                        $('<a class="close" href="#" onclick="closeWidget.call(this)">'));
            var content = $('<div class="widget-content" style="display: block;">').append(cont);

            Div.append(head,content);
            $('#wbench').append(Div)

            jsPlumb.addEndpoint($(Div), outendpointOptions);
            jsPlumb.addEndpoint($(Div), inendpointOptions);
            jsPlumb.draggable($(Div));
            $(Div).addClass('widget');
            addtoAttributeArray(jindex,aindex,sec);
}

function closeWidget(){
	//$(this).parentNode.parentNode.animate({opacity: 0});
	//alert("hi" + $(this).parents("div").parents("div").attr('id'));
	var ele = $(this).parents("div").parents("div").attr('id');
    jsPlumb.removeAllEndpoints($("#"+ele));
	$("#"+ele).remove();
}

function openModalForm(element){
    //console.log(element);
    //alert($(element).parents("div").parents("div").attr("id"));
    var parent = $(element).parents("div").parents("div");
    var method = $(parent).find("select").val();
    var newdiv = argumentDiv(parent.attr("id"),method);
    $('body').append(newdiv);
    $(newdiv).dialog({
                        autoOpen: false,
                        height: 500,
                        width: 500,
                        modal: true,
                      })
    $(newdiv).dialog("open");
}

function removeMapping(element){
    $(element).parent().remove();
}